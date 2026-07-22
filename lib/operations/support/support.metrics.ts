/**
 * Post-Launch P6 — Enterprise Support Metrics
 */

import { listEnterpriseSupportCases } from "./support.case";
import { listKnowledgeArticles } from "./support.knowledge";
import { listEscalationRoutingDecisions } from "./support.routing";
import { listCustomerSupportWorkflows } from "./support.workflow";
import type { EnterpriseSupportMetrics } from "./support.types";

function nowIso(): string {
  return new Date().toISOString();
}

function minutesBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function avg(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function computeEnterpriseSupportMetrics(filter?: {
  productId?: string;
  supportSlaProfileId?: string;
}): EnterpriseSupportMetrics {
  const cases = listEnterpriseSupportCases({
    productId: filter?.productId,
    supportSlaProfileId: filter?.supportSlaProfileId,
  });

  const openCount = cases.filter(
    (c) =>
      c.status === "OPEN" ||
      c.status === "IN_PROGRESS" ||
      c.status === "WAITING_CUSTOMER" ||
      c.status === "ESCALATED",
  ).length;
  const escalatedCount = cases.filter(
    (c) => c.status === "ESCALATED" || c.route !== "L1_SUPPORT",
  ).length;
  const resolvedCount = cases.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED",
  ).length;
  const closedCount = cases.filter((c) => c.status === "CLOSED").length;

  const resolutionMinutes = cases
    .filter((c) => c.resolvedAt)
    .map((c) => minutesBetween(c.openedAt, c.resolvedAt!));

  const workflows = listCustomerSupportWorkflows().filter((w) =>
    cases.some((c) => c.id === w.supportCaseId),
  );
  const workflowCompleteCount = workflows.filter(
    (w) => w.complete && !w.failed,
  ).length;

  const knowledgePublishedCount = listKnowledgeArticles({
    productId: filter?.productId,
    status: "PUBLISHED",
  }).length;

  const routingCount = listEscalationRoutingDecisions().filter((r) =>
    cases.some((c) => c.id === r.supportCaseId),
  ).length;

  let supportHealthScore = 40;
  if (cases.length === 0) {
    supportHealthScore = 100;
  } else {
    supportHealthScore += Math.round((resolvedCount / cases.length) * 30);
    supportHealthScore += Math.min(15, workflowCompleteCount * 5);
    supportHealthScore += Math.min(10, knowledgePublishedCount * 5);
    if (routingCount > 0) supportHealthScore += 5;
  }
  supportHealthScore = Math.max(0, Math.min(100, supportHealthScore));

  return {
    supportSlaProfileId: filter?.supportSlaProfileId,
    productId: filter?.productId,
    caseCount: cases.length,
    openCount,
    escalatedCount,
    resolvedCount,
    closedCount,
    workflowCompleteCount,
    knowledgePublishedCount,
    avgResolutionMinutes: avg(resolutionMinutes),
    routingCount,
    supportHealthScore,
    computedAt: nowIso(),
  };
}
