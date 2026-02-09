import { z } from "zod";

export const createHotelSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  location: z.string().min(1),
  rating: z.number().optional(),
  ratingCount: z.number().optional(),
});

export const getHotelByIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), {
    message: "id must be a number string",
  }),
});
