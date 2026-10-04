/**
 * V59 — Tender Service (PDF 标书生成入口)
 */

import { QuoteStatus, TenderStatus, type Prisma } from "@prisma/client";

import { runTenderEngine } from "@/lib/product-engine";
import { createQuoteOrchestrator } from "@/lib/quote-lifecycle";
import { prisma } from "@/lib/prisma";
import { readBudgetQuoteBasis } from "@/lib/services/budget.service";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export type GenerateTenderInput = {
  projectId: string;
  quoteId: string;
  budgetId: string;
  organizationId?: string;
};

export type TenderBindingFailure =
  | "QUOTE_ID_REQUIRED"
  | "BUDGET_ID_REQUIRED"
  | "TENDER_ID_REQUIRED"
  | "PROJECT_NOT_FOUND"
  | "QUOTE_NOT_FOUND"
  | "BUDGET_NOT_FOUND"
  | "TENDER_NOT_FOUND"
  | "QUOTE_PROJECT_MISMATCH"
  | "BUDGET_PROJECT_MISMATCH"
  | "TENDER_PROJECT_MISMATCH"
  | "QUOTE_NOT_READY"
  | "TENDER_NOT_READY"
  | "BUDGET_QUOTE_MISMATCH"
  | "TENDER_BINDING_INCOMPLETE";

const TENDER_BINDING_STATUS: Record<TenderBindingFailure, 400 | 404 | 409 | 422> = {
  QUOTE_ID_REQUIRED: 400,
  BUDGET_ID_REQUIRED: 400,
  TENDER_ID_REQUIRED: 400,
  PROJECT_NOT_FOUND: 404,
  QUOTE_NOT_FOUND: 404,
  BUDGET_NOT_FOUND: 404,
  TENDER_NOT_FOUND: 404,
  QUOTE_PROJECT_MISMATCH: 409,
  BUDGET_PROJECT_MISMATCH: 409,
  TENDER_PROJECT_MISMATCH: 409,
  QUOTE_NOT_READY: 409,
  TENDER_NOT_READY: 409,
  BUDGET_QUOTE_MISMATCH: 409,
  TENDER_BINDING_INCOMPLETE: 422,
};

/** The requested Project / Quote / Budget (/ Tender) do not form one commercial version; nothing is created or delivered. */
export class TenderBindingError extends Error {
  readonly status: 400 | 404 | 409 | 422;

  constructor(
    readonly code: TenderBindingFailure,
    message: string,
  ) {
    super(message);
    this.name = "TenderBindingError";
    this.status = TENDER_BINDING_STATUS[code];
  }
}

/** Loads the requested rows and enforces the C.3 binding invariant; never falls back to the latest Budget. */
async function loadTenderBinding(input: GenerateTenderInput) {
  const projectId = String(input.projectId ?? "").trim();
  const quoteId = String(input.quoteId ?? "").trim();
  const budgetId = String(input.budgetId ?? "").trim();

  if (!quoteId) {
    throw new TenderBindingError("QUOTE_ID_REQUIRED", "缺少 quoteId");
  }
  if (!budgetId) {
    throw new TenderBindingError("BUDGET_ID_REQUIRED", "缺少 budgetId，请先为当前方案计算预算");
  }

  const [project, quote, budget] = await Promise.all([
    projectId ? prisma.project.findUnique({ where: { id: projectId } }) : null,
    prisma.quote.findUnique({ where: { id: quoteId } }),
    prisma.budget.findUnique({ where: { id: budgetId } }),
  ]);

  if (!project) {
    throw new TenderBindingError("PROJECT_NOT_FOUND", "项目不存在");
  }
  if (input.organizationId) {
    assertResourceBelongsToTenant(project.organizationId, input.organizationId);
  }
  if (!quote) {
    throw new TenderBindingError("QUOTE_NOT_FOUND", "方案不存在");
  }
  if (quote.projectId !== project.id) {
    throw new TenderBindingError("QUOTE_PROJECT_MISMATCH", "方案不属于当前项目");
  }
  if (!budget) {
    throw new TenderBindingError("BUDGET_NOT_FOUND", "预算不存在");
  }
  assertQuoteBudgetVersion(project, quote, budget);

  return { project, quote, budget };
}

/** Quote + Budget describe one commercial version of the project (shared by creation and delivery). */
function assertQuoteBudgetVersion(
  project: { id: string },
  quote: { id: string; projectId: string; status: QuoteStatus },
  budget: { projectId: string; assumptions: unknown },
): void {
  if (quote.projectId !== project.id) {
    throw new TenderBindingError("QUOTE_PROJECT_MISMATCH", "方案不属于当前项目");
  }
  if (budget.projectId !== project.id) {
    throw new TenderBindingError("BUDGET_PROJECT_MISMATCH", "预算不属于当前项目");
  }
  if (quote.status !== QuoteStatus.READY) {
    throw new TenderBindingError("QUOTE_NOT_READY", "方案尚未就绪，无法生成投标文件");
  }
  if (readBudgetQuoteBasis(budget.assumptions)?.quoteId !== quote.id) {
    throw new TenderBindingError(
      "BUDGET_QUOTE_MISMATCH",
      "预算不是基于当前方案版本计算的，请为当前方案重新计算预算",
    );
  }
}

/**
 * Delivery anchor: resolves exactly the Quote + Budget persisted on the Tender.
 * Never substitutes a newer Quote / Budget of the project.
 */
export async function loadTenderDeliveryBinding(input: {
  tenderId: string;
  projectId: string;
  organizationId: string;
}) {
  const tenderId = String(input.tenderId ?? "").trim();
  if (!tenderId) {
    throw new TenderBindingError("TENDER_ID_REQUIRED", "缺少 tenderId");
  }

  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new TenderBindingError("TENDER_NOT_FOUND", "投标文件不存在");
  }
  const project = await prisma.project.findUnique({ where: { id: tender.projectId } });
  if (!project) {
    throw new TenderBindingError("PROJECT_NOT_FOUND", "项目不存在");
  }
  assertResourceBelongsToTenant(project.organizationId, input.organizationId);
  if (tender.projectId !== String(input.projectId ?? "").trim()) {
    throw new TenderBindingError("TENDER_PROJECT_MISMATCH", "投标文件不属于当前项目");
  }
  if (tender.status !== TenderStatus.READY) {
    throw new TenderBindingError("TENDER_NOT_READY", "投标文件尚未就绪");
  }
  if (!tender.quoteId || !tender.budgetId) {
    throw new TenderBindingError("TENDER_BINDING_INCOMPLETE", "投标文件缺少绑定的方案或预算，请重新生成投标文件");
  }

  const [quote, budget] = await Promise.all([
    prisma.quote.findUnique({ where: { id: tender.quoteId }, include: { project: true } }),
    prisma.budget.findUnique({ where: { id: tender.budgetId } }),
  ]);
  if (!quote || !budget) {
    throw new TenderBindingError("TENDER_BINDING_INCOMPLETE", "投标文件绑定的方案或预算已不存在");
  }
  assertQuoteBudgetVersion(project, quote, budget);

  return { tender, project, quote, budget };
}

export async function generateTender(input: GenerateTenderInput) {
  const { project, quote, budget } = await loadTenderBinding(input);

  const tender = await prisma.tender.create({
    data: {
      projectId: project.id,
      quoteId: quote.id,
      budgetId: budget.id,
      status: TenderStatus.GENERATING,
    },
  });

  try {
    const orchestrator = createQuoteOrchestrator();
    orchestrator.run({
      context: {
        quoteId: quote.id,
        workspaceId: quote.workspaceId,
        jobId: `tender-${tender.id}`,
      },
      action: "tender.generate",
      payload: { projectId: project.id, budgetId: budget.id },
      observedAt: new Date().toISOString(),
    });

    const engine = runTenderEngine({
      quoteId: quote.id,
      projectId: project.id,
      projectName: project.name,
      historyStore: orchestrator.historyStore,
    });

    const updated = await prisma.tender.update({
      where: { id: tender.id },
      data: {
        status: TenderStatus.READY,
        fileName: engine.artifact.fileName,
        fileUrl: `/api/pdf/tender/zip?projectId=${project.id}`,
        renderVersion: engine.artifact.renderVersion,
        metadata: engine.artifact.metadata as unknown as Prisma.JsonObject,
      },
    });

    return { tender: updated, engine };
  } catch (error) {
    await prisma.tender.update({
      where: { id: tender.id },
      data: { status: TenderStatus.FAILED },
    });
    throw error;
  }
}

export async function getTenderById(tenderId: string) {
  return prisma.tender.findUnique({
    where: { id: tenderId },
    include: { project: true, quote: true, budget: true },
  });
}
