import { Router } from "express";

import { requireRole } from "../../middlewares/authorize.middleware";
import { validateParams, validateRequestBody } from "../../validators/index";
import {
  hotelIdSchema,
  hotelSchema,
  updateHotelSchema,
} from "../../validators/hotel.validator";
import {
  createHotel,
  getHotelById,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../../controllers/hotel.controller";

const hotelRouter = Router();

const hostOnly = requireRole(["host"]);

hotelRouter.post("/", hostOnly, validateRequestBody(hotelSchema), createHotel);
hotelRouter.get("/:id", validateParams(hotelIdSchema), getHotelById);
hotelRouter.get("/", getHotels);
hotelRouter.put(
  "/:id",
  hostOnly,
  validateParams(hotelIdSchema),
  validateRequestBody(updateHotelSchema),
  updateHotel,
);
hotelRouter.delete(
  "/:id",
  hostOnly,
  validateParams(hotelIdSchema),
  deleteHotel,
);

export default hotelRouter;
