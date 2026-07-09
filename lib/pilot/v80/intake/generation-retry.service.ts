/**
 * V80 Pilot P4 — Retry failed generation without recreating production entities
 */

import { appendIntakeAudit } from "./audit-trail.service";
import { getIntakeSession, tryAcquireApproveLock, releaseApproveLock, updateIntakeSession } from "./intake.store";
import { isIntakeSessionFrozen } from "./freeze-lock.service";
import {
  buildIntakeV80PipelineInput,
  buildPostGenerationTenderMetadata,
  runIntakeV80Generation,
} from "./generation-bridge.service";
import { assertValidForApproval } from "./requirements.validation";
import { syncSessionWorkflowStatus } from "./artifact-delivery.service";
import type { ApproveIntakeResult } from "./approve.service";
import { TenderStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RetryIntakeGenerationInput = {
  sessionId: string;
  organizationId: string;
  actorId?: string;
};

export async function retryIntakeGeneration(
  input: RetryIntakeGenerationInput,
): Promise<ApproveIntakeResult> {
  const initial = getIntakeSession(input.sessionId);
  if (!initial) throw new Error("SESSION_NOT_FOUND");
  if (initial.organizationId !== input.organizationId) throw new Error("ORG_MISMATCH");

  if (isIntakeSessionFrozen(initial)) {
    throw new Error("SESSION_FROZEN");
  }

  if (!initial.productionProjectId || !initial.productionTenderId || !initial.productionQuoteId) {
    throw new Error("ENTITIES_NOT_CREATED");
  }

  if (
    (initial.status === "ready" || initial.status === "approved") &&
    initial.workflowStatus === "completed"
  ) {
    return {
      sessionId: initial.id,
      projectId: initial.productionProjectId,
      tenderId: initial.productionTenderId,
      quoteId: initial.productionQuoteId,
      v80TenderId: initial.v80TenderId,
      v80QuoteId: initial.v80QuoteId,
      workflowJobId: initial.v80WorkflowJobId,
      workflowStatus: initial.workflowStatus,
      generationPhase: "ready",
      idempotent: true,
    };
  }

  if (!tryAcquireApproveLock(input.sessionId)) {
    throw new Error("APPROVE_IN_PROGRESS");
  }

  try {
    let session = await syncSessionWorkflowStatus(input.sessionId, initial);
    if (
      (session.status === "ready" || session.status === "approved") &&
      session.workflowStatus === "completed"
    ) {
      return {
        sessionId: session.id,
        projectId: session.productionProjectId!,
        tenderId: session.productionTenderId!,
        quoteId: session.productionQuoteId!,
        v80TenderId: session.v80TenderId,
        v80QuoteId: session.v80QuoteId,
        workflowJobId: session.v80WorkflowJobId,
        workflowStatus: session.workflowStatus,
        generationPhase: "ready",
        idempotent: true,
      };
    }

    const requirements = assertValidForApproval(
      session.requirements ?? session.extractedRequirements ?? {},
    );

    updateIntakeSession(session.id, { status: "generating" });

    const pipelineInput = buildIntakeV80PipelineInput({
      projectId: session.productionProjectId!,
      organizationId: input.organizationId,
      requirements,
      session,
    });

    const generation = await runIntakeV80Generation(pipelineInput);

    const finalMetadata = buildPostGenerationTenderMetadata(requirements, input.organizationId, {
      intakeSessionId: session.id,
      tenderIntakeId: session.tenderIntakeId,
      sourceFile: session.fileName,
      v80TenderId: generation.v80TenderId,
      v80QuoteId: generation.v80QuoteId,
      workflowJobId: generation.workflowJobId,
      workflowStatus: generation.workflowStatus,
      retriedAt: new Date().toISOString(),
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
            ? "V80 生成失败"
            : undefined,
    });

    appendIntakeAudit({
      sessionId: session.id,
      organizationId: input.organizationId,
      actorId: input.actorId ?? session.userId,
      step: "retry",
      statusBefore: initial.status,
      statusAfter: generation.workflowStatus === "completed" ? "approved" : "generating",
      workflowStatusBefore: initial.workflowStatus,
      workflowStatusAfter: generation.workflowStatus,
      message: "重试 V80 生成",
      linkage: {
        projectId: session.productionProjectId!,
        quoteId: session.productionQuoteId!,
        tenderId: session.productionTenderId!,
        v80TenderId: generation.v80TenderId,
        v80QuoteId: generation.v80QuoteId,
        workflowJobId: generation.workflowJobId,
      },
      meta: { workflowStatus: generation.workflowStatus, entitiesRecreated: false },
    });

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
    };
  } finally {
    releaseApproveLock(input.sessionId);
  }
}
