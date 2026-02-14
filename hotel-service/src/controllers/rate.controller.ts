import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { RateService } from "../services/rate.service";
import { RateRepository } from "../repositories/rate.repository";

const rateService = new RateService(new RateRepository());

export async function upsertRateByDateRange(
  req: Request,
  res: Response
): Promise<void> {
  const rates = await rateService.upsertByDateRange(req.body);
  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(`Upserted ${rates.length} rate record(s)`, rates)
    );
}
