/**
 * TypeScript types for Booking proto messages
 * Generated from booking.proto
 * Industry standard: Type-safe proto message definitions
 */

// Request types
export interface CreateBookingRequest {
  user_id: number;
  hotel_id: number;
  booking_amount: string;
  check_in: number; // Unix timestamp in seconds
  check_out: number; // Unix timestamp in seconds
  total_guests: number;
}

export interface GetBookingRequest {
  booking_id: string;
}

export interface UpdateBookingStatusRequest {
  booking_id: string;
  status: BookingStatusProto;
}

export interface CancelBookingRequest {
  booking_id: string;
}

export interface ListUserBookingsRequest {
  user_id: number;
  page?: number;
  page_size?: number;
}

// Response types
export interface BookingResponse {
  booking: BookingProto;
}

export interface ListBookingsResponse {
  bookings: BookingProto[];
  total: number;
  page: number;
  page_size: number;
}

// Proto message types
export interface BookingProto {
  id: string;
  user_id: number;
  hotel_id: number;
  booking_amount: string;
  booking_status: BookingStatusProto;
  check_in: number; // Unix timestamp in seconds
  check_out: number; // Unix timestamp in seconds
  total_guests: number;
  created_at: number; // Unix timestamp in seconds
  updated_at: number; // Unix timestamp in seconds
}

// Proto enum
export enum BookingStatusProto {
  BOOKING_STATUS_UNSPECIFIED = 0,
  BOOKING_STATUS_PENDING = 1,
  BOOKING_STATUS_CONFIRMED = 2,
  BOOKING_STATUS_CANCELLED = 3,
}
