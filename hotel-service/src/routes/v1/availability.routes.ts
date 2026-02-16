import { Router } from "express";
import { validateRequestBody } from "../../validators/index";
import { getQuoteSchema } from "../../validators/availability.validator";
import { quote } from "../../controllers/availability.controller";

const availabilityRouter = Router();

availabilityRouter.post(
  "/quote",
  validateRequestBody(getQuoteSchema),
  quote
);

export default availabilityRouter;
