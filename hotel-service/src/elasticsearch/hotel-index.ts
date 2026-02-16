import { getElasticsearchClient } from "./client";
import logger from "../config/logger.config";

const INDEX_NAME = "hotels";

export interface HotelDocument {
  id: number;
  name: string;
  address: string;
  location: string;
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelEntity {
  id: number;
  name: string;
  address: string;
  location: string;
  checkInTime: string;
  checkOutTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHotelSearchIndex {
  indexHotel(hotel: HotelEntity): Promise<void>;
  deleteHotel(id: number): Promise<void>;
}

function hotelToDocument(hotel: {
  id: number;
  name: string;
  address: string;
  location: string;
  checkInTime: string;
  checkOutTime: string;
  createdAt: Date;
  updatedAt: Date;
}): HotelDocument {
  return {
    id: hotel.id,
    name: hotel.name,
    address: hotel.address,
    location: hotel.location,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    createdAt: hotel.createdAt.toISOString(),
    updatedAt: hotel.updatedAt.toISOString(),
  };
}

export async function ensureIndex(): Promise<void> {
  const client = getElasticsearchClient();
  if (!client) return;
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (exists) return;
    await client.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: "integer" },
          name: { type: "text" },
          address: { type: "text" },
          location: { type: "text" },
          checkInTime: { type: "keyword" },
          checkOutTime: { type: "keyword" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" },
        },
      },
    });
    logger.info(`Elasticsearch index "${INDEX_NAME}" created`);
  } catch (err) {
    logger.warn("Elasticsearch ensureIndex failed", { error: err });
  }
}

async function indexHotel(hotel: HotelDocument): Promise<void> {
  const client = getElasticsearchClient();
  if (!client) return;
  await client.index({
    index: INDEX_NAME,
    id: String(hotel.id),
    document: hotel,
  });
}

async function deleteHotel(id: number): Promise<void> {
  const client = getElasticsearchClient();
  if (!client) return;
  try {
    await client.delete({ index: INDEX_NAME, id: String(id) });
  } catch (err: unknown) {
    const meta = err as { meta?: { statusCode?: number } };
    if (meta?.meta?.statusCode === 404) return;
    throw err;
  }
}

export async function searchHotels(query: string): Promise<HotelDocument[]> {
  const client = getElasticsearchClient();
  if (!client) {
    throw new Error("Elasticsearch is not configured");
  }
  const response = await client.search<HotelDocument>({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query,
        fields: ["name", "address", "location"],
      },
    },
  });
  const hits = response.hits.hits ?? [];
  return hits.map((h) => h._source!).filter(Boolean);
}

export const hotelSearchIndex: IHotelSearchIndex = {
  async indexHotel(hotel: HotelEntity) {
    await indexHotel(hotelToDocument(hotel));
  },
  deleteHotel,
};
