import { Booking, BookingStatus } from "../types/booking.types";
import type { BookingProto } from "../types/booking.proto.types";
import { BookingStatusProto } from "../types/booking.proto.types";

/**
 * Mapper layer for converting between domain models and proto messages
 * Industry standard: Separate mapping logic from handlers
 */

/**
 * Map domain Booking to proto Booking message
 */
export function bookingToProto(booking: Booking): BookingProto {
  return {
    id: booking.id,
    user_id: booking.userId,
    hotel_id: booking.hotelId,
    booking_amount: booking.bookingAmount.toString(),
    booking_status: mapBookingStatusToProto(booking.bookingStatus),
    check_in: Math.floor(booking.checkIn.getTime() / 1000),
    check_out: Math.floor(booking.checkOut.getTime() / 1000),
    total_guests: booking.totalGuests,
    created_at: Math.floor(booking.createdAt.getTime() / 1000),
    updated_at: Math.floor(booking.updatedAt.getTime() / 1000),
  };
}

/**
 * Map proto BookingStatus enum to domain BookingStatus
 */
export function mapProtoStatusToDomain(
  protoStatus: BookingStatusProto
): BookingStatus {
  switch (protoStatus) {
    case BookingStatusProto.BOOKING_STATUS_PENDING:
      return BookingStatus.PENDING;
    case BookingStatusProto.BOOKING_STATUS_CONFIRMED:
      return BookingStatus.CONFIRMED;
    case BookingStatusProto.BOOKING_STATUS_CANCELLED:
      return BookingStatus.CANCELLED;
    default:
      return BookingStatus.PENDING;
  }
}

/**
 * Map domain BookingStatus to proto enum
 */
function mapBookingStatusToProto(status: BookingStatus): BookingStatusProto {
  switch (status) {
    case BookingStatus.PENDING:
      return BookingStatusProto.BOOKING_STATUS_PENDING;
    case BookingStatus.CONFIRMED:
      return BookingStatusProto.BOOKING_STATUS_CONFIRMED;
    case BookingStatus.CANCELLED:
      return BookingStatusProto.BOOKING_STATUS_CANCELLED;
    default:
      return BookingStatusProto.BOOKING_STATUS_UNSPECIFIED;
  }
}
