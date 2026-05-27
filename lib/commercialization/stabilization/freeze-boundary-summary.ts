export const FREEZE_BOUNDARY_SUMMARY_VERSION = "3.7-freeze-boundary-1" as const;

export type FreezeBoundaryRule = {
  id: string;
  label: string;
  locked: boolean;
};

export type FreezeBoundarySummary = {
  version: typeof FREEZE_BOUNDARY_SUMMARY_VERSION;
  boundaryId: string;
  rules: FreezeBoundaryRule[];
  ruleCount: number;
  boundaryLocked: boolean;
  expansionAllowed: false;
  summary: string;
};

export function buildFreezeBoundarySummary(input: {
  deploymentId: string;
  hubFrozen: boolean;
  terminalLocked: boolean;
}): FreezeBoundarySummary {
  const boundaryId = `FBND-V37-${input.deploymentId.slice(0, 8)}`;

  const rules: FreezeBoundaryRule[] = [
    { id: "no-civ-runtime", label: "No new civilization runtime", locked: true },
    { id: "no-swarm", label: "No swarm / meta-cognition expansion", locked: true },
    { id: "no-payment", label: "No payment / IdP / billing engine", locked: true },
    { id: "hub-frozen", label: "Canonical hub frozen", locked: input.hubFrozen },
    { id: "terminal", label: "Terminal freeze locked", locked: input.terminalLocked },
  ];

  const boundaryLocked =
    input.hubFrozen && input.terminalLocked && rules.every((r) => r.locked);

  return {
    version: FREEZE_BOUNDARY_SUMMARY_VERSION,
    boundaryId,
    rules,
    ruleCount: rules.length,
    boundaryLocked,
    expansionAllowed: false,
    summary: `freeze-boundary id=${boundaryId} locked=${boundaryLocked}`,
  };
}
