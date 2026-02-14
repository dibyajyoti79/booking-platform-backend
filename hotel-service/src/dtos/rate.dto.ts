import { z } from "zod";
import { rateUpsertByDateRangeSchema } from "../validators/rate.validator";

export type RateUpsertByDateRangeDto = z.infer<
  typeof rateUpsertByDateRangeSchema
>;
