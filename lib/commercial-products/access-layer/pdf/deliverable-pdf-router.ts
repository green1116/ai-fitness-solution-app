import { loadBudgetPdfRenderer, loadPlanPdfRenderer } from "@/lib/runtime/lazy-pdf-modules";
import { CP_DEFAULT_BRIDGE_PLAN_ID } from "../shared/deliverable-types";
import type {
  DeliverablePdfRequest,
  DeliverablePdfResult,
  DeliverableRoutingContext,
} from "./deliverable-pdf-types";
import { getQuoteSnapshotById } from "./quote-snapshot-registry";

function bridgePlanId(request: DeliverablePdfRequest): string {
  if (request.planId?.trim()) return request.planId.trim();
  return CP_DEFAULT_BRIDGE_PLAN_ID;
}

function bridgeBudgetId(request: DeliverablePdfRequest, planId: string): string {
  return request.budgetId?.trim() || planId;
}

export function buildDeliverableRoutingContext(
  request: DeliverablePdfRequest,
): DeliverableRoutingContext {
  const snapshot = request.snapshot ?? getQuoteSnapshotById(request.quoteId);
  const planId = bridgePlanId(request);
  const budgetId = bridgeBudgetId(request, planId);

  return {
    quoteId: request.quoteId,
    type: request.type,
    planId,
    budgetId,
    projectName: snapshot?.inputs.projectName ?? "Commercial Deliverable",
    sku: snapshot?.sku,
    hasSnapshot: Boolean(snapshot),
  };
}

async function routeSummaryPdf(request: DeliverablePdfRequest): Promise<DeliverablePdfResult> {
  const { runSummaryPdfRuntime } = await import("./summary-pdf-runtime");
  const result = await runSummaryPdfRuntime({
    quoteId: request.quoteId,
    snapshot: request.snapshot ?? getQuoteSnapshotById(request.quoteId),
  });

  return {
    filename: result.pdfMeta.filename,
    mimeType: "application/pdf",
    buffer: result.buffer,
    source: "summary-pdf",
  };
}

async function routePlanPdf(
  request: DeliverablePdfRequest,
  context: DeliverableRoutingContext,
): Promise<DeliverablePdfResult> {
  const planPdf = await loadPlanPdfRenderer();
  const buffer = await planPdf.renderPdf(context.planId, {
    mode: "full",
    variant: "sales",
  });

  return {
    filename: `plan-${context.planId}.pdf`,
    mimeType: "application/pdf",
    buffer,
    source: "plan-pdf",
  };
}

async function routeBudgetPdf(
  request: DeliverablePdfRequest,
  context: DeliverableRoutingContext,
): Promise<DeliverablePdfResult> {
  const snapshot = request.snapshot ?? getQuoteSnapshotById(request.quoteId);
  const budgetPdf = await loadBudgetPdfRenderer();
  const buffer = await budgetPdf.renderBudgetPdfBuffer(
    {
      planId: context.budgetId,
      companyName: snapshot?.inputs.projectName ?? context.projectName,
      companySize: snapshot?.inputs.headcount ?? 200,
      budgetTier: "mid",
    },
    {},
  );

  const bytes =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer as ArrayBuffer);

  return {
    filename: `budget-${context.budgetId}.pdf`,
    mimeType: "application/pdf",
    buffer: bytes,
    source: "budget-pdf",
  };
}

async function routeZipPackage(
  request: DeliverablePdfRequest,
  context: DeliverableRoutingContext,
): Promise<DeliverablePdfResult> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const summary = await routeSummaryPdf(request);
  zip.file("summary.pdf", summary.buffer);

  const manifest = {
    quoteId: context.quoteId,
    sku: context.sku,
    projectName: context.projectName,
    planId: context.planId,
    budgetId: context.budgetId,
    deliverables: ["summary.pdf", "plan.pdf", "budget.pdf"],
    placeholder: true,
    generatedAt: new Date().toISOString(),
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file(
    "README.txt",
    `AI Fitness Solution deliverable package\nquoteId=${context.quoteId}\nplan=${context.planId}\n`,
  );

  const buffer = await zip.generateAsync({ type: "uint8array" });

  return {
    filename: `deliverable-${context.quoteId}.zip`,
    mimeType: "application/zip",
    buffer,
    source: "zip-package",
  };
}

export async function routeDeliverablePdf(
  request: DeliverablePdfRequest,
): Promise<DeliverablePdfResult> {
  if (!request.quoteId?.trim()) {
    throw new Error("quoteId is required");
  }

  const context = buildDeliverableRoutingContext(request);

  switch (request.type) {
    case "summary":
      return routeSummaryPdf(request);
    case "plan":
      return routePlanPdf(request, context);
    case "budget":
      return routeBudgetPdf(request, context);
    case "zip":
      return routeZipPackage(request, context);
    default:
      throw new Error(`Unknown deliverable type: ${request.type}`);
  }
}
