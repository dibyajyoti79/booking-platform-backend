import { Router } from "express";
import {
  confirmBooking,
  createBooking,
  getBookingDetails,
} from "../../controllers/booking.controller";
import { validateRequestBody } from "../../validators/index";
import { createBookingSchema } from "../../validators/booking.validator";

const bookingRouter = Router();

bookingRouter.post(
  "/",
  validateRequestBody(createBookingSchema),
  createBooking
);

bookingRouter.post("/confirm/:idempotencyKey", confirmBooking);

bookingRouter.get("/:id", getBookingDetails);

export default bookingRouter;
