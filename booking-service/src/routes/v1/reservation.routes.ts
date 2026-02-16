import { Router } from "express";
import {
  createReservation,
  confirmReservation,
  getReservationDetails,
} from "../../controllers/reservation.controller";
import { validateRequestBody } from "../../validators/index";
import { createReservationSchema } from "../../validators/reservation.validator";
import { attachUserFromHeaders } from "../../middlewares/user.middleware";

const reservationRouter = Router();

reservationRouter.use(attachUserFromHeaders);

reservationRouter.post(
  "/",
  validateRequestBody(createReservationSchema),
  createReservation
);

reservationRouter.post("/confirm/:idempotencyKey", confirmReservation);

reservationRouter.get("/:id", getReservationDetails);

export default reservationRouter;
