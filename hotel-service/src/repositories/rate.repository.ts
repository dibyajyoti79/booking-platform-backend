import type { Rate } from "../prisma/generated/client";
import type { RateUpsertByDateRangeDto } from "../dtos/rate.dto";
import { prisma } from "../prisma/client";
import { getDatesInRange } from "../utils/date-range";

export interface IRateRepository {
  upsertByDateRange(dto: RateUpsertByDateRangeDto): Promise<Rate[]>;
}

export class RateRepository implements IRateRepository {
  async upsertByDateRange(dto: RateUpsertByDateRangeDto): Promise<Rate[]> {
    const dates = getDatesInRange(dto.fromDate, dto.toDate);
    return prisma.$transaction(
      dates.map((date) =>
        prisma.rate.upsert({
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
            rate: dto.rate,
          },
          update: { rate: dto.rate },
        })
      )
    );
  }
}
