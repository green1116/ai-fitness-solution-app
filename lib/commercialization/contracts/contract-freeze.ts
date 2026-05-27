/**
 * V3.5 contract freeze bundle compat entry.
 * Minimal pass-through for index.ts module resolution.
 */

export const CONTRACT_FREEZE_BUNDLE = "3.5-contract-freeze-1" as const;

export type ContractFreezeBundleInput = {
  deploymentId?: string;
  contracts?: readonly string[];
};

export type ContractFreezeBundleResult = {
  bundleId: typeof CONTRACT_FREEZE_BUNDLE;
  frozen: boolean;
  summary: string;
};

export function applyContractFreezeBundle(
  input: ContractFreezeBundleInput = {},
): ContractFreezeBundleResult {
  void input;

  return {
    bundleId: CONTRACT_FREEZE_BUNDLE,
    frozen: true,
    summary: `contract-freeze=${CONTRACT_FREEZE_BUNDLE} frozen=true`,
  };
}

export function buildContractFreezeSummary(
  result: ContractFreezeBundleResult,
): string {
  return result.summary;
}
