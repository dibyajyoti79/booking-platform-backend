import type { Inventory } from "../prisma/generated/client";
import type { InventoryUpsertByDateRangeDto } from "../dtos/inventory.dto";
import { IInventoryRepository } from "../repositories/inventory.repository";

export interface IInventoryService {
  upsertByDateRange(dto: InventoryUpsertByDateRangeDto): Promise<Inventory[]>;
}

export class InventoryService implements IInventoryService {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async upsertByDateRange(
    dto: InventoryUpsertByDateRangeDto
  ): Promise<Inventory[]> {
    return this.inventoryRepository.upsertByDateRange(dto);
  }
}
