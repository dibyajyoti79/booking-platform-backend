import {
  createHotelService,
  deleteHotelService,
  getHotelByIdService,
  getHotelsService,
  updateHotelService,
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

export async function getHotelsController(req: Request, res: Response) {
  const hotels = await getHotelsService();
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotels found successfully", hotels));
}

export async function updateHotelController(req: Request, res: Response) {
  const hotel = await updateHotelService(Number(req.params.id), req.body);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotel updated successfully", hotel));
}

export async function deleteHotelController(req: Request, res: Response) {
  const hotel = await deleteHotelService(Number(req.params.id));
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotel deleted successfully", hotel));
}
