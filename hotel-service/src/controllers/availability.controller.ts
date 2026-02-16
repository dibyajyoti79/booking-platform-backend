import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { getQuote } from "../services/availability.service";

export async function quote(
  req: Request,
  res: Response
): Promise<void> {
  const result = await getQuote(req.body);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Quote retrieved", result));
}
