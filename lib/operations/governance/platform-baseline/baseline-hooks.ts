import type { GovernancePlatformBaselineHookEvent } from "./baseline-types";

export function runGovernancePlatformBaselineHooks(input: {
  inventoryCount: number;
  frozenCount: number;
}): GovernancePlatformBaselineHookEvent[] {
  return [
    { phase: "beforeCapabilityInventory", payload: "scanning-platform-capabilities" },
    { phase: "afterCapabilityInventory", payload: `capabilities=${input.inventoryCount}` },
    { phase: "beforeBaselineFreeze", payload: "preparing-baseline-freeze" },
    { phase: "afterBaselineFreeze", payload: `frozen=${input.frozenCount}` },
  ];
}
