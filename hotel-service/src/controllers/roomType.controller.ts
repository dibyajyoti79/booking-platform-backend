import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { RoomTypeService } from "../services/roomType.service";
import { RoomTypeRepository } from "../repositories/roomType.repository";
import { BadRequestError } from "../utils/api-error";

const roomTypeService = new RoomTypeService(new RoomTypeRepository());

export async function createRoomType(
  req: Request,
  res: Response
): Promise<void> {
  const roomType = await roomTypeService.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse("Room type created successfully", roomType));
}

export async function getRoomTypeById(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Room type ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid room type ID");
  }
  const roomType = await roomTypeService.getById(id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Room type details fetched successfully", roomType));
}

export async function getRoomTypes(
  req: Request,
  res: Response
): Promise<void> {
  const roomTypes = await roomTypeService.getAll();
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Room types fetched successfully", roomTypes));
}

export async function updateRoomType(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Room type ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid room type ID");
  }
  const roomType = await roomTypeService.update(id, req.body);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Room type updated successfully", roomType));
}

export async function deleteRoomType(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Room type ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid room type ID");
  }
  await roomTypeService.delete(id);
  res.status(StatusCodes.NO_CONTENT).send();
}
