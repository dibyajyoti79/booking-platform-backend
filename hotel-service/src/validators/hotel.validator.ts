import { z } from "zod";

export const hotelSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  location: z.string().min(1),
  checkInTime: z.string().min(1),
  checkOutTime: z.string().min(1),
});

export const updateHotelSchema = hotelSchema.partial();

export const hotelIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), {
    message: "id must be a number string",
  }),
});

export const getHotelsQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
});
