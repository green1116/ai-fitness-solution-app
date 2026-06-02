import type {
  GovernanceCapabilityClassification,
  GovernanceCapabilityInventoryEntry,
} from "./baseline-types";

export function classifyGovernanceCapabilities(input: {
  deploymentId: string;
  inventory: GovernanceCapabilityInventoryEntry[];
}): GovernanceCapabilityClassification[] {
  const byKey = new Map<string, GovernanceCapabilityClassification>();

  for (const entry of input.inventory) {
    const key = `${entry.tier}:${entry.capabilityClass}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.capabilityIds.push(entry.capabilityId);
      existing.count += 1;
      continue;
    }
    byKey.set(key, {
      classificationId: `classification-${entry.tier}-${entry.capabilityClass}-${input.deploymentId}`,
      tier: entry.tier,
      capabilityClass: entry.capabilityClass,
      capabilityIds: [entry.capabilityId],
      count: 1,
    });
  }

  return [...byKey.values()].sort((a, b) => a.tier.localeCompare(b.tier));
}
