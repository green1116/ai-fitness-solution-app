import { buildIntelligenceSnapshot } from "@/lib/commercial-products/shared/intelligence-snapshot";
import { getProductCatalogEntry } from "@/lib/commercial-products/product-catalog/product-catalog";
import { createQuote } from "../quote/quote-service";
import { CP_ACCESS_CANONICAL_ID, CP_ACCESS_VERSION } from "../shared/constants";
import type { QuoteSnapshot } from "../shared/types";
import type { SummaryPdfContext, SummaryPdfRequest, SummaryPdfResult, SummaryPdfSection } from "./pdf-context";
import { getQuoteSnapshotById, registerQuoteSnapshot } from "./quote-snapshot-registry";

export const CP_MIN_SUMMARY_SECTION_COUNT = 5 as const;

function loadQuoteSnapshot(request: SummaryPdfRequest): QuoteSnapshot {
  if (request.snapshot) {
    registerQuoteSnapshot(request.snapshot);
    return request.snapshot;
  }

  const cached = getQuoteSnapshotById(request.quoteId);
  if (cached) return cached;

  throw new Error(`Quote snapshot not found for quoteId: ${request.quoteId}`);
}

function buildSummarySections(
  snapshot: QuoteSnapshot,
  productName: string,
  intelligence: ReturnType<typeof buildIntelligenceSnapshot>,
): SummaryPdfSection[] {
  return [
    {
      sectionId: "brand-summary",
      title: "Brand Summary",
      body: `Brand coverage=${intelligence.brandCount} requirements=${intelligence.requirementCount} for ${snapshot.inputs.projectName}. Product=${productName}.`,
    },
    {
      sectionId: "risk-summary",
      title: "Risk Summary",
      body: `Delivery risk context projects=${intelligence.projectCount}. Eligibility=${snapshot.eligible ? "pass" : "review"}.`,
    },
    {
      sectionId: "procurement-summary",
      title: "Procurement Summary",
      body: `Procurement decisions=${intelligence.procurementDecisionCount}. Budget input=${snapshot.inputs.budgetCny}.`,
    },
    {
      sectionId: "tender-summary",
      title: "Tender Summary",
      body: `Tenders=${intelligence.tenderCount} outcomes=${intelligence.winLossOutcomeCount}. SKU=${snapshot.sku}.`,
    },
    {
      sectionId: "delivery-summary",
      title: "Delivery Summary",
      body: `Performance avg=${intelligence.performanceAverageScore} optimizations=${intelligence.optimizationOpportunityCount}. SLA=${snapshot.sla}.`,
    },
  ];
}

function buildSummaryPdfContext(snapshot: QuoteSnapshot): SummaryPdfContext {
  const catalogEntry = getProductCatalogEntry(snapshot.sku);
  const intelligence = buildIntelligenceSnapshot();
  const sections = buildSummarySections(snapshot, catalogEntry.name, intelligence);
  const filename = `summary-${snapshot.quoteId}.pdf`;

  return {
    quoteId: snapshot.quoteId,
    sku: snapshot.sku,
    projectName: snapshot.inputs.projectName,
    productName: catalogEntry.name,
    suggestedPriceCny: snapshot.price,
    priceBand: snapshot.priceBand,
    sla: snapshot.sla,
    eligible: snapshot.eligible,
    eligibilityReasons: snapshot.reasons,
    createdAt: snapshot.createdAt,
    sections,
    intelligence,
    pdfMeta: {
      filename,
      mimeType: "application/pdf",
      pageCount: 1,
      byteLength: 0,
    },
  };
}

export function resolveQuoteSnapshotForPdf(input: {
  quoteId: string;
  rebuildRequest?: QuoteSnapshot["inputs"];
}): QuoteSnapshot {
  const cached = getQuoteSnapshotById(input.quoteId);
  if (cached) return cached;

  if (input.rebuildRequest) {
    const quote = createQuote(input.rebuildRequest);
    registerQuoteSnapshot(quote.snapshot);
    return quote.snapshot;
  }

  throw new Error(`Quote snapshot not found for quoteId: ${input.quoteId}`);
}

export async function runSummaryPdfRuntime(request: SummaryPdfRequest): Promise<SummaryPdfResult> {
  const snapshot = loadQuoteSnapshot(request);
  const context = buildSummaryPdfContext(snapshot);
  const { renderSummaryPdf } = await import("./render-summary-pdf");
  const buffer = await renderSummaryPdf(context);

  context.pdfMeta.byteLength = buffer.byteLength;

  return {
    quoteId: context.quoteId,
    sku: context.sku,
    projectName: context.projectName,
    createdAt: context.createdAt,
    buffer,
    pdfMeta: context.pdfMeta,
    context,
  };
}

export function getSummaryPdfRuntimeMeta() {
  return {
    runtimeId: "cp-summary-pdf-runtime-v47-p2-s3",
    version: CP_ACCESS_VERSION,
    mode: CP_ACCESS_CANONICAL_ID,
  };
}
