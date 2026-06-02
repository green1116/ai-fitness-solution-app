import { buildFreezeManifests } from "../manifest";
import type { FreezeDomainKey, FreezeInventory } from "../inventory";
import type { FreezeManifest } from "../manifest";

export interface PlatformBaseline {
  baselineId: string;
  runtime: FreezeManifest;
  consumer: FreezeManifest;
  dashboard: FreezeManifest;
  release: FreezeManifest;
  operations: FreezeManifest;
  commercialization: FreezeManifest;
  landing: FreezeManifest;
  governance: FreezeManifest;
  trust: FreezeManifest;
  "control-center": FreezeManifest;
  executive: FreezeManifest;
  strategy: FreezeManifest;
}

function manifestByDomain(manifests: FreezeManifest[], domain: FreezeDomainKey): FreezeManifest {
  const manifest = manifests.find((m) => m.domain === domain);
  if (!manifest) {
    throw new Error(`Missing manifest for domain: ${domain}`);
  }
  return manifest;
}

export function buildPlatformBaseline(input: {
  deploymentId: string;
  inventory: FreezeInventory;
}): PlatformBaseline {
  const manifests = buildFreezeManifests();
  return {
    baselineId: `platform-baseline-${input.deploymentId}`,
    runtime: manifestByDomain(manifests, "runtime"),
    consumer: manifestByDomain(manifests, "consumer"),
    dashboard: manifestByDomain(manifests, "dashboard"),
    release: manifestByDomain(manifests, "release"),
    operations: manifestByDomain(manifests, "operations"),
    commercialization: manifestByDomain(manifests, "commercialization"),
    landing: manifestByDomain(manifests, "landing"),
    governance: manifestByDomain(manifests, "governance"),
    trust: manifestByDomain(manifests, "trust"),
    "control-center": manifestByDomain(manifests, "control-center"),
    executive: manifestByDomain(manifests, "executive"),
    strategy: manifestByDomain(manifests, "strategy"),
  };
}

export function countFrozenDomains(baseline: PlatformBaseline): number {
  const domains = Object.values(baseline).filter(
    (value): value is FreezeManifest => typeof value === "object" && "status" in value,
  );
  return domains.filter((m) => m.status === "frozen").length;
}
