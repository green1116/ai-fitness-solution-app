/**
 * V65 P5 — SaasPlan read-boundary normalization (legacy string compat)
 */
import type { SaasPlan, SaasSubStatus } from "./types";

const PLAN_ALIASES: Record<string, SaasPlan> = {
  BASIC: "BASIC",
  basic: "BASIC",
  free: "BASIC",
  starter: "BASIC",
  PRO: "PRO",
  pro: "PRO",
  professional: "PRO",
  ENTERPRISE: "ENTERPRISE",
  enterprise: "ENTERPRISE",
};

export function normalizeSaasPlan(
  value: string | null | undefined,
  fallback: SaasPlan = "BASIC",
): SaasPlan {
  if (!value) return fallback;
  const alias = PLAN_ALIASES[value];
  if (alias) return alias;
  const upper = value.toUpperCase();
  if (upper === "BASIC" || upper === "PRO" || upper === "ENTERPRISE") {
    return upper;
  }
  return fallback;
}

export function normalizeSaasSubStatus(
  value: string | null | undefined,
  fallback: SaasSubStatus = "ACTIVE",
): SaasSubStatus {
  if (value === "ACTIVE" || value === "CANCELED") return value;
  const upper = value?.toUpperCase();
  if (upper === "CANCELED") return "CANCELED";
  if (upper === "ACTIVE") return "ACTIVE";
  return fallback;
}
