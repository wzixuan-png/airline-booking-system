# Submission checklist

Use this checklist before submitting.

## Functional requirements

- [ ] Landing page opens at `/`.
- [ ] Flight search works at `/search`.
- [ ] Search supports origin, destination, and real calendar date range.
- [ ] Search results show flight number, departure, arrival, aircraft, price, and seats left.
- [ ] User can select a scheduled flight and make a booking.
- [ ] Booking reference is unique and shown on invoice page.
- [ ] Full flights cannot be booked.
- [ ] User can cancel a booking.
- [ ] User can search by email to see all booked scheduled flights.
- [ ] No login/registration is required.

## Data requirements

- [ ] MongoDB Atlas connection string is set in `.env.local` locally.
- [ ] MongoDB Atlas connection string is set in Vercel Environment Variables.
- [ ] `npm run seed` has been run successfully.
- [ ] Database contains more than one week of scheduled flights.
- [ ] Timetable uses real dates, not only weekday names.
- [ ] Sydney and Chatham time zones are displayed correctly.

## Presentation requirements

- [ ] UI is styled beyond plain HTML.
- [ ] Invoice page is clear and readable.
- [ ] User guidance is visible on search and booking pages.

## Deployment requirements

- [ ] Website deployed on Vercel.
- [ ] Public Vercel URL works in an incognito/private browser window.
- [ ] `node_modules` is not included in submitted zip.
- [ ] `.env.local` is not included in submitted zip.
- [ ] README instructions are included.
