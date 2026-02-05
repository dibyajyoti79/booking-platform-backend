import { CreateBookingDto } from "../dtos/booking.dto";
import { prisma } from "../prisma/client";
import type { IdempotencyKey, Booking } from "../prisma/generated/client";

export interface IBookingRepository {
  create(data: CreateBookingDto, amount: number): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | null>;
  confirmBooking(id: number): Promise<Booking>;
  cancelBooking(id: number): Promise<Booking>;
  createIdempotencyKey(key: string, bookingId: number): Promise<IdempotencyKey>;
  getIdempotencyKey(key: string): Promise<IdempotencyKey | null>;
  finalizeIdempotencyKey(id: number): Promise<IdempotencyKey>;
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

  async confirmBooking(id: number): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: {
        id,
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
        key,
        booking: {
          connect: {
            id: bookingId,
          },
        },
      },
    });
    return idempotencyKey;
  }

  async getIdempotencyKey(key: string): Promise<IdempotencyKey | null> {
    return prisma.idempotencyKey.findUnique({
      where: {
        key,
      },
    });
  }

  async finalizeIdempotencyKey(id: number): Promise<IdempotencyKey> {
    const idempotencyKey = await prisma.idempotencyKey.update({
      where: {
        id,
      },
      data: {
        finalized: true,
      },
    });
    return idempotencyKey;
  }
}
