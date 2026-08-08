/**
 * V80 Pilot P3 — Approve review → production entities + V80 auto-generation bridge
 * Hardened: idempotent create, stepwise persistence, resume-only on retry.
 */

import { QuoteStatus, TenderStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";
import { registerPilotProject } from "@/lib/portal/v62/store/pilot-registry.store";
import { generateQuote } from "@/lib/services/quote.service";
import { createProject } from "@/lib/services/project.service";

import {
  buildIntakeV80PipelineInput,
  buildPostGenerationTenderMetadata,
  runIntakeV80Generation,
} from "./generation-bridge.service";
import { appendIntakeAudit, getIntakeAuditSummary } from "./audit-trail.service";
import {
  getIntakeSession,
  releaseApproveLock,
  tryAcquireApproveLock,
  updateIntakeSession,
  type TenderIntakeSession,
} from "./intake.store";
import { assertClarificationsResolved } from "./clarification.service";
import { assertCompliancePassed } from "./compliance.service";
import { seedProjectBootstrap } from "./bootstrap.service";
import { IntakeValidationError, assertValidForApproval } from "./requirements.validation";
import { assertQaPassedForHandoffAsync, IntakeQaError } from "./qa-gate.service";
import { maybeFreezeIntakeOnReady, isIntakeSessionFrozen } from "./freeze-lock.service";
import { patchIntakeRequirements } from "./review.service";
import type { TenderRequirements } from "./requirements.schema";
import { buildIntakeSyncPackage, type IntakeSyncPackage } from "./sync.service";
import { ensureV80WorkspaceForProduction } from "./v80-bridge.service";

export type ApproveIntakeInput = {
  sessionId: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  requirements?: TenderRequirements;
};

export type ApproveIntakeResult = {
  sessionId: string;
  projectId: string;
  tenderId: string;
  quoteId: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  workflowJobId?: string;
  workflowStatus?: string;
  generationPhase?: "generating" | "ready" | "failed";
  terminalStatus?: "ready" | "failed" | "generating" | "pending";
  idempotent?: true;
};

/** P3 — terminal creation/handoff states */
export type IntakeCreateTerminalStatus =
  | "pending"
  | "creating"
  | "handoff"
  | "ready"
  | "failed";

export function hasCompleteProductionEntities(
  session: Pick<
    TenderIntakeSession,
    "productionProjectId" | "productionTenderId" | "productionQuoteId"
  >,
): boolean {
  return Boolean(
    session.productionProjectId &&
      session.productionTenderId &&
      session.productionQuoteId,
  );
}

export function hasPartialProductionEntities(
  session: Pick<
    TenderIntakeSession,
    "productionProjectId" | "productionTenderId" | "productionQuoteId"
  >,
): boolean {
  const any =
    Boolean(session.productionProjectId) ||
    Boolean(session.productionTenderId) ||
    Boolean(session.productionQuoteId);
  return any && !hasCompleteProductionEntities(session);
}

/**
 * Pure decision for approve path — used by runtime + verification.
 * create = first-time persistence; resume = V80 handoff only; idempotent = done.
 */
export function resolveIntakeApprovePath(
  session: TenderIntakeSession,
): "idempotent" | "resume" | "create" | "partial_error" {
  if (isIntakeSessionFrozen(session) && hasCompleteProductionEntities(session)) {
    return "idempotent";
  }
  if (session.status === "ready" && hasCompleteProductionEntities(session)) {
    return "idempotent";
  }
  if (
    (session.status === "approved" || session.status === "ready") &&
    hasCompleteProductionEntities(session) &&
    session.workflowStatus === "completed"
  ) {
    return "idempotent";
  }
  if (session.status === "approved" && hasCompleteProductionEntities(session)) {
    return "idempotent";
  }
  if (hasPartialProductionEntities(session)) {
    return "partial_error";
  }
  if (
    hasCompleteProductionEntities(session) &&
    (session.status === "generating" ||
      session.status === "failed" ||
      session.status === "approving" ||
      session.status === "qa_failed")
  ) {
    return "resume";
  }
  if (hasCompleteProductionEntities(session)) {
    return "resume";
  }
  return "create";
}

export function deriveCreateTerminalStatus(
  session: TenderIntakeSession,
): IntakeCreateTerminalStatus {
  if (session.status === "ready" || session.workflowStatus === "completed") {
    return "ready";
  }
  if (session.status === "failed" || session.workflowStatus === "failed") {
    return "failed";
  }
  if (session.status === "generating" || session.status === "approving") {
    return session.v80WorkflowJobId ? "handoff" : "creating";
  }
  if (hasCompleteProductionEntities(session)) {
    return "handoff";
  }
  return "pending";
}

function idempotentResult(session: TenderIntakeSession): ApproveIntakeResult {
  const terminal = deriveCreateTerminalStatus(session);
  return {
    sessionId: session.id,
    projectId: session.productionProjectId!,
    tenderId: session.productionTenderId!,
    quoteId: session.productionQuoteId!,
    v80TenderId: session.v80TenderId,
    v80QuoteId: session.v80QuoteId,
    workflowJobId: session.v80WorkflowJobId,
    workflowStatus: session.workflowStatus,
    generationPhase:
      terminal === "ready"
        ? "ready"
        : terminal === "failed"
          ? "failed"
          : "generating",
    terminalStatus:
      terminal === "ready" || terminal === "failed"
        ? terminal
        : terminal === "pending"
          ? "pending"
          : "generating",
    idempotent: true,
  };
}

async function runGenerationForSession(
  session: TenderIntakeSession,
  requirements: TenderRequirements,
  organizationId: string,
  actorId: string,
): Promise<{
  v80TenderId: string;
  v80QuoteId: string;
  workflowJobId: string;
  workflowStatus: string;
}> {
  const pipelineInput = buildIntakeV80PipelineInput({
    projectId: session.productionProjectId!,
    organizationId,
    requirements,
    session,
  });

  const statusBefore = session.status;
  const workflowBefore = session.workflowStatus;

  updateIntakeSession(session.id, { status: "generating" });

  const generation = await runIntakeV80Generation(pipelineInput);

  const failedStep = generation.workflowSteps.find((s) => s.status === "failed");

  const finalMetadata = buildPostGenerationTenderMetadata(requirements, organizationId, {
    intakeSessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    sourceFile: session.fileName,
    v80TenderId: generation.v80TenderId,
    v80QuoteId: generation.v80QuoteId,
    workflowJobId: generation.workflowJobId,
    workflowStatus: generation.workflowStatus,
    auditTrail: getIntakeAuditSummary(session.id),
  });

  await prisma.tender.update({
    where: { id: session.productionTenderId! },
    data: {
      status:
        generation.workflowStatus === "completed"
          ? TenderStatus.READY
          : generation.workflowStatus === "failed"
            ? TenderStatus.FAILED
            : TenderStatus.GENERATING,
      fileUrl: `/api/pdf/tender/zip`,
      metadata: finalMetadata as unknown as Prisma.JsonObject,
    },
  });

  updateIntakeSession(session.id, {
    v80TenderId: generation.v80TenderId,
    v80QuoteId: generation.v80QuoteId,
    v80WorkflowJobId: generation.workflowJobId,
    workflowStatus: generation.workflowStatus,
    status:
      generation.workflowStatus === "completed"
        ? "ready"
        : generation.workflowStatus === "failed"
          ? "failed"
          : "generating",
    statusReasonCode:
      generation.workflowStatus === "completed"
        ? "QA_PASS"
        : generation.workflowStatus === "failed"
          ? "WORKFLOW_CONFLICT"
          : undefined,
    statusReasonMessage:
      generation.workflowStatus === "completed"
        ? "V80 生成完成"
        : generation.workflowStatus === "failed"
          ? failedStep?.error ?? "V80 生成失败"
          : undefined,
  });

  appendIntakeAudit({
    sessionId: session.id,
    organizationId,
    actorId,
    step: "generate",
    statusBefore,
    statusAfter:
      generation.workflowStatus === "completed"
        ? "ready"
        : generation.workflowStatus === "failed"
          ? "failed"
          : "generating",
    workflowStatusBefore: workflowBefore,
    workflowStatusAfter: generation.workflowStatus,
    message:
      generation.workflowStatus === "completed"
        ? "V80 生成完成"
        : generation.workflowStatus === "failed"
          ? `V80 生成失败：${failedStep?.error ?? failedStep?.step ?? "unknown"}`
          : "V80 生成中",
    requirementsSnapshot: requirements,
    linkage: {
      projectId: session.productionProjectId,
      quoteId: session.productionQuoteId,
      tenderId: session.productionTenderId,
      v80TenderId: generation.v80TenderId,
      v80QuoteId: generation.v80QuoteId,
      workflowJobId: generation.workflowJobId,
    },
    meta: {
      workflowStatus: generation.workflowStatus,
      failedStep: failedStep?.step,
      error: failedStep?.error,
      entitiesRecreated: false,
    },
  });

  if (generation.workflowStatus === "completed") {
    maybeFreezeIntakeOnReady({
      sessionId: session.id,
      organizationId,
      actorId,
    });
  }

  return generation;
}

async function resumeGeneratingSession(
  session: TenderIntakeSession,
  input: ApproveIntakeInput,
): Promise<ApproveIntakeResult> {
  assertClarificationsResolved(session);
  assertCompliancePassed(session);
  const requirements = assertValidForApproval(
    session.requirements ?? session.extractedRequirements ?? {},
  );

  const generation = await runGenerationForSession(
    session,
    requirements,
    input.organizationId,
    input.userId,
  );

  if (generation.workflowStatus === "completed") {
    recordPilotTelemetry({
      name: "tender_pack_opened",
      organizationId: input.organizationId,
      userId: input.userId,
      projectId: session.productionProjectId!,
      success: true,
      meta: {
        tenderId: session.productionTenderId,
        quoteId: session.productionQuoteId,
        resumed: true,
      },
    });
  }

  const terminal =
    generation.workflowStatus === "completed"
      ? "ready"
      : generation.workflowStatus === "failed"
        ? "failed"
        : "generating";

  return {
    sessionId: session.id,
    projectId: session.productionProjectId!,
    tenderId: session.productionTenderId!,
    quoteId: session.productionQuoteId!,
    v80TenderId: generation.v80TenderId,
    v80QuoteId: generation.v80QuoteId,
    workflowJobId: generation.workflowJobId,
    workflowStatus: generation.workflowStatus,
    generationPhase: terminal,
    terminalStatus: terminal,
    idempotent: true,
  };
}

/**
 * Single source of truth: reuse session-mapped production entities or create once.
 * Persists IDs stepwise to shrink orphan windows on crash/retry.
 */
async function ensureProductionEntities(input: {
  session: TenderIntakeSession;
  sync: IntakeSyncPackage;
  organizationId: string;
  userEmail: string;
}): Promise<{
  projectId: string;
  quoteId: string;
  tenderId: string;
  projectName: string;
  created: { project: boolean; quote: boolean; tender: boolean };
}> {
  const created = { project: false, quote: false, tender: false };
  let session = getIntakeSession(input.session.id)!;

  let projectId = session.productionProjectId;
  let quoteId = session.productionQuoteId;
  let tenderId = session.productionTenderId;
  let projectName = input.sync.projectInput.name;

  if (projectId) {
    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) {
      throw new Error("PARTIAL_WRITE_DETECTED");
    }
    projectName = existing.name;
  } else {
    const project = await createProject(input.sync.projectInput);
    projectId = project.id;
    projectName = project.name;
    created.project = true;
    updateIntakeSession(session.id, { productionProjectId: projectId });
    session = getIntakeSession(session.id)!;
  }

  if (quoteId) {
    const existing = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!existing) {
      throw new Error("PARTIAL_WRITE_DETECTED");
    }
  } else {
    const quoteResult = await generateQuote({
      projectId: projectId!,
      workspaceId: input.organizationId,
      organizationId: input.organizationId,
      companyInfo: input.sync.quoteCompanyInfo,
    });
    quoteId = quoteResult.quote.id;
    created.quote = true;

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        content: input.sync.quoteContent as unknown as Prisma.JsonObject,
        status: QuoteStatus.READY,
      },
    });
    updateIntakeSession(session.id, { productionQuoteId: quoteId });
    session = getIntakeSession(session.id)!;
  }

  if (tenderId) {
    const existing = await prisma.tender.findUnique({ where: { id: tenderId } });
    if (!existing) {
      throw new Error("PARTIAL_WRITE_DETECTED");
    }
  } else {
    const productionTender = await prisma.tender.create({
      data: {
        projectId: projectId!,
        quoteId: quoteId!,
        status: TenderStatus.GENERATING,
        fileName: input.session.fileName,
        metadata: input.sync.tenderMetadata as unknown as Prisma.JsonObject,
      },
    });
    tenderId = productionTender.id;
    created.tender = true;
    updateIntakeSession(session.id, { productionTenderId: tenderId });
  }

  await ensureV80WorkspaceForProduction({
    organizationId: input.organizationId,
    projectId: projectId!,
    projectName,
    adminEmail: input.userEmail,
    plan: "PRO",
  });

  return {
    projectId: projectId!,
    quoteId: quoteId!,
    tenderId: tenderId!,
    projectName,
    created,
  };
}

export async function approveTenderIntake(input: ApproveIntakeInput): Promise<ApproveIntakeResult> {
  const initial = getIntakeSession(input.sessionId);
  if (!initial) throw new Error("SESSION_NOT_FOUND");
  if (initial.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  const path = resolveIntakeApprovePath(initial);

  if (path === "idempotent") {
    return idempotentResult(initial);
  }

  if (path === "partial_error") {
    throw new Error("PARTIAL_WRITE_DETECTED");
  }

  if (path === "resume") {
    if (!tryAcquireApproveLock(input.sessionId)) {
      throw new Error("APPROVE_IN_PROGRESS");
    }
    try {
      const session = getIntakeSession(input.sessionId);
      if (!session) throw new Error("SESSION_NOT_FOUND");
      const again = resolveIntakeApprovePath(session);
      if (again === "idempotent") return idempotentResult(session);
      return resumeGeneratingSession(session, input);
    } finally {
      releaseApproveLock(input.sessionId);
    }
  }

  // path === "create"
  if (!tryAcquireApproveLock(input.sessionId)) {
    throw new Error("APPROVE_IN_PROGRESS");
  }

  try {
    const session = getIntakeSession(input.sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");

    // Race: another request may have finished create while we waited for lock
    const raced = resolveIntakeApprovePath(session);
    if (raced === "idempotent") return idempotentResult(session);
    if (raced === "resume") return resumeGeneratingSession(session, input);
    if (raced === "partial_error") throw new Error("PARTIAL_WRITE_DETECTED");

    assertClarificationsResolved(session);

    const patched = patchIntakeRequirements({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      requirements: input.requirements ?? session.requirements ?? {},
      actorId: input.userId,
    });

    assertCompliancePassed(session, patched.requirements);

    let requirements: TenderRequirements;
    try {
      requirements = await assertQaPassedForHandoffAsync({
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        requirements: patched.requirements,
        actorId: input.userId,
      });
    } catch (err) {
      if (err instanceof IntakeQaError || err instanceof IntakeValidationError) throw err;
      throw err;
    }

    updateIntakeSession(input.sessionId, { status: "approving", requirements });

    appendIntakeAudit({
      sessionId: session.id,
      organizationId: input.organizationId,
      actorId: input.userId,
      step: "handoff",
      statusBefore: session.status,
      statusAfter: "approving",
      message: "QA 通过，开始生产交接",
      requirementsSnapshot: requirements,
      meta: { qaPassed: true },
    });

    const sync = buildIntakeSyncPackage(requirements, input.organizationId, {
      intakeSessionId: session.id,
      tenderIntakeId: session.tenderIntakeId,
      sourceFile: session.fileName,
      parseMeta: {
        pages: session.parseResult.pages.length,
        chars: session.parseResult.rawText.length,
      },
      intakeVersion: "v80-pilot-p3",
    });

    const entities = await ensureProductionEntities({
      session: getIntakeSession(session.id)!,
      sync,
      organizationId: input.organizationId,
      userEmail: input.userEmail,
    });

    appendIntakeAudit({
      sessionId: session.id,
      organizationId: input.organizationId,
      actorId: input.userId,
      step: "approve",
      statusBefore: session.status,
      statusAfter: "approving",
      message: "批准 intake，映射 Project / Quote / Tender",
      requirementsSnapshot: requirements,
      linkage: {
        projectId: entities.projectId,
        quoteId: entities.quoteId,
        tenderId: entities.tenderId,
      },
      meta: {
        entitiesRecreated: false,
        created: entities.created,
        mappingLocked: true,
      },
    });

    // Handoff only after successful persistence + session mapping lock
    const refreshed = getIntakeSession(session.id)!;
    if (!hasCompleteProductionEntities(refreshed)) {
      updateIntakeSession(session.id, {
        status: "failed",
        statusReasonCode: "PARTIAL_WRITE_DETECTED",
        statusReasonMessage: "生产实体未完整落库",
      });
      throw new Error("PARTIAL_WRITE_DETECTED");
    }

    // P10 — seed execution kickoff (idempotent; best-effort if DB unavailable)
    try {
      await seedProjectBootstrap({
        sessionId: session.id,
        organizationId: input.organizationId,
        actorId: input.userId,
        actorEmail: input.userEmail,
        persistProduction: true,
      });
    } catch {
      // Bootstrap persistence should not block V80 handoff
    }

    const generation = await runGenerationForSession(
      refreshed,
      requirements,
      input.organizationId,
      input.userId,
    );

    registerPilotProject({
      projectId: entities.projectId,
      organizationId: input.organizationId,
      name: entities.projectName,
    });

    recordPilotTelemetry({
      name: "project_created",
      organizationId: input.organizationId,
      userId: input.userId,
      projectId: entities.projectId,
      success: true,
      meta: {
        intakeSessionId: session.id,
        workflowKey: "tender-pack-complete",
        created: entities.created,
      },
    });

    recordPilotTelemetry({
      name: "tender_pack_opened",
      organizationId: input.organizationId,
      userId: input.userId,
      projectId: entities.projectId,
      success: generation.workflowStatus === "completed",
      meta: { tenderId: entities.tenderId, quoteId: entities.quoteId },
    });

    const terminal =
      generation.workflowStatus === "completed"
        ? "ready"
        : generation.workflowStatus === "failed"
          ? "failed"
          : "generating";

    return {
      sessionId: session.id,
      projectId: entities.projectId,
      tenderId: entities.tenderId,
      quoteId: entities.quoteId,
      v80TenderId: generation.v80TenderId,
      v80QuoteId: generation.v80QuoteId,
      workflowJobId: generation.workflowJobId,
      workflowStatus: generation.workflowStatus,
      generationPhase: terminal,
      terminalStatus: terminal,
    };
  } catch (err) {
    const session = getIntakeSession(input.sessionId);
    if (
      session &&
      session.status === "approving" &&
      !hasCompleteProductionEntities(session)
    ) {
      updateIntakeSession(input.sessionId, {
        status: "failed",
        statusReasonCode: "CREATE_FAILED",
        statusReasonMessage: err instanceof Error ? err.message : "创建失败",
      });
      appendIntakeAudit({
        sessionId: input.sessionId,
        organizationId: input.organizationId,
        actorId: input.userId,
        step: "status_transition",
        statusBefore: "approving",
        statusAfter: "failed",
        message: "创建失败，进入 failed 终端态",
        meta: { error: err instanceof Error ? err.message : String(err) },
      });
    }
    throw err;
  } finally {
    releaseApproveLock(input.sessionId);
  }
}

export { IntakeValidationError };
