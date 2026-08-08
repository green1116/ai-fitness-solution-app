/**
 * V80 Pilot P3 — Approved intake → existing V80 pipeline (single-source bridge)
 */

import { createTenderFromIntake } from "@/lib/scaffold/v80/services/tender-intake.service";
import {
  enqueueWorkflowJob,
  getWorkflowJob,
} from "@/lib/scaffold/v80/workflow/runner.service";
import type { V80WorkflowStepState } from "@/lib/scaffold/v80/runtime/store";

import type { TenderIntakeSession } from "./intake.store";
import { getIntakeSession } from "./intake.store";
import type { TenderRequirements } from "./requirements.schema";
import { buildIntakeSyncPackage } from "./sync.service";
import { validateTenderRequirementsForApproval } from "./requirements.validation";
export type IntakeV80PipelineInput = {
  projectId: string;
  organizationId: string;
  requirements: TenderRequirements;
  intakeSessionId: string;
  tenderIntakeId: string;
  sourceFile: string;
  parseMeta?: { pages: number; chars: number };
};

export type IntakeV80GenerationResult = {
  v80TenderId: string;
  v80QuoteId: string;
  workflowJobId: string;
  workflowStatus: string;
  workflowSteps: V80WorkflowStepState[];
  idempotent?: true;
};

export type IntakeGenerationProgress = {
  phase: "pending" | "generating" | "ready" | "failed";
  sessionStatus: TenderIntakeSession["status"];
  projectId?: string;
  tenderId?: string;
  quoteId?: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  workflowJobId?: string;
  workflowStatus?: string;
  steps: V80WorkflowStepState[];
  documentCenterUrl?: string;
  tenderZipUrl?: string;
};

/** Map approved intake requirements → existing V80 pipeline input */
export function buildIntakeV80PipelineInput(input: {
  projectId: string;
  organizationId: string;
  requirements: TenderRequirements;
  session: Pick<
    TenderIntakeSession,
    "id" | "tenderIntakeId" | "fileName" | "parseResult"
  >;
}): IntakeV80PipelineInput {
  return {
    projectId: input.projectId,
    organizationId: input.organizationId,
    requirements: input.requirements,
    intakeSessionId: input.session.id,
    tenderIntakeId: input.session.tenderIntakeId,
    sourceFile: input.session.fileName,
    parseMeta: {
      pages: input.session.parseResult.pages.length,
      chars: input.session.parseResult.rawText.length,
    },
  };
}

function intakeDocumentRef(input: IntakeV80PipelineInput): string[] {
  return [
    `pilot-intake://${input.intakeSessionId}/${encodeURIComponent(input.sourceFile)}`,
  ];
}

/** Run existing createTenderFromIntake + tender-pack-complete workflow (idempotent) */
export async function runIntakeV80Generation(
  input: IntakeV80PipelineInput,
): Promise<IntakeV80GenerationResult> {
  // P2 — Approval gate: only after QA-passed intake review
  const session = getIntakeSession(input.intakeSessionId);
  if (!session) {
    throw new Error("APPROVAL_REQUIRED");
  }
  if (!session.qaPassedAt) {
    throw new Error("APPROVAL_REQUIRED");
  }
  const reviewGate = validateTenderRequirementsForApproval(
    input.requirements ?? session.requirements ?? session.extractedRequirements,
  );
  if (!reviewGate.valid) {
    throw new Error("REVIEW_INCOMPLETE");
  }

  const v80Intake = await createTenderFromIntake({
    projectId: input.projectId,
    tenderType: "enterprise-gym",
    documentUrls: intakeDocumentRef(input),
  });

  const workflowJob = await enqueueWorkflowJob({
    projectId: input.projectId,
    workflowKey: "tender-pack-complete",
  });

  return {
    v80TenderId: v80Intake.tenderId,
    v80QuoteId: v80Intake.quoteId,
    workflowJobId: workflowJob.jobId,
    workflowStatus: workflowJob.status,
    workflowSteps: workflowJob.steps,
    idempotent:
      v80Intake.idempotent || ("idempotent" in workflowJob && workflowJob.idempotent)
        ? true
        : undefined,
  };
}

export function buildPostGenerationTenderMetadata(
  requirements: TenderRequirements,
  organizationId: string,
  extras: Record<string, unknown>,
): Record<string, unknown> {
  return buildIntakeSyncPackage(requirements, organizationId, {
    intakeVersion: "v80-pilot-p3",
    ...extras,
  }).tenderMetadata;
}

export async function getIntakeGenerationProgress(
  session: TenderIntakeSession,
): Promise<IntakeGenerationProgress> {
  const base: IntakeGenerationProgress = {
    phase:
      session.status === "ready" || session.status === "approved"
        ? "ready"
        : session.status === "failed"
          ? "failed"
          : session.status === "generating"
            ? "generating"
            : "pending",
    sessionStatus: session.status,
    projectId: session.productionProjectId,
    tenderId: session.productionTenderId,
    quoteId: session.productionQuoteId,
    v80TenderId: session.v80TenderId,
    v80QuoteId: session.v80QuoteId,
    workflowJobId: session.v80WorkflowJobId,
    workflowStatus: session.workflowStatus,
    steps: [],
  };

  if (session.productionProjectId) {
    base.documentCenterUrl = `/documents/projects/${session.productionProjectId}`;
    base.tenderZipUrl = `/api/pdf/tender/zip`;
  }

  if (!session.v80WorkflowJobId) return base;

  const job = await getWorkflowJob(session.v80WorkflowJobId);
  if (!job) return base;

  base.workflowStatus = job.status;
  base.steps = job.steps;

  if (job.status === "completed" || session.status === "approved" || session.status === "ready") {
    base.phase = "ready";
  } else if (job.status === "failed") {
    base.phase = "failed";
  } else {
    base.phase = "generating";
  }

  return base;
}
