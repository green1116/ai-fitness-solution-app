import { buildTenderRegistryRecords, findTenderGraphRecordById } from "./tender-registry";
import { CANONICAL_TENDER_GRAPH_TENDER_ID } from "./shared/types";

export function findTendersByRegion(region: string) {
  return buildTenderRegistryRecords().filter((record) => record.region === region);
}

export function findTendersByStatus(status: string) {
  return buildTenderRegistryRecords().filter((record) => record.status === status);
}

export function findTendersByPriority(priority: string) {
  return buildTenderRegistryRecords().filter((record) => record.priority === priority);
}

export function findCanonicalTender() {
  return findTenderGraphRecordById(CANONICAL_TENDER_GRAPH_TENDER_ID);
}

export function findTopTendersByBudget(limit = 5) {
  return [...buildTenderRegistryRecords()]
    .sort((a, b) => b.budget - a.budget)
    .slice(0, limit);
}
