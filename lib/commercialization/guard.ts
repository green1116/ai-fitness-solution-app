import {
  isCivilizationLayerAllowed,
  isRuntimeExpansionAllowed,
} from "./policy";

export type CommercializationFreezeValidation = {
  compliant: boolean;
  blockedExpansions: number;
  message: string;
};

const FORBIDDEN_PREFIXES = [
  "ecology-",
  "civilization-",
  "meta-runtime",
  "recursive-",
  "governance-recursion",
] as const;

function countExpansionViolations(proposedLayer?: string): number {
  if (isRuntimeExpansionAllowed() || isCivilizationLayerAllowed()) {
    return 0;
  }
  if (!proposedLayer?.trim()) {
    return 0;
  }

  const layer = proposedLayer.trim().toLowerCase();
  let count = 0;

  if (
    layer.includes("observation/tracking/") &&
    layer !== "observation/tracking" &&
    !layer.endsWith("/tracking")
  ) {
    count += 1;
  }

  if (FORBIDDEN_PREFIXES.some((p) => layer.includes(p))) {
    count += 1;
  }

  if (layer.includes("experimental-runtime")) {
    count += 1;
  }

  return count;
}

/** Runtime Freeze Guard：拦截非法扩展与 recursion drift */
export function validateCommercializationFreeze(
  proposedLayer?: string,
): CommercializationFreezeValidation {
  const blockedExpansions = countExpansionViolations(proposedLayer);
  const compliant = blockedExpansions === 0;

  return {
    compliant,
    blockedExpansions,
    message: compliant ? "freeze compliant" : "runtime expansion blocked",
  };
}

export function assertFreezeCompliance(proposedLayer?: string): void {
  const result = validateCommercializationFreeze(proposedLayer);
  if (!result.compliant) {
    throw new Error(
      `${result.message} (${result.blockedExpansions} blocked)`,
    );
  }
}

/** @deprecated 使用 validateCommercializationFreeze */
export function checkRuntimeExpansionGuard(proposedLayer?: string) {
  const v = validateCommercializationFreeze(proposedLayer);
  if (v.blockedExpansions === 0) return [];
  return [{ code: "EXPANSION_FORBIDDEN" as const, message: v.message }];
}

/** @deprecated 使用 assertFreezeCompliance */
export function assertRuntimeExpansionAllowed(proposedLayer?: string): void {
  assertFreezeCompliance(proposedLayer);
}
