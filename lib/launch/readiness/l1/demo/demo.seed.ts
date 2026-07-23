/**
 * Launch L1 — Demo seed
 */

import { incrementBundleSeedCount, getDemoBundle } from "./demo.loader";
import type { DemoSeed, SeedDemoInput } from "./demo.types";

const seeds = new Map<string, DemoSeed>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSeed(seed: DemoSeed): DemoSeed {
  return { ...seed, payloadKeys: [...seed.payloadKeys] };
}

export function seedDemoData(input: SeedDemoInput): DemoSeed {
  const label = input.label.trim();
  const bundleId = input.bundleId.trim();
  if (!label) throw new Error("seed.label is required");
  if (!bundleId) throw new Error("seed.bundleId is required");
  if (!getDemoBundle(bundleId)) {
    throw new Error(`demo bundle not found: ${bundleId}`);
  }

  const id = input.id?.trim() || createId("l1sed");
  if (seeds.has(id)) {
    throw new Error(`demo seed already exists: ${id}`);
  }

  const payload = input.payload ?? {};
  const payloadKeys = Object.keys(payload).sort((a, b) => a.localeCompare(b));
  const seed: DemoSeed = {
    id,
    bundleId,
    label,
    payloadKeys,
    detail: `label=${label} keys=${payloadKeys.length}`,
    seededAt: nowIso(),
  };
  seeds.set(id, seed);
  incrementBundleSeedCount(bundleId);
  return cloneSeed(seed);
}

export function getDemoSeed(id: string): DemoSeed | undefined {
  const seed = seeds.get(id.trim());
  return seed ? cloneSeed(seed) : undefined;
}

export function listDemoSeeds(filter?: {
  bundleId?: string;
}): DemoSeed[] {
  let result = [...seeds.values()];
  if (filter?.bundleId) {
    const bid = filter.bundleId.trim();
    result = result.filter((s) => s.bundleId === bid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSeed);
}

export function clearDemoSeeds(): void {
  seeds.clear();
}
