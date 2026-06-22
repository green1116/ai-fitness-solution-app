/**
 * V62 P3 — Growth: autonomous growth loop
 */

import type { CompanyState } from "../core/company.state";
import { optimizeGrowthFunnels } from "@/lib/ai-decision/decision.service";
import { runAcquisitionEngine } from "./acquisition.engine";
import { runRetentionEngine } from "./retention.engine";
import { executeGrowthAction } from "@/lib/ai-execution/execution.service";

export async function optimizeGrowthAutomatically(state: CompanyState): Promise<{
  tactics: string[];
  executed: number;
}> {
  const tactics: string[] = [];
  let executed = 0;

  if (state.metrics.growthStagnant) {
    tactics.push(...runAcquisitionEngine(state));
    const funnel = optimizeGrowthFunnels(state.business);
    tactics.push(...funnel.optimizations);

    const result = await executeGrowthAction(
      {
        id: `auto-growth-${state.traceId}`,
        type: "GROWTH",
        priority: "HIGH",
        payload: { operation: "optimize_onboarding" },
        targetSystem: "V60",
        organizationId: state.organizationId,
        reversible: true,
      },
      state.traceId,
    );
    if (result.status === "executed") executed += 1;
  }

  if (state.metrics.churnRate > 10) {
    tactics.push(...runRetentionEngine(state));
    const result = await executeGrowthAction(
      {
        id: `auto-retention-${state.traceId}`,
        type: "GROWTH",
        priority: "HIGH",
        payload: { operation: "retention" },
        targetSystem: "V60",
        organizationId: state.organizationId,
        reversible: true,
      },
      state.traceId,
    );
    if (result.status === "executed") executed += 1;
  }

  if (tactics.length === 0) {
    tactics.push("Growth metrics healthy — no autonomous growth intervention");
  }

  return { tactics, executed };
}

export async function runAutonomousGrowthLoop(state: CompanyState) {
  return optimizeGrowthAutomatically(state);
}
