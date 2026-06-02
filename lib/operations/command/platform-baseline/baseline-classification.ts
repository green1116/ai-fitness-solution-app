import type {
  CommandCapabilityClassification,
  CommandCapabilityInventoryEntry,
} from "./baseline-types";

export function classifyCommandCapabilities(input: {
  deploymentId: string;
  inventory: CommandCapabilityInventoryEntry[];
}): CommandCapabilityClassification[] {
  const byKey = new Map<string, CommandCapabilityClassification>();

  for (const entry of input.inventory) {
    const key = `${entry.tier}:${entry.capabilityClass}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.capabilityIds.push(entry.capabilityId);
      existing.count += 1;
      continue;
    }
    byKey.set(key, {
      classificationId: `command-classification-${entry.tier}-${entry.capabilityClass}-${input.deploymentId}`,
      tier: entry.tier,
      capabilityClass: entry.capabilityClass,
      capabilityIds: [entry.capabilityId],
      count: 1,
    });
  }

  return [...byKey.values()].sort((a, b) => a.tier.localeCompare(b.tier));
}
