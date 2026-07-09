/**
 * V80 Pilot P6 — Pre-approve QA gate & handoff readiness
 */

import { workflowIdempotencyKey } from "@/lib/scaffold/v80/runtime/store";
import { v80Persist } from "@/lib/scaffold/v80/runtime/store";

import { appendIntakeAudit } from "./audit-trail.service";
import { getIntakeSession, updateIntakeSession } from "./intake.store";
import type { TenderRequirements } from "./requirements.schema";
import {
  parseTenderRequirements,
  validateTenderRequirementsForApproval,
} from "./requirements.validation";
import { buildIntakeSyncPackage } from "./sync.service";

export type QaReasonCode =
  | "QA_PASS"
  | "SESSION_NOT_FOUND"
  | "ORG_MISMATCH"
  | "SCHEMA_INCOMPLETE"
  | "REQUIRED_FIELD_MISSING"
  | "PARSE_EMPTY"
  | "PARTIAL_WRITE_DETECTED"
  | "WORKFLOW_CONFLICT"
  | "SESSION_LOCKED"
  | "ALREADY_HANDED_OFF"
  | "VALIDATION_FAILED";

export type QaCheckResult = {
  id: string;
  passed: boolean;
  message: string;
};

export type ProductionReadinessSummary = {
  projectName: string;
  organization: string;
  hasScope: boolean;
  requirementCount: number;
  syncPackageReady: boolean;
  v80WorkspaceRequired: boolean;
  workflowKey: "tender-pack-complete";
};

export type IntakeQaResult = {
  passed: boolean;
  reasonCode: QaReasonCode;
  reasonMessage: string;
  checks: QaCheckResult[];
  handoffReady: boolean;
  requirements?: TenderRequirements;
  productionReadiness?: ProductionReadinessSummary;
  idempotent?: true;
};

export class IntakeQaError extends Error {
  readonly status = 422;
  readonly code: QaReasonCode;
  readonly checks: QaCheckResult[];

  constructor(result: IntakeQaResult) {
    super(result.reasonMessage);
    this.name = "IntakeQaError";
    this.code = result.reasonCode;
    this.checks = result.checks;
  }
}

function buildReadiness(
  requirements: TenderRequirements,
  organizationId: string,
): ProductionReadinessSummary {
  const sync = buildIntakeSyncPackage(requirements, organizationId);
  const requirementCount =
    requirements.functionalRequirements.length +
    requirements.technicalRequirements.length +
    requirements.equipment.length;

  return {
    projectName: requirements.projectName,
    organization: requirements.organization,
    hasScope: Boolean(requirements.scope.trim() || requirements.objectives.length),
    requirementCount,
    syncPackageReady: Boolean(sync.projectInput.name && sync.quoteContent),
    v80WorkspaceRequired: true,
    workflowKey: "tender-pack-complete",
  };
}

async function checkWorkflowConflict(
  session: NonNullable<ReturnType<typeof getIntakeSession>>,
): Promise<QaCheckResult> {
  if (session.status === "approving") {
    return {
      id: "workflow_conflict",
      passed: false,
      message: "批准进行中，请稍后重试",
    };
  }

  if (
    session.productionProjectId &&
    session.v80WorkflowJobId &&
    session.workflowStatus === "running"
  ) {
    return {
      id: "workflow_conflict",
      passed: false,
      message: "V80 工作流运行中，请等待完成或从恢复入口重试",
    };
  }

  if (session.productionProjectId) {
    const key = workflowIdempotencyKey(session.productionProjectId, "tender-pack-complete");
    const existingJob = await v80Persist.findJobByIdempotency(key).catch(() => null);
    if (existingJob?.status === "running") {
      return {
        id: "workflow_conflict",
        passed: false,
        message: "检测到运行中的 tender-pack-complete 作业",
      };
    }
  }

  return { id: "workflow_conflict", passed: true, message: "无工作流冲突" };
}

export function runIntakeQaGate(input: {
  sessionId: string;
  organizationId: string;
  requirements?: TenderRequirements;
  actorId?: string;
  persistFailure?: boolean;
}): IntakeQaResult {
  const checks: QaCheckResult[] = [];
  const session = getIntakeSession(input.sessionId);

  if (!session) {
    return {
      passed: false,
      reasonCode: "SESSION_NOT_FOUND",
      reasonMessage: "会话不存在",
      checks: [{ id: "session", passed: false, message: "会话不存在" }],
      handoffReady: false,
    };
  }

  if (session.organizationId !== input.organizationId) {
    return {
      passed: false,
      reasonCode: "ORG_MISMATCH",
      reasonMessage: "组织不匹配",
      checks: [{ id: "org", passed: false, message: "组织不匹配" }],
      handoffReady: false,
    };
  }

  if (
    (session.status === "approved" || session.status === "ready") &&
    session.productionProjectId
  ) {
    return {
      passed: true,
      reasonCode: "ALREADY_HANDED_OFF",
      reasonMessage: "已完成生产交接（幂等）",
      checks: [{ id: "handoff", passed: true, message: "已交接" }],
      handoffReady: false,
      idempotent: true,
    };
  }

  if (session.status === "approving" || session.status === "generating") {
    if (session.workflowStatus !== "failed") {
      checks.push({
        id: "session_locked",
        passed: false,
        message: "会话已锁定，等待生成完成或从恢复入口重试",
      });
    }
  }

  const hasPartialWrite =
    Boolean(session.productionProjectId) &&
    (!session.productionTenderId || !session.productionQuoteId) &&
    session.status !== "approved" &&
    session.status !== "ready";

  checks.push({
    id: "partial_write",
    passed: !hasPartialWrite,
    message: hasPartialWrite ? "检测到部分写入，请联系管理员" : "无部分写入",
  });

  const rawText = String(session.parseResult.rawText ?? "").trim();
  checks.push({
    id: "parse",
    passed: rawText.length > 0,
    message: rawText.length > 0 ? "解析文本完整" : "解析文本为空",
  });

  const candidate =
    input.requirements ?? session.requirements ?? session.extractedRequirements;

  let requirements: TenderRequirements | undefined;
  try {
    requirements = parseTenderRequirements(candidate ?? {});
    checks.push({
      id: "schema",
      passed: true,
      message: "Schema 完整",
    });
  } catch {
    checks.push({
      id: "schema",
      passed: false,
      message: "Schema 不完整或格式无效",
    });
  }

  const validation = validateTenderRequirementsForApproval(candidate ?? {});
  checks.push({
    id: "required_fields",
    passed: validation.valid,
    message: validation.valid
      ? "必填字段齐全"
      : validation.errors[0]?.message ?? "必填字段缺失",
  });

  if (requirements && validation.valid && validation.requirements) {
    requirements = validation.requirements;
  }

  const workflowCheck =
    session.status === "approving"
      ? { id: "workflow_conflict", passed: false, message: "批准进行中" }
      : { id: "workflow_conflict", passed: true, message: "无工作流冲突" };
  checks.push(workflowCheck);

  const failedChecks = checks.filter((c) => !c.passed);
  const passed = failedChecks.length === 0 && Boolean(requirements);

  let reasonCode: QaReasonCode = "QA_PASS";
  let reasonMessage = "QA 通过，可交接生产";

  if (!passed) {
    const first = failedChecks[0];
    if (first?.id === "partial_write") {
      reasonCode = "PARTIAL_WRITE_DETECTED";
      reasonMessage = first.message;
    } else if (first?.id === "session_locked") {
      reasonCode = "SESSION_LOCKED";
      reasonMessage = first.message;
    } else if (first?.id === "parse") {
      reasonCode = "PARSE_EMPTY";
      reasonMessage = first.message;
    } else if (first?.id === "schema") {
      reasonCode = "SCHEMA_INCOMPLETE";
      reasonMessage = first.message;
    } else if (first?.id === "required_fields") {
      reasonCode = validation.valid ? "VALIDATION_FAILED" : "REQUIRED_FIELD_MISSING";
      reasonMessage = first.message;
    } else if (first?.id === "workflow_conflict") {
      reasonCode = "WORKFLOW_CONFLICT";
      reasonMessage = first.message;
    } else {
      reasonCode = "VALIDATION_FAILED";
      reasonMessage = first?.message ?? "QA 未通过";
    }
  }

  const result: IntakeQaResult = {
    passed,
    reasonCode,
    reasonMessage,
    checks,
    handoffReady: passed,
    requirements,
    productionReadiness:
      requirements && passed ? buildReadiness(requirements, input.organizationId) : undefined,
  };

  if (input.actorId) {
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "qa",
      statusBefore: session.status,
      statusAfter: passed ? session.status : "qa_failed",
      message: passed ? "QA 门禁通过" : `QA 未通过：${reasonMessage}`,
      requirementsSnapshot: requirements,
      meta: {
        reasonCode,
        checks,
        handoffReady: passed,
      },
    });
  }

  if (input.persistFailure && !passed) {
    updateIntakeSession(input.sessionId, {
      status: "qa_failed",
      statusReasonCode: reasonCode,
      statusReasonMessage: reasonMessage,
    });
  } else if (input.persistFailure && passed && session.status === "qa_failed") {
    updateIntakeSession(input.sessionId, {
      status: "in_review",
      statusReasonCode: "QA_PASS",
      statusReasonMessage: reasonMessage,
      qaPassedAt: new Date().toISOString(),
    });
  } else if (input.persistFailure && passed) {
    updateIntakeSession(input.sessionId, {
      statusReasonCode: "QA_PASS",
      statusReasonMessage: reasonMessage,
      qaPassedAt: new Date().toISOString(),
    });
  }

  return result;
}

export async function runIntakeQaGateAsync(
  input: Parameters<typeof runIntakeQaGate>[0],
): Promise<IntakeQaResult> {
  const session = getIntakeSession(input.sessionId);
  if (!session) {
    return runIntakeQaGate(input);
  }

  const baseChecks = runIntakeQaGate({ ...input, actorId: undefined, persistFailure: false });
  if (!baseChecks.passed || baseChecks.idempotent) {
    return runIntakeQaGate(input);
  }

  const workflowCheck = await checkWorkflowConflict(session);
  const checks = [
    ...baseChecks.checks.filter((c) => c.id !== "workflow_conflict"),
    workflowCheck,
  ];
  const failedChecks = checks.filter((c) => !c.passed);
  const passed = failedChecks.length === 0 && Boolean(baseChecks.requirements);

  const result: IntakeQaResult = {
    ...baseChecks,
    passed,
    checks,
    handoffReady: passed,
    reasonCode: passed
      ? "QA_PASS"
      : workflowCheck.passed
        ? baseChecks.reasonCode
        : "WORKFLOW_CONFLICT",
    reasonMessage: passed
      ? baseChecks.reasonMessage
      : (failedChecks[0]?.message ?? baseChecks.reasonMessage),
  };

  if (input.actorId) {
    appendIntakeAudit({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "qa",
      statusBefore: session.status,
      statusAfter: passed ? session.status : "qa_failed",
      message: passed ? "QA 门禁通过" : `QA 未通过：${result.reasonMessage}`,
      requirementsSnapshot: baseChecks.requirements,
      meta: { reasonCode: result.reasonCode, checks, handoffReady: passed },
    });
  }

  if (input.persistFailure) {
    if (!passed) {
      updateIntakeSession(input.sessionId, {
        status: "qa_failed",
        statusReasonCode: result.reasonCode,
        statusReasonMessage: result.reasonMessage,
      });
    } else {
      updateIntakeSession(input.sessionId, {
        status: session.status === "qa_failed" ? "in_review" : session.status,
        statusReasonCode: "QA_PASS",
        statusReasonMessage: result.reasonMessage,
        qaPassedAt: new Date().toISOString(),
      });
    }
  }

  return result;
}

export function assertQaPassedForHandoff(input: {
  sessionId: string;
  organizationId: string;
  requirements?: TenderRequirements;
  actorId?: string;
}): TenderRequirements {
  const result = runIntakeQaGate({ ...input, persistFailure: true });
  if (!result.passed || !result.requirements) {
    throw new IntakeQaError(result);
  }
  return result.requirements;
}

export async function assertQaPassedForHandoffAsync(
  input: Parameters<typeof assertQaPassedForHandoff>[0],
): Promise<TenderRequirements> {
  const result = await runIntakeQaGateAsync({ ...input, persistFailure: true });
  if (!result.passed || !result.requirements) {
    throw new IntakeQaError(result);
  }
  return result.requirements;
}

export function getIntakeDisplayStatus(session: {
  status: string;
  workflowStatus?: string;
  statusReasonCode?: string;
}): { phase: string; reasonCode?: string } {
  if (session.status === "ready" || session.workflowStatus === "completed") {
    return { phase: "ready", reasonCode: session.statusReasonCode ?? "QA_PASS" };
  }
  if (session.status === "failed" || session.workflowStatus === "failed") {
    return { phase: "failed", reasonCode: session.statusReasonCode ?? "WORKFLOW_CONFLICT" };
  }
  if (session.status === "qa_failed") {
    return { phase: "qa_failed", reasonCode: session.statusReasonCode };
  }
  if (session.status === "generating" || session.status === "approving") {
    return { phase: "generating", reasonCode: session.statusReasonCode };
  }
  if (session.status === "approved") {
    return { phase: "approved", reasonCode: session.statusReasonCode };
  }
  if (session.status === "in_review" || session.status === "extracted") {
    return { phase: "reviewing", reasonCode: session.statusReasonCode };
  }
  return { phase: "draft", reasonCode: session.statusReasonCode };
}
