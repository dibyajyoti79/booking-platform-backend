import * as grpc from "@grpc/grpc-js";
import logger from "../config/logger.config";
import { getCorrelationId } from "../utils/helpers/request.helpers";
import { handleGrpcError } from "../interceptors/error.interceptor";
import { withServerInterceptor } from "../interceptors/server.interceptor";
import { BookingService } from "../services/booking.service";
import {
  bookingToProto,
  mapProtoStatusToDomain,
} from "../mappers/booking.mapper";
import { CreateBookingInput } from "../types/booking.types";
import type {
  CreateBookingRequest,
  GetBookingRequest,
  UpdateBookingStatusRequest,
  CancelBookingRequest,
  ListUserBookingsRequest,
  BookingResponse,
  ListBookingsResponse,
} from "../types/booking.proto.types";

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
    const {
      user_id,
      hotel_id,
      booking_amount,
      check_in,
      check_out,
      total_guests,
    } = call.request;

    logger.info({
      correlationId: getCorrelationId(),
      method: "CreateBooking",
      userId: user_id,
      hotelId: hotel_id,
    });

    const input: CreateBookingInput = {
      userId: user_id,
      hotelId: hotel_id,
      bookingAmount: parseFloat(booking_amount),
      checkIn: new Date(check_in * 1000),
      checkOut: new Date(check_out * 1000),
      totalGuests: total_guests,
    };

    const booking = await bookingService.createBooking(input);

    const response: BookingResponse = {
      booking: bookingToProto(booking),
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
    const { booking_id } = call.request;

    logger.info({
      correlationId: getCorrelationId(),
      method: "GetBooking",
      bookingId: booking_id,
    });

    const booking = await bookingService.getBookingById(booking_id);

    const response: BookingResponse = {
      booking: bookingToProto(booking),
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
      const { booking_id, status } = call.request;

      logger.info({
        correlationId: getCorrelationId(),
        method: "UpdateBookingStatus",
        bookingId: booking_id,
        status,
      });

      const bookingStatus = mapProtoStatusToDomain(status);
      const booking = await bookingService.updateBookingStatus({
        bookingId: booking_id,
        status: bookingStatus,
      });

      const response: BookingResponse = {
        booking: bookingToProto(booking),
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
    const { booking_id } = call.request;

    logger.info({
      correlationId: getCorrelationId(),
      method: "CancelBooking",
      bookingId: booking_id,
    });

    const booking = await bookingService.cancelBooking(booking_id);

    const response: BookingResponse = {
      booking: bookingToProto(booking),
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
      const { user_id, page = 1, page_size = 10 } = call.request;

      logger.info({
        correlationId: getCorrelationId(),
        method: "ListUserBookings",
        userId: user_id,
        page,
        pageSize: page_size,
      });

      const result = await bookingService.listUserBookings({
        userId: user_id,
        page,
        pageSize: page_size,
      });

      const response: ListBookingsResponse = {
        bookings: result.bookings.map(bookingToProto),
        total: result.total,
        page: result.page,
        page_size: result.pageSize,
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
