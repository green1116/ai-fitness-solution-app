/**
 * V80 Pilot P3 — Approve review → production entities + V80 auto-generation bridge
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
import { IntakeValidationError, assertValidForApproval } from "./requirements.validation";
import { assertQaPassedForHandoffAsync, IntakeQaError } from "./qa-gate.service";
import { maybeFreezeIntakeOnReady, isIntakeSessionFrozen } from "./freeze-lock.service";
import { patchIntakeRequirements } from "./review.service";
import type { TenderRequirements } from "./requirements.schema";
import { buildIntakeSyncPackage } from "./sync.service";
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
  generationPhase?: "generating" | "ready";
  idempotent?: true;
};

function idempotentResult(session: TenderIntakeSession): ApproveIntakeResult {
  return {
    sessionId: session.id,
    projectId: session.productionProjectId!,
    tenderId: session.productionTenderId!,
    quoteId: session.productionQuoteId!,
    v80TenderId: session.v80TenderId,
    v80QuoteId: session.v80QuoteId,
    workflowJobId: session.v80WorkflowJobId,
    workflowStatus: session.workflowStatus,
    generationPhase: session.status === "ready" || session.workflowStatus === "completed" ? "ready" : "generating",
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
    statusAfter: generation.workflowStatus === "completed" ? "ready" : generation.workflowStatus === "failed" ? "failed" : "generating",
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

  return {
    sessionId: session.id,
    projectId: session.productionProjectId!,
    tenderId: session.productionTenderId!,
    quoteId: session.productionQuoteId!,
    v80TenderId: generation.v80TenderId,
    v80QuoteId: generation.v80QuoteId,
    workflowJobId: generation.workflowJobId,
    workflowStatus: generation.workflowStatus,
    generationPhase: generation.workflowStatus === "completed" ? "ready" : "generating",
    idempotent: true,
  };
}

export async function approveTenderIntake(input: ApproveIntakeInput): Promise<ApproveIntakeResult> {
  const initial = getIntakeSession(input.sessionId);
  if (!initial) throw new Error("SESSION_NOT_FOUND");
  if (initial.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  if (isIntakeSessionFrozen(initial)) {
    return idempotentResult(initial);
  }

  if (initial.status === "ready" && initial.productionProjectId) {
    return idempotentResult(initial);
  }

  if (initial.status === "approved" && initial.productionProjectId && initial.workflowStatus === "completed") {
    return idempotentResult(initial);
  }

  if (initial.status === "approved" && initial.productionProjectId) {
    return idempotentResult(initial);
  }

  if (
    initial.status === "generating" &&
    initial.productionProjectId &&
    initial.productionTenderId &&
    initial.productionQuoteId
  ) {
    if (!tryAcquireApproveLock(input.sessionId)) {
      throw new Error("APPROVE_IN_PROGRESS");
    }
    try {
      const session = getIntakeSession(input.sessionId);
      if (!session) throw new Error("SESSION_NOT_FOUND");
      if (session.status === "approved") return idempotentResult(session);
      return resumeGeneratingSession(session, input);
    } finally {
      releaseApproveLock(input.sessionId);
    }
  }

  if (
    initial.productionProjectId &&
    initial.productionTenderId &&
    initial.productionQuoteId &&
    initial.status !== "approved" &&
    initial.status !== "generating" &&
    initial.status !== "ready" &&
    initial.status !== "failed"
  ) {
    throw new Error("PARTIAL_WRITE_DETECTED");
  }

  if (!tryAcquireApproveLock(input.sessionId)) {
    throw new Error("APPROVE_IN_PROGRESS");
  }

  try {
    const session = getIntakeSession(input.sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");
    if (session.status === "approved" && session.productionProjectId) {
      return idempotentResult(session);
    }

    const patched = patchIntakeRequirements({
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      requirements: input.requirements ?? session.requirements ?? {},
      actorId: input.userId,
    });

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
      intakeVersion: "v80-pilot-p6",
    });

    const project = await createProject(sync.projectInput);

    const quoteResult = await generateQuote({
      projectId: project.id,
      workspaceId: input.organizationId,
      organizationId: input.organizationId,
      companyInfo: sync.quoteCompanyInfo,
    });

    await prisma.quote.update({
      where: { id: quoteResult.quote.id },
      data: {
        content: sync.quoteContent as unknown as Prisma.JsonObject,
        status: QuoteStatus.READY,
      },
    });

    const productionTender = await prisma.tender.create({
      data: {
        projectId: project.id,
        quoteId: quoteResult.quote.id,
        status: TenderStatus.GENERATING,
        fileName: session.fileName,
        metadata: sync.tenderMetadata as unknown as Prisma.JsonObject,
      },
    });

    await ensureV80WorkspaceForProduction({
      organizationId: input.organizationId,
      projectId: project.id,
      projectName: project.name,
      adminEmail: input.userEmail,
      plan: "PRO",
    });

    updateIntakeSession(session.id, {
      productionProjectId: project.id,
      productionTenderId: productionTender.id,
      productionQuoteId: quoteResult.quote.id,
    });

    appendIntakeAudit({
      sessionId: session.id,
      organizationId: input.organizationId,
      actorId: input.userId,
      step: "approve",
      statusBefore: session.status,
      statusAfter: "approving",
      message: "批准 intake，创建 Project / Quote / Tender",
      requirementsSnapshot: requirements,
      linkage: {
        projectId: project.id,
        quoteId: quoteResult.quote.id,
        tenderId: productionTender.id,
      },
      meta: { entitiesRecreated: false },
    });

    const refreshed = getIntakeSession(session.id)!;
    const generation = await runGenerationForSession(
      refreshed,
      requirements,
      input.organizationId,
      input.userId,
    );

    registerPilotProject({
      projectId: project.id,
      organizationId: input.organizationId,
      name: project.name,
    });

    recordPilotTelemetry({
      name: "project_created",
      organizationId: input.organizationId,
      userId: input.userId,
      projectId: project.id,
      success: true,
      meta: { intakeSessionId: session.id, workflowKey: "tender-pack-complete" },
    });

    recordPilotTelemetry({
      name: "tender_pack_opened",
      organizationId: input.organizationId,
      userId: input.userId,
      projectId: project.id,
      success: generation.workflowStatus === "completed",
      meta: { tenderId: productionTender.id, quoteId: quoteResult.quote.id },
    });

    return {
      sessionId: session.id,
      projectId: project.id,
      tenderId: productionTender.id,
      quoteId: quoteResult.quote.id,
      v80TenderId: generation.v80TenderId,
      v80QuoteId: generation.v80QuoteId,
      workflowJobId: generation.workflowJobId,
      workflowStatus: generation.workflowStatus,
      generationPhase: generation.workflowStatus === "completed" ? "ready" : "generating",
    };
  } finally {
    releaseApproveLock(input.sessionId);
  }
}

export { IntakeValidationError };
