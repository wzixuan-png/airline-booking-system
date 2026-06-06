export type Booking = {
  bookingRef: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: Date | string;
};

export type Schedule = {
  _id: string;
  flightNo: string;
  routeId: string;
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  originTimeZone: string;
  destinationTimeZone: string;
  departureTime: Date | string;
  arrivalTime: Date | string;
  departureDateLocal: string;
  aircraft: {
    id: string;
    type: string;
    capacity: number;
  };
  price: number;
  bookings?: Booking[];
  seatsBooked?: number;
  seatsLeft?: number;
};

export type PublicSchedule = Omit<Schedule, "bookings"> & {
  seatsBooked: number;
  seatsLeft: number;
};

export type BookingWithSchedule = {
  booking: Booking;
  schedule: PublicSchedule;
};
