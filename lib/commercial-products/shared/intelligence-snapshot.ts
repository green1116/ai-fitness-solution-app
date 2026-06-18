import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { buildTenderRegistryRecords } from "@/lib/tender-knowledge-graph";
import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "@/lib/win-loss-intelligence";
import { buildProjectRegistry } from "@/lib/project-delivery-intelligence";
import {
  buildOptimizationOpportunityRegistry,
  buildPerformanceRegistry,
} from "@/lib/performance-intelligence";
import type { IntelligenceSnapshot } from "./types";

let cachedSnapshot: IntelligenceSnapshot | undefined;

export function buildIntelligenceSnapshot(): IntelligenceSnapshot {
  if (cachedSnapshot) return cachedSnapshot;

  cachedSnapshot = {
    brandCount: buildBrandRegistryRecords().length,
    requirementCount: buildRequirementRegistryRecords().length,
    tenderCount: buildTenderRegistryRecords().length,
    procurementDecisionCount: runProcurementDecisionEngine().length,
    winLossOutcomeCount: buildOutcomeRegistry().records.length,
    projectCount: buildProjectRegistry().count,
    performanceAverageScore: buildPerformanceRegistry().averageScore,
    optimizationOpportunityCount: buildOptimizationOpportunityRegistry().count,
  };

  return cachedSnapshot;
}
