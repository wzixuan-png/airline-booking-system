# Dairy Flat Air Booking System

A complete Next.js + MongoDB Atlas + Vercel web application for **159.352 Assignment 2**.

The application implements an online booking system for a fictitious airline operating from Dairy Flat Airport. It includes flight search, seat availability checking, passenger booking, invoice display, booking cancellation, and passenger trip lookup.

---

## 1. Features included

| Assignment requirement | Where it is implemented |
|---|---|
| Landing page / entry point | `/` |
| Search for flights | `/search` and `GET /api/schedules` |
| Select scheduled flight and make booking | `/book/[id]` and `POST /api/bookings` |
| Unique booking reference | Generated as `DF-XXXXXX` by `lib/bookingRefs.ts` |
| Do not allow booking when flight is full | Atomic MongoDB update in `POST /api/bookings` |
| Cancel a booking | `/manage`, invoice page, and `DELETE /api/bookings/[reference]` |
| Fetch all scheduled flights for a passenger | `/customer` and `GET /api/bookings?email=...` |
| Real calendar dates, not just weekdays | `departureDateLocal`, `departureTime`, `arrivalTime` in `scripts/seed.mjs` |
| More than one week of scheduled flights | Seed script loads 10 weeks by default |
| Invoice page after booking | `/invoice/[reference]` |
| Time zones | Airport time zones stored and displayed with `Intl.DateTimeFormat` |
| Attractive UI | `app/globals.css` |
| Vercel deployment ready | Uses environment variables and standard Next.js structure |

---

## 2. Project structure

```text
app/
  api/
    airports/route.ts
    schedules/route.ts
    bookings/route.ts
    bookings/[reference]/route.ts
  book/[id]/page.tsx
  customer/page.tsx
  invoice/[reference]/page.tsx
  manage/page.tsx
  search/page.tsx
components/
  BookingForm.tsx
  CancelBookingButton.tsx
  CustomerBookings.tsx
  ManageBooking.tsx
  SearchFlights.tsx
lib/
  airports.ts
  bookingRefs.ts
  format.ts
  mongodb.ts
  serialise.ts
  serverData.ts
  types.ts
scripts/
  seed.mjs
data/
  randomnames.csv
```

---

## 3. From zero: how to run locally

### Step 1 — Install Node.js

Install the LTS version of Node.js from the official Node.js website. After installation, check it in a terminal:

```bash
node -v
npm -v
```

### Step 2 — Install dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

### Step 3 — Create MongoDB Atlas database

1. Go to MongoDB Atlas.
2. Create a free cluster.
3. Create a database user and password.
4. In **Network Access**, allow your IP address. For Vercel deployment, you can use `0.0.0.0/0` for coursework testing.
5. Copy your connection string. It should look like:

```text
mongodb+srv://username:password@cluster-url/dairy_flat_air?retryWrites=true&w=majority
```

### Step 4 — Create `.env.local`

Copy `.env.example` and rename it to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER_URL/dairy_flat_air?retryWrites=true&w=majority
MONGODB_DB=dairy_flat_air
```

### Step 5 — Seed the database

This loads scheduled flights for multiple weeks and creates a few sample bookings using `data/randomnames.csv`.

```bash
npm run seed
```

Optional: to force a specific start date and number of weeks:

```bash
SEED_START_DATE=2026-06-01 SEED_WEEKS=10 npm run seed
```

After seeding, the terminal prints an example passenger email you can use on the **My trips** page.

### Step 6 — Run the app locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 4. How to test all required functions

### Test A — Search flights

1. Open `/search`.
2. Try:
   - From: `Dairy Flat (NZNE)`
   - To: `Sydney (YSSY)`
   - Date range: at least 2–4 weeks
3. Click **Search flights**.
4. Results should show flight number, departure, arrival, aircraft, price, and seats left.

### Test B — Make a booking

1. Click **Book this flight**.
2. Enter passenger details.
3. Click **Confirm booking**.
4. The app redirects to `/invoice/[bookingRef]`.
5. The invoice page shows flight details, passenger details, date/time, aircraft, and price.

### Test C — Cancel a booking

1. Open `/manage`.
2. Enter the booking reference, for example `DF-XXXXXX`.
3. Open the invoice page.
4. Click **Cancel this booking**.
5. The booking is removed from the scheduled flight.

### Test D — Find passenger trips

1. Open `/customer`.
2. Enter the same passenger email used in the booking.
3. The page lists all scheduled flights booked by that passenger.

### Test E — Check full-flight protection

The aircraft capacities are small by design:

- SyberJet SJ30i: 6 passengers
- Cirrus SF50: 4 passengers
- HondaJet Elite: 5 passengers

Book the same scheduled flight repeatedly with different emails. Once the capacity is reached, the API returns a “flight is full” message and prevents overbooking.

---

## 5. Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Complete assignment 2 airline booking system"
```

Create a GitHub repository and push this folder.

### Step 2 — Import the project into Vercel

1. Open Vercel.
2. Choose **Add New Project**.
3. Import the GitHub repository.
4. Keep the default Next.js settings.

### Step 3 — Add environment variables on Vercel

In Vercel project settings, add:

```env
MONGODB_URI=your MongoDB Atlas connection string
MONGODB_DB=dairy_flat_air
```

### Step 4 — Deploy

Click **Deploy**.

### Step 5 — Seed MongoDB Atlas

You only need to seed the database once. You can seed from your local terminal using the same Atlas connection string:

```bash
npm run seed
```

Then refresh the Vercel website and test `/search`.

---

## 6. API endpoints

### `GET /api/schedules`

Searches scheduled flights by origin, destination, and real date range.

Example:

```text
/api/schedules?date1=2026-06-10&date2=2026-06-30&orig=NZNE&dest=YSSY
```

### `POST /api/bookings`

Creates a booking if the scheduled flight has seats available.

Body:

```json
{
  "scheduleId": "MongoDB schedule id",
  "title": "Miss",
  "firstName": "Ella",
  "lastName": "Lee",
  "email": "ella.lee@example.com",
  "phone": "+64 21 000 000"
}
```

### `GET /api/bookings?email=...`

Returns all scheduled flights for a passenger email.

### `GET /api/bookings/[reference]`

Returns one booking invoice record.

### `DELETE /api/bookings/[reference]`

Cancels one booking.

---

## 7. Notes for submission

Before submitting, make sure:

- The website is deployed on Vercel and publicly accessible.
- MongoDB Atlas has been seeded with scheduled flights.
- `/search` returns flight results.
- A new booking redirects to an invoice page.
- Cancellation works.
- Passenger trip lookup works.
- Your submitted package does **not** include `node_modules`, `.env.local`, or your real MongoDB password.

