/** V3.5 commercialization freeze policy compat entry. */

export type CommercializationFreezePolicy = {
  allowedWork: readonly string[];
  forbiddenWork: readonly string[];
  runtimeExpansionAllowed: boolean;
  civilizationLayerAllowed: boolean;
};

export const DEFAULT_COMMERCIALIZATION_FREEZE_POLICY: CommercializationFreezePolicy =
  {
    allowedWork: [
      "freeze",
      "deployment",
      "monitoring",
      "observability",
      "reliability",
      "saas-isolation",
      "runtime-cost",
      "stabilization",
      "standardization",
    ],
    forbiddenWork: [
      "civilization-recursion",
      "meta-runtime",
      "recursive-topology",
      "deep-runtime-expansion",
    ],
    runtimeExpansionAllowed: false,
    civilizationLayerAllowed: false,
  };

export function isRuntimeExpansionAllowed(
  policy: CommercializationFreezePolicy = DEFAULT_COMMERCIALIZATION_FREEZE_POLICY,
): boolean {
  return policy.runtimeExpansionAllowed;
}

export function isCivilizationLayerAllowed(
  policy: CommercializationFreezePolicy = DEFAULT_COMMERCIALIZATION_FREEZE_POLICY,
): boolean {
  return policy.civilizationLayerAllowed;
}
