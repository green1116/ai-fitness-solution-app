/** V3.5 runtime cost estimate compat entry. */

export type RuntimeCostProfile = {
  nodeCount?: number;
  depth?: number;
  estimatedUnits?: number;
};

export function estimateRuntimeCost(
  profile: RuntimeCostProfile = {},
): string {
  const nodeCount = profile.nodeCount ?? 0;
  const depth = profile.depth ?? 0;
  const estimatedUnits = profile.estimatedUnits ?? 0;

  return `runtime-cost nodes=${nodeCount} depth=${depth} estimated=${estimatedUnits}`;
}
