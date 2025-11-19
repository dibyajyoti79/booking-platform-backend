import { CreateHotelDto, UpdateHotelDto } from "../dtos/hotel.dto";
import {
  createHotel,
  deleteHotel,
  getHotelById,
  getHotels,
  updateHotel,
} from "../repositories/hotel.repository";
import { NotFoundError } from "../utils/api-error";

export async function createHotelService(hotel: CreateHotelDto) {
  const newHotel = await createHotel(hotel);
  return newHotel;
}

export async function getHotelByIdService(id: number) {
  const hotel = await getHotelById(id);
  return hotel;
}

export async function getHotelsService() {
  const hotels = await getHotels();
  return hotels;
}

export async function updateHotelService(id: number, hotel: UpdateHotelDto) {
  const existingHotel = await getHotelById(id);
  if (!existingHotel) {
    throw new NotFoundError(`Hotel not found with id: ${id}`);
  }
  const updatedHotel = await updateHotel(id, hotel);
  return updatedHotel;
}

export async function deleteHotelService(id: number) {
  const existingHotel = await getHotelById(id);
  if (!existingHotel) {
    throw new NotFoundError(`Hotel not found with id: ${id}`);
  }
  const deletedHotel = await deleteHotel(id);
  return deletedHotel;
}
