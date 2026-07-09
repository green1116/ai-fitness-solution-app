/**
 * V84 — CRM dashboard (read intelligence + follow-up state)
 */

import { getIntakeSession, listIntakeSessionsForOrg } from "@/lib/pilot/v80";
import { listDeliveryTrackingEvents } from "@/lib/pilot/v81";
import { buildDeliveryIntelligenceDashboard } from "@/lib/pilot/v83";

import {
  getFollowUpRecord,
  listRetentionActions,
} from "./follow-up.store";
import type {
  CrmCustomerRow,
  CrmDashboard,
  FollowUpQueueItem,
  SessionFollowUpDetail,
} from "./follow-up.types";
import { V84_CUSTOMER_SUCCESS_VERSION } from "./follow-up.types";

const EVENT_LABELS: Record<string, string> = {
  release_ready: "发布就绪",
  delivery_opened: "客户打开",
  artifact_viewed: "产物查看",
  artifact_downloaded: "产物下载",
  pending_action: "待处理",
  delivery_failed: "交付失败",
};

function lastTrackingLabel(sessionId: string): { at?: string; label?: string } {
  const events = listDeliveryTrackingEvents(sessionId);
  if (events.length === 0) return {};
  const last = events[events.length - 1]!;
  return {
    at: last.timestamp,
    label: EVENT_LABELS[last.type] ?? last.type,
  };
}

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

function resolveFollowUp(sessionId: string, organizationId: string) {
  return getFollowUpRecord(sessionId, organizationId) ?? defaultFollowUp(sessionId, organizationId);
}

function buildCustomerRow(
  organizationId: string,
  ranked: ReturnType<typeof buildDeliveryIntelligenceDashboard>["rankedSessions"][number],
  recommendation: ReturnType<typeof buildDeliveryIntelligenceDashboard>["recommendations"][number] | undefined,
): CrmCustomerRow | null {
  const session = getIntakeSession(ranked.sessionId);
  if (!session || !session.signedOff) return null;

  const followUp = resolveFollowUp(ranked.sessionId, organizationId);

  const last = lastTrackingLabel(ranked.sessionId);

  return {
    sessionId: ranked.sessionId,
    releasePackageId: ranked.releasePackageId,
    projectName: ranked.projectName ?? session.requirements?.projectName,
    fileName: session.fileName,
    riskScore: ranked.score,
    priority: ranked.priority,
    due: ranked.due,
    lastEventAt: last.at ?? session.signedOffAt,
    lastEventLabel: last.label ?? "签收发布",
    recommendedAction: recommendation?.action ?? ranked.topAction,
    recommendedTitle: recommendation?.title ?? ranked.topAction,
    followUp,
    readOnly: true,
  };
}

export function buildCrmDashboard(organizationId: string): CrmDashboard {
  const intelligence = buildDeliveryIntelligenceDashboard(organizationId);
  const released = listIntakeSessionsForOrg(organizationId).filter((s) => s.signedOff);

  const customers: CrmCustomerRow[] = [];

  if (intelligence.rankedSessions.length > 0) {
    for (const ranked of intelligence.rankedSessions) {
      const rec = intelligence.recommendations.find((r) => r.sessionId === ranked.sessionId);
      const row = buildCustomerRow(organizationId, ranked, rec);
      if (row) customers.push(row);
    }
  } else {
    for (const session of released) {
      const followUp = resolveFollowUp(session.id, organizationId);
      const last = lastTrackingLabel(session.id);
      customers.push({
        sessionId: session.id,
        releasePackageId: session.releasePackageId,
        projectName: session.requirements?.projectName,
        fileName: session.fileName,
        riskScore: 0,
        priority: "low",
        due: "later",
        lastEventAt: last.at ?? session.signedOffAt,
        lastEventLabel: last.label ?? "签收发布",
        recommendedAction: "customer_success_action",
        recommendedTitle: "客户成功触达",
        followUp,
        readOnly: true,
      });
    }
  }

  const queue: FollowUpQueueItem[] = customers
    .filter((c) => c.followUp.status !== "resolved")
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((c, i) => ({ ...c, queuePosition: i + 1 }));

  const summary = {
    total: customers.length,
    pending: customers.filter((c) => c.followUp.status === "pending").length,
    inProgress: customers.filter((c) => c.followUp.status === "in_progress").length,
    escalated: customers.filter((c) => c.followUp.status === "escalated").length,
    resolved: customers.filter((c) => c.followUp.status === "resolved").length,
    hotAccounts: customers.filter((c) => c.priority === "high").length,
  };

  return {
    version: V84_CUSTOMER_SUCCESS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    customers,
    queue,
    summary,
    readOnly: true,
  };
}

export function buildSessionFollowUpDetail(
  sessionId: string,
  organizationId: string,
): SessionFollowUpDetail {
  const dashboard = buildCrmDashboard(organizationId);
  const customer = dashboard.customers.find((c) => c.sessionId === sessionId);
  if (!customer) throw new Error("NOT_RELEASED");

  return {
    sessionId,
    customer,
    actionHistory: listRetentionActions(sessionId),
    intelligencePath: `/api/pilot/v83/delivery-intelligence/${sessionId}`,
    readOnly: true,
  };
}

export function buildFollowUpQueue(organizationId: string): FollowUpQueueItem[] {
  return buildCrmDashboard(organizationId).queue;
}
