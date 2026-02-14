import type { Hotel } from "../prisma/generated/client";
import type { CreateHotelDto, UpdateHotelDto } from "../dtos/hotel.dto";
import { IHotelRepository } from "../repositories/hotel.repository";
import { NotFoundError } from "../utils/api-error";

export interface IHotelService {
  getById(id: number): Promise<Hotel>;
  getAll(): Promise<Hotel[]>;
  create(data: CreateHotelDto): Promise<Hotel>;
  update(id: number, data: UpdateHotelDto): Promise<Hotel>;
  delete(id: number): Promise<void>;
}

export class HotelService implements IHotelService {
  constructor(private readonly hotelRepository: IHotelRepository) {}

  async getById(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findById(id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found", { id });
    }
    return hotel;
  }

  async getAll(): Promise<Hotel[]> {
    return this.hotelRepository.findMany();
  }

  async create(data: CreateHotelDto): Promise<Hotel> {
    return this.hotelRepository.create(data);
  }

  async update(id: number, data: UpdateHotelDto): Promise<Hotel> {
    await this.getById(id);
    return this.hotelRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.getById(id);
    await this.hotelRepository.delete(id);
  }
}
