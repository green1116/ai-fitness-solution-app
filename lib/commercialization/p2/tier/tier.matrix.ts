/**
 * Commercialization P2 — Tier entitlement matrix
 */

import { TIER_LEVELS } from "./tier.constants";
import type { TierLevel } from "../package/package.types";

export type TierEntitlement = {
  tier: TierLevel;
  maxSeats: number;
  maxWorkspaces: number;
  supportLevel: "BASIC" | "STANDARD" | "PREMIUM" | "DEDICATED";
  apiAccess: boolean;
  ssoEnabled: boolean;
  entitlementScore: number;
};

const MATRIX: Record<TierLevel, TierEntitlement> = {
  STARTER: {
    tier: "STARTER",
    maxSeats: 10,
    maxWorkspaces: 1,
    supportLevel: "BASIC",
    apiAccess: false,
    ssoEnabled: false,
    entitlementScore: 25,
  },
  GROWTH: {
    tier: "GROWTH",
    maxSeats: 50,
    maxWorkspaces: 5,
    supportLevel: "STANDARD",
    apiAccess: true,
    ssoEnabled: false,
    entitlementScore: 50,
  },
  PROFESSIONAL: {
    tier: "PROFESSIONAL",
    maxSeats: 200,
    maxWorkspaces: 25,
    supportLevel: "PREMIUM",
    apiAccess: true,
    ssoEnabled: true,
    entitlementScore: 75,
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    maxSeats: 2000,
    maxWorkspaces: 200,
    supportLevel: "DEDICATED",
    apiAccess: true,
    ssoEnabled: true,
    entitlementScore: 100,
  },
};

export function getTierEntitlement(tier: TierLevel): TierEntitlement {
  if (!(TIER_LEVELS as readonly string[]).includes(tier)) {
    throw new Error(`invalid tier level: ${tier}`);
  }
  return { ...MATRIX[tier] };
}

export function buildTierMatrix(): TierEntitlement[] {
  return TIER_LEVELS.map((tier) => getTierEntitlement(tier));
}

export function scoreTierFeatures(
  tier: TierLevel,
  featureCount: number,
): number {
  const base = getTierEntitlement(tier).entitlementScore;
  return Math.min(100, base + Math.max(0, featureCount) * 2);
}
