/**
 * V80 Pilot P9 — Build deterministic intake summary / pre-V80 handoff package
 */

import { createHash } from "node:crypto";

import { appendIntakeAudit, listIntakeAudit } from "./audit-trail.service";
import { listOpenBlockingClarifications } from "./clarification.service";
import { evaluateComplianceRules } from "./compliance.service";
import {
  INTAKE_HANDOFF_PACKAGE_VERSION,
  type HandoffAudience,
  type HandoffEvidenceTraceItem,
  type HandoffRequirementSummary,
  type IntakeHandoffPackage,
  type IntakeHandoffState,
} from "./handoff-package.schema";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import { listIntakeDocuments } from "./multidoc.service";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import { parseTenderRequirements } from "./requirements.validation";

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

function stablePackageId(session: TenderIntakeSession, hash: string): string {
  return `handoff_${session.tenderIntakeId}_${hash.slice(0, 10)}`;
}

function contentHash(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function summarizeRequirements(req: TenderRequirements): HandoffRequirementSummary {
  let mustCount = 0;
  let confirmedMustCount = 0;
  let lowConfidenceCount = 0;
  let withEvidenceCount = 0;
  let itemCount = 0;

  for (const key of ITEM_KEYS) {
    for (const item of req[key]) {
      if (!item.text.trim()) continue;
      itemCount += 1;
      const priority = item.priority ?? "must";
      if (priority === "must") {
        mustCount += 1;
        if (item.reviewStatus === "confirmed") confirmedMustCount += 1;
      }
      if (item.confidenceBand === "low" || (item.confidence ?? 1) < 0.5) {
        lowConfidenceCount += 1;
      }
      if ((item.evidence?.length ?? 0) > 0 || item.pageRef) withEvidenceCount += 1;
    }
  }

  return {
    projectName: req.projectName,
    organization: req.organization,
    location: req.location,
    industry: req.industry,
    scope: req.scope,
    mustCount,
    confirmedMustCount,
    lowConfidenceCount,
    withEvidenceCount,
    itemCount,
  };
}

function collectEvidenceSample(
  req: TenderRequirements,
  limit = 12,
): HandoffEvidenceTraceItem[] {
  const out: HandoffEvidenceTraceItem[] = [];
  for (const key of ITEM_KEYS) {
    for (const item of req[key]) {
      if (!item.text.trim()) continue;
      if ((item.evidence?.length ?? 0) === 0 && !item.pageRef && !item.sourceDocumentId) {
        continue;
      }
      out.push({
        itemId: item.id,
        listKey: key,
        text: item.text.slice(0, 160),
        pageRef: item.pageRef,
        confidence: item.confidence,
        confidenceBand: item.confidenceBand,
        sourceDocumentId: item.sourceDocumentId,
        sourceDocumentName: item.sourceDocumentName,
        evidenceExcerpts: (item.evidence ?? []).slice(0, 2).map((e) => ({
          page: e.page,
          excerpt: e.excerpt.slice(0, 120),
          documentName: e.documentName,
        })),
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Customer view: drop internal-only fields from requirement items */
function customerizeRequirements(req: TenderRequirements): TenderRequirements {
  const mapItem = (item: RequirementItem): RequirementItem => ({
    id: item.id,
    text: item.text,
    pageRef: item.pageRef,
    priority: item.priority,
    reviewStatus: item.reviewStatus,
    confidenceBand: item.confidenceBand,
    sourceDocumentName: item.sourceDocumentName,
    evidence: (item.evidence ?? []).map((e) => ({
      page: e.page,
      excerpt: e.excerpt,
      documentName: e.documentName,
    })),
  });

  return {
    ...req,
    functionalRequirements: req.functionalRequirements.map(mapItem),
    technicalRequirements: req.technicalRequirements.map(mapItem),
    equipment: req.equipment.map(mapItem),
    space: req.space.map(mapItem),
    quantity: req.quantity.map(mapItem),
    constraints: req.constraints.map(mapItem),
    compliance: req.compliance.map(mapItem),
    standards: req.standards.map(mapItem),
    evaluation: req.evaluation.map(mapItem),
    optionalItems: req.optionalItems.map(mapItem),
  };
}

function buildCustomerBrief(
  session: TenderIntakeSession,
  req: TenderRequirements,
  summary: HandoffRequirementSummary,
): IntakeHandoffPackage["customerBrief"] {
  const openQs =
    session.clarifications?.questions
      .filter((q) => q.status === "open")
      .map((q) => q.question)
      .slice(0, 8) ?? [];

  const bullets = [
    `项目：${summary.projectName || "（待确认）"}`,
    `招标单位：${summary.organization || "（待确认）"}`,
    `地点：${summary.location || "（待确认）"}`,
    `已整理需求 ${summary.itemCount} 条（必选 ${summary.mustCount}，已确认 ${summary.confirmedMustCount}）`,
    `来源文档 ${(session.documents?.length ?? 1)} 份`,
  ];

  const riskNote =
    session.compliance?.report && !session.compliance.report.passed
      ? `仍有 ${session.compliance.report.blockingCount} 项合规阻断待处理`
      : session.compliance?.report?.warningCount
        ? `合规警告 ${session.compliance.report.warningCount} 项`
        : undefined;

  return {
    title: summary.projectName || session.fileName,
    headline: "招标需求澄清与确认摘要（交付前）",
    bullets,
    openQuestions: openQs,
    riskNote,
  };
}

function buildInternalNotes(
  session: TenderIntakeSession,
  req: TenderRequirements,
): IntakeHandoffPackage["internalNotes"] {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const nextActions: string[] = [];

  const blockingClarify = listOpenBlockingClarifications(session.clarifications);
  if (blockingClarify.length) {
    blockers.push(`未答阻断澄清 ${blockingClarify.length} 项`);
  }

  const compliance =
    session.compliance?.report ??
    evaluateComplianceRules({
      requirements: req,
      acknowledgedFindingIds: session.compliance?.acknowledgedFindingIds,
    });
  if (!compliance.passed) {
    blockers.push(`合规阻断 ${compliance.blockingCount} 项`);
  }
  for (const f of compliance.findings.filter((x) => x.severity === "warning" && !x.acknowledged)) {
    warnings.push(f.message);
  }

  if (!session.qaPassedAt) {
    warnings.push("QA 门禁尚未通过");
    nextActions.push("运行 QA 并确认 handoffReady");
  }
  if (blockingClarify.length) nextActions.push("完成阻断性澄清回答");
  if (!compliance.passed) nextActions.push("修复合规阻断项后重新校验");
  if (!session.productionProjectId) {
    nextActions.push("批准后创建 Project / Quote / Tender 并交接 V80");
  } else {
    nextActions.push("确认 V80 生成状态与交付产物");
  }

  return {
    blockers,
    warnings: warnings.slice(0, 12),
    nextActions: nextActions.slice(0, 8),
  };
}

/** Pure builder — deterministic from session snapshot. */
export function buildIntakeHandoffPackage(
  session: TenderIntakeSession,
  audience: HandoffAudience = "internal",
): IntakeHandoffPackage {
  const req = parseTenderRequirements(
    session.requirements ?? session.extractedRequirements ?? {},
  );
  const summary = summarizeRequirements(req);
  const documents = listIntakeDocuments(session.id).map((d) => ({
    id: d.id,
    fileName: d.fileName,
    docType: d.docType,
    order: d.order,
    priority: d.priority,
    status: d.status,
  }));

  const compliance =
    session.compliance?.report ??
    evaluateComplianceRules({
      requirements: req,
      acknowledgedFindingIds: session.compliance?.acknowledgedFindingIds,
    });

  const clarificationsBlockingOpen = listOpenBlockingClarifications(
    session.clarifications,
  ).length;

  const approval = {
    sessionStatus: session.status,
    qaPassed: Boolean(session.qaPassedAt),
    qaPassedAt: session.qaPassedAt,
    compliancePassed: compliance.passed,
    clarificationsBlockingOpen,
    frozen: isIntakeSessionFrozen(session),
    signedOff: session.signedOff === true,
    readyForV80:
      Boolean(session.qaPassedAt) &&
      compliance.passed &&
      clarificationsBlockingOpen === 0 &&
      !["failed", "qa_failed"].includes(session.status),
    workflowStatus: session.workflowStatus,
  };

  const hashPayload = {
    version: INTAKE_HANDOFF_PACKAGE_VERSION,
    sessionId: session.id,
    revision: session.requirementsRevision ?? 0,
    requirements: req,
    clarificationRound: session.clarifications?.round ?? 0,
    clarificationAnswers: (session.clarifications?.questions ?? []).map((q) => ({
      id: q.id,
      status: q.status,
      answer: q.answer ?? null,
    })),
    consolidation: session.consolidation
      ? {
          documentCount: session.consolidation.documentCount,
          keptItemCount: session.consolidation.keptItemCount,
          droppedItemCount: session.consolidation.droppedItemCount,
          conflictIds: session.consolidation.conflicts.map((c) => c.id).sort(),
        }
      : null,
    compliancePassed: compliance.passed,
    complianceBlocking: compliance.blockingCount,
    complianceWarning: compliance.warningCount,
    complianceRuleIds: compliance.findings.map((f) => f.ruleId).sort(),
    documents: documents.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      docType: d.docType,
      priority: d.priority,
    })),
    approval: {
      status: session.status,
      qaPassedAt: session.qaPassedAt ?? null,
      workflowStatus: session.workflowStatus ?? null,
    },
  };
  const hash = contentHash(hashPayload);
  const packageId = stablePackageId(session, hash);

  const auditSteps = listIntakeAudit(session.id)
    .slice(-30)
    .map((e) => ({
      id: e.id,
      step: e.step,
      timestamp: e.timestamp,
      message: e.message,
    }));

  const requirementsView =
    audience === "customer" ? customerizeRequirements(req) : req;

  const internalNotes = buildInternalNotes(session, req);

  return {
    version: INTAKE_HANDOFF_PACKAGE_VERSION,
    packageId,
    audience,
    builtAt: new Date().toISOString(),
    organizationId: session.organizationId,
    sessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    fileName: session.fileName,
    revision: session.requirementsRevision ?? 0,
    approval,
    requirementSummary: summary,
    requirements: requirementsView,
    clarifications: session.clarifications
      ? {
          round: session.clarifications.round,
          gaps: session.clarifications.gaps,
          questions:
            audience === "customer"
              ? session.clarifications.questions.map((q) => ({
                  ...q,
                  // hide merge internals from customer
                  suggestedTarget: q.suggestedTarget,
                }))
              : session.clarifications.questions,
          updatedAt: session.clarifications.updatedAt,
        }
      : undefined,
    consolidation: session.consolidation,
    compliance,
    documents,
    traceability: {
      sessionId: session.id,
      tenderIntakeId: session.tenderIntakeId,
      packageId,
      contentHash: hash,
      documents,
      auditSteps,
      linkage: {
        productionProjectId: session.productionProjectId,
        productionQuoteId: session.productionQuoteId,
        productionTenderId: session.productionTenderId,
        v80WorkflowJobId: session.v80WorkflowJobId,
      },
      evidenceSample: collectEvidenceSample(req),
    },
    customerBrief: buildCustomerBrief(session, req, summary),
    internalNotes:
      audience === "customer"
        ? { blockers: [], warnings: [], nextActions: [] }
        : internalNotes,
  };
}

export type BuildHandoffResult = {
  session: TenderIntakeSession;
  handoff: IntakeHandoffState;
  package: IntakeHandoffPackage;
};

/** Build, persist on session, audit. */
export function generateIntakeHandoffPackage(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
  audience?: HandoffAudience;
}): BuildHandoffResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  const audience = input.audience ?? "internal";
  const pkg = buildIntakeHandoffPackage(session, audience);

  const handoff: IntakeHandoffState = {
    packageId: pkg.packageId,
    builtAt: pkg.builtAt,
    contentHash: pkg.traceability.contentHash,
    lastAudience: audience,
    package: pkg,
  };

  const updated = updateIntakeSession(input.sessionId, { handoff });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "handoff_package",
    statusBefore: session.status,
    statusAfter: updated.status,
    message: `生成交接摘要包 ${pkg.packageId}（${audience}）`,
    meta: {
      packageId: pkg.packageId,
      audience,
      contentHash: pkg.traceability.contentHash,
      readyForV80: pkg.approval.readyForV80,
      revision: pkg.revision,
    },
  });

  return { session: updated, handoff, package: pkg };
}

export function getIntakeHandoffPackage(
  sessionId: string,
  audience?: HandoffAudience,
): IntakeHandoffPackage | null {
  const session = getIntakeSession(sessionId);
  if (!session) return null;
  if (audience) return buildIntakeHandoffPackage(session, audience);
  return session.handoff?.package ?? buildIntakeHandoffPackage(session, "internal");
}

/** JSON export body for download endpoint */
export function exportIntakeHandoffPackageJson(
  sessionId: string,
  organizationId: string,
  audience: HandoffAudience = "internal",
): { fileName: string; body: string; package: IntakeHandoffPackage } {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");

  const pkg = buildIntakeHandoffPackage(session, audience);
  const safeName = (pkg.requirementSummary.projectName || pkg.tenderIntakeId)
    .replace(/[^\w\u4e00-\u9fff-]+/g, "_")
    .slice(0, 48);
  return {
    fileName: `intake-handoff-${safeName}-${audience}.json`,
    body: JSON.stringify(pkg, null, 2),
    package: pkg,
  };
}
