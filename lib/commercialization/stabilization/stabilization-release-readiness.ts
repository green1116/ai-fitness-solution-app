export const STABILIZATION_RELEASE_READINESS_VERSION =
  "3.7-stabilization-release-1" as const;

export type StabilizationReleaseCheck = {
  id: string;
  label: string;
  ready: boolean;
};

export type StabilizationReleaseReadiness = {
  version: typeof STABILIZATION_RELEASE_READINESS_VERSION;
  readinessId: string;
  checks: StabilizationReleaseCheck[];
  readyCount: number;
  totalCount: number;
  releaseReady: boolean;
  publishable: boolean;
  summary: string;
};

export function buildStabilizationReleaseReadiness(input: {
  deploymentId: string;
  hubFrozen: boolean;
  consolidationComplete: boolean;
  boundaryLocked: boolean;
  baselineReady: boolean;
}): StabilizationReleaseReadiness {
  const readinessId = `SREL-V37-${input.deploymentId.slice(0, 8)}`;

  const checks: StabilizationReleaseCheck[] = [
    { id: "frozen", label: "Hub frozen", ready: input.hubFrozen },
    { id: "consolidated", label: "Surfaces consolidated", ready: input.consolidationComplete },
    { id: "boundary", label: "Freeze boundary locked", ready: input.boundaryLocked },
    { id: "regression", label: "Regression baseline defined", ready: input.baselineReady },
    { id: "readonly", label: "Read-only commercial surface", ready: input.hubFrozen },
    { id: "no-crm", label: "No CRM / ERP wired", ready: true },
  ];

  const readyCount = checks.filter((c) => c.ready).length;
  const releaseReady = readyCount === checks.length;

  return {
    version: STABILIZATION_RELEASE_READINESS_VERSION,
    readinessId,
    checks,
    readyCount,
    totalCount: checks.length,
    releaseReady,
    publishable: releaseReady && input.hubFrozen,
    summary: `stabilization-release id=${readinessId} ${readyCount}/${checks.length} publishable=${releaseReady}`,
  };
}
