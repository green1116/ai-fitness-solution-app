import { buildOutcomeRegistry } from "@/lib/win-loss-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildOptimizationOpportunityRegistry } from "./optimization-opportunity-registry";
import { OPTIMIZATION_REASON_CODES, type OptimizationReasoning } from "./optimization-types";

function buildWinLossReasonCodes(): string[] {
  const lossOutcomes = buildOutcomeRegistry().records.filter((outcome) => outcome.outcome === "loss");
  const codes: string[] = [];

  for (const outcome of lossOutcomes) {
    for (const reason of outcome.reasonCodes) {
      if (reason.includes("lead-time") || reason.includes("leadTime")) {
        codes.push(OPTIMIZATION_REASON_CODES.supplierDelay);
      }
      if (reason.includes("availability")) {
        codes.push(OPTIMIZATION_REASON_CODES.acceptanceGap);
      }
      if (reason.includes("supplier") || reason.includes("procurement")) {
        codes.push(OPTIMIZATION_REASON_CODES.winLossGap);
      }
    }
  }

  return [...new Set(codes)];
}

function buildReasonCodesForOpportunity(
  opportunity: ReturnType<typeof buildOptimizationOpportunityRegistry>["records"][number],
  winLossCodes: string[],
): string[] {
  const codes = new Set<string>();

  if (opportunity.source === "benchmark") {
    codes.add(OPTIMIZATION_REASON_CODES.benchmarkGap);
  }
  if (opportunity.source === "performance") {
    codes.add(OPTIMIZATION_REASON_CODES.lowPerformance);
    codes.add(OPTIMIZATION_REASON_CODES.acceptanceGap);
  }
  if (opportunity.source === "risk") {
    codes.add(OPTIMIZATION_REASON_CODES.highRisk);
    if (opportunity.type === "supplier") {
      codes.add(OPTIMIZATION_REASON_CODES.supplierDelay);
    }
  }
  if (opportunity.source === "issue") {
    codes.add(OPTIMIZATION_REASON_CODES.issueOpen);
    codes.add(OPTIMIZATION_REASON_CODES.highRisk);
  }

  for (const code of winLossCodes) {
    codes.add(code);
  }

  if (opportunity.priority === "high") {
    codes.add(OPTIMIZATION_REASON_CODES.highRisk);
  }

  return [...codes];
}

let cachedReasoning: OptimizationReasoning[] | undefined;

export function buildOptimizationReasoning(): OptimizationReasoning[] {
  if (cachedReasoning) return cachedReasoning;

  const winLossCodes = buildWinLossReasonCodes();
  cachedReasoning = buildOptimizationOpportunityRegistry().records.map((opportunity) => ({
    reasoningId: `pi-reasoning-${opportunity.opportunityId}`,
    opportunityId: opportunity.opportunityId,
    reasonCodes: buildReasonCodesForOpportunity(opportunity, winLossCodes),
    mode: PI_CANONICAL_ID,
  }));

  return cachedReasoning;
}

export function buildOptimizationReasoningForOpportunity(
  opportunityId: string,
): OptimizationReasoning | undefined {
  return buildOptimizationReasoning().find((reasoning) => reasoning.opportunityId === opportunityId);
}
