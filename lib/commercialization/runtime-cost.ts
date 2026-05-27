/**
 * V3.5 runtime cost foundation compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const RUNTIME_COST_FOUNDATION_VERSION = "3.5-runtime-cost-1" as const;

export type RuntimeCostFoundationInput = {
  deploymentId?: string;
  nodeCount?: number;
  depth?: number;
};

export type RuntimeCostFoundationResult = {
  version: typeof RUNTIME_COST_FOUNDATION_VERSION;
  nodeCount: number;
  depth: number;
  summary: string;
};

export function runRuntimeCostFoundation(
  input: RuntimeCostFoundationInput = {},
): RuntimeCostFoundationResult {
  const nodeCount = input.nodeCount ?? 0;
  const depth = input.depth ?? 0;

  return {
    version: RUNTIME_COST_FOUNDATION_VERSION,
    nodeCount,
    depth,
    summary: `runtime-cost=${RUNTIME_COST_FOUNDATION_VERSION} nodes=${nodeCount} depth=${depth}`,
  };
}

export function buildCostSummary(result: RuntimeCostFoundationResult): string {
  return result.summary;
}

export function formatCostRuntimeHook(result: RuntimeCostFoundationResult): string {
  return result.summary;
}
