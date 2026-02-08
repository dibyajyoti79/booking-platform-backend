import { Booking } from "../prisma/generated/client";
import { IBookingRepository } from "../repositories/booking.repository";
import { CreateBookingDto } from "../dtos/booking.dto";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/api-error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";
import { prisma } from "../prisma/client";
import { serverConfig } from "../config";
import { redlock } from "../config/redis.config";

export interface IBookingService {
  createBooking(
    input: CreateBookingDto,
  ): Promise<{ bookingId: number; idempotencyKey: string }>;
  finalizeBooking(idempotencyKey: string): Promise<Booking>;
  getBookingById(id: number): Promise<Booking>;
}

export class BookingService implements IBookingService {
  constructor(private readonly bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }
  async createBooking(
    data: CreateBookingDto,
  ): Promise<{ bookingId: number; idempotencyKey: string }> {
    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${data.hotelId}`;

    try {
      await redlock.acquire([bookingResource], ttl);
      const amount = 100;
      const booking = await this.bookingRepository.create(data, amount);
      const idempotencyKey = generateIdempotencyKey();
      await this.bookingRepository.createIdempotencyKey(
        idempotencyKey,
        booking.id,
      );
      return {
        bookingId: booking.id,
        idempotencyKey,
      };
    } catch (error) {
      throw new InternalServerError(
        "Failed to acquire lock for booking resource",
      );
    }
  }
  async finalizeBooking(idempotencyKey: string): Promise<Booking> {
    return await prisma.$transaction(async (tx) => {
      const idempotencyKeyData =
        await this.bookingRepository.getIdempotencyKeyWithLock(
          tx,
          idempotencyKey,
        );

      if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
        throw new NotFoundError("Idempotency key not found");
      }

      if (idempotencyKeyData.finalized) {
        throw new BadRequestError("Idempotency key already finalized");
      }

      const booking = await this.bookingRepository.confirmBooking(
        tx,
        idempotencyKeyData.bookingId,
      );
      await this.bookingRepository.finalizeIdempotencyKey(tx, idempotencyKey);

      return booking;
    });
  }
  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.getBookingById(id);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    return booking;
  }
}
