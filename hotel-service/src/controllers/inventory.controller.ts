import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { InventoryService } from "../services/inventory.service";
import { InventoryRepository } from "../repositories/inventory.repository";

const inventoryService = new InventoryService(new InventoryRepository());

export async function upsertInventoryByDateRange(
  req: Request,
  res: Response
): Promise<void> {
  const inventories = await inventoryService.upsertByDateRange(req.body);
  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        `Upserted ${inventories.length} inventory record(s)`,
        inventories
      )
    );
}
