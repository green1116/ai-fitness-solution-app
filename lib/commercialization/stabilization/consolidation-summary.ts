export const CONSOLIDATION_SUMMARY_VERSION = "3.7-consolidation-1" as const;

export type ConsolidationItem = {
  id: string;
  label: string;
  consolidated: boolean;
};

export type ConsolidationSummary = {
  version: typeof CONSOLIDATION_SUMMARY_VERSION;
  consolidationId: string;
  items: ConsolidationItem[];
  itemCount: number;
  consolidatedCount: number;
  consolidationComplete: boolean;
  summary: string;
};

export function buildConsolidationSummary(input: {
  deploymentId: string;
  hubFrozen: boolean;
  hubReady: boolean;
}): ConsolidationSummary {
  const consolidationId = `CONSOL-V37-${input.deploymentId.slice(0, 8)}`;

  const items: ConsolidationItem[] = [
    { id: "v35-freeze", label: "V3.5 commercialization freeze", consolidated: true },
    { id: "v36-public", label: "V3.6 public surface closure", consolidated: true },
    { id: "v37-product", label: "V3.7 productization surfaces", consolidated: input.hubReady },
    { id: "canonical-hub", label: "Canonical hub entry", consolidated: input.hubFrozen },
    { id: "no-expansion", label: "No new runtime expansion", consolidated: true },
  ];

  const consolidatedCount = items.filter((i) => i.consolidated).length;

  return {
    version: CONSOLIDATION_SUMMARY_VERSION,
    consolidationId,
    items,
    itemCount: items.length,
    consolidatedCount,
    consolidationComplete: consolidatedCount === items.length && input.hubFrozen,
    summary: `consolidation id=${consolidationId} ${consolidatedCount}/${items.length} complete=${consolidatedCount === items.length}`,
  };
}
