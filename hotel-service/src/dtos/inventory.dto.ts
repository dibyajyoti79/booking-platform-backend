import { z } from "zod";
import { inventoryUpsertByDateRangeSchema } from "../validators/inventory.validator";

export type InventoryUpsertByDateRangeDto = z.infer<
  typeof inventoryUpsertByDateRangeSchema
>;
