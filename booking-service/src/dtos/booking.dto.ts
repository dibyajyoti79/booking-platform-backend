import { z } from "zod";
import { createReservationSchema } from "../validators/reservation.validator";

export type CreateBookingDto = z.infer<typeof createReservationSchema> & {
  userId: number;
};
