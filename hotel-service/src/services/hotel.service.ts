import { CreateHotelDto } from "../dtos/hotel.dto";
import { createHotel, getHotelById } from "../repositories/hotel.repository";

export async function createHotelService(hotel: CreateHotelDto) {
  const newHotel = await createHotel(hotel);
  return newHotel;
}

export async function getHotelByIdService(id: number) {
  const hotel = await getHotelById(id);
  return hotel;
}
