import { loadGovernancePolicyPacks } from "./policy-pack.loader";
import type { GovernancePolicyPackRegistry } from "./policy-pack.types";

export function buildGovernancePolicyPackRegistry(input?: {
  packs?: ReturnType<typeof loadGovernancePolicyPacks>;
}): GovernancePolicyPackRegistry {
  const packs = loadGovernancePolicyPacks(input);
  return {
    loadedAt: new Date().toISOString(),
    packs,
    activeVersion: packs[0]?.version ?? "v4-a3-r3-policy-pack-1",
    defaultMode: "standard",
  };
}
