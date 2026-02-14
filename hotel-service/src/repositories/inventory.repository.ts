import type { Inventory } from "../prisma/generated/client";
import type { InventoryUpsertByDateRangeDto } from "../dtos/inventory.dto";
import { prisma } from "../prisma/client";
import { getDatesInRange } from "../utils/date-range";

export interface IInventoryRepository {
  upsertByDateRange(dto: InventoryUpsertByDateRangeDto): Promise<Inventory[]>;
}

export class InventoryRepository implements IInventoryRepository {
  async upsertByDateRange(
    dto: InventoryUpsertByDateRangeDto
  ): Promise<Inventory[]> {
    const dates = getDatesInRange(dto.fromDate, dto.toDate);
    return prisma.$transaction(
      dates.map((date) =>
        prisma.inventory.upsert({
          where: {
            hotelId_roomTypeId_date: {
              hotelId: dto.hotelId,
              roomTypeId: dto.roomTypeId,
              date,
            },
          },
          create: {
            hotelId: dto.hotelId,
            roomTypeId: dto.roomTypeId,
            date,
            totalInventory: dto.totalInventory,
            totalReserved: 0,
          },
          update: { totalInventory: dto.totalInventory },
        })
      )
    );
  }
}
