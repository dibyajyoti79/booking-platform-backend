import { Booking } from "../prisma/generated/client";
import { IBookingRepository } from "../repositories/booking.repository";
import { CreateBookingDto } from "../dtos/booking.dto";
import { BadRequestError, NotFoundError } from "../utils/api-error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";

export interface IBookingService {
  createBooking(
    input: CreateBookingDto
  ): Promise<{ bookingId: number; idempotencyKey: string }>;
  finalizeBooking(idempotencyKey: string): Promise<Booking>;
  getBookingById(id: number): Promise<Booking>;
}

export class BookingService implements IBookingService {
  constructor(private readonly bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }
  async createBooking(
    data: CreateBookingDto
  ): Promise<{ bookingId: number; idempotencyKey: string }> {
    const amount = 100;
    const booking = await this.bookingRepository.create(data, amount);
    const idempotencyKey = generateIdempotencyKey();
    await this.bookingRepository.createIdempotencyKey(
      idempotencyKey,
      booking.id
    );
    return {
      bookingId: booking.id,
      idempotencyKey,
    };
  }
  async finalizeBooking(idempotencyKey: string): Promise<Booking> {
    const idempotencyKeyData = await this.bookingRepository.getIdempotencyKey(
      idempotencyKey
    );
    if (!idempotencyKeyData) {
      throw new NotFoundError("Idempotency key not found");
    }
    if (idempotencyKeyData.finalized) {
      throw new BadRequestError("Idempotency key already finalized");
    }
    const booking = await this.bookingRepository.confirmBooking(
      idempotencyKeyData.bookingId
    );
    await this.bookingRepository.finalizeIdempotencyKey(idempotencyKeyData.id);
    return booking;
  }
  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.getBookingById(id);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    return booking;
  }
}
