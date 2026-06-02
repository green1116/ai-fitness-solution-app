import { buildPipeline } from "./pipeline";
import type { PipelineStageKind, RevenueMetrics } from "./types";

const OPEN_STAGES: PipelineStageKind[] = [
  "lead",
  "qualified",
  "proposal",
  "trial",
  "negotiation",
];

export function buildRevenueMetrics(input?: { deploymentId?: string }): RevenueMetrics {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  const pipeline = buildPipeline({ deploymentId });

  const openPipeline = pipeline.filter((o) => OPEN_STAGES.includes(o.stage));
  const pipelineValue = openPipeline.reduce((sum, o) => sum + o.value * (o.probability / 100), 0);
  const closedRevenue = pipeline
    .filter((o) => o.stage === "won")
    .reduce((sum, o) => sum + o.value, 0);
  const expansionRevenue = Math.round(closedRevenue * 0.18);
  const renewalRevenue = Math.round(closedRevenue * 0.42);
  const forecastRevenue = Math.round(pipelineValue + closedRevenue * 0.25);
  const arr = closedRevenue + renewalRevenue + expansionRevenue;
  const mrr = Math.round(arr / 12);

  return {
    metricsId: `revenue-metrics-${deploymentId}`,
    pipelineValue: Math.round(pipelineValue),
    forecastRevenue,
    closedRevenue,
    expansionRevenue,
    renewalRevenue,
    arr,
    mrr,
    summary: `revenue-metrics pipeline=${Math.round(pipelineValue)} closed=${closedRevenue} arr=${arr} mrr=${mrr}`,
  };
}
