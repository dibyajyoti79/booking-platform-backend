import type { Reservation } from "../prisma/generated/client";
import { IBookingRepository } from "../repositories/booking.repository";
import type { CreateBookingDto } from "../dtos/booking.dto";
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
    amount: number
  ): Promise<{ bookingId: number; idempotencyKey: string }>;
  finalizeBooking(idempotencyKey: string): Promise<Reservation>;
  getBookingById(id: number): Promise<Reservation>;
}

export class BookingService implements IBookingService {
  constructor(private readonly bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }
  async createBooking(
    data: CreateBookingDto,
    amount: number
  ): Promise<{ bookingId: number; idempotencyKey: string }> {
    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${data.hotelId}:roomType:${data.roomTypeId}`;

    try {
      await redlock.acquire([bookingResource], ttl);
      const reservation = await this.bookingRepository.create(data, amount);
      const idempotencyKey = generateIdempotencyKey();
      await this.bookingRepository.createIdempotencyKey(
        idempotencyKey,
        reservation.id,
      );
      return {
        bookingId: reservation.id,
        idempotencyKey,
      };
    } catch (error) {
      throw new InternalServerError(
        "Failed to acquire lock for booking resource",
      );
    }
  }
  async finalizeBooking(idempotencyKey: string): Promise<Reservation> {
    return await prisma.$transaction(async (tx) => {
      const idempotencyKeyData =
        await this.bookingRepository.getIdempotencyKeyWithLock(
          tx,
          idempotencyKey,
        );

      if (!idempotencyKeyData?.reservationId) {
        throw new NotFoundError("Idempotency key not found");
      }

      if (idempotencyKeyData.finalized) {
        throw new BadRequestError("Idempotency key already finalized");
      }

      const reservation = await this.bookingRepository.confirmBooking(
        tx,
        idempotencyKeyData.reservationId,
      );
      await this.bookingRepository.finalizeIdempotencyKey(tx, idempotencyKey);

      return reservation;
    });
  }
  async getBookingById(id: number): Promise<Reservation> {
    const reservation = await this.bookingRepository.getBookingById(id);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }
    return reservation;
  }
}
