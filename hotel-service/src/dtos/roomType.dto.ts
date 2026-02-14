import { z } from "zod";
import {
  roomTypeSchema,
  roomTypeUpdateSchema,
} from "../validators/roomType.validator";

export type CreateRoomTypeDto = z.infer<typeof roomTypeSchema>;
export type UpdateRoomTypeDto = z.infer<typeof roomTypeUpdateSchema>;
