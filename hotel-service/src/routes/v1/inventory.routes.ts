import { Router } from "express";
import { requireRole } from "../../middlewares/authorize.middleware";
import { validateRequestBody } from "../../validators/index";
import { inventoryUpsertByDateRangeSchema } from "../../validators/inventory.validator";
import { upsertInventoryByDateRange } from "../../controllers/inventory.controller";

const inventoryRouter = Router();
const hostOnly = requireRole(["host"]);

inventoryRouter.post(
  "/upsert-by-date-range",
  hostOnly,
  validateRequestBody(inventoryUpsertByDateRangeSchema),
  upsertInventoryByDateRange
);

export default inventoryRouter;
