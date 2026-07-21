/**
 * Launch P5 — Support Tier Model
 */

import {
  SUPPORT_TIER_RESPONSE_MINUTES,
  SUPPORT_TIERS,
} from "./support.constants";
import type {
  CreateSupportTierInput,
  SupportTier,
  SupportTierDefinition,
} from "./support.types";

const tiers = new Map<string, SupportTierDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTier(tier: SupportTierDefinition): SupportTierDefinition {
  return {
    ...tier,
    channels: [...tier.channels],
    metadata: { ...tier.metadata },
  };
}

export function createSupportTier(
  input: CreateSupportTierInput,
): SupportTierDefinition {
  const name = input.name.trim();
  const tier = input.tier;
  if (!name) throw new Error("supportTier.name is required");
  if (!(SUPPORT_TIERS as readonly string[]).includes(tier)) {
    throw new Error(`invalid support tier: ${tier}`);
  }

  const responseMinutes =
    input.responseMinutes ?? SUPPORT_TIER_RESPONSE_MINUTES[tier];
  const resolutionMinutes =
    input.resolutionMinutes ?? responseMinutes * 4;
  if (responseMinutes <= 0 || resolutionMinutes <= 0) {
    throw new Error("support tier minutes must be positive");
  }

  const id = input.id?.trim() || createId("suptier");
  if (tiers.has(id)) throw new Error(`support tier already exists: ${id}`);

  const definition: SupportTierDefinition = {
    id,
    name,
    tier,
    responseMinutes,
    resolutionMinutes,
    channels: input.channels?.length
      ? [...input.channels]
      : ["email", "portal"],
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  tiers.set(id, definition);
  return cloneTier(definition);
}

export function getSupportTier(id: string): SupportTierDefinition | undefined {
  const tier = tiers.get(id.trim());
  return tier ? cloneTier(tier) : undefined;
}

export function listSupportTiers(filter?: {
  tier?: SupportTier;
}): SupportTierDefinition[] {
  let result = [...tiers.values()];
  if (filter?.tier) result = result.filter((t) => t.tier === filter.tier);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTier);
}

export function clearSupportTiers(): void {
  tiers.clear();
}
