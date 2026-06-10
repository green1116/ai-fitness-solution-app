import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildUsageMetrics } from "./builders";
import type { UsageRuntimePayload } from "./types";
import { USAGE_RUNTIME_VERSION } from "./types";

export function validateUsageRuntime(input?: { deploymentId?: string }): {
  metricsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "usage-default";
  const metrics = buildUsageMetrics({ deploymentId });

  return {
    metricsValid:
      metrics.projects >= 0 &&
      metrics.plans >= 0 &&
      metrics.budgets >= 0 &&
      metrics.zipExports >= 0 &&
      metrics.tenderUploads >= 0 &&
      metrics.periodEnd >= metrics.periodStart,
  };
}

export function runUsageRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<UsageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "usage-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const metrics = runStage(
    "usage-metrics",
    "Usage Metrics",
    () => buildUsageMetrics({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "usage-validate",
    "Usage Validation",
    () => validateUsageRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Usage runtime validation failed");
  }

  const payload: UsageRuntimePayload = {
    version: USAGE_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    metrics,
    summary: `usage-runtime projects=${metrics.projects} plans=${metrics.plans} budgets=${metrics.budgets} zip=${metrics.zipExports} tender=${metrics.tenderUploads}`,
  };

  return finalizeRuntime({
    domain: "usage",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
