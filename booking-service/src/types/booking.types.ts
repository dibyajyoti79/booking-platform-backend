/**
 * Domain types for Booking
 */

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface Booking {
  id: string;
  userId: number;
  hotelId: number;
  bookingAmount: number;
  bookingStatus: BookingStatus;
  checkIn: Date;
  checkOut: Date;
  totalGuests: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  userId: number;
  hotelId: number;
  bookingAmount: number;
  checkIn: Date;
  checkOut: Date;
  totalGuests: number;
}

export interface UpdateBookingStatusInput {
  bookingId: string;
  status: BookingStatus;
}

export interface ListBookingsInput {
  userId: number;
  page: number;
  pageSize: number;
}

export interface ListBookingsResult {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
}
