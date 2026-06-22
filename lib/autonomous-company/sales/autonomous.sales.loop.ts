/**
 * V62 P3 — Sales: autonomous sales loop
 */

import type { CompanyState } from "../core/company.state";
import { executeSalesAction, executePricingAction } from "@/lib/ai-execution/execution.service";
import { runDealCloserAI } from "./deal.closer.ai";
import { runNegotiationEngine } from "./negotiation.engine";

export async function optimizeSalesAutomatically(state: CompanyState): Promise<{
  tactics: string[];
  executed: number;
}> {
  const tactics: string[] = [];
  let executed = 0;

  const closer = runDealCloserAI(state);
  tactics.push(`Deal close probability: ${closer.probability}% (${closer.label})`);
  tactics.push(`Next action: ${closer.nextAction}`);

  if (state.metrics.conversionDropping) {
    tactics.push(...runNegotiationEngine(state));

    const pricingResult = await executePricingAction(
      {
        id: `auto-pricing-sales-${state.traceId}`,
        type: "PRICING",
        priority: "MEDIUM",
        payload: { operation: "adjust" },
        targetSystem: "V60",
        organizationId: state.organizationId,
        reversible: true,
      },
      state.traceId,
    );
    if (pricingResult.status === "executed") executed += 1;

    const salesResult = await executeSalesAction(
      {
        id: `auto-sales-campaign-${state.traceId}`,
        type: "SALES",
        priority: "HIGH",
        payload: { operation: "proposal_reminder" },
        targetSystem: "V60",
        organizationId: state.organizationId,
        reversible: true,
      },
      state.traceId,
    );
    if (salesResult.status === "executed") executed += 1;
    tactics.push("Triggered AI sales campaign for conversion recovery");
  }

  if (state.business.dealCount < 3) {
    const salesResult = await executeSalesAction(
      {
        id: `auto-sales-pipeline-${state.traceId}`,
        type: "SALES",
        priority: "MEDIUM",
        payload: { operation: "automate" },
        targetSystem: "V60",
        organizationId: state.organizationId,
      },
      state.traceId,
    );
    if (salesResult.status === "executed" || salesResult.status === "skipped") executed += 1;
  }

  return { tactics, executed };
}

export async function runAutonomousSalesLoop(state: CompanyState) {
  return optimizeSalesAutomatically(state);
}
