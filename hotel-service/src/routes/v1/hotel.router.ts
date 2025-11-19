import { Router } from "express";
import {
  createHotelController,
  getHotelByIdController,
} from "../../controllers/hotel.controller";
import { validateParams, validateRequestBody } from "../../validators/index";
import { hotelIdSchema, hotelSchema } from "../../validators/hotel.validator";

const hotelRouter = Router();

hotelRouter.post("/", validateRequestBody(hotelSchema), createHotelController);
hotelRouter.get("/:id", validateParams(hotelIdSchema), getHotelByIdController);

export default hotelRouter;
