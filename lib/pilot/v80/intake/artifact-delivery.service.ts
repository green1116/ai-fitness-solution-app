/**
 * V80 Pilot P4 — Intake artifact linkage & Document Center delivery visibility
 */

import { prisma } from "@/lib/prisma";
import { getProjectDocuments } from "@/lib/portal/v58/documents/documents.aggregator";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";
import { v80Persist } from "@/lib/scaffold/v80/runtime/store";
import { getWorkflowJob } from "@/lib/scaffold/v80/workflow/runner.service";

import { maybeFreezeIntakeOnReady } from "./freeze-lock.service";
import { getIntakeSession, updateIntakeSession, type TenderIntakeSession } from "./intake.store";
import type { IntakeGenerationProgress } from "./generation-bridge.service";
import { getIntakeGenerationProgress } from "./generation-bridge.service";

export type IntakeArtifactStatus = "ready" | "generating" | "failed" | "pending";

export type IntakeArtifactItem = {
  id: string;
  kind: "plan" | "budget" | "proposal" | "bundle" | "tender_pack" | "quote";
  label: string;
  status: IntakeArtifactStatus;
  source: "v80" | "document_center" | "production";
  artifactId?: string;
  downloadUrl?: string;
  openUrl?: string;
};

export type IntakeLinkage = {
  intakeSessionId: string;
  tenderIntakeId: string;
  projectId?: string;
  quoteId?: string;
  tenderId?: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  workflowJobId?: string;
};

export type IntakeGenerationError = {
  message: string;
  step?: string;
};

export type IntakeDeliverySnapshot = IntakeGenerationProgress & {
  linkage: IntakeLinkage;
  artifacts: IntakeArtifactItem[];
  error?: IntakeGenerationError;
  canRetry: boolean;
};

const V80_LABELS: Record<string, string> = {
  plan: "计划 PDF",
  budget: "预算 PDF",
  proposal: "方案 PDF",
  bundle: "标书包 ZIP",
};

const SLOT_LABELS: Record<string, { kind: IntakeArtifactItem["kind"]; label: string }> = {
  planPdf: { kind: "plan", label: "计划 PDF" },
  budgetPdf: { kind: "budget", label: "预算 PDF" },
  quotePdf: { kind: "quote", label: "方案 PDF" },
  zipPackage: { kind: "bundle", label: "标书包 ZIP" },
  tenderPack: { kind: "tender_pack", label: "Tender Pack" },
};

function mapDeliveryStatus(status: string): IntakeArtifactStatus {
  if (status === "delivered" || status === "ready") return "ready";
  if (status === "pending") return "generating";
  if (status === "archived") return "failed";
  return "pending";
}

function mapTenderStatus(status: string | undefined): IntakeArtifactStatus {
  if (status === "READY") return "ready";
  if (status === "GENERATING") return "generating";
  if (status === "FAILED") return "failed";
  return "pending";
}

function v80ArtifactOpenUrl(
  type: string,
  artifactId: string,
  projectId: string,
): { downloadUrl?: string; openUrl?: string } {
  if (type === "bundle") {
    return {
      openUrl: `/documents/projects/${projectId}`,
      downloadUrl: `/api/pdf/tender/zip`,
    };
  }
  return {
    downloadUrl: `/api/v80/pdf?artifactId=${encodeURIComponent(artifactId)}`,
    openUrl: `/api/v80/pdf?artifactId=${encodeURIComponent(artifactId)}`,
  };
}

function deliveryToArtifact(record: DeliveryRecord): IntakeArtifactItem {
  const kind =
    record.artifactType === "plan_pdf"
      ? "plan"
      : record.artifactType === "budget_pdf"
        ? "budget"
        : record.artifactType === "quote_pdf"
          ? "quote"
          : record.artifactType === "zip_package"
            ? "bundle"
            : "tender_pack";

  return {
    id: record.id,
    kind,
    label: SLOT_LABELS[
      kind === "plan"
        ? "planPdf"
        : kind === "budget"
          ? "budgetPdf"
          : kind === "quote"
            ? "quotePdf"
            : kind === "bundle"
              ? "zipPackage"
              : "tenderPack"
    ]?.label ?? record.fileName,
    status: mapDeliveryStatus(record.status),
    source: "document_center",
    downloadUrl: record.downloadUrl,
    openUrl: record.downloadUrl,
  };
}

function extractWorkflowError(
  steps: IntakeGenerationProgress["steps"],
): IntakeGenerationError | undefined {
  const failed = steps.find((s) => s.status === "failed");
  if (!failed) return undefined;
  return {
    step: failed.step,
    message: failed.error ?? `工作流步骤 ${failed.step} 失败`,
  };
}

export function buildIntakeLinkage(session: TenderIntakeSession): IntakeLinkage {
  return {
    intakeSessionId: session.id,
    tenderIntakeId: session.tenderIntakeId,
    projectId: session.productionProjectId,
    quoteId: session.productionQuoteId,
    tenderId: session.productionTenderId,
    v80TenderId: session.v80TenderId,
    v80QuoteId: session.v80QuoteId,
    workflowJobId: session.v80WorkflowJobId,
  };
}

async function listV80Artifacts(projectId: string): Promise<IntakeArtifactItem[]> {
  const rows = await v80Persist.listArtifactsByProject(projectId);
  return rows.map((row) => {
    const urls = v80ArtifactOpenUrl(row.type, row.id, projectId);
    return {
      id: `v80_${row.type}_${row.id}`,
      kind:
        row.type === "plan"
          ? "plan"
          : row.type === "budget"
            ? "budget"
            : row.type === "proposal"
              ? "proposal"
              : "bundle",
      label: V80_LABELS[row.type] ?? row.type,
      status: "ready" as const,
      source: "v80" as const,
      artifactId: row.id,
      ...urls,
    };
  });
}

async function listDocumentCenterArtifacts(
  organizationId: string,
  projectId: string,
): Promise<IntakeArtifactItem[]> {
  const docs = await getProjectDocuments(organizationId, projectId);
  if (!docs) return [];

  const items: IntakeArtifactItem[] = [];
  for (const [slot, meta] of Object.entries(SLOT_LABELS)) {
    const record = docs.tenderPack[slot as keyof typeof docs.tenderPack];
    if (!record || Array.isArray(record)) continue;
    items.push(deliveryToArtifact(record as DeliveryRecord));
  }

  if (docs.quotes[0]) {
    items.push({
      id: `quote_${docs.quotes[0].id}`,
      kind: "quote",
      label: "Quote",
      status: mapTenderStatus(docs.quotes[0].status),
      source: "production",
      openUrl: `/documents/quotes/${docs.quotes[0].id}`,
    });
  }

  if (docs.tenders[0]) {
    const tender = docs.tenders[0];
    items.push({
      id: `tender_${tender.id}`,
      kind: "tender_pack",
      label: "Production Tender",
      status: mapTenderStatus(tender.status),
      source: "production",
      openUrl: `/documents/projects/${projectId}`,
      downloadUrl: `/api/pdf/tender/zip`,
    });
  }

  return items;
}

function mergeArtifactLists(
  primary: IntakeArtifactItem[],
  secondary: IntakeArtifactItem[],
): IntakeArtifactItem[] {
  const byKind = new Map<string, IntakeArtifactItem>();
  for (const item of [...secondary, ...primary]) {
    const key = item.kind;
    if (!byKind.has(key)) byKind.set(key, item);
  }
  return [...byKind.values()];
}

export async function getIntakeDeliverySnapshot(
  session: TenderIntakeSession,
  organizationId: string,
): Promise<IntakeDeliverySnapshot> {
  const progress = await getIntakeGenerationProgress(session);
  const linkage = buildIntakeLinkage(session);

  let artifacts: IntakeArtifactItem[] = [];
  if (session.productionProjectId) {
    const [v80Items, dcItems] = await Promise.all([
      listV80Artifacts(session.productionProjectId),
      listDocumentCenterArtifacts(organizationId, session.productionProjectId),
    ]);
    artifacts = mergeArtifactLists(dcItems, v80Items);
  }

  const error = extractWorkflowError(progress.steps);
  const canRetry =
    progress.phase === "failed" ||
    (progress.phase === "generating" && Boolean(error)) ||
    (session.status === "generating" && progress.workflowStatus === "failed");

  if (session.v80WorkflowJobId && progress.phase === "generating") {
    const job = await getWorkflowJob(session.v80WorkflowJobId);
    if (job?.status === "failed") {
      progress.phase = "failed";
    }
  }

  return {
    ...progress,
    linkage,
    artifacts,
    error,
    canRetry,
    documentCenterUrl: session.productionProjectId
      ? `/documents/projects/${session.productionProjectId}`
      : progress.documentCenterUrl,
    tenderZipUrl: session.productionProjectId
      ? `/api/pdf/tender/zip`
      : progress.tenderZipUrl,
  };
}

export async function syncSessionWorkflowStatus(
  sessionId: string,
  session: TenderIntakeSession,
): Promise<TenderIntakeSession> {
  if (!session.v80WorkflowJobId) return session;

  const job = await getWorkflowJob(session.v80WorkflowJobId);
  if (!job) return session;

    const nextStatus =
      job.status === "completed"
        ? "ready"
        : job.status === "failed"
          ? "failed"
          : session.status;

  if (
    session.workflowStatus !== job.status ||
    (job.status === "completed" && session.status !== "approved")
  ) {
    const updated = updateIntakeSession(sessionId, {
      workflowStatus: job.status,
      status: nextStatus,
    });
    if (updated) return updated;
  }

  if (session.productionTenderId && job.status === "completed") {
    await prisma.tender.updateMany({
      where: { id: session.productionTenderId, status: "GENERATING" },
      data: { status: "READY", fileUrl: "/api/pdf/tender/zip" },
    });
  }

  const latest = getIntakeSession(sessionId) ?? session;
  if (job.status === "completed") {
    maybeFreezeIntakeOnReady({
      sessionId,
      organizationId: latest.organizationId,
      actorId: latest.userId,
    });
    return getIntakeSession(sessionId) ?? latest;
  }

  return latest;
}
