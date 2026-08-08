/**
 * V80 Pilot P4 — Intake ops status, stuck detection, failure normalization, operator resume
 * Reuses P1–P3 + existing retry/recover/approve — no new engine.
 */

import {
  approveTenderIntake,
  deriveCreateTerminalStatus,
  hasCompleteProductionEntities,
  hasPartialProductionEntities,
  resolveIntakeApprovePath,
  type ApproveIntakeResult,
} from "./approve.service";
import { appendIntakeAudit, listIntakeAudit } from "./audit-trail.service";
import { retryIntakeGeneration } from "./generation-retry.service";
import {
  getIntakeSession,
  listIntakeSessionsForOrg,
  type TenderIntakeSession,
} from "./intake.store";
import {
  recoverIntakeSession,
  type RecoverIntakeAction,
  type RecoverIntakeResult,
} from "./recovery.service";

export const INTAKE_OPS_STUCK_MS = 15 * 60 * 1000; // 15 minutes

export type IntakeOpsStatus =
  | "healthy"
  | "in_review"
  | "generating"
  | "failed"
  | "stuck"
  | "partial"
  | "frozen"
  | "ready";

export type IntakeFailureCategory =
  | "validation"
  | "create"
  | "generation"
  | "partial"
  | "lock"
  | "unknown";

export type IntakeFailureCode =
  | "NONE"
  | "PARTIAL_WRITE_DETECTED"
  | "CREATE_FAILED"
  | "WORKFLOW_CONFLICT"
  | "APPROVAL_REQUIRED"
  | "REVIEW_INCOMPLETE"
  | "SESSION_FROZEN"
  | "APPROVE_IN_PROGRESS"
  | "ENTITIES_NOT_CREATED"
  | "QA_FAILED"
  | "VALIDATION_FAILED"
  | "STUCK_GENERATING"
  | "STUCK_APPROVING"
  | "UNKNOWN";

export type NormalizedIntakeFailure = {
  code: IntakeFailureCode;
  message: string;
  category: IntakeFailureCategory;
  retryable: boolean;
  source: "session" | "audit" | "derived" | "none";
  step?: string;
};

export type IntakeOpsRecommendedAction =
  | "none"
  | "retry_generation"
  | "resume_approve"
  | "rollback_valid"
  | "restore_snapshot"
  | "inspect_partial";

export type IntakeOpsSnapshot = {
  sessionId: string;
  tenderIntakeId: string;
  fileName: string;
  status: TenderIntakeSession["status"];
  opsStatus: IntakeOpsStatus;
  terminalStatus: ReturnType<typeof deriveCreateTerminalStatus>;
  approvePath: ReturnType<typeof resolveIntakeApprovePath>;
  stuck: boolean;
  stuckReason?: string;
  ageMs: number;
  updatedAt: string;
  workflowStatus?: string;
  productionProjectId?: string;
  productionQuoteId?: string;
  productionTenderId?: string;
  v80WorkflowJobId?: string;
  failure: NormalizedIntakeFailure;
  recommendedAction: IntakeOpsRecommendedAction;
  timeline: Array<{
    id: string;
    step: string;
    timestamp: string;
    message?: string;
    statusAfter?: string;
  }>;
};

export type OperatorResumeAction =
  | "auto"
  | "retry"
  | "resume_approve"
  | "rollback_valid"
  | "restore_snapshot";

export type OperatorResumeResult = {
  sessionId: string;
  actionTaken: OperatorResumeAction | RecoverIntakeAction;
  opsBefore: IntakeOpsStatus;
  opsAfter: IntakeOpsStatus;
  failure: NormalizedIntakeFailure;
  approve?: ApproveIntakeResult;
  recover?: RecoverIntakeResult;
  idempotent?: boolean;
};

const FAILURE_CATALOG: Record<
  IntakeFailureCode,
  { category: IntakeFailureCategory; retryable: boolean; defaultMessage: string }
> = {
  NONE: { category: "unknown", retryable: false, defaultMessage: "" },
  PARTIAL_WRITE_DETECTED: {
    category: "partial",
    retryable: false,
    defaultMessage: "生产实体半写，需人工排查后恢复",
  },
  CREATE_FAILED: {
    category: "create",
    retryable: true,
    defaultMessage: "创建 Project/Quote/Tender 失败",
  },
  WORKFLOW_CONFLICT: {
    category: "generation",
    retryable: true,
    defaultMessage: "V80 工作流失败",
  },
  APPROVAL_REQUIRED: {
    category: "validation",
    retryable: true,
    defaultMessage: "尚未通过审核/QA，无法交接 V80",
  },
  REVIEW_INCOMPLETE: {
    category: "validation",
    retryable: true,
    defaultMessage: "需求审核未完成",
  },
  SESSION_FROZEN: {
    category: "lock",
    retryable: false,
    defaultMessage: "会话已冻结",
  },
  APPROVE_IN_PROGRESS: {
    category: "lock",
    retryable: true,
    defaultMessage: "批准进行中，请稍后重试",
  },
  ENTITIES_NOT_CREATED: {
    category: "create",
    retryable: true,
    defaultMessage: "生产实体尚未创建",
  },
  QA_FAILED: {
    category: "validation",
    retryable: true,
    defaultMessage: "QA 门禁未通过",
  },
  VALIDATION_FAILED: {
    category: "validation",
    retryable: true,
    defaultMessage: "需求校验失败",
  },
  STUCK_GENERATING: {
    category: "generation",
    retryable: true,
    defaultMessage: "生成超时卡住",
  },
  STUCK_APPROVING: {
    category: "create",
    retryable: true,
    defaultMessage: "批准超时卡住",
  },
  UNKNOWN: {
    category: "unknown",
    retryable: true,
    defaultMessage: "未知异常",
  },
};

function ageMs(session: TenderIntakeSession, now: number): number {
  const t = Date.parse(session.updatedAt);
  return Number.isFinite(t) ? Math.max(0, now - t) : 0;
}

export function detectIntakeStuck(
  session: TenderIntakeSession,
  now = Date.now(),
  thresholdMs = INTAKE_OPS_STUCK_MS,
): { stuck: boolean; reason?: string } {
  const age = ageMs(session, now);
  if (age < thresholdMs) return { stuck: false };

  if (session.status === "generating") {
    return { stuck: true, reason: "STUCK_GENERATING" };
  }
  if (session.status === "approving") {
    return { stuck: true, reason: "STUCK_APPROVING" };
  }
  return { stuck: false };
}

function coerceFailureCode(raw: string | undefined): IntakeFailureCode {
  if (!raw) return "UNKNOWN";
  if (raw in FAILURE_CATALOG) return raw as IntakeFailureCode;
  const upper = raw.toUpperCase();
  if (upper in FAILURE_CATALOG) return upper as IntakeFailureCode;
  if (/PARTIAL/i.test(raw)) return "PARTIAL_WRITE_DETECTED";
  if (/CREATE/i.test(raw)) return "CREATE_FAILED";
  if (/WORKFLOW|GENERATE/i.test(raw)) return "WORKFLOW_CONFLICT";
  if (/QA/i.test(raw)) return "QA_FAILED";
  if (/VALID/i.test(raw)) return "VALIDATION_FAILED";
  if (/FROZEN/i.test(raw)) return "SESSION_FROZEN";
  return "UNKNOWN";
}

/** Normalize scattered statusReason / audit errors into one operator-facing failure. */
export function normalizeIntakeFailure(
  session: TenderIntakeSession,
): NormalizedIntakeFailure {
  if (hasPartialProductionEntities(session)) {
    const meta = FAILURE_CATALOG.PARTIAL_WRITE_DETECTED;
    return {
      code: "PARTIAL_WRITE_DETECTED",
      message: session.statusReasonMessage || meta.defaultMessage,
      category: meta.category,
      retryable: meta.retryable,
      source: "derived",
    };
  }

  if (session.statusReasonCode || session.statusReasonMessage) {
    const code = coerceFailureCode(session.statusReasonCode);
    const meta = FAILURE_CATALOG[code];
    return {
      code,
      message: session.statusReasonMessage || meta.defaultMessage,
      category: meta.category,
      retryable: meta.retryable,
      source: "session",
    };
  }

  const stuck = detectIntakeStuck(session);
  if (stuck.stuck && stuck.reason) {
    const code = coerceFailureCode(stuck.reason);
    const meta = FAILURE_CATALOG[code];
    return {
      code,
      message: meta.defaultMessage,
      category: meta.category,
      retryable: meta.retryable,
      source: "derived",
    };
  }

  const audit = listIntakeAudit(session.id);
  for (let i = audit.length - 1; i >= 0; i--) {
    const entry = audit[i]!;
    if (entry.step === "generate" || entry.step === "retry") {
      if (
        entry.workflowStatusAfter === "failed" ||
        entry.meta?.workflowStatus === "failed" ||
        entry.statusAfter === "failed"
      ) {
        const meta = FAILURE_CATALOG.WORKFLOW_CONFLICT;
        return {
          code: "WORKFLOW_CONFLICT",
          message: String(entry.message ?? entry.meta?.error ?? meta.defaultMessage),
          category: meta.category,
          retryable: true,
          source: "audit",
          step: entry.meta?.failedStep ? String(entry.meta.failedStep) : undefined,
        };
      }
    }
    if (entry.step === "validate" && entry.meta?.valid === false) {
      const meta = FAILURE_CATALOG.VALIDATION_FAILED;
      return {
        code: "VALIDATION_FAILED",
        message: String(entry.message ?? meta.defaultMessage),
        category: meta.category,
        retryable: true,
        source: "audit",
      };
    }
    if (entry.step === "qa" && entry.meta?.valid === false) {
      const meta = FAILURE_CATALOG.QA_FAILED;
      return {
        code: "QA_FAILED",
        message: String(entry.message ?? meta.defaultMessage),
        category: meta.category,
        retryable: true,
        source: "audit",
      };
    }
  }

  if (session.status === "ready" || session.workflowStatus === "completed") {
    return {
      code: "NONE",
      message: "",
      category: "unknown",
      retryable: false,
      source: "none",
    };
  }

  return {
    code: "NONE",
    message: "",
    category: "unknown",
    retryable: false,
    source: "none",
  };
}

export function deriveIntakeOpsStatus(
  session: TenderIntakeSession,
  now = Date.now(),
): IntakeOpsStatus {
  // Ready deliveries are frozen by design — surface as ready for ops, not frozen.
  if (session.status === "ready" || session.workflowStatus === "completed") {
    return "ready";
  }
  if (session.frozen === true) return "frozen";
  if (hasPartialProductionEntities(session)) return "partial";

  const stuck = detectIntakeStuck(session, now);
  if (stuck.stuck) return "stuck";

  if (session.status === "failed" || session.workflowStatus === "failed") {
    return "failed";
  }
  if (session.status === "generating" || session.status === "approving") {
    return "generating";
  }
  if (
    session.status === "in_review" ||
    session.status === "extracted" ||
    session.status === "qa_failed"
  ) {
    return "in_review";
  }
  return "healthy";
}

export function recommendOpsAction(
  session: TenderIntakeSession,
  opsStatus: IntakeOpsStatus,
): IntakeOpsRecommendedAction {
  if (opsStatus === "frozen" || opsStatus === "ready") return "none";
  if (opsStatus === "partial") return "inspect_partial";

  const path = resolveIntakeApprovePath(session);
  if (opsStatus === "stuck" || opsStatus === "failed" || opsStatus === "generating") {
    if (path === "resume" || hasCompleteProductionEntities(session)) {
      return "retry_generation";
    }
    if (path === "create") return "resume_approve";
  }
  if (opsStatus === "in_review") return "none";
  return "none";
}

export function buildIntakeOpsSnapshot(
  session: TenderIntakeSession,
  now = Date.now(),
): IntakeOpsSnapshot {
  const stuckInfo = detectIntakeStuck(session, now);
  const opsStatus = deriveIntakeOpsStatus(session, now);
  const failure = normalizeIntakeFailure(session);
  const timeline = listIntakeAudit(session.id)
    .slice(-20)
    .map((e) => ({
      id: e.id,
      step: e.step,
      timestamp: e.timestamp,
      message: e.message,
      statusAfter: e.statusAfter,
    }));

  return {
    sessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    fileName: session.fileName,
    status: session.status,
    opsStatus,
    terminalStatus: deriveCreateTerminalStatus(session),
    approvePath: resolveIntakeApprovePath(session),
    stuck: stuckInfo.stuck,
    stuckReason: stuckInfo.reason,
    ageMs: ageMs(session, now),
    updatedAt: session.updatedAt,
    workflowStatus: session.workflowStatus,
    productionProjectId: session.productionProjectId,
    productionQuoteId: session.productionQuoteId,
    productionTenderId: session.productionTenderId,
    v80WorkflowJobId: session.v80WorkflowJobId,
    failure,
    recommendedAction: recommendOpsAction(session, opsStatus),
    timeline,
  };
}

export function listIntakeOpsExceptions(
  organizationId: string,
  now = Date.now(),
): IntakeOpsSnapshot[] {
  const sessions = listIntakeSessionsForOrg(organizationId);
  return sessions
    .map((s) => buildIntakeOpsSnapshot(s, now))
    .filter((s) =>
      ["failed", "stuck", "partial", "generating"].includes(s.opsStatus),
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function listIntakeOpsBoard(
  organizationId: string,
  now = Date.now(),
): {
  exceptions: IntakeOpsSnapshot[];
  all: IntakeOpsSnapshot[];
  counts: Record<IntakeOpsStatus, number>;
} {
  const all = listIntakeSessionsForOrg(organizationId)
    .map((s) => buildIntakeOpsSnapshot(s, now))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const counts: Record<IntakeOpsStatus, number> = {
    healthy: 0,
    in_review: 0,
    generating: 0,
    failed: 0,
    stuck: 0,
    partial: 0,
    frozen: 0,
    ready: 0,
  };
  for (const row of all) counts[row.opsStatus] += 1;

  return {
    all,
    exceptions: all.filter((s) =>
      ["failed", "stuck", "partial", "generating"].includes(s.opsStatus),
    ),
    counts,
  };
}

function resolveAutoAction(session: TenderIntakeSession): OperatorResumeAction {
  const ops = deriveIntakeOpsStatus(session);
  const rec = recommendOpsAction(session, ops);
  if (rec === "retry_generation") return "retry";
  if (rec === "resume_approve") return "resume_approve";
  if (rec === "rollback_valid") return "rollback_valid";
  if (rec === "restore_snapshot") return "restore_snapshot";
  // Default safe resume for complete entities
  if (hasCompleteProductionEntities(session)) return "retry";
  return "resume_approve";
}

/**
 * Operator resume — deterministic routing to existing retry / approve / recover.
 * Always appends audit; never invents a second creation path.
 */
export async function operatorResumeIntake(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  userEmail: string;
  action?: OperatorResumeAction;
  auditEntryId?: string;
  explicitRecovery?: boolean;
}): Promise<OperatorResumeResult> {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  const opsBefore = deriveIntakeOpsStatus(session);
  const action = input.action ?? "auto";
  const resolved = action === "auto" ? resolveAutoAction(session) : action;

  const auditStep =
    resolved === "rollback_valid" || resolved === "restore_snapshot" ? "recover" : "retry";

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: auditStep,
    statusBefore: session.status,
    statusAfter: session.status,
    message: `操作员恢复：${resolved}`,
    meta: {
      opsAction: resolved,
      opsBefore,
      operator: true,
    },
  });

  if (opsBefore === "partial" || resolveIntakeApprovePath(session) === "partial_error") {
    throw new Error("PARTIAL_WRITE_DETECTED");
  }

  if (resolved === "retry") {
    const approve = await retryIntakeGeneration({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
    });
    const after = getIntakeSession(input.sessionId)!;
    appendIntakeAudit({
      sessionId: after.id,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "retry",
      statusBefore: session.status,
      statusAfter: after.status,
      workflowStatusBefore: session.workflowStatus,
      workflowStatusAfter: after.workflowStatus,
      message: "操作员重试生成完成",
      meta: { opsAction: "retry", operator: true, idempotent: approve.idempotent === true },
    });
    return {
      sessionId: input.sessionId,
      actionTaken: "retry",
      opsBefore,
      opsAfter: deriveIntakeOpsStatus(after),
      failure: normalizeIntakeFailure(after),
      approve,
      idempotent: approve.idempotent === true,
    };
  }

  if (resolved === "resume_approve") {
    const approve = await approveTenderIntake({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      userId: input.actorId,
      userEmail: input.userEmail,
    });
    const after = getIntakeSession(input.sessionId)!;
    appendIntakeAudit({
      sessionId: after.id,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "retry",
      statusBefore: session.status,
      statusAfter: after.status,
      workflowStatusBefore: session.workflowStatus,
      workflowStatusAfter: after.workflowStatus,
      message: "操作员恢复批准/交接完成",
      meta: {
        opsAction: "resume_approve",
        operator: true,
        idempotent: approve.idempotent === true,
      },
    });
    return {
      sessionId: input.sessionId,
      actionTaken: "resume_approve",
      opsBefore,
      opsAfter: deriveIntakeOpsStatus(after),
      failure: normalizeIntakeFailure(after),
      approve,
      idempotent: approve.idempotent === true,
    };
  }

  if (resolved === "rollback_valid" || resolved === "restore_snapshot") {
    const recover = await recoverIntakeSession({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      actorId: input.actorId,
      action: resolved,
      auditEntryId: input.auditEntryId,
      explicitRecovery: input.explicitRecovery === true,
    });
    const after = getIntakeSession(input.sessionId)!;
    appendIntakeAudit({
      sessionId: after.id,
      organizationId: input.organizationId,
      actorId: input.actorId,
      step: "recover",
      statusBefore: session.status,
      statusAfter: after.status,
      message: `操作员恢复完成：${resolved}`,
      meta: { opsAction: resolved, operator: true },
    });
    return {
      sessionId: input.sessionId,
      actionTaken: resolved,
      opsBefore,
      opsAfter: deriveIntakeOpsStatus(after),
      failure: normalizeIntakeFailure(after),
      recover,
    };
  }

  throw new Error("INVALID_OPS_ACTION");
}
