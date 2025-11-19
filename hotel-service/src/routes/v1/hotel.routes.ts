import { Router } from "express";
import {
  createHotelController,
  deleteHotelController,
  getHotelByIdController,
  getHotelsController,
  updateHotelController,
} from "../../controllers/hotel.controller";
import { validateParams, validateRequestBody } from "../../validators/index";
import { hotelIdSchema, hotelSchema } from "../../validators/hotel.validator";

const hotelRouter = Router();

hotelRouter.post("/", validateRequestBody(hotelSchema), createHotelController);
hotelRouter.get("/:id", validateParams(hotelIdSchema), getHotelByIdController);
hotelRouter.get("/", getHotelsController);
hotelRouter.put(
  "/:id",
  validateParams(hotelIdSchema),
  validateRequestBody(hotelSchema),
  updateHotelController
);
hotelRouter.delete(
  "/:id",
  validateParams(hotelIdSchema),
  deleteHotelController
);

export default hotelRouter;
