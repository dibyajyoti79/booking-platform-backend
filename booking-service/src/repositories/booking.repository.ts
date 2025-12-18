import { prisma } from "../prisma/client";
import type { Booking as PrismaBooking } from "../prisma/generated/client";
import {
  Booking,
  BookingStatus,
  CreateBookingInput,
  UpdateBookingStatusInput,
  ListBookingsInput,
  ListBookingsResult,
} from "../types/booking.types";

/**
 * Repository layer for Booking data access
 * Industry standard: Repository pattern for data persistence
 */
export class BookingRepository {
  /**
   * Create a new booking
   */
  async create(input: CreateBookingInput): Promise<Booking> {
    const booking = await prisma.booking.create({
      data: {
        userId: input.userId,
        hotelId: input.hotelId,
        bookingAmount: input.bookingAmount,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        totalGuests: input.totalGuests,
        bookingStatus: "PENDING",
      },
    });

    return this.mapPrismaToDomain(booking);
  }

  /**
   * Find booking by ID
   */
  async findById(id: string): Promise<Booking | null> {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return null;
    }

    return this.mapPrismaToDomain(booking);
  }

  /**
   * Update booking status
   */
  async updateStatus(input: UpdateBookingStatusInput): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id: input.bookingId },
      data: { bookingStatus: input.status },
    });

    return this.mapPrismaToDomain(booking);
  }

  /**
   * Cancel a booking
   */
  async cancel(id: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: { bookingStatus: "CANCELLED" },
    });

    return this.mapPrismaToDomain(booking);
  }

  /**
   * List bookings for a user with pagination
   */
  async listByUser(input: ListBookingsInput): Promise<ListBookingsResult> {
    const skip = (input.page - 1) * input.pageSize;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: input.userId },
        skip,
        take: input.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({
        where: { userId: input.userId },
      }),
    ]);

    return {
      bookings: bookings.map(this.mapPrismaToDomain),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  /**
   * Map Prisma model to domain model
   */
  private mapPrismaToDomain(prismaBooking: PrismaBooking): Booking {
    return {
      id: prismaBooking.id,
      userId: prismaBooking.userId,
      hotelId: prismaBooking.hotelId,
      bookingAmount: Number(prismaBooking.bookingAmount),
      bookingStatus: prismaBooking.bookingStatus as BookingStatus,
      checkIn: prismaBooking.checkIn,
      checkOut: prismaBooking.checkOut,
      totalGuests: prismaBooking.totalGuests,
      createdAt: prismaBooking.createdAt,
      updatedAt: prismaBooking.updatedAt,
    };
  }
}
