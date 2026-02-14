import { z } from "zod";

export const inventoryUpsertByDateRangeSchema = z
  .object({
    hotelId: z.coerce.number().int().positive(),
    roomTypeId: z.coerce.number().int().positive(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    totalInventory: z.coerce.number().int().min(0),
  })
  .refine((data) => data.toDate >= data.fromDate, {
    message: "toDate must be on or after fromDate",
    path: ["toDate"],
  });
