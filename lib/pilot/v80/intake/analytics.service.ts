/**
 * V80 Pilot P11 — Deterministic intake KPI aggregation (read-only)
 */

import { listOpenBlockingClarifications } from "./clarification.service";
import {
  INTAKE_ANALYTICS_VERSION,
  type ClarificationAnalytics,
  type ConfidenceAnalytics,
  type ComplianceAnalytics,
  type DocumentSourceAnalytics,
  type DurationMetrics,
  type IntakeAnalyticsKpis,
  type IntakeAnalyticsReport,
  type TrendPoint,
} from "./analytics.schema";
import {
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "./intake.store";
import type { RequirementItem } from "./requirements.schema";

const ITEM_KEYS = [
  "functionalRequirements",
  "technicalRequirements",
  "equipment",
  "space",
  "quantity",
  "constraints",
  "compliance",
  "standards",
  "evaluation",
  "optionalItems",
] as const;

function dayKey(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "unknown";
  return new Date(t).toISOString().slice(0, 10);
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
  }
  return sorted[mid]!;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)]!;
}

function durationMs(session: TenderIntakeSession): number | null {
  const start = Date.parse(session.createdAt);
  if (!Number.isFinite(start)) return null;
  const endIso =
    session.status === "ready" || session.workflowStatus === "completed"
      ? session.updatedAt
      : session.qaPassedAt && session.productionProjectId
        ? session.updatedAt
        : null;
  if (!endIso) return null;
  const end = Date.parse(endIso);
  if (!Number.isFinite(end) || end < start) return null;
  return end - start;
}

function allItems(session: TenderIntakeSession): RequirementItem[] {
  const req = session.requirements ?? session.extractedRequirements;
  if (!req) return [];
  const out: RequirementItem[] = [];
  for (const key of ITEM_KEYS) {
    for (const item of req[key]) {
      if (item.text.trim()) out.push(item);
    }
  }
  return out;
}

function filterByWindow(
  sessions: TenderIntakeSession[],
  from?: string,
  to?: string,
): TenderIntakeSession[] {
  const fromMs = from ? Date.parse(from) : NaN;
  const toMs = to ? Date.parse(to) : NaN;
  return sessions.filter((s) => {
    const t = Date.parse(s.createdAt);
    if (!Number.isFinite(t)) return true;
    if (Number.isFinite(fromMs) && t < fromMs) return false;
    if (Number.isFinite(toMs) && t > toMs) return false;
    return true;
  });
}

function computeDuration(sessions: TenderIntakeSession[]): DurationMetrics {
  const values = sessions
    .map(durationMs)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  if (values.length === 0) {
    return { sampleSize: 0, avgMs: 0, medianMs: 0, p90Ms: 0, minMs: 0, maxMs: 0 };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    sampleSize: values.length,
    avgMs: Math.round(sum / values.length),
    medianMs: median(values),
    p90Ms: percentile(values, 90),
    minMs: values[0]!,
    maxMs: values[values.length - 1]!,
  };
}

function computeClarifications(sessions: TenderIntakeSession[]): ClarificationAnalytics {
  let withC = 0;
  let totalQ = 0;
  let open = 0;
  let answered = 0;
  let skipped = 0;
  let blockingOpen = 0;
  let roundSum = 0;
  for (const s of sessions) {
    const c = s.clarifications;
    if (!c) continue;
    withC += 1;
    roundSum += c.round;
    blockingOpen += listOpenBlockingClarifications(c).length;
    for (const q of c.questions) {
      totalQ += 1;
      if (q.status === "open") open += 1;
      else if (q.status === "answered") answered += 1;
      else if (q.status === "skipped") skipped += 1;
    }
  }
  return {
    sessionsWithClarifications: withC,
    totalQuestions: totalQ,
    open,
    answered,
    skipped,
    blockingOpen,
    avgRound: withC ? Math.round((roundSum / withC) * 100) / 100 : 0,
  };
}

function computeConfidence(sessions: TenderIntakeSession[]): ConfidenceAnalytics {
  let high = 0;
  let medium = 0;
  let low = 0;
  let withEvidence = 0;
  let withoutEvidence = 0;
  let totalItems = 0;
  for (const s of sessions) {
    for (const item of allItems(s)) {
      totalItems += 1;
      const band =
        item.confidenceBand ??
        (typeof item.confidence === "number"
          ? item.confidence >= 0.75
            ? "high"
            : item.confidence >= 0.5
              ? "medium"
              : "low"
          : "medium");
      if (band === "high") high += 1;
      else if (band === "medium") medium += 1;
      else low += 1;
      if ((item.evidence?.length ?? 0) > 0 || item.pageRef) withEvidence += 1;
      else withoutEvidence += 1;
    }
  }
  return { high, medium, low, withEvidence, withoutEvidence, totalItems };
}

function computeCompliance(sessions: TenderIntakeSession[]): ComplianceAnalytics {
  let evaluated = 0;
  let passed = 0;
  let blocked = 0;
  const bySeverity = { blocking: 0, warning: 0, info: 0 };
  const byCategory: Record<string, number> = {};
  const ruleCounts = new Map<string, number>();

  for (const s of sessions) {
    const report = s.compliance?.report;
    if (!report) continue;
    evaluated += 1;
    if (report.passed) passed += 1;
    else blocked += 1;
    for (const f of report.findings) {
      bySeverity[f.severity] += 1;
      byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
      ruleCounts.set(f.ruleId, (ruleCounts.get(f.ruleId) ?? 0) + 1);
    }
  }

  const topRuleIds = [...ruleCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([ruleId, count]) => ({ ruleId, count }));

  return {
    sessionsEvaluated: evaluated,
    passed,
    blocked,
    findingsBySeverity: bySeverity,
    findingsByCategory: byCategory,
    topRuleIds,
  };
}

function computeDocuments(sessions: TenderIntakeSession[]): DocumentSourceAnalytics {
  let totalDocuments = 0;
  let multi = 0;
  let single = 0;
  let conflicts = 0;
  const byDocType: Record<string, number> = {};

  for (const s of sessions) {
    const docs = s.documents?.length
      ? s.documents
      : [{ docType: "primary" as const }];
    const n = docs.length;
    totalDocuments += n;
    if (n > 1) multi += 1;
    else single += 1;
    for (const d of docs) {
      const t = "docType" in d ? d.docType : "primary";
      byDocType[t] = (byDocType[t] ?? 0) + 1;
    }
    conflicts += s.consolidation?.conflicts.length ?? 0;
  }

  return {
    totalDocuments,
    multiDocSessions: multi,
    singleDocSessions: single,
    byDocType,
    avgDocumentsPerSession:
      sessions.length === 0
        ? 0
        : Math.round((totalDocuments / sessions.length) * 100) / 100,
    conflictCount: conflicts,
  };
}

function computeBootstrap(sessions: TenderIntakeSession[]) {
  let withB = 0;
  let ready = 0;
  let ms = 0;
  let tasks = 0;
  let owners = 0;
  for (const s of sessions) {
    const b = s.bootstrap?.package;
    if (!b) continue;
    withB += 1;
    if (b.kickoff.ready) ready += 1;
    ms += b.milestones.length;
    tasks += b.tasks.length;
    owners += b.owners.length;
  }
  return {
    sessionsWithBootstrap: withB,
    readyCount: ready,
    avgMilestones: withB ? Math.round((ms / withB) * 100) / 100 : 0,
    avgTasks: withB ? Math.round((tasks / withB) * 100) / 100 : 0,
    avgOwners: withB ? Math.round((owners / withB) * 100) / 100 : 0,
  };
}

function computeTrends(sessions: TenderIntakeSession[]): TrendPoint[] {
  const map = new Map<string, TrendPoint>();
  const ensure = (date: string): TrendPoint => {
    let row = map.get(date);
    if (!row) {
      row = {
        date,
        sessionsCreated: 0,
        sessionsReady: 0,
        clarificationsAnswered: 0,
        complianceBlocked: 0,
        bootstrapsSeeded: 0,
      };
      map.set(date, row);
    }
    return row;
  };

  for (const s of sessions) {
    const created = ensure(dayKey(s.createdAt));
    created.sessionsCreated += 1;
    if (s.status === "ready" || s.workflowStatus === "completed") {
      created.sessionsReady += 1;
    }
    if (s.clarifications) {
      created.clarificationsAnswered += s.clarifications.questions.filter(
        (q) => q.status === "answered",
      ).length;
    }
    if (s.compliance?.report && !s.compliance.report.passed) {
      created.complianceBlocked += 1;
    }
    if (s.bootstrap) {
      created.bootstrapsSeeded += 1;
    }
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateIntakeAnalytics(
  sessions: TenderIntakeSession[],
): IntakeAnalyticsKpis {
  const byStatus: Record<string, number> = {};
  let qaPassed = 0;
  let withProject = 0;
  let ready = 0;
  let failed = 0;

  for (const s of sessions) {
    byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
    if (s.qaPassedAt) qaPassed += 1;
    if (s.productionProjectId) withProject += 1;
    if (s.status === "ready" || s.workflowStatus === "completed") ready += 1;
    if (s.status === "failed" || s.workflowStatus === "failed") failed += 1;
  }

  const n = sessions.length || 1;
  return {
    totalSessions: sessions.length,
    byStatus,
    readyRate: Math.round((ready / n) * 1000) / 1000,
    failedRate: Math.round((failed / n) * 1000) / 1000,
    qaPassedRate: Math.round((qaPassed / n) * 1000) / 1000,
    withProjectRate: Math.round((withProject / n) * 1000) / 1000,
    duration: computeDuration(sessions),
    clarifications: computeClarifications(sessions),
    confidence: computeConfidence(sessions),
    compliance: computeCompliance(sessions),
    documents: computeDocuments(sessions),
    bootstrap: computeBootstrap(sessions),
  };
}

/** Build full analytics report for an organization (read-only). */
export function buildIntakeAnalyticsReport(input: {
  organizationId: string;
  from?: string;
  to?: string;
  now?: string;
}): IntakeAnalyticsReport {
  const all = listIntakeSessionsForOrg(input.organizationId);
  const sessions = filterByWindow(all, input.from, input.to);
  const kpis = aggregateIntakeAnalytics(sessions);
  const trends = computeTrends(sessions);

  return {
    version: INTAKE_ANALYTICS_VERSION,
    organizationId: input.organizationId,
    generatedAt: input.now ?? new Date().toISOString(),
    window: {
      from: input.from,
      to: input.to,
      sessionCount: sessions.length,
    },
    kpis,
    trends,
  };
}

export function exportIntakeAnalyticsJson(report: IntakeAnalyticsReport): {
  fileName: string;
  body: string;
} {
  const day = report.generatedAt.slice(0, 10);
  return {
    fileName: `intake-analytics-${report.organizationId.slice(0, 12)}-${day}.json`,
    body: JSON.stringify(report, null, 2),
  };
}
