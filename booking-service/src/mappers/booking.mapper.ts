import {
  Booking as DomainBooking,
  BookingStatus as DomainBookingStatus,
  CreateBookingInput,
  UpdateBookingStatusInput,
  ListBookingsInput,
} from "../types/booking.types";
// Industry standard: Import from generated proto types
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  ListUserBookingsRequest,
} from "../proto/generated/booking";
import { BookingStatus } from "../proto/generated/booking";

/**
 * Mapper layer for converting between domain models and DTOs
 * Industry standard: Separate mapping logic from handlers
 */

/**
 * Map DTO CreateBookingRequest to domain CreateBookingInput
 * Generated types use camelCase (userId, hotelId) instead of snake_case
 */
export function createBookingRequestToDomain(
  dto: CreateBookingRequest
): CreateBookingInput {
  return {
    userId: dto.userId,
    hotelId: dto.hotelId,
    bookingAmount: parseFloat(dto.bookingAmount),
    checkIn: new Date(dto.checkIn * 1000),
    checkOut: new Date(dto.checkOut * 1000),
    totalGuests: dto.totalGuests,
  };
}

/**
 * Map DTO UpdateBookingStatusRequest to domain UpdateBookingStatusInput
 * Generated types use camelCase (bookingId) instead of snake_case
 */
export function updateBookingStatusRequestToDomain(
  dto: UpdateBookingStatusRequest
): UpdateBookingStatusInput {
  return {
    bookingId: dto.bookingId,
    status: mapDtoStatusToDomain(dto.status),
  };
}

/**
 * Map DTO ListUserBookingsRequest to domain ListBookingsInput
 * Generated types use camelCase (userId, pageSize) instead of snake_case
 */
export function listUserBookingsRequestToDomain(
  dto: ListUserBookingsRequest
): ListBookingsInput {
  return {
    userId: dto.userId,
    page: dto.page || 1,
    pageSize: dto.pageSize || 10,
  };
}

/**
 * Map domain Booking to generated DTO
 * Generated types use camelCase (userId, hotelId) instead of snake_case
 */
export function bookingToDto(booking: DomainBooking): Booking {
  return {
    id: booking.id,
    userId: booking.userId,
    hotelId: booking.hotelId,
    bookingAmount: booking.bookingAmount.toString(),
    bookingStatus: mapBookingStatusToDto(booking.bookingStatus),
    checkIn: Math.floor(booking.checkIn.getTime() / 1000),
    checkOut: Math.floor(booking.checkOut.getTime() / 1000),
    totalGuests: booking.totalGuests,
    createdAt: Math.floor(booking.createdAt.getTime() / 1000),
    updatedAt: Math.floor(booking.updatedAt.getTime() / 1000),
  };
}

/**
 * Map generated BookingStatus enum to domain BookingStatus
 * Generated types use string enum values (e.g., "BOOKING_STATUS_PENDING")
 */
export function mapDtoStatusToDomain(
  dtoStatus: BookingStatus
): DomainBookingStatus {
  // Generated enum uses string values - check enum constants directly
  switch (dtoStatus) {
    case BookingStatus.BOOKING_STATUS_PENDING:
      return DomainBookingStatus.PENDING;
    case BookingStatus.BOOKING_STATUS_CONFIRMED:
      return DomainBookingStatus.CONFIRMED;
    case BookingStatus.BOOKING_STATUS_CANCELLED:
      return DomainBookingStatus.CANCELLED;
    case BookingStatus.BOOKING_STATUS_UNSPECIFIED:
    case BookingStatus.UNRECOGNIZED:
    default:
      return DomainBookingStatus.PENDING;
  }
}

/**
 * Map domain BookingStatus to generated enum
 * Generated types use string enum values
 */
function mapBookingStatusToDto(status: DomainBookingStatus): BookingStatus {
  switch (status) {
    case DomainBookingStatus.PENDING:
      return BookingStatus.BOOKING_STATUS_PENDING;
    case DomainBookingStatus.CONFIRMED:
      return BookingStatus.BOOKING_STATUS_CONFIRMED;
    case DomainBookingStatus.CANCELLED:
      return BookingStatus.BOOKING_STATUS_CANCELLED;
    default:
      return BookingStatus.BOOKING_STATUS_UNSPECIFIED;
  }
}
