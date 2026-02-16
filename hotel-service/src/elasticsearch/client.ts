import { Client } from "@elastic/elasticsearch";
import { serverConfig } from "../config";

let clientInstance: Client | null = null;

export function getElasticsearchClient(): Client | null {
  if (!serverConfig.ELASTICSEARCH_NODE?.trim()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new Client({
      node: serverConfig.ELASTICSEARCH_NODE,
    });
  }
  return clientInstance;
}
