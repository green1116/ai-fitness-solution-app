import type { CommandPlatformBaselineHookEvent } from "./baseline-types";

export function runCommandPlatformBaselineHooks(input: {
  inventoryCount: number;
  frozenCount: number;
}): CommandPlatformBaselineHookEvent[] {
  return [
    { phase: "beforeCapabilityInventory", payload: "scanning-command-platform-capabilities" },
    { phase: "afterCapabilityInventory", payload: `capabilities=${input.inventoryCount}` },
    { phase: "beforeBaselineFreeze", payload: "preparing-command-platform-freeze" },
    { phase: "afterBaselineFreeze", payload: `frozen=${input.frozenCount}` },
  ];
}
