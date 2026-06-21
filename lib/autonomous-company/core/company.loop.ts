/**
 * V62 P3 — Autonomous company loop (single cycle iteration)
 */

import type { CompanyState, CompanyCycleOutcome } from "./company.state";
import {
  analyzeCompanyState,
  generateBusinessStrategy,
  observeBusinessMetrics,
} from "./company.brain";
import { executeCompanyActions } from "../control/company.control.plane";
import { runAutonomousGrowthLoop } from "../growth/autonomous.growth.loop";
import { runAutonomousSalesLoop } from "../sales/autonomous.sales.loop";
import { optimizeRevenueAutomatically } from "../economy/revenue.optimizer";
import { optimizePricingAutomatically } from "../economy/pricing.optimizer";
import { reduceOperationalCost } from "../economy/cost.reducer";
import { ingestBusinessFeedback, publishFeedbackLoop } from "../control/feedback.loop";
import { selfHealSystemIssues } from "../control/system.self.healing";
import { createTraceId } from "@/lib/ai-execution/core/execution.context";

declare global {
  // eslint-disable-next-line no-var
  var __companyRunning: Map<string, boolean> | undefined;
  // eslint-disable-next-line no-var
  var __companyCycleCount: Map<string, number> | undefined;
}

function getRunningStore(): Map<string, boolean> {
  globalThis.__companyRunning ||= new Map();
  return globalThis.__companyRunning;
}

function getCycleStore(): Map<string, number> {
  globalThis.__companyCycleCount ||= new Map();
  return globalThis.__companyCycleCount;
}

export function setCompanyRunning(organizationId: string, running: boolean): void {
  getRunningStore().set(organizationId, running);
}

export function isCompanyRunning(organizationId: string): boolean {
  return getRunningStore().get(organizationId) ?? true;
}

export function clearCompanyLoopForTests(): void {
  globalThis.__companyRunning = new Map();
  globalThis.__companyCycleCount = new Map();
}

export async function runCompanyLoopIteration(
  organizationId: string,
  traceId?: string,
): Promise<{ state: CompanyState; outcome: CompanyCycleOutcome; feedback: Record<string, number> }> {
  const tid = traceId ?? createTraceId();
  const cycleStore = getCycleStore();
  const cycle = (cycleStore.get(organizationId) ?? 0) + 1;
  cycleStore.set(organizationId, cycle);

  // 1. Observe
  const observed = observeBusinessMetrics(organizationId, tid);

  // 2. Analyze (V62 P1)
  let state = analyzeCompanyState(organizationId, tid);
  state = { ...state, metrics: observed, cycleCount: cycle };

  // 3. Generate Strategy
  state = generateBusinessStrategy(state);

  const optimizations: string[] = [];

  // 4. Execute via control plane + domain loops
  const execution = await executeCompanyActions(state);
  const growth = await runAutonomousGrowthLoop(state);
  const sales = await runAutonomousSalesLoop(state);

  optimizations.push(...growth.tactics, ...sales.tactics);
  optimizations.push(...optimizeRevenueAutomatically(state));
  optimizations.push(...optimizePricingAutomatically(state));
  optimizations.push(...reduceOperationalCost(state));

  // 6. Self-heal
  const healing = await selfHealSystemIssues(state);

  // 5. Measure + 7. Feedback
  const feedbackRaw = ingestBusinessFeedback(organizationId);
  const feedback = publishFeedbackLoop(state, feedbackRaw);

  const outcome: CompanyCycleOutcome = {
    cycle,
    traceId: tid,
    observed,
    strategyGenerated: !!state.strategy,
    actionsExecuted:
      (execution.outcome.actionsExecuted ?? 0) + growth.executed + sales.executed,
    actionsFailed: execution.outcome.actionsFailed ?? 0,
    optimizations,
    selfHealingApplied: healing.healed,
    policiesEnforced: execution.policiesEnforced,
    completedAt: new Date().toISOString(),
  };

  return { state: { ...state, lastCycleAt: outcome.completedAt }, outcome, feedback };
}

export async function runAutonomousCompanyWhile(
  organizationId: string,
  maxIterations = 1,
): Promise<CompanyCycleOutcome[]> {
  const outcomes: CompanyCycleOutcome[] = [];
  let i = 0;

  while (isCompanyRunning(organizationId) && i < maxIterations) {
    const { outcome } = await runCompanyLoopIteration(organizationId);
    outcomes.push(outcome);
    i += 1;
  }

  return outcomes;
}
