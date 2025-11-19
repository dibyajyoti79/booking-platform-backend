import {
  createHotelService,
  getHotelByIdService,
} from "../services/hotel.service";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { Request, Response } from "express";

export async function createHotelController(req: Request, res: Response) {
  const hotel = await createHotelService(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse("Hotel created successfully", hotel));
}

export async function getHotelByIdController(req: Request, res: Response) {
  const hotel = await getHotelByIdService(Number(req.params.id));
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotel found successfully", hotel));
}
