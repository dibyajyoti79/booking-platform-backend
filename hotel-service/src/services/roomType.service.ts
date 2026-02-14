import type { RoomType } from "../prisma/generated/client";
import type { CreateRoomTypeDto, UpdateRoomTypeDto } from "../dtos/roomType.dto";
import { IRoomTypeRepository } from "../repositories/roomType.repository";
import { NotFoundError } from "../utils/api-error";

export interface IRoomTypeService {
  getById(id: number): Promise<RoomType>;
  getByHotelId(hotelId: number): Promise<RoomType[]>;
  getAll(): Promise<RoomType[]>;
  create(data: CreateRoomTypeDto): Promise<RoomType>;
  update(id: number, data: UpdateRoomTypeDto): Promise<RoomType>;
  delete(id: number): Promise<void>;
}

export class RoomTypeService implements IRoomTypeService {
  constructor(private readonly roomTypeRepository: IRoomTypeRepository) {}

  async getById(id: number): Promise<RoomType> {
    const roomType = await this.roomTypeRepository.findById(id);
    if (!roomType) {
      throw new NotFoundError("Room type not found", { id });
    }
    return roomType;
  }

  async getByHotelId(hotelId: number): Promise<RoomType[]> {
    return this.roomTypeRepository.findManyByHotelId(hotelId);
  }

  async getAll(): Promise<RoomType[]> {
    return this.roomTypeRepository.findMany();
  }

  async create(data: CreateRoomTypeDto): Promise<RoomType> {
    return this.roomTypeRepository.create(data);
  }

  async update(id: number, data: UpdateRoomTypeDto): Promise<RoomType> {
    await this.getById(id);
    return this.roomTypeRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.getById(id);
    await this.roomTypeRepository.delete(id);
  }
}
