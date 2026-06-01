import { getPhaseRegistry } from "../inventory";
import type { FreezeManifest } from "./types";

export function buildFreezeManifests(): FreezeManifest[] {
  return getPhaseRegistry().map((entry) => ({
    domain: entry.domain,
    phase: entry.phase,
    phaseName: entry.phaseName,
    status: "frozen" as const,
    version: `phase-${entry.phase}-v1`,
    tag: entry.tag,
  }));
}

export function buildFreezeManifestForDomain(domain: FreezeManifest["domain"]): FreezeManifest {
  const manifests = buildFreezeManifests();
  const manifest = manifests.find((m) => m.domain === domain);
  if (!manifest) {
    throw new Error(`Unknown freeze domain: ${domain}`);
  }
  return manifest;
}
