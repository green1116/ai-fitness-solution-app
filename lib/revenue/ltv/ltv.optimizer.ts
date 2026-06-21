/**
 * V64 P3 — LTV optimizer
 */

import { predictLTV } from "./ltv.predictor";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";

export function optimizeLTV(): {
  prediction: ReturnType<typeof predictLTV>;
  tactics: string[];
} {
  const prediction = predictLTV();
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const tactics: string[] = [];

  if (prediction.predictedLtv < thresholds.ltvLow) {
    tactics.push("triggerUpsellFlow: extend lifecycle via Pro annual bundle");
    tactics.push("Increase activation touchpoints to reduce early churn");
  }

  tactics.push("Identify high-value users for enterprise outreach");
  tactics.push("Increase repurchase via tender generation reminders");
  tactics.push("Extend subscription duration with renewal incentives (read-only prompts)");

  if (prediction.expectedLifetimeMonths < 12) {
    tactics.push("Focus retention playbook — lifetime under 12 months");
  }

  return { prediction, tactics };
}
