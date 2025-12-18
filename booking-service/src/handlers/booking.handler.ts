import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { getCorrelationId } from "../utils/helpers/request.helpers";
import { handleGrpcError } from "../interceptors/error.interceptor";
import { withServerInterceptor } from "../interceptors/server.interceptor";
import { BookingService } from "../services/booking.service";
import {
  bookingToDto,
  createBookingRequestToDomain,
  updateBookingStatusRequestToDomain,
  listUserBookingsRequestToDomain,
} from "../mappers/booking.mapper";
// Industry standard: Import from generated proto types
import type {
  CreateBookingRequest,
  GetBookingRequest,
  UpdateBookingStatusRequest,
  CancelBookingRequest,
  ListUserBookingsRequest,
  BookingResponse,
  ListBookingsResponse,
} from "../proto/generated/booking";

// Type definitions for booking service handlers
interface BookingServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateBooking: grpc.handleUnaryCall<CreateBookingRequest, BookingResponse>;
  GetBooking: grpc.handleUnaryCall<GetBookingRequest, BookingResponse>;
  UpdateBookingStatus: grpc.handleUnaryCall<
    UpdateBookingStatusRequest,
    BookingResponse
  >;
  CancelBooking: grpc.handleUnaryCall<CancelBookingRequest, BookingResponse>;
  ListUserBookings: grpc.handleUnaryCall<
    ListUserBookingsRequest,
    ListBookingsResponse
  >;
}

// Initialize service
const bookingService = new BookingService();

/**
 * Create a new booking
 */
const createBookingHandler: BookingServiceHandlers["CreateBooking"] = async (
  call: grpc.ServerUnaryCall<CreateBookingRequest, BookingResponse>,
  callback: grpc.sendUnaryData<BookingResponse>
) => {
  try {
    logger.info({
      correlationId: getCorrelationId(),
      method: "CreateBooking",
      userId: call.request.userId,
      hotelId: call.request.hotelId,
    });

    const input = createBookingRequestToDomain(call.request);
    const booking = await bookingService.createBooking(input);

    const response: BookingResponse = {
      booking: bookingToDto(booking),
    };

    callback(null, response);
  } catch (error) {
    callback(handleGrpcError(error), null);
  }
};

/**
 * Get booking by ID
 */
const getBookingHandler: BookingServiceHandlers["GetBooking"] = async (
  call: grpc.ServerUnaryCall<GetBookingRequest, BookingResponse>,
  callback: grpc.sendUnaryData<BookingResponse>
) => {
  try {
    const { bookingId } = call.request;

    logger.info({
      correlationId: getCorrelationId(),
      method: "GetBooking",
      bookingId: bookingId,
    });

    const booking = await bookingService.getBookingById(bookingId);

    const response: BookingResponse = {
      booking: bookingToDto(booking),
    };

    callback(null, response);
  } catch (error) {
    callback(handleGrpcError(error), null);
  }
};

/**
 * Update booking status
 */
const updateBookingStatusHandler: BookingServiceHandlers["UpdateBookingStatus"] =
  async (
    call: grpc.ServerUnaryCall<UpdateBookingStatusRequest, BookingResponse>,
    callback: grpc.sendUnaryData<BookingResponse>
  ) => {
    try {
      logger.info({
        correlationId: getCorrelationId(),
        method: "UpdateBookingStatus",
        bookingId: call.request.bookingId,
        status: call.request.status,
      });

      const input = updateBookingStatusRequestToDomain(call.request);
      const booking = await bookingService.updateBookingStatus(input);

      const response: BookingResponse = {
        booking: bookingToDto(booking),
      };

      callback(null, response);
    } catch (error) {
      callback(handleGrpcError(error), null);
    }
  };

/**
 * Cancel a booking
 */
const cancelBookingHandler: BookingServiceHandlers["CancelBooking"] = async (
  call: grpc.ServerUnaryCall<CancelBookingRequest, BookingResponse>,
  callback: grpc.sendUnaryData<BookingResponse>
) => {
  try {
    const { bookingId } = call.request;

    logger.info({
      correlationId: getCorrelationId(),
      method: "CancelBooking",
      bookingId: bookingId,
    });

    const booking = await bookingService.cancelBooking(bookingId);

    const response: BookingResponse = {
      booking: bookingToDto(booking),
    };

    callback(null, response);
  } catch (error) {
    callback(handleGrpcError(error), null);
  }
};

/**
 * List bookings for a user
 */
const listUserBookingsHandler: BookingServiceHandlers["ListUserBookings"] =
  async (
    call: grpc.ServerUnaryCall<ListUserBookingsRequest, ListBookingsResponse>,
    callback: grpc.sendUnaryData<ListBookingsResponse>
  ) => {
    try {
      logger.info({
        correlationId: getCorrelationId(),
        method: "ListUserBookings",
        userId: call.request.userId,
        page: call.request.page || 1,
        pageSize: call.request.pageSize || 10,
      });

      const input = listUserBookingsRequestToDomain(call.request);
      const result = await bookingService.listUserBookings(input);

      const response: ListBookingsResponse = {
        bookings: result.bookings.map(bookingToDto),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };

      callback(null, response);
    } catch (error) {
      callback(handleGrpcError(error), null);
    }
  };

// Apply server interceptor to all handlers
export const bookingHandlers: BookingServiceHandlers = {
  CreateBooking: withServerInterceptor(createBookingHandler),
  GetBooking: withServerInterceptor(getBookingHandler),
  UpdateBookingStatus: withServerInterceptor(updateBookingStatusHandler),
  CancelBooking: withServerInterceptor(cancelBookingHandler),
  ListUserBookings: withServerInterceptor(listUserBookingsHandler),
};
