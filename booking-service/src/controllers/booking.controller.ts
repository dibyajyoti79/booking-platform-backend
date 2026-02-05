import { BookingService } from "../services/booking.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { BookingRepository } from "../repositories/booking.repository";
import { BadRequestError } from "../utils/api-error";

const bookingService = new BookingService(new BookingRepository());

export async function createBooking(req: Request, res: Response) {
  const booking = await bookingService.createBooking(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse("Booking created successfully", booking));
}

export async function confirmBooking(req: Request, res: Response) {
  const booking = await bookingService.finalizeBooking(
    req.params.idempotencyKey
  );
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Booking Confirmed successfully", booking));
}

export async function getBookingDetails(req: Request, res: Response) {
  if (!req.params.id) {
    throw new BadRequestError("Booking ID is required");
  }
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new BadRequestError("Invalid booking ID");
  }
  const booking = await bookingService.getBookingById(id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Booking details fetched successfully", booking));
}
