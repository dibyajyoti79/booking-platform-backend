import type { Rate } from "../prisma/generated/client";
import type { RateUpsertByDateRangeDto } from "../dtos/rate.dto";
import { IRateRepository } from "../repositories/rate.repository";

export interface IRateService {
  upsertByDateRange(dto: RateUpsertByDateRangeDto): Promise<Rate[]>;
}

export class RateService implements IRateService {
  constructor(private readonly rateRepository: IRateRepository) {}

  async upsertByDateRange(dto: RateUpsertByDateRangeDto): Promise<Rate[]> {
    return this.rateRepository.upsertByDateRange(dto);
  }
}
