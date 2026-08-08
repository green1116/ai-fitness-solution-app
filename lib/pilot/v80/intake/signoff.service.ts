/**
 * V80 Pilot P8 — Final sign-off & release package
 */

import { createHash } from "node:crypto";

import {
  appendIntakeAudit,
  listIntakeAudit,
  type IntakeAuditEntry,
} from "./audit-trail.service";
import {
  buildIntakeLinkage,
  getIntakeDeliverySnapshot,
  type IntakeArtifactItem,
  type IntakeLinkage,
} from "./artifact-delivery.service";
import {
  getIntakeFreezeSnapshot,
  isIntakeSessionFrozen,
  type DeliveryLockSummary,
} from "./freeze-lock.service";
import { getIntakeSession, updateIntakeSession, type TenderIntakeSession } from "./intake.store";
import type { RecoverIntakeAction } from "./recovery.service";

export const V80_PILOT_SIGNOFF_VERSION = "v80-pilot-signoff-1";

export type IntakeReadinessState = "pass" | "blocked" | "frozen" | "released";

export type PilotReleaseGate = {
  phase: string;
  label: string;
  ok: boolean;
  verifyScript: string;
};

export const RELEASE_GATE_CATALOG: PilotReleaseGate[] = [
  { phase: "P1", label: "Intake Upload & Extract", ok: false, verifyScript: "verify:v80-pilot-p1-intake" },
  { phase: "P2", label: "Review & Approval Hardening", ok: false, verifyScript: "verify:v80-pilot-p2-review" },
  { phase: "P3", label: "Auto-Generation Bridge", ok: false, verifyScript: "verify:v80-pilot-p3-generation" },
  { phase: "P4", label: "Artifact Center & Delivery", ok: false, verifyScript: "verify:v80-pilot-p4-artifacts" },
  { phase: "P5", label: "Audit Trail & Recovery", ok: false, verifyScript: "verify:v80-pilot-p5-audit" },
  { phase: "P6", label: "QA Gate & Production Handoff", ok: false, verifyScript: "verify:v80-pilot-p6-qa-handoff" },
  { phase: "P7", label: "Completion Freeze & Delivery Lock", ok: false, verifyScript: "verify:v80-pilot-p7-freeze" },
  { phase: "P8", label: "Final Sign-off & Release Package", ok: false, verifyScript: "verify:v80-pilot-p8-signoff" },
];

export type IntakeReadinessSummary = {
  state: IntakeReadinessState;
  reasonCode: string;
  reasonMessage: string;
  lastEventAt?: string;
  lastWorkflowStep?: string;
  frozen: boolean;
  released: boolean;
  signedOff: boolean;
  gatesPass: boolean;
};

export type RollbackIndexEntry = {
  id: string;
  action: RecoverIntakeAction | "explicit_recovery";
  label: string;
  auditEntryId?: string;
  timestamp?: string;
  available: boolean;
  requiresExplicitAdmin: boolean;
  description: string;
};

export type IntakeReleaseManifest = {
  version: string;
  manifestId: string;
  sessionId: string;
  organizationId: string;
  builtAt: string;
  linkage: IntakeLinkage;
  workflow: {
    status: string;
    phase: string;
    workflowJobId?: string;
    lastStep?: string;
  };
  artifacts: Array<{
    kind: string;
    label: string;
    status: string;
    artifactId?: string;
    downloadUrl?: string;
    openUrl?: string;
  }>;
  deliveryLock: DeliveryLockSummary;
};

export type DeliveryChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
};

export type IntakeSignoffReport = {
  version: string;
  sessionId: string;
  readiness: IntakeReadinessSummary;
  gateSummary: { gates: PilotReleaseGate[]; allGatesPass: boolean };
  releaseManifest: IntakeReleaseManifest;
  rollbackIndex: RollbackIndexEntry[];
  deliveryChecklist: DeliveryChecklistItem[];
  signoffState: {
    signedOff: boolean;
    signedOffAt?: string;
    signedOffBy?: string;
    releasePackageId?: string;
    canSignOff: boolean;
    blockReason?: string;
  };
  qa: { passed: boolean; passedAt?: string };
  handoff: { completed: boolean };
  freeze: DeliveryLockSummary;
  artifactState: { readyCount: number; totalCount: number; allReady: boolean };
};

export type SignOffIntakeResult = {
  sessionId: string;
  signedOff: true;
  idempotent?: true;
  signedOffAt: string;
  signedOffBy: string;
  releasePackageId: string;
  report: IntakeSignoffReport;
};

export class IntakeSignoffError extends Error {
  readonly code: string;
  readonly blockReason?: string;

  constructor(code: string, message: string, blockReason?: string) {
    super(message);
    this.name = "IntakeSignoffError";
    this.code = code;
    this.blockReason = blockReason;
  }
}

function hasAuditStep(audit: IntakeAuditEntry[], step: IntakeAuditEntry["step"]): boolean {
  return audit.some((e) => e.step === step);
}

function lastAuditEntry(audit: IntakeAuditEntry[]): IntakeAuditEntry | undefined {
  return audit.length > 0 ? audit[audit.length - 1] : undefined;
}

function lastWorkflowStepFromAudit(audit: IntakeAuditEntry[]): string | undefined {
  for (let i = audit.length - 1; i >= 0; i--) {
    const entry = audit[i]!;
    if (entry.workflowStatusAfter) return entry.workflowStatusAfter;
    if (entry.meta?.failedStep) return String(entry.meta.failedStep);
    if (entry.step === "generate" || entry.step === "handoff") return entry.step;
  }
  return undefined;
}

export function evaluateReleaseGates(
  session: TenderIntakeSession,
  audit: IntakeAuditEntry[],
): PilotReleaseGate[] {
  const has = (step: IntakeAuditEntry["step"]) => hasAuditStep(audit, step);

  return RELEASE_GATE_CATALOG.map((gate) => {
    let ok = false;
    switch (gate.phase) {
      case "P1":
        ok = has("upload") && has("extract");
        break;
      case "P2":
        ok = has("validate") || has("patch");
        break;
      case "P3":
        ok = has("approve") && (has("generate") || session.productionProjectId != null);
        break;
      case "P4":
        ok = Boolean(session.productionProjectId) && (has("generate") || session.status === "ready");
        break;
      case "P5":
        ok = audit.length >= 3;
        break;
      case "P6":
        ok = has("qa") && has("handoff") && Boolean(session.qaPassedAt);
        break;
      case "P7":
        ok = session.frozen === true && has("freeze") && has("delivery_lock");
        break;
      case "P8":
        ok = session.signedOff === true && has("signoff");
        break;
      default:
        ok = false;
    }
    return { ...gate, ok };
  });
}

export function buildDeliveryChecklist(
  session: TenderIntakeSession,
  audit: IntakeAuditEntry[],
  artifactState: { readyCount: number; totalCount: number; allReady: boolean },
): DeliveryChecklistItem[] {
  return [
    {
      id: "qa",
      label: "QA 门禁通过",
      ok: hasAuditStep(audit, "qa") && Boolean(session.qaPassedAt),
    },
    {
      id: "handoff",
      label: "生产交接完成",
      ok: hasAuditStep(audit, "handoff") && Boolean(session.productionProjectId),
    },
    {
      id: "generation",
      label: "工作流就绪",
      ok: session.workflowStatus === "completed" && session.status === "ready",
    },
    {
      id: "freeze",
      label: "交付已冻结",
      ok: session.frozen === true && hasAuditStep(audit, "freeze"),
    },
    {
      id: "delivery_lock",
      label: "交付锁定",
      ok: session.deliveryLocked === true && hasAuditStep(audit, "delivery_lock"),
    },
    {
      id: "artifacts",
      label: "产物已关联",
      ok: Boolean(session.productionProjectId) && artifactState.totalCount > 0,
      detail: `${artifactState.readyCount}/${artifactState.totalCount} ready`,
    },
    {
      id: "audit",
      label: "审计链路完整",
      ok: audit.length >= 5,
      detail: `${audit.length} events`,
    },
    {
      id: "signoff_ready",
      label: "可签收",
      ok:
        session.frozen === true &&
        session.workflowStatus === "completed" &&
        !session.signedOff,
    },
  ];
}

export function buildIntakeRollbackIndex(
  session: TenderIntakeSession,
  audit: IntakeAuditEntry[],
): RollbackIndexEntry[] {
  const frozen = isIntakeSessionFrozen(session);
  const lastValid = [...audit].reverse().find((e) => e.step === "validate" && e.meta?.valid === true);
  const lastFailure = [...audit].reverse().find((e) => e.workflowStatusAfter === "failed");

  return [
    {
      id: "restore_snapshot",
      action: "restore_snapshot",
      label: "还原需求快照",
      auditEntryId: lastValid?.id,
      timestamp: lastValid?.timestamp,
      available: !frozen && Boolean(lastValid),
      requiresExplicitAdmin: frozen,
      description: frozen
        ? "冻结态默认禁用；需 explicitRecovery 管理员显式恢复"
        : "从有效校验快照还原需求",
    },
    {
      id: "rollback_valid",
      action: "rollback_valid",
      label: "回滚到最后有效审核",
      auditEntryId: lastValid?.id,
      timestamp: lastValid?.timestamp,
      available: !frozen && Boolean(lastValid),
      requiresExplicitAdmin: frozen,
      description: frozen
        ? "冻结态默认禁用；需 explicitRecovery 管理员显式恢复"
        : "回滚需求并同步已存在实体",
    },
    {
      id: "retry_generation",
      action: "retry_generation",
      label: "重试生成",
      auditEntryId: lastFailure?.id,
      timestamp: lastFailure?.timestamp,
      available: !frozen && session.workflowStatus === "failed",
      requiresExplicitAdmin: false,
      description: "保留已批准实体，重跑 tender-pack-complete",
    },
    {
      id: "explicit_recovery",
      action: "explicit_recovery",
      label: "管理员显式恢复",
      available: frozen,
      requiresExplicitAdmin: true,
      description: "POST /recover with explicitRecovery: true — 不默认变更冻结数据",
    },
  ];
}

function stableManifestId(session: TenderIntakeSession, linkage: IntakeLinkage): string {
  const payload = [
    session.id,
    session.frozenAt ?? "",
    linkage.projectId ?? "",
    linkage.quoteId ?? "",
    linkage.tenderId ?? "",
  ].join("|");
  const hash = createHash("sha256").update(payload).digest("hex").slice(0, 16);
  return `rel_${hash}`;
}

function mapArtifacts(items: IntakeArtifactItem[]) {
  return items.map((a) => ({
    kind: a.kind,
    label: a.label,
    status: a.status,
    artifactId: a.artifactId,
    downloadUrl: a.downloadUrl,
    openUrl: a.openUrl,
  }));
}

export async function buildIntakeReleaseManifest(
  session: TenderIntakeSession,
  organizationId: string,
): Promise<IntakeReleaseManifest> {
  const linkage = buildIntakeLinkage(session);
  const deliveryLock = getIntakeFreezeSnapshot(session);

  let phase: string = session.status;
  let lastStep: string | undefined;
  let artifacts: IntakeArtifactItem[] = [];

  if (session.productionProjectId) {
    try {
      const delivery = await getIntakeDeliverySnapshot(session, organizationId);
      phase = delivery.phase;
      lastStep = delivery.steps.filter((s) => s.status === "completed").at(-1)?.step;
      artifacts = delivery.artifacts;
    } catch {
      phase = session.workflowStatus === "completed" ? "ready" : session.status;
      lastStep = session.workflowStatus;
    }
  }

  const manifestId = session.releasePackageId ?? stableManifestId(session, linkage);

  return {
    version: V80_PILOT_SIGNOFF_VERSION,
    manifestId,
    sessionId: session.id,
    organizationId,
    builtAt: new Date().toISOString(),
    linkage,
    workflow: {
      status: session.workflowStatus ?? session.status,
      phase,
      workflowJobId: linkage.workflowJobId,
      lastStep,
    },
    artifacts: mapArtifacts(artifacts),
    deliveryLock,
  };
}

export function collectIntakeReadinessSummary(
  session: TenderIntakeSession,
  audit: IntakeAuditEntry[],
  gates: PilotReleaseGate[],
): IntakeReadinessSummary {
  const allGatesPass = gates.every((g) => g.ok || g.phase === "P8");
  const last = lastAuditEntry(audit);
  const frozen = isIntakeSessionFrozen(session);
  const released = session.signedOff === true;

  let state: IntakeReadinessState;
  let reasonCode: string;
  let reasonMessage: string;

  if (released) {
    state = "released";
    reasonCode = "SIGNOFF_COMPLETE";
    reasonMessage = "已完成最终签收并发布";
  } else if (frozen && allGatesPass) {
    state = "pass";
    reasonCode = "READY_FOR_SIGNOFF";
    reasonMessage = "已冻结，可进行最终签收";
  } else if (frozen) {
    state = "frozen";
    reasonCode = session.freezeReasonCode ?? "DELIVERY_FROZEN";
    reasonMessage = session.freezeReasonMessage ?? "交付已冻结，等待签收";
  } else {
    state = "blocked";
    reasonCode = session.statusReasonCode ?? "NOT_FROZEN";
    reasonMessage = "会话未冻结，尚未达到签收条件";
  }

  return {
    state,
    reasonCode,
    reasonMessage,
    lastEventAt: last?.timestamp ?? session.updatedAt,
    lastWorkflowStep: lastWorkflowStepFromAudit(audit) ?? session.workflowStatus,
    frozen,
    released,
    signedOff: released,
    gatesPass: allGatesPass,
  };
}

function resolveArtifactState(
  session: TenderIntakeSession,
  manifest: IntakeReleaseManifest,
): { readyCount: number; totalCount: number; allReady: boolean } {
  const artifacts = manifest.artifacts;
  if (artifacts.length > 0) {
    const readyCount = artifacts.filter((a) => a.status === "ready").length;
    return {
      readyCount,
      totalCount: artifacts.length,
      allReady: readyCount === artifacts.length,
    };
  }
  const linked = Boolean(session.productionProjectId && session.productionQuoteId);
  return {
    readyCount: linked && session.workflowStatus === "completed" ? 1 : 0,
    totalCount: linked ? 1 : 0,
    allReady: linked && session.workflowStatus === "completed",
  };
}

export async function buildIntakeSignoffReport(
  sessionId: string,
  organizationId: string,
): Promise<IntakeSignoffReport> {
  const session = getIntakeSession(sessionId);
  if (!session || session.organizationId !== organizationId) {
    throw new IntakeSignoffError("SESSION_NOT_FOUND", "会话不存在");
  }

  const audit = listIntakeAudit(sessionId);
  const gates = evaluateReleaseGates(session, audit);
  const releaseManifest = await buildIntakeReleaseManifest(session, organizationId);
  const artifactState = resolveArtifactState(session, releaseManifest);
  const readiness = collectIntakeReadinessSummary(session, audit, gates);
  const deliveryChecklist = buildDeliveryChecklist(session, audit, artifactState);
  const rollbackIndex = buildIntakeRollbackIndex(session, audit);
  const freeze = getIntakeFreezeSnapshot(session);

  const checklistPass = deliveryChecklist
    .filter((c) => c.id !== "signoff_ready")
    .every((c) => c.ok);

  const canSignOff =
    session.frozen === true &&
    session.status === "ready" &&
    session.workflowStatus === "completed" &&
    !session.signedOff &&
    checklistPass &&
    gates.filter((g) => g.phase !== "P8").every((g) => g.ok);

  let blockReason: string | undefined;
  if (!session.frozen) blockReason = "会话未冻结";
  else if (session.signedOff) blockReason = "已签收";
  else if (!checklistPass) blockReason = "交付清单未全部通过";
  else if (!gates.filter((g) => g.phase !== "P8").every((g) => g.ok)) blockReason = "发布门禁未全部通过";

  return {
    version: V80_PILOT_SIGNOFF_VERSION,
    sessionId,
    readiness,
    gateSummary: { gates, allGatesPass: gates.filter((g) => g.phase !== "P8").every((g) => g.ok) },
    releaseManifest,
    rollbackIndex,
    deliveryChecklist,
    signoffState: {
      signedOff: session.signedOff === true,
      signedOffAt: session.signedOffAt,
      signedOffBy: session.signedOffBy,
      releasePackageId: session.releasePackageId,
      canSignOff,
      blockReason,
    },
    qa: {
      passed: hasAuditStep(audit, "qa") && Boolean(session.qaPassedAt),
      passedAt: session.qaPassedAt,
    },
    handoff: { completed: hasAuditStep(audit, "handoff") },
    freeze,
    artifactState,
  };
}

export function assertIntakeSignoffPass(report: IntakeSignoffReport): void {
  if (!report.signoffState.signedOff && !report.signoffState.canSignOff) {
    throw new IntakeSignoffError(
      "SIGNOFF_BLOCKED",
      report.signoffState.blockReason ?? "签收被阻止",
      report.signoffState.blockReason,
    );
  }
}

export async function signOffIntakeSession(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
}): Promise<SignOffIntakeResult> {
  const session = getIntakeSession(input.sessionId);
  if (!session) throw new IntakeSignoffError("SESSION_NOT_FOUND", "会话不存在");
  if (session.organizationId !== input.organizationId) {
    throw new IntakeSignoffError("ORG_MISMATCH", "组织不匹配");
  }

  if (session.signedOff && session.signedOffAt && session.signedOffBy) {
    const report = await buildIntakeSignoffReport(input.sessionId, input.organizationId);
    return {
      sessionId: session.id,
      signedOff: true,
      idempotent: true,
      signedOffAt: session.signedOffAt,
      signedOffBy: session.signedOffBy,
      releasePackageId: session.releasePackageId ?? report.releaseManifest.manifestId,
      report,
    };
  }

  if (session.frozen !== true) {
    throw new IntakeSignoffError("NOT_FROZEN", "仅冻结会话可签收");
  }

  const report = await buildIntakeSignoffReport(input.sessionId, input.organizationId);
  if (!report.signoffState.canSignOff) {
    throw new IntakeSignoffError(
      "SIGNOFF_BLOCKED",
      report.signoffState.blockReason ?? "签收条件未满足",
      report.signoffState.blockReason,
    );
  }

  const now = new Date().toISOString();
  const releasePackageId = report.releaseManifest.manifestId;

  const updated = updateIntakeSession(
    input.sessionId,
    {
      signedOff: true,
      signedOffAt: now,
      signedOffBy: input.actorId,
      signoffReasonCode: "SIGNOFF_COMPLETE",
      releasePackageId,
      statusReasonCode: "SIGNOFF_COMPLETE",
      statusReasonMessage: "V80 Pilot intake 已完成最终签收",
    },
    { bypassFreeze: true },
  );
  if (!updated) throw new IntakeSignoffError("SESSION_NOT_FOUND", "会话不存在");

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "signoff",
    statusBefore: session.status,
    statusAfter: "ready",
    workflowStatusBefore: session.workflowStatus,
    workflowStatusAfter: session.workflowStatus,
    message: "V80 Pilot intake 最终签收完成",
    linkage: report.releaseManifest.linkage,
    meta: {
      releasePackageId,
      readiness: report.readiness,
      gateSummary: report.gateSummary,
    },
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId: input.organizationId,
    actorId: input.actorId,
    step: "release_package",
    statusBefore: session.status,
    statusAfter: "ready",
    message: "发布包清单已生成",
    meta: {
      manifestId: releasePackageId,
      manifest: report.releaseManifest,
      rollbackIndex: report.rollbackIndex,
    },
  });

  const finalReport = await buildIntakeSignoffReport(input.sessionId, input.organizationId);

  return {
    sessionId: session.id,
    signedOff: true,
    signedOffAt: now,
    signedOffBy: input.actorId,
    releasePackageId,
    report: finalReport,
  };
}

export async function getIntakeSignoffSnapshot(
  sessionId: string,
  organizationId: string,
): Promise<IntakeSignoffReport> {
  return buildIntakeSignoffReport(sessionId, organizationId);
}
