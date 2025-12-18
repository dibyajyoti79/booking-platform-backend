import { BookingRepository } from "../repositories/booking.repository";
import {
  Booking,
  CreateBookingInput,
  UpdateBookingStatusInput,
  ListBookingsInput,
  ListBookingsResult,
  BookingStatus,
} from "../types/booking.types";
import { NotFoundError, BadRequestError } from "../utils/api-error";

/**
 * Service layer for Booking business logic
 * Industry standard: Service layer handles business rules and validation
 */
export class BookingService {
  private bookingRepository: BookingRepository;

  constructor(bookingRepository?: BookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  /**
   * Create a new booking
   */
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // Business logic validation
    this.validateBookingDates(input.checkIn, input.checkOut);
    this.validateBookingAmount(input.bookingAmount);
    this.validateTotalGuests(input.totalGuests);

    return this.bookingRepository.create(input);
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return booking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(input: UpdateBookingStatusInput): Promise<Booking> {
    // Verify booking exists
    const existingBooking = await this.bookingRepository.findById(input.bookingId);
    if (!existingBooking) {
      throw new NotFoundError("Booking not found");
    }

    // Business rule: Can't update status of cancelled bookings
    if (existingBooking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BadRequestError("Cannot update status of a cancelled booking");
    }

    return this.bookingRepository.updateStatus(input);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BadRequestError("Booking is already cancelled");
    }

    return this.bookingRepository.cancel(id);
  }

  /**
   * List bookings for a user
   */
  async listUserBookings(input: ListBookingsInput): Promise<ListBookingsResult> {
    // Validate pagination
    if (input.page < 1) {
      throw new BadRequestError("Page must be greater than 0");
    }

    if (input.pageSize < 1 || input.pageSize > 100) {
      throw new BadRequestError("Page size must be between 1 and 100");
    }

    return this.bookingRepository.listByUser(input);
  }

  /**
   * Validate booking dates
   */
  private validateBookingDates(checkIn: Date, checkOut: Date): void {
    if (checkIn >= checkOut) {
      throw new BadRequestError("Check-in date must be before check-out date");
    }

    if (checkIn < new Date()) {
      throw new BadRequestError("Check-in date cannot be in the past");
    }
  }

  /**
   * Validate booking amount
   */
  private validateBookingAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestError("Booking amount must be greater than 0");
    }
  }

  /**
   * Validate total guests
   */
  private validateTotalGuests(guests: number): void {
    if (guests < 1) {
      throw new BadRequestError("Total guests must be at least 1");
    }

    if (guests > 20) {
      throw new BadRequestError("Total guests cannot exceed 20");
    }
  }
}

