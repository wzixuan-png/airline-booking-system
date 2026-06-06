export type Airport = {
  code: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  timeZone: string;
  utcOffsetMinutes: number;
};

export const airports: Airport[] = [
  {
    code: "NZNE",
    name: "Dairy Flat Airport",
    shortName: "Dairy Flat",
    city: "Auckland",
    country: "New Zealand",
    timeZone: "Pacific/Auckland",
    utcOffsetMinutes: 12 * 60
  },
  {
    code: "YSSY",
    name: "Sydney Kingsford Smith Airport",
    shortName: "Sydney",
    city: "Sydney",
    country: "Australia",
    timeZone: "Australia/Sydney",
    utcOffsetMinutes: 10 * 60
  },
  {
    code: "NZRO",
    name: "Rotorua Airport",
    shortName: "Rotorua",
    city: "Rotorua",
    country: "New Zealand",
    timeZone: "Pacific/Auckland",
    utcOffsetMinutes: 12 * 60
  },
  {
    code: "NZGB",
    name: "Claris Airport",
    shortName: "Great Barrier / Claris",
    city: "Great Barrier Island",
    country: "New Zealand",
    timeZone: "Pacific/Auckland",
    utcOffsetMinutes: 12 * 60
  },
  {
    code: "NZCI",
    name: "Tuuta Airport",
    shortName: "Chatham Islands / Tuuta",
    city: "Chatham Islands",
    country: "New Zealand",
    timeZone: "Pacific/Chatham",
    utcOffsetMinutes: 12 * 60 + 45
  },
  {
    code: "NZTL",
    name: "Lake Tekapo Airport",
    shortName: "Lake Tekapo",
    city: "Lake Tekapo",
    country: "New Zealand",
    timeZone: "Pacific/Auckland",
    utcOffsetMinutes: 12 * 60
  }
];

export const airportByCode = Object.fromEntries(airports.map((airport) => [airport.code, airport]));
