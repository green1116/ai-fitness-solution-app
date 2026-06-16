import type { TenderRegistryContext } from "./shared/types";
import { TKG_MIN_TENDER_COUNT } from "./shared/types";
import { buildTenderRegistryRecords } from "./tender-registry";

export function buildTenderRegistryContext(): TenderRegistryContext {
  const records = buildTenderRegistryRecords();
  const regionBreakdown: Record<string, number> = {};
  const statusBreakdown: Record<string, number> = {};

  for (const record of records) {
    regionBreakdown[record.region] = (regionBreakdown[record.region] ?? 0) + 1;
    statusBreakdown[record.status] = (statusBreakdown[record.status] ?? 0) + 1;
  }

  const averageBudget =
    records.length === 0
      ? 0
      : Math.round(records.reduce((sum, record) => sum + record.budget, 0) / records.length);

  return {
    contextId: "tender-knowledge-graph-registry-context-v41-p1",
    records,
    recordCount: records.length,
    regionBreakdown,
    statusBreakdown,
    averageBudget,
    contextReady: records.length >= TKG_MIN_TENDER_COUNT,
    mode: "tender-knowledge-graph",
  };
}
