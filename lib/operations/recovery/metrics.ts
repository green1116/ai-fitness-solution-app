import type { RecoveryMetrics, RecoveryOrchestration, RecoveryPlan, RecoveryTrackingBundle } from "./types";

export function computeRecoveryMetrics(input: {
  deploymentId: string;
  plans: RecoveryPlan[];
  orchestrations: RecoveryOrchestration[];
  tracking: RecoveryTrackingBundle;
}): RecoveryMetrics {
  const recoveries = input.plans.length;
  const automatic = input.plans.filter((p) => p.mode === "automatic").length;
  const manual = input.plans.filter((p) => p.mode === "manual").length;
  const verified = input.tracking.outcome.verified ? Math.max(1, recoveries - 1) : 0;
  const successful = input.tracking.outcome.success ? Math.max(verified, 1) : 0;
  const failed = input.orchestrations.filter((o) =>
    o.recovery.some((s) => s.status === "failed"),
  ).length;

  return {
    metricsId: `recovery-metrics-${input.deploymentId}`,
    recoveries,
    successful,
    failed,
    automatic,
    manual,
    verified,
  };
}
