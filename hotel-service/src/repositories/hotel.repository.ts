import Hotel from "../db/models/hotel";
import { CreateHotelDto, UpdateHotelDto } from "../dtos/hotel.dto";
import logger from "../config/logger.config";
import { NotFoundError } from "../utils/api-error";

export async function createHotel(hotel: CreateHotelDto) {
  const newHotel = await Hotel.create({
    name: hotel.name,
    address: hotel.address,
    location: hotel.location,
    rating: hotel.rating,
    rating_count: hotel.rating_count,
  });
  logger.info(`Hotel Created: ${newHotel.id}`);
  return newHotel;
}

export async function getHotelById(id: number) {
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    logger.error(`Hotel not found with id: ${id}`);
    throw new NotFoundError(`Hotel not found with id: ${id}`);
  }
  logger.info(`Hotel found with id: ${id}`);
  return hotel;
}

export async function getHotels() {
  const hotels = await Hotel.findAll();
  return hotels;
}

export async function updateHotel(id: number, hotel: UpdateHotelDto) {
  const updatedHotel = await Hotel.update(hotel, {
    where: { id },
  });
  logger.info(`Hotel updated with id: ${id}`);
  return updatedHotel;
}

export async function deleteHotel(id: number) {
  const deletedHotel = await Hotel.destroy({ where: { id } });
  if (!deletedHotel) {
    logger.error(`Hotel not found with id: ${id}`);
    throw new NotFoundError(`Hotel not found with id: ${id}`);
  }
  logger.info(`Hotel deleted with id: ${id}`);
  return deletedHotel;
}
