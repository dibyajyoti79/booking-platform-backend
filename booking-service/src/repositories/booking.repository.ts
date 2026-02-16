import { CreateBookingDto } from "../dtos/booking.dto";
import { prisma } from "../prisma/client";
import type { IdempotencyKey, Reservation } from "../prisma/generated/client";
import { Prisma } from "../prisma/generated/client";
import { BadRequestError, NotFoundError } from "../utils/api-error";
import { validate as isValidUUID } from "uuid";

export interface IBookingRepository {
  create(data: CreateBookingDto, amount: number): Promise<Reservation>;
  getBookingById(id: number): Promise<Reservation | null>;
  confirmBooking(
    tx: Prisma.TransactionClient,
    reservationId: number
  ): Promise<Reservation>;
  createIdempotencyKey(key: string, reservationId: number): Promise<IdempotencyKey>;
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
  async create(data: CreateBookingDto, amount: number): Promise<Reservation> {
    const reservation = await prisma.reservation.create({
      data: {
        userId: data.userId,
        hotelId: data.hotelId,
        roomTypeId: data.roomTypeId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        quantity: 1,
        totalAmount: amount,
        status: "PENDING",
      },
    });

    return reservation;
  }

  async getBookingById(id: number): Promise<Reservation | null> {
    return prisma.reservation.findUnique({
      where: { id },
    });
  }

  async confirmBooking(
    tx: Prisma.TransactionClient,
    reservationId: number
  ): Promise<Reservation> {
    return tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    });
  }

  async createIdempotencyKey(
    key: string,
    reservationId: number
  ): Promise<IdempotencyKey> {
    return prisma.idempotencyKey.create({
      data: {
        idemKey: key,
        reservation: {
          connect: { id: reservationId },
        },
      },
    });
  }

  async getIdempotencyKeyWithLock(tx: Prisma.TransactionClient, key: string) {
    if (!isValidUUID(key)) {
      throw new BadRequestError("Invalid idempotency key format");
    }

    const rows = await tx.$queryRaw<IdempotencyKey[]>(
      Prisma.raw(
        `SELECT * FROM idempotencykey WHERE idemKey = '${key}' FOR UPDATE;`
      )
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundError("Idempotency key not found");
    }

    return rows[0];
  }

  async finalizeIdempotencyKey(tx: Prisma.TransactionClient, key: string) {
    return tx.idempotencyKey.update({
      where: { idemKey: key },
      data: { finalized: true },
    });
  }
}
