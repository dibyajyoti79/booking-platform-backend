import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/api-response";
import { HotelService } from "../services/hotel.service";
import { HotelRepository } from "../repositories/hotel.repository";
import { getElasticsearchClient } from "../elasticsearch/client";
import { hotelSearchIndex } from "../elasticsearch/hotel-index";
import { BadRequestError, ServiceUnavailableError } from "../utils/api-error";

const searchIndex = getElasticsearchClient() ? hotelSearchIndex : undefined;
const hotelService = new HotelService(new HotelRepository(), searchIndex);

export async function createHotel(
  req: Request,
  res: Response
): Promise<void> {
  const hotel = await hotelService.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse("Hotel created successfully", hotel));
}

export async function getHotelById(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Hotel ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid hotel ID");
  }
  const hotel = await hotelService.getById(id);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotel details fetched successfully", hotel));
}

export async function getHotels(req: Request, res: Response): Promise<void> {
  const q = req.query.q;
  const searchQuery =
    typeof q === "string" && q.trim().length > 0 ? q.trim() : null;
  if (searchQuery && !searchIndex) {
    throw new ServiceUnavailableError(
      "Search is not available. Elasticsearch is not configured."
    );
  }
  const hotels = searchQuery
    ? await hotelService.search(searchQuery)
    : await hotelService.getAll();
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotels fetched successfully", hotels));
}

export async function updateHotel(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Hotel ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid hotel ID");
  }
  const hotel = await hotelService.update(id, req.body);
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse("Hotel updated successfully", hotel));
}

export async function deleteHotel(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.params.id) {
    throw new BadRequestError("Hotel ID is required");
  }
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError("Invalid hotel ID");
  }
  await hotelService.delete(id);
  res.status(StatusCodes.NO_CONTENT).send();
}
