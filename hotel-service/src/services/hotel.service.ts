import type { Hotel } from "../prisma/generated/client";
import type { CreateHotelDto, UpdateHotelDto } from "../dtos/hotel.dto";
import { IHotelRepository } from "../repositories/hotel.repository";
import type { IHotelSearchIndex } from "../elasticsearch/hotel-index";
import { searchHotels } from "../elasticsearch/hotel-index";
import { NotFoundError } from "../utils/api-error";
import logger from "../config/logger.config";

export interface IHotelService {
  getById(id: number): Promise<Hotel>;
  getAll(): Promise<Hotel[]>;
  search(query: string): Promise<Hotel[]>;
  create(data: CreateHotelDto): Promise<Hotel>;
  update(id: number, data: UpdateHotelDto): Promise<Hotel>;
  delete(id: number): Promise<void>;
}

export class HotelService implements IHotelService {
  constructor(
    private readonly hotelRepository: IHotelRepository,
    private readonly searchIndex?: IHotelSearchIndex
  ) {}

  async search(query: string): Promise<Hotel[]> {
    const docs = await searchHotels(query);
    return docs.map((d) => ({
      id: d.id,
      name: d.name,
      address: d.address,
      location: d.location,
      checkInTime: d.checkInTime,
      checkOutTime: d.checkOutTime,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    })) as Hotel[];
  }

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
    const hotel = await this.hotelRepository.create(data);
    if (this.searchIndex) {
      try {
        await this.searchIndex.indexHotel(hotel);
      } catch (err) {
        logger.warn("Elasticsearch indexHotel failed after create", {
          hotelId: hotel.id,
          error: err,
        });
      }
    }
    return hotel;
  }

  async update(id: number, data: UpdateHotelDto): Promise<Hotel> {
    await this.getById(id);
    const hotel = await this.hotelRepository.update(id, data);
    if (this.searchIndex) {
      try {
        await this.searchIndex.indexHotel(hotel);
      } catch (err) {
        logger.warn("Elasticsearch indexHotel failed after update", {
          hotelId: id,
          error: err,
        });
      }
    }
    return hotel;
  }

  async delete(id: number): Promise<void> {
    await this.getById(id);
    await this.hotelRepository.delete(id);
    if (this.searchIndex) {
      try {
        await this.searchIndex.deleteHotel(id);
      } catch (err) {
        logger.warn("Elasticsearch deleteHotel failed after delete", {
          hotelId: id,
          error: err,
        });
      }
    }
  }
}
