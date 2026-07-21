/**
 * Launch P5 — Response Metrics
 */

import { listSupportIncidents } from "./support.incident";
import { listSupportPolicies } from "./support.policy";
import { getSupportSlaProfile } from "./support.profile";
import { getSupportTier } from "./support.tier";
import type { SupportResponseMetrics } from "./support.types";

function nowIso(): string {
  return new Date().toISOString();
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function computeSupportResponseMetrics(
  supportSlaProfileId: string,
): SupportResponseMetrics {
  const profileId = supportSlaProfileId.trim();
  const profile = getSupportSlaProfile(profileId);
  if (!profile) {
    throw new Error(`support sla profile not found: ${profileId}`);
  }

  const incidents = listSupportIncidents({ supportSlaProfileId: profileId });
  const openCount = incidents.filter(
    (i) => i.status === "OPEN" || i.status === "ACKNOWLEDGED" || i.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;
  const closedCount = incidents.filter((i) => i.status === "CLOSED").length;

  const responseValues = incidents
    .map((i) => i.responseMinutes)
    .filter((v): v is number => typeof v === "number");
  const resolutionValues = incidents
    .map((i) => i.resolutionMinutes)
    .filter((v): v is number => typeof v === "number");

  const tier = profile.supportTierId
    ? getSupportTier(profile.supportTierId)
    : undefined;
  const responsePolicy = listSupportPolicies({
    supportSlaProfileId: profileId,
    kind: "RESPONSE_TIME",
  })[0];
  const responseTarget =
    responsePolicy?.valueMinutes ?? tier?.responseMinutes ?? null;

  let withinSlaCount = 0;
  let breachedCount = 0;
  if (responseTarget !== null) {
    for (const minutes of responseValues) {
      if (minutes <= responseTarget) withinSlaCount += 1;
      else breachedCount += 1;
    }
  }

  const measured = withinSlaCount + breachedCount;
  const slaComplianceRate =
    measured === 0 ? null : Math.round((withinSlaCount / measured) * 10000) / 100;

  return {
    supportSlaProfileId: profileId,
    incidentCount: incidents.length,
    openCount,
    resolvedCount,
    closedCount,
    avgResponseMinutes: average(responseValues),
    avgResolutionMinutes: average(resolutionValues),
    withinSlaCount,
    breachedCount,
    slaComplianceRate,
    computedAt: nowIso(),
  };
}
