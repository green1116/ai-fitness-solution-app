/**
 * V85 — Account health dashboard (read-only forecast layer)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { listDeliveryTrackingEvents } from "@/lib/pilot/v81";
import { buildDeliveryIntelligenceDashboard } from "@/lib/pilot/v83";
import { buildCrmDashboard, type CrmCustomerRow } from "@/lib/pilot/v84";

import type {
  AccountHealthDashboard,
  AccountHealthDetail,
  AccountHealthRow,
} from "./account.types";
import { V85_ACCOUNT_HEALTH_VERSION } from "./account.types";
import {
  buildDeliveryHistory,
  computeAccountHealthScores,
  deriveOpenRisks,
} from "./health.service";
import { buildRenewalForecast, FORECAST_CATEGORY_LABELS } from "./renewal.service";

function defaultFollowUp(sessionId: string, organizationId: string) {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "pending" as const,
    responseStatus: "unknown" as const,
    resolutionStatus: "open" as const,
    contactAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function buildAccountRow(
  customer: CrmCustomerRow,
  organizationId: string,
  patterns: string[],
  options?: { now?: Date; useCache?: boolean },
): AccountHealthRow | null {
  const session = getIntakeSession(customer.sessionId);
  if (!session?.signedOffAt) return null;

  const events = listDeliveryTrackingEvents(customer.sessionId);
  const followUp = customer.followUp ?? defaultFollowUp(customer.sessionId, organizationId);

  const scoreInput = {
    sessionId: customer.sessionId,
    organizationId,
    signedOffAt: session.signedOffAt,
    riskScore: customer.riskScore,
    events,
    followUp,
    patterns,
  };

  const scores = computeAccountHealthScores(scoreInput);
  const forecast = buildRenewalForecast(scoreInput, options);
  const openRisks = deriveOpenRisks({ scores, followUp, events, patterns });

  return {
    sessionId: customer.sessionId,
    releasePackageId: customer.releasePackageId,
    projectName: customer.projectName,
    fileName: customer.fileName,
    signedOffAt: session.signedOffAt,
    scores,
    forecast,
    followUp,
    openRisks,
    deliveryHistory: buildDeliveryHistory(events, session.signedOffAt),
    lastEventAt: customer.lastEventAt,
    lastEventLabel: customer.lastEventLabel,
    recommendedTitle: customer.recommendedTitle,
    readOnly: true,
  };
}

export function buildAccountHealthDashboard(
  organizationId: string,
  options?: { now?: Date; useCache?: boolean },
): AccountHealthDashboard {
  const crm = buildCrmDashboard(organizationId);
  const intelligence = buildDeliveryIntelligenceDashboard(organizationId);

  const accounts: AccountHealthRow[] = [];
  for (const customer of crm.customers) {
    const ranked = intelligence.rankedSessions.find((r) => r.sessionId === customer.sessionId);
    const patterns = ranked?.patterns ?? [];
    const row = buildAccountRow(customer, organizationId, patterns, options);
    if (row) accounts.push(row);
  }

  const renewalList = [...accounts].sort(
    (a, b) => a.forecast.daysUntilRenewal - b.forecast.daysUntilRenewal,
  );

  const avg = (vals: number[]) =>
    vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  const summary = {
    total: accounts.length,
    healthy: accounts.filter((a) => a.scores.accountHealthScore >= 65).length,
    atRisk: accounts.filter((a) => a.forecast.category === "at_risk").length,
    expiringSoon: accounts.filter((a) => a.forecast.category === "expiring_soon").length,
    likelyRenew: accounts.filter((a) => a.forecast.category === "likely_renew").length,
    needsOutreach: accounts.filter((a) => a.forecast.category === "needs_outreach").length,
    avgHealthScore: avg(accounts.map((a) => a.scores.accountHealthScore)),
    avgRenewalLikelihood: avg(accounts.map((a) => a.scores.renewalLikelihood)),
  };

  return {
    version: V85_ACCOUNT_HEALTH_VERSION,
    organizationId,
    generatedAt: (options?.now ?? new Date()).toISOString(),
    accounts,
    renewalList,
    summary,
    readOnly: true,
  };
}

export function buildAccountHealthDetail(
  sessionId: string,
  organizationId: string,
  options?: { now?: Date },
): AccountHealthDetail {
  const dashboard = buildAccountHealthDashboard(organizationId, options);
  const account = dashboard.accounts.find((a) => a.sessionId === sessionId);
  if (!account) throw new Error("NOT_RELEASED");

  const crm = buildCrmDashboard(organizationId);
  const customer = crm.customers.find((c) => c.sessionId === sessionId);
  if (!customer) throw new Error("NOT_RELEASED");

  const timeline: AccountHealthDetail["forecastTimeline"] = [];

  if (account.signedOffAt) {
    timeline.push({
      date: account.signedOffAt,
      label: "签收发布",
      kind: "release",
    });
  }

  for (const entry of account.deliveryHistory) {
    if (entry.type === "release") continue;
    timeline.push({
      date: entry.timestamp,
      label: entry.label,
      kind: "event",
    });
  }

  const actions = customer.followUp.lastContactAt;
  if (actions) {
    timeline.push({
      date: actions,
      label: `跟进联系 (${customer.followUp.contactAttempts} 次)`,
      kind: "follow_up",
    });
  }

  timeline.push({
    date: account.forecast.renewalDate,
    label: `续约窗口 — ${FORECAST_CATEGORY_LABELS[account.forecast.category]}`,
    kind: "renewal",
  });

  timeline.sort((a, b) => a.date.localeCompare(b.date));

  return {
    account,
    customer,
    forecastTimeline: timeline,
    readOnly: true,
  };
}
