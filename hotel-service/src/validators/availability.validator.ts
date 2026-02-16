import { z } from "zod";

export const getQuoteSchema = z
  .object({
    hotelId: z.coerce.number().int().positive(),
    roomTypeId: z.coerce.number().int().positive(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    totalGuests: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });
