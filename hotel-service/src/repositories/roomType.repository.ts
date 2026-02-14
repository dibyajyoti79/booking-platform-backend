import type { RoomType } from "../prisma/generated/client";
import type { CreateRoomTypeDto, UpdateRoomTypeDto } from "../dtos/roomType.dto";
import { prisma } from "../prisma/client";

export interface IRoomTypeRepository {
  findById(id: number): Promise<RoomType | null>;
  findManyByHotelId(hotelId: number): Promise<RoomType[]>;
  findMany(): Promise<RoomType[]>;
  create(data: CreateRoomTypeDto): Promise<RoomType>;
  update(id: number, data: UpdateRoomTypeDto): Promise<RoomType>;
  delete(id: number): Promise<RoomType>;
}

export class RoomTypeRepository implements IRoomTypeRepository {
  async findById(id: number): Promise<RoomType | null> {
    return prisma.roomType.findUnique({ where: { id } });
  }

  async findManyByHotelId(hotelId: number): Promise<RoomType[]> {
    return prisma.roomType.findMany({ where: { hotelId } });
  }

  async findMany(): Promise<RoomType[]> {
    return prisma.roomType.findMany();
  }

  async create(data: CreateRoomTypeDto): Promise<RoomType> {
    return prisma.roomType.create({ data });
  }

  async update(id: number, data: UpdateRoomTypeDto): Promise<RoomType> {
    return prisma.roomType.update({ where: { id }, data });
  }

  async delete(id: number): Promise<RoomType> {
    return prisma.roomType.delete({ where: { id } });
  }
}
