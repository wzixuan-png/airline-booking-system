import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

// On Windows, router DNS can reject MongoDB Atlas SRV lookups.
// Use public DNS locally, but leave Vercel/Linux production on system DNS.
if (process.platform === "win32" && !process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Create .env.local or set the variable before running npm run seed.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB || "dairy_flat_air";
const weeks = Number(process.env.SEED_WEEKS || 10);
const startDate = process.env.SEED_START_DATE || nextMondayIso(new Date());

const airports = {
  NZNE: { code: "NZNE", name: "Dairy Flat Airport", shortName: "Dairy Flat", timeZone: "Pacific/Auckland", offset: 12 * 60 },
  YSSY: { code: "YSSY", name: "Sydney Kingsford Smith Airport", shortName: "Sydney", timeZone: "Australia/Sydney", offset: 10 * 60 },
  NZRO: { code: "NZRO", name: "Rotorua Airport", shortName: "Rotorua", timeZone: "Pacific/Auckland", offset: 12 * 60 },
  NZGB: { code: "NZGB", name: "Claris Airport", shortName: "Great Barrier / Claris", timeZone: "Pacific/Auckland", offset: 12 * 60 },
  NZCI: { code: "NZCI", name: "Tuuta Airport", shortName: "Chatham Islands / Tuuta", timeZone: "Pacific/Chatham", offset: 12 * 60 + 45 },
  NZTL: { code: "NZTL", name: "Lake Tekapo Airport", shortName: "Lake Tekapo", timeZone: "Pacific/Auckland", offset: 12 * 60 }
};

const aircraft = {
  SJ30I: { id: "SJ30I", type: "SyberJet SJ30i", capacity: 6 },
  CIRRUS_A: { id: "CIRRUS-A", type: "Cirrus SF50 Vision Jet", capacity: 4 },
  CIRRUS_B: { id: "CIRRUS-B", type: "Cirrus SF50 Vision Jet", capacity: 4 },
  HONDA_A: { id: "HONDA-A", type: "HondaJet Elite", capacity: 5 },
  HONDA_B: { id: "HONDA-B", type: "HondaJet Elite", capacity: 5 }
};

function nextMondayIso(from) {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const day = date.getUTCDay(); // 0 Sun, 1 Mon...
  const add = day === 1 ? 0 : (8 - day) % 7;
  date.setUTCDate(date.getUTCDate() + add);
  return date.toISOString().slice(0, 10);
}

function addDaysIso(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function localToUtc(isoDate, hour, minute, offsetMinutes) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000);
}

function makeFlight({ weekStart, dayOffset, flightNo, routeId, origin, destination, hour, minute, durationMinutes, aircraftCode, price }) {
  const departureDateLocal = addDaysIso(weekStart, dayOffset);
  const originAirport = airports[origin];
  const destinationAirport = airports[destination];
  const departureTime = localToUtc(departureDateLocal, hour, minute, originAirport.offset);
  const arrivalTime = new Date(departureTime.getTime() + durationMinutes * 60_000);

  return {
    flightNo,
    routeId,
    origin,
    destination,
    originName: originAirport.name,
    destinationName: destinationAirport.name,
    originTimeZone: originAirport.timeZone,
    destinationTimeZone: destinationAirport.timeZone,
    departureDateLocal,
    departureTime,
    arrivalTime,
    aircraft: aircraft[aircraftCode],
    price,
    bookings: [],
    createdAt: new Date()
  };
}

function buildSchedules() {
  const schedules = [];
  for (let week = 0; week < weeks; week += 1) {
    const weekStart = addDaysIso(startDate, week * 7);

    // Sydney prestige route: Friday outbound, Sunday return.
    schedules.push(makeFlight({ weekStart, dayOffset: 4, flightNo: "DF101", routeId: "SYD-OUT", origin: "NZNE", destination: "YSSY", hour: 10, minute: 30, durationMinutes: 210, aircraftCode: "SJ30I", price: 1850 }));
    schedules.push(makeFlight({ weekStart, dayOffset: 6, flightNo: "DF102", routeId: "SYD-IN", origin: "YSSY", destination: "NZNE", hour: 15, minute: 30, durationMinutes: 180, aircraftCode: "SJ30I", price: 1850 }));

    // Rotorua weekday shuttle: two returns per weekday.
    for (let dayOffset = 0; dayOffset <= 4; dayOffset += 1) {
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF201", routeId: "ROT-AM-OUT", origin: "NZNE", destination: "NZRO", hour: 7, minute: 30, durationMinutes: 40, aircraftCode: "CIRRUS_A", price: 280 }));
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF202", routeId: "ROT-AM-IN", origin: "NZRO", destination: "NZNE", hour: 8, minute: 45, durationMinutes: 45, aircraftCode: "CIRRUS_A", price: 280 }));
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF203", routeId: "ROT-PM-OUT", origin: "NZNE", destination: "NZRO", hour: 16, minute: 45, durationMinutes: 40, aircraftCode: "CIRRUS_A", price: 280 }));
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF204", routeId: "ROT-PM-IN", origin: "NZRO", destination: "NZNE", hour: 18, minute: 5, durationMinutes: 45, aircraftCode: "CIRRUS_A", price: 280 }));
    }

    // Great Barrier / Claris route.
    for (const dayOffset of [0, 2, 4]) {
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF301", routeId: "GBI-OUT", origin: "NZNE", destination: "NZGB", hour: 9, minute: 15, durationMinutes: 35, aircraftCode: "CIRRUS_B", price: 260 }));
    }
    for (const dayOffset of [1, 3, 5]) {
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF302", routeId: "GBI-IN", origin: "NZGB", destination: "NZNE", hour: 9, minute: 40, durationMinutes: 40, aircraftCode: "CIRRUS_B", price: 260 }));
    }

    // Chatham Islands / Tuuta route. Chatham local time is 45 minutes ahead of mainland NZ.
    for (const dayOffset of [1, 4]) {
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF401", routeId: "CHA-OUT", origin: "NZNE", destination: "NZCI", hour: 8, minute: 30, durationMinutes: 130, aircraftCode: "HONDA_A", price: 980 }));
    }
    for (const dayOffset of [2, 5]) {
      schedules.push(makeFlight({ weekStart, dayOffset, flightNo: "DF402", routeId: "CHA-IN", origin: "NZCI", destination: "NZNE", hour: 10, minute: 15, durationMinutes: 155, aircraftCode: "HONDA_A", price: 980 }));
    }

    // Lake Tekapo route.
    schedules.push(makeFlight({ weekStart, dayOffset: 0, flightNo: "DF501", routeId: "TEK-OUT", origin: "NZNE", destination: "NZTL", hour: 11, minute: 0, durationMinutes: 105, aircraftCode: "HONDA_B", price: 620 }));
    schedules.push(makeFlight({ weekStart, dayOffset: 1, flightNo: "DF502", routeId: "TEK-IN", origin: "NZTL", destination: "NZNE", hour: 14, minute: 10, durationMinutes: 115, aircraftCode: "HONDA_B", price: 620 }));
  }
  return schedules.sort((a, b) => a.departureTime - b.departureTime);
}

function readPassengerNames() {
  const csvPath = path.join(__dirname, "..", "data", "randomnames.csv");
  if (!fs.existsSync(csvPath)) return [];
  return fs
    .readFileSync(csvPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, 60)
    .map((line) => {
      const [id, title, firstName, lastName, gender, email] = line.split(",").map((value) => value.trim());
      return { id, title, firstName, lastName, gender, email: email.toLowerCase() };
    })
    .filter((person) => person.firstName && person.lastName && person.email);
}

function makeBookingRef(index) {
  return `DF-SEED${String(index + 1).padStart(3, "0")}`;
}

function addSampleBookings(schedules, passengers) {
  if (passengers.length === 0) return { schedules, passengerDocs: [] };
  const passengerMap = new Map();
  let bookingIndex = 0;

  for (let i = 0; i < schedules.length && bookingIndex < 36; i += 4) {
    const schedule = schedules[i];
    const person = passengers[bookingIndex % passengers.length];
    const bookingRef = makeBookingRef(bookingIndex);
    const booking = {
      bookingRef,
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: "",
      createdAt: new Date()
    };
    schedule.bookings.push(booking);

    const current = passengerMap.get(person.email) || {
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: "",
      bookingRefs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    current.bookingRefs.push(bookingRef);
    current.updatedAt = new Date();
    passengerMap.set(person.email, current);
    bookingIndex += 1;
  }

  return { schedules, passengerDocs: Array.from(passengerMap.values()) };
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const baseSchedules = buildSchedules();
  const passengers = readPassengerNames();
  const { schedules, passengerDocs } = addSampleBookings(baseSchedules, passengers);

  await db.collection("schedules").deleteMany({});
  await db.collection("passengers").deleteMany({});

  if (schedules.length > 0) await db.collection("schedules").insertMany(schedules);
  if (passengerDocs.length > 0) await db.collection("passengers").insertMany(passengerDocs);

  await db.collection("schedules").createIndex({ origin: 1, destination: 1, departureDateLocal: 1 });
  await db.collection("schedules").createIndex({ "bookings.bookingRef": 1 });
  await db.collection("schedules").createIndex({ "bookings.email": 1 });
  await db.collection("passengers").createIndex({ email: 1 }, { unique: true });

  console.log(`Seeded ${schedules.length} scheduled flights across ${weeks} weeks starting ${startDate}.`);
  console.log(`Seeded ${passengerDocs.length} passengers with sample bookings from data/randomnames.csv.`);
  console.log("Example lookup email:", passengerDocs[0]?.email || "none");

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
