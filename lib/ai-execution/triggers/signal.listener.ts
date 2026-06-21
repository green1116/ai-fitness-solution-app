/**
 * V62 P2 — Signal listener (V60 growth + sales signals)
 */

import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { getSignalSummary } from "@/lib/sales/signals/sales.signal.engine";

export type ExecutionSignal = {
  source: "growth" | "sales";
  name: string;
  organizationId: string;
  strength: number;
  timestamp?: number;
};

export function listenGrowthSignals(organizationId: string): ExecutionSignal[] {
  const events = getGrowthEventsSnapshot().filter((e) => e.organizationId === organizationId);
  const signals: ExecutionSignal[] = [];

  const churnEvents = events.filter((e) => e.event.includes("churn") || e.event === "session.return");
  if (churnEvents.length > 0) {
    signals.push({
      source: "growth",
      name: "churn_risk",
      organizationId,
      strength: churnEvents.length,
      timestamp: churnEvents[churnEvents.length - 1]?.timestamp,
    });
  }

  const payments = events.filter((e) => e.event === "payment.completed").length;
  if (payments > 0) {
    signals.push({
      source: "growth",
      name: "payment_completed",
      organizationId,
      strength: payments,
    });
  }

  return signals;
}

export function listenSalesSignals(organizationId: string): ExecutionSignal[] {
  const summary = getSignalSummary(organizationId);
  const signals: ExecutionSignal[] = [];

  if (summary.hotDeals > 0) {
    signals.push({
      source: "sales",
      name: "hot_deal",
      organizationId,
      strength: summary.hotDeals,
    });
  }

  if (summary.budgetViews >= 3) {
    signals.push({
      source: "sales",
      name: "budget_engagement",
      organizationId,
      strength: summary.budgetViews,
    });
  }

  return signals;
}

export function collectExecutionSignals(organizationId: string): ExecutionSignal[] {
  return [...listenGrowthSignals(organizationId), ...listenSalesSignals(organizationId)];
}
