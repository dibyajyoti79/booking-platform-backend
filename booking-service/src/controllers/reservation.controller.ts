import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { BookingService } from "../services/booking.service";
import { BookingRepository } from "../repositories/booking.repository";
import { getQuote } from "../clients/hotel.client";
import { BadRequestError } from "../utils/api-error";

const bookingService = new BookingService(new BookingRepository());

export async function createReservation(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new BadRequestError("User context required");
  }
  const { hotelId, roomTypeId, checkIn, checkOut, totalGuests } = req.body;

  const quote = await getQuote({
    hotelId,
    roomTypeId,
    checkIn,
    checkOut,
    totalGuests,
  });

  if (!quote.available) {
    throw new BadRequestError(
      quote.message ?? "Room is not available for the selected dates"
    );
  }

  const { bookingId, idempotencyKey } = await bookingService.createBooking(
    {
      userId: user.id,
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      totalGuests,
    },
    quote.totalPrice
  );

  res.status(StatusCodes.CREATED).json(
    new ApiResponse("Reservation created successfully", {
      reservationId: bookingId,
      idempotencyKey,
      totalAmount: quote.totalPrice,
    })
  );
}

export async function confirmReservation(req: Request, res: Response) {
  const booking = await bookingService.finalizeBooking(
    req.params.idempotencyKey
  );
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Reservation confirmed successfully", booking));
}

export async function getReservationDetails(req: Request, res: Response) {
  if (!req.params.id) {
    throw new BadRequestError("Reservation ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new BadRequestError("Invalid reservation ID");
  }
  const booking = await bookingService.getBookingById(id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Reservation details fetched successfully", booking));
}
