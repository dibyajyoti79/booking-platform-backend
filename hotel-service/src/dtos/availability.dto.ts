import { z } from "zod";
import { getQuoteSchema } from "../validators/availability.validator";

export type GetQuoteDto = z.infer<typeof getQuoteSchema>;

export interface QuoteResultDto {
  available: boolean;
  totalPrice: number;
  nightlyRates: { date: string; rate: number }[];
  message?: string;
}
