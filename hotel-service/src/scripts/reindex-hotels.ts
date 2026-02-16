/**
 * One-off script to reindex all hotels from the database into Elasticsearch.
 * Run after first deploy or when the ES index was recreated.
 *
 * Usage: npx ts-node src/scripts/reindex-hotels.ts
 * Or: npm run build && node dist/scripts/reindex-hotels.js
 */
import "../config";
import { prisma } from "../prisma/client";
import { hotelSearchIndex } from "../elasticsearch/hotel-index";
import { getElasticsearchClient } from "../elasticsearch/client";
import logger from "../config/logger.config";

async function main() {
  const client = getElasticsearchClient();
  if (!client) {
    logger.error("Elasticsearch is not configured (ELASTICSEARCH_NODE). Exiting.");
    process.exit(1);
  }
  const hotels = await prisma.hotel.findMany();
  logger.info(`Reindexing ${hotels.length} hotels.`);
  for (const hotel of hotels) {
    try {
      await hotelSearchIndex.indexHotel(hotel);
    } catch (err) {
      logger.warn("Failed to index hotel", { hotelId: hotel.id, error: err });
    }
  }
  logger.info("Reindex complete.");
}

main()
  .catch((err) => {
    logger.error("Reindex failed", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());