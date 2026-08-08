/**
 * V80 Pilot P8 — Rule-based knowledge/compliance validation (no new engine)
 */

import { randomUUID } from "node:crypto";

import { appendIntakeAudit } from "./audit-trail.service";
import {
  DEFAULT_COMPLIANCE_RULES,
  DEFAULT_KNOWLEDGE_REFERENCES,
} from "./compliance.catalog";
import type {
  ComplianceFinding,
  ComplianceRiskLevel,
  ComplianceRule,
  ComplianceValidationReport,
  IntakeComplianceState,
  KnowledgeReference,
} from "./compliance.schema";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  getIntakeSession,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import type { RequirementItem, TenderRequirements } from "./requirements.schema";
import { parseTenderRequirements } from "./requirements.validation";

const AMBIGUOUS_QTY = /大约|若干|待定|左右|TBD|未知/i;

function allItems(req: TenderRequirements): Array<{ key: string; item: RequirementItem }> {
  const keys = [
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
  const out: Array<{ key: string; item: RequirementItem }> = [];
  for (const key of keys) {
    for (const item of req[key]) {
      if (item.text.trim()) out.push({ key, item });
    }
  }
  return out;
}

function blob(req: TenderRequirements): string {
  return [
    req.projectName,
    req.organization,
    req.industry,
    req.location,
    req.scope,
    ...req.objectives,
    ...allItems(req).map((x) => x.item.text),
    ...req.standards.map((s) => s.text),
    ...req.compliance.map((c) => c.text),
    req.budget.notes,
  ]
    .join("\n")
    .toLowerCase();
}

function isFitnessContext(req: TenderRequirements): boolean {
  const b = blob(req);
  return /健身|gym|器械|有氧|力量|跑步机|体育/.test(b) || req.industry === "fitness";
}

function severityToRisk(
  severity: ComplianceFinding["severity"],
): ComplianceRiskLevel {
  if (severity === "blocking") return "critical";
  if (severity === "warning") return "high";
  return "low";
}

function overallRisk(findings: ComplianceFinding[]): ComplianceRiskLevel {
  if (findings.some((f) => f.severity === "blocking" && !f.acknowledged)) {
    return "critical";
  }
  if (findings.some((f) => f.severity === "warning" && !f.acknowledged)) {
    return "high";
  }
  if (findings.some((f) => f.severity === "warning")) return "medium";
  if (findings.some((f) => f.severity === "info")) return "low";
  return "none";
}

function finding(
  rule: ComplianceRule,
  message: string,
  recommendation: string,
  extra?: Partial<ComplianceFinding>,
): ComplianceFinding {
  return {
    id: `cf_${rule.id}_${randomUUID().slice(0, 6)}`,
    ruleId: rule.id,
    category: rule.category,
    severity: rule.severity,
    risk: severityToRisk(rule.severity),
    title: rule.title,
    message,
    recommendation,
    knowledgeRefIds: rule.knowledgeRefIds,
    ...extra,
  };
}

function knowledgeMentions(
  text: string,
  refs: KnowledgeReference[],
  refIds?: string[],
): boolean {
  const pool = refIds?.length
    ? refs.filter((r) => refIds.includes(r.id))
    : refs;
  const lower = text.toLowerCase();
  return pool.some((r) =>
    r.keywords.some((k) => lower.includes(k.toLowerCase())),
  );
}

/** Pure evaluation — reusable by verify scripts and session runner. */
export function evaluateComplianceRules(input: {
  requirements: TenderRequirements;
  knowledgeRefs?: KnowledgeReference[];
  rules?: ComplianceRule[];
  acknowledgedFindingIds?: string[];
}): ComplianceValidationReport {
  const knowledgeRefs = input.knowledgeRefs ?? DEFAULT_KNOWLEDGE_REFERENCES;
  const rules = input.rules ?? DEFAULT_COMPLIANCE_RULES;
  const req = parseTenderRequirements(input.requirements);
  const textBlob = blob(req);
  const items = allItems(req);
  const findings: ComplianceFinding[] = [];

  for (const rule of rules) {
    switch (rule.matcher) {
      case "require_project_basics": {
        const missing: string[] = [];
        if (!req.projectName.trim()) missing.push("projectName");
        if (!req.organization.trim()) missing.push("organization");
        if (!req.location.trim()) missing.push("location");
        if (missing.length) {
          findings.push(
            finding(
              rule,
              `缺少基础字段：${missing.join(", ")}`,
              "请补全项目名称、招标单位与建设地点后再批准。",
              { fieldPath: missing[0] },
            ),
          );
        }
        break;
      }
      case "require_tech_or_func": {
        const n =
          req.technicalRequirements.filter((i) => i.text.trim()).length +
          req.functionalRequirements.filter((i) => i.text.trim()).length;
        if (n === 0) {
          findings.push(
            finding(
              rule,
              "未找到技术或功能需求条目",
              "请补充至少一条可执行的技术/功能需求。",
              { fieldPath: "technicalRequirements" },
            ),
          );
        }
        break;
      }
      case "require_standard_mention": {
        if (!isFitnessContext(req)) break;
        const hasStd =
          knowledgeMentions(textBlob, knowledgeRefs, rule.knowledgeRefIds) ||
          req.standards.some((s) => s.text.trim().length > 0);
        if (!hasStd) {
          findings.push(
            finding(
              rule,
              "健身/器械场景未引用 GB/T 22517 或 GB 17498 等相关标准",
              "在 standards 或技术需求中补充适用国家标准引用。",
              { fieldPath: "standards" },
            ),
          );
        }
        break;
      }
      case "require_certification_when_compliance": {
        const hasCompliance = req.compliance.some((c) => c.text.trim());
        if (!hasCompliance) break;
        const hasCert = knowledgeMentions(
          textBlob,
          knowledgeRefs,
          rule.knowledgeRefIds,
        );
        if (!hasCert) {
          findings.push(
            finding(
              rule,
              "存在合规/资质条目但未提及 ISO/CCC 等认证线索",
              "补充质量管理或产品认证要求，或在合规条目中写明认证名称。",
              { fieldPath: "compliance" },
            ),
          );
        }
        break;
      }
      case "flag_ambiguous_quantity": {
        for (const { key, item } of items) {
          if (!/(设备|器械|数量|台|套|跑步机|器材)/.test(item.text) && key !== "equipment" && key !== "quantity") {
            continue;
          }
          if (AMBIGUOUS_QTY.test(item.text)) {
            findings.push(
              finding(
                rule,
                `数量表述含糊：${item.text.slice(0, 48)}`,
                "将「大约/若干」改为明确数量（如「不少于 N 台」）。",
                {
                  fieldPath: `${key}.${item.id}`,
                  relatedItemIds: [item.id],
                },
              ),
            );
          }
        }
        break;
      }
      case "flag_missing_budget": {
        const has =
          req.budget.min !== undefined ||
          req.budget.max !== undefined ||
          Boolean(req.budget.notes?.trim());
        if (!has) {
          findings.push(
            finding(
              rule,
              "预算信息缺失",
              "补充预算上下限或限价说明（可在澄清循环中收集）。",
              { fieldPath: "budget" },
            ),
          );
        }
        break;
      }
      case "flag_space_without_area": {
        const spaceTexts = [
          ...req.space.map((s) => s.text),
          ...items
            .filter((x) => /面积|场地|空间/.test(x.item.text))
            .map((x) => x.item.text),
        ].filter((t) => t.trim());
        if (spaceTexts.length === 0) break;
        const hasArea = spaceTexts.some((t) =>
          /\d+\s*(㎡|m2|平方米|平米)/i.test(t),
        );
        if (!hasArea) {
          findings.push(
            finding(
              rule,
              "提到场地/空间但未给出面积数字",
              "补充建筑面积或使用面积（㎡）。",
              { fieldPath: "space" },
            ),
          );
        }
        break;
      }
      case "flag_equipment_without_safety": {
        const hasEquipment =
          req.equipment.some((e) => e.text.trim()) ||
          items.some((x) => /器械|设备|跑步机|器材/.test(x.item.text));
        if (!hasEquipment) break;
        const hasSafety = knowledgeMentions(textBlob, knowledgeRefs, rule.knowledgeRefIds);
        if (!hasSafety) {
          findings.push(
            finding(
              rule,
              "存在设备需求但缺少安全间距/防护相关表述",
              "补充安全间距、防护装置或急停等安全要求。",
              { fieldPath: "equipment" },
            ),
          );
        }
        break;
      }
      case "consistency_budget_vs_scope": {
        const max = req.budget.max ?? 0;
        if (max >= 2_000_000 && req.scope.trim().length < 40) {
          findings.push(
            finding(
              rule,
              "预算较高但范围描述过短，可能存在信息不足",
              "扩充 scope/objectives，明确建设边界与交付范围。",
              { fieldPath: "scope" },
            ),
          );
        }
        break;
      }
      case "require_location_for_fitness": {
        if (!isFitnessContext(req)) break;
        if (!req.location.trim()) {
          findings.push(
            finding(
              rule,
              "健身相关项目缺少建设地点",
              "填写城市/园区等地点信息。",
              { fieldPath: "location" },
            ),
          );
        }
        break;
      }
      default:
        break;
    }
  }

  const ackSet = new Set(input.acknowledgedFindingIds ?? []);
  const finalFindings = findings.map((f) => {
    // Blocking findings can never be acknowledged away
    if (f.severity === "blocking") return { ...f, acknowledged: false };
    if (ackSet.has(f.id) || ackSet.has(f.ruleId)) {
      return { ...f, acknowledged: true };
    }
    return f;
  });

  const realBlocking = finalFindings.filter((f) => f.severity === "blocking").length;
  const warningCount = finalFindings.filter(
    (f) => f.severity === "warning" && !f.acknowledged,
  ).length;
  const infoCount = finalFindings.filter((f) => f.severity === "info").length;
  const passed = realBlocking === 0;
  const risk = overallRisk(finalFindings);

  return {
    evaluatedAt: new Date().toISOString(),
    knowledgeRefCount: knowledgeRefs.length,
    ruleCount: rules.length,
    findings: finalFindings,
    blockingCount: realBlocking,
    warningCount,
    infoCount,
    overallRisk: risk,
    passed,
    summary: passed
      ? `合规校验通过（警告 ${warningCount}，提示 ${infoCount}，风险 ${risk}）`
      : `存在 ${realBlocking} 项阻断性合规问题（风险 ${risk}）`,
  };
}

export function listKnowledgeReferences(): KnowledgeReference[] {
  return [...DEFAULT_KNOWLEDGE_REFERENCES];
}

export function listComplianceRules(): ComplianceRule[] {
  return [...DEFAULT_COMPLIANCE_RULES];
}

function assertMutable(session: TenderIntakeSession): void {
  if (session.signedOff) throw new Error("RELEASE_LOCKED");
  if (isIntakeSessionFrozen(session) || session.status === "ready") {
    throw new Error("SESSION_FROZEN");
  }
  if (session.status === "approving" || session.status === "generating") {
    throw new Error("SESSION_LOCKED");
  }
}

export type RunComplianceResult = {
  session: TenderIntakeSession;
  compliance: IntakeComplianceState;
  report: ComplianceValidationReport;
};

/** Evaluate current session requirements and persist report on session. */
export function runIntakeComplianceValidation(input: {
  sessionId: string;
  organizationId: string;
  actorId?: string;
  requirements?: TenderRequirements;
}): RunComplianceResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  const requirements = parseTenderRequirements(
    input.requirements ?? session.requirements ?? session.extractedRequirements ?? {},
  );
  const prevAck = session.compliance?.acknowledgedFindingIds ?? [];
  const report = evaluateComplianceRules({
    requirements,
    acknowledgedFindingIds: prevAck,
  });

  const compliance: IntakeComplianceState = {
    report,
    acknowledgedFindingIds: prevAck,
    updatedAt: new Date().toISOString(),
  };

  const updated = updateIntakeSession(input.sessionId, { compliance });
  if (!updated) throw new Error("SESSION_NOT_FOUND");

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "compliance",
    statusBefore: session.status,
    statusAfter: updated.status,
    message: report.summary,
    requirementsSnapshot: requirements,
    meta: {
      passed: report.passed,
      blockingCount: report.blockingCount,
      warningCount: report.warningCount,
      overallRisk: report.overallRisk,
      findingIds: report.findings.map((f) => f.id),
    },
  });

  return { session: updated, compliance, report };
}

export function acknowledgeComplianceFinding(input: {
  sessionId: string;
  organizationId: string;
  findingId?: string;
  ruleId?: string;
  actorId?: string;
}): RunComplianceResult {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");
  assertMutable(session);

  const id = input.findingId || input.ruleId;
  if (!id) throw new Error("FINDING_REQUIRED");

  const findingRow = session.compliance?.report.findings.find(
    (f) => f.id === input.findingId || f.ruleId === input.ruleId,
  );
  if (findingRow?.severity === "blocking") {
    throw new Error("BLOCKING_CANNOT_ACKNOWLEDGE");
  }

  const acknowledgedFindingIds = Array.from(
    new Set([
      ...(session.compliance?.acknowledgedFindingIds ?? []),
      id,
      ...(input.ruleId ? [input.ruleId] : findingRow ? [findingRow.ruleId] : []),
    ]),
  );

  updateIntakeSession(input.sessionId, {
    compliance: {
      report: session.compliance?.report ?? evaluateComplianceRules({
        requirements: session.requirements ?? {},
      }),
      acknowledgedFindingIds,
      updatedAt: new Date().toISOString(),
    },
  });

  appendIntakeAudit({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId ?? session.userId,
    step: "compliance",
    statusBefore: session.status,
    statusAfter: session.status,
    message: `确认合规警告：${id}`,
    meta: { action: "acknowledge", findingId: id },
  });

  return runIntakeComplianceValidation({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
  });
}

export function assertCompliancePassed(
  session: TenderIntakeSession,
  requirementsOverride?: TenderRequirements,
): void {
  const requirements =
    requirementsOverride ??
    session.requirements ??
    session.extractedRequirements;
  if (!requirements) throw new Error("COMPLIANCE_REQUIRED");

  const live = evaluateComplianceRules({
    requirements,
    acknowledgedFindingIds: session.compliance?.acknowledgedFindingIds,
  });

  if (!live.passed) {
    const err = new Error("COMPLIANCE_BLOCKED");
    (err as Error & { report: ComplianceValidationReport }).report = live;
    throw err;
  }
}

export function getComplianceSnapshot(sessionId: string): IntakeComplianceState | null {
  return getIntakeSession(sessionId)?.compliance ?? null;
}
