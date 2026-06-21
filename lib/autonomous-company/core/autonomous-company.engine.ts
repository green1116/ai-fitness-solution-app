/**
 * V62 P3 — Autonomous Company Engine (Full Autonomous Entity)
 */

import type { AutonomousCompanyReport, CompanyCycleOutcome } from "./company.state";
import { analyzeCompanyState } from "./company.brain";
import { runCompanyLoopIteration, runAutonomousCompanyWhile, isCompanyRunning } from "./company.loop";
import { executeCompanyActions, getControlPlaneStatus } from "../control/company.control.plane";
import { runAutonomousGrowthLoop } from "../growth/autonomous.growth.loop";
import { runAutonomousSalesLoop } from "../sales/autonomous.sales.loop";
import { optimizeRevenueAutomatically } from "../economy/revenue.optimizer";
import { selfHealSystemIssues } from "../control/system.self.healing";
import { enforceBusinessPolicies, COMPANY_POLICIES } from "../governance/policy.engine";
import { guardExecutionBatch } from "../governance/safety.guard";
import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import { generateExecutionPlan } from "@/lib/ai-execution/execution.service";

export {
  analyzeCompanyState,
  generateBusinessStrategy,
} from "./company.brain";

export { runAutonomousCompanyWhile, runCompanyLoopIteration, isCompanyRunning };

export async function runAutonomousCompanyCycle(
  organizationId: string,
  options?: { traceId?: string; iterations?: number },
): Promise<AutonomousCompanyReport> {
  const traceId = options?.traceId ?? createTraceId();
  const iterations = Math.max(1, Math.min(options?.iterations ?? 1, 5));

  const outcomes: CompanyCycleOutcome[] = [];
  let lastState = analyzeCompanyState(organizationId, traceId);
  let lastFeedback: Record<string, number> = {};

  for (let i = 0; i < iterations; i++) {
    const { state, outcome, feedback } = await runCompanyLoopIteration(organizationId, traceId);
    outcomes.push(outcome);
    lastState = state;
    lastFeedback = feedback;
  }

  return {
    organizationId,
    traceId,
    state: lastState,
    outcomes,
    feedback: lastFeedback,
    generatedAt: new Date().toISOString(),
  };
}

export async function executeCompanyActionsPublic(state: ReturnType<typeof analyzeCompanyState>) {
  return executeCompanyActions(state);
}

export { optimizeRevenueAutomatically };

export async function optimizeGrowthAutomatically(state: ReturnType<typeof analyzeCompanyState>) {
  return runAutonomousGrowthLoop(state);
}

export async function optimizeSalesAutomatically(state: ReturnType<typeof analyzeCompanyState>) {
  return runAutonomousSalesLoop(state);
}

export { selfHealSystemIssues };

export function enforceBusinessPoliciesPublic(organizationId: string) {
  const plan = generateExecutionPlan(organizationId);
  const safe = guardExecutionBatch(plan.actions);
  return enforceBusinessPolicies(organizationId, safe);
}

export function getGovernanceCatalog() {
  return COMPANY_POLICIES;
}

export function getCompanyControllerStatus(organizationId: string) {
  return getControlPlaneStatus(organizationId);
}
