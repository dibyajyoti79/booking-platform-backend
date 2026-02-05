import { z } from "zod";
import { createBookingSchema } from "../validators/booking.validator";

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
