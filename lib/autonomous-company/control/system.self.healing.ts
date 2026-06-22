/**
 * V62 P3 — Control: system self-healing
 */

import type { CompanyState } from "../core/company.state";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";
import { dispatchSystemAction } from "@/lib/ai-execution/execution.service";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { COMPANY_CONSTRAINTS } from "../governance/constraint.engine";

export async function selfHealSystemIssues(state: CompanyState): Promise<{
  healed: boolean;
  tactics: string[];
}> {
  const ops = analyzeOperations();
  const tactics: string[] = [];
  let healed = false;

  if (
    state.metrics.errorRate > COMPANY_CONSTRAINTS.maxErrorRateBeforeHeal ||
    ops.health === "critical"
  ) {
    tactics.push("Reduce automation load during elevated error rate");
    tactics.push("Optimize execution paths via V61 metrics refresh");

    await dispatchSystemAction(
      {
        id: `self-heal-${state.traceId}`,
        type: "SYSTEM",
        priority: "HIGH",
        payload: { operation: "metrics_refresh" },
        targetSystem: "V61",
        organizationId: state.organizationId,
      },
      state.traceId,
    );

    appendGrowthEvent({
      event: "autonomous.self_heal",
      organizationId: state.organizationId,
      meta: { errorRate: state.metrics.errorRate, health: ops.health },
    });

    healed = true;
  }

  if (ops.avgLatencyMs > 800) {
    tactics.push(`High latency detected (${ops.avgLatencyMs}ms) — throttling non-critical paths`);
    healed = true;
  }

  if (!healed) {
    tactics.push("System health nominal — no self-healing required");
  }

  return { healed, tactics };
}
