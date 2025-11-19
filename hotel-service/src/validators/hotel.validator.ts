import { z } from "zod";

export const hotelSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  location: z.string().min(1),
  rating: z.number().optional(),
  rating_count: z.number().optional(),
});

export const hotelIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), {
    message: "id must be a number string",
  }),
});
