import { z } from "zod";

export const rateUpsertByDateRangeSchema = z
  .object({
    hotelId: z.coerce.number().int().positive(),
    roomTypeId: z.coerce.number().int().positive(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    rate: z.coerce.number().min(0),
  })
  .refine((data) => data.toDate >= data.fromDate, {
    message: "toDate must be on or after fromDate",
    path: ["toDate"],
  });
