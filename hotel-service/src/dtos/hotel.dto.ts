import { z } from "zod";
import { hotelSchema, updateHotelSchema } from "../validators/hotel.validator";

export type CreateHotelDto = z.infer<typeof hotelSchema>;
export type UpdateHotelDto = z.infer<typeof updateHotelSchema>;
