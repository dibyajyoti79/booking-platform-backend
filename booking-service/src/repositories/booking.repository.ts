import { CreateBookingDto } from "../dtos/booking.dto";
import { prisma } from "../prisma/client";
import type { IdempotencyKey, Booking } from "../prisma/generated/client";
import { Prisma } from "../prisma/generated/client";
import { BadRequestError, NotFoundError } from "../utils/api-error";
import { validate as isValidUUID } from "uuid";

export interface IBookingRepository {
  create(data: CreateBookingDto, amount: number): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | null>;
  confirmBooking(
    tx: Prisma.TransactionClient,
    bookingId: number
  ): Promise<Booking>;
  cancelBooking(id: number): Promise<Booking>;
  createIdempotencyKey(key: string, bookingId: number): Promise<IdempotencyKey>;
  getIdempotencyKeyWithLock(
    tx: Prisma.TransactionClient,
    key: string
  ): Promise<IdempotencyKey>;
  finalizeIdempotencyKey(
    tx: Prisma.TransactionClient,
    key: string
  ): Promise<IdempotencyKey>;
}

export class BookingRepository implements IBookingRepository {
  async create(data: CreateBookingDto, amount: number): Promise<Booking> {
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        hotelId: data.hotelId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalGuests: data.totalGuests,
        bookingAmount: amount,
        bookingStatus: "PENDING",
      },
    });

    return booking;
  }

  async getBookingById(id: number): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });
    return booking;
  }

  async confirmBooking(
    tx: Prisma.TransactionClient,
    bookingId: number
  ): Promise<Booking> {
    const booking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        bookingStatus: "CONFIRMED",
      },
    });
    return booking;
  }

  async cancelBooking(id: number): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        bookingStatus: "CANCELLED",
      },
    });
    return booking;
  }

  async createIdempotencyKey(
    key: string,
    bookingId: number
  ): Promise<IdempotencyKey> {
    const idempotencyKey = await prisma.idempotencyKey.create({
      data: {
        idemKey: key,
        booking: {
          connect: {
            id: bookingId,
          },
        },
      },
    });
    return idempotencyKey;
  }

  async getIdempotencyKeyWithLock(tx: Prisma.TransactionClient, key: string) {
    if (!isValidUUID(key)) {
      throw new BadRequestError("Invalid idempotency key format");
    }

    const idempotencyKey: Array<IdempotencyKey> = await tx.$queryRaw(
      Prisma.raw(
        `SELECT * FROM idempotencykey WHERE idemKey = '${key}' FOR UPDATE;`
      )
    );

    if (!idempotencyKey || idempotencyKey.length === 0) {
      throw new NotFoundError("Idempotency key not found");
    }

    return idempotencyKey[0];
  }

  async finalizeIdempotencyKey(tx: Prisma.TransactionClient, key: string) {
    const idempotencyKey = await tx.idempotencyKey.update({
      where: {
        idemKey: key,
      },
      data: {
        finalized: true,
      },
    });

    return idempotencyKey;
  }
}
