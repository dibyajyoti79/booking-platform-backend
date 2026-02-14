import { Router } from "express";
import { requireRole } from "../../middlewares/authorize.middleware";
import { validateRequestBody } from "../../validators/index";
import { rateUpsertByDateRangeSchema } from "../../validators/rate.validator";
import { upsertRateByDateRange } from "../../controllers/rate.controller";

const rateRouter = Router();
const hostOnly = requireRole(["host"]);

rateRouter.post(
  "/upsert-by-date-range",
  hostOnly,
  validateRequestBody(rateUpsertByDateRangeSchema),
  upsertRateByDateRange
);

export default rateRouter;
