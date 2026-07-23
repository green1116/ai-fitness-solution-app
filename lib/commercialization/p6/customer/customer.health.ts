/**
 * Commercialization P6 — Customer health
 */

import { HEALTH_BANDS } from "../kpi/kpi.constants";
import type {
  AssessCustomerHealthInput,
  CustomerHealthProfile,
  HealthBand,
} from "./customer.types";

const healthStore = new Map<string, CustomerHealthProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneHealth(
  profile: CustomerHealthProfile,
): CustomerHealthProfile {
  return { ...profile };
}

function bandForScore(score: number): HealthBand {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 55) return "FAIR";
  if (score >= 40) return "POOR";
  return "CRITICAL";
}

export function assessCustomerHealth(
  input: AssessCustomerHealthInput,
): CustomerHealthProfile {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("customerHealth.accountRef is required");

  const engagementScore = Math.max(
    0,
    Math.min(100, Math.round(input.engagementScore)),
  );
  const supportLoad = Math.max(0, Math.round(input.supportLoad ?? 20));
  const adjusted = Math.max(
    0,
    Math.min(100, engagementScore - Math.round(supportLoad / 5)),
  );
  const band = bandForScore(adjusted);
  if (!(HEALTH_BANDS as readonly string[]).includes(band)) {
    throw new Error(`invalid health band: ${band}`);
  }

  const id = input.id?.trim() || createId("chealth");
  if (healthStore.has(id)) {
    throw new Error(`customer health profile already exists: ${id}`);
  }

  const profile: CustomerHealthProfile = {
    id,
    accountRef,
    band,
    engagementScore,
    supportLoad,
    detail: `band=${band} engagement=${engagementScore}`,
    assessedAt: nowIso(),
  };
  healthStore.set(id, profile);
  return cloneHealth(profile);
}

export function getCustomerHealthProfile(
  id: string,
): CustomerHealthProfile | undefined {
  const profile = healthStore.get(id.trim());
  return profile ? cloneHealth(profile) : undefined;
}

export function listCustomerHealthProfiles(filter?: {
  accountRef?: string;
  band?: HealthBand;
}): CustomerHealthProfile[] {
  let result = [...healthStore.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  if (filter?.band) result = result.filter((p) => p.band === filter.band);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHealth);
}

export function clearCustomerHealthProfiles(): void {
  healthStore.clear();
}
