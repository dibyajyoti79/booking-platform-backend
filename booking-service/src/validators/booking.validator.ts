import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.number().int().positive(),
  hotelId: z.number().int().positive(),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  totalGuests: z.number().int().positive(),
});
