import { z } from "zod";

export const roomTypeSchema = z.object({
  hotelId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  maxOccupancy: z.number().int().positive(),
});

export const roomTypeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  maxOccupancy: z.number().int().positive().optional(),
});

export const roomTypeIdSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), {
    message: "id must be a number string",
  }),
});

export const hotelIdParamSchema = z.object({
  hotelId: z.string().refine((val) => !isNaN(Number(val)), {
    message: "hotelId must be a number string",
  }),
});
