import type { Hotel } from "../prisma/generated/client";
import type { CreateHotelDto, UpdateHotelDto } from "../dtos/hotel.dto";
import { prisma } from "../prisma/client";

export interface IHotelRepository {
  findById(id: number): Promise<Hotel | null>;
  findMany(): Promise<Hotel[]>;
  create(data: CreateHotelDto): Promise<Hotel>;
  update(id: number, data: UpdateHotelDto): Promise<Hotel>;
  delete(id: number): Promise<Hotel>;
}

export class HotelRepository implements IHotelRepository {
  async findById(id: number): Promise<Hotel | null> {
    return prisma.hotel.findUnique({ where: { id } });
  }

  async findMany(): Promise<Hotel[]> {
    return prisma.hotel.findMany();
  }

  async create(data: CreateHotelDto): Promise<Hotel> {
    return prisma.hotel.create({ data });
  }

  async update(id: number, data: UpdateHotelDto): Promise<Hotel> {
    return prisma.hotel.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Hotel> {
    return prisma.hotel.delete({ where: { id } });
  }
}
