import { z } from "zod";

export const createReservationSchema = z
  .object({
    hotelId: z.number().int().positive(),
    roomTypeId: z.number().int().positive(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    totalGuests: z.number().int().positive(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });
