import { getProductCatalogEntry } from "@/lib/commercial-products/product-catalog/product-catalog";
import { createQuote } from "../quote/quote-service";
import { CP_MIN_SUMMARY_SECTION_COUNT } from "../pdf/summary-pdf-runtime";
import type { CommercialSummaryPdfValidation } from "../pdf/pdf-context";
import { clearQuoteSnapshotRegistry, registerQuoteSnapshot } from "../pdf/quote-snapshot-registry";
import { runSummaryPdfRuntime } from "../pdf/summary-pdf-runtime";

const SAMPLE_REQUEST = {
  sku: "kickstart-package" as const,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

export async function validateCommercialSummaryPdf(): Promise<CommercialSummaryPdfValidation> {
  let snapshotLoaded = false;
  let catalogLoaded = false;
  let sectionCountOk = false;
  let bufferGenerated = false;
  let mimeTypeOk = false;
  let noPlanIdDependency = true;
  let noBudgetIdDependency = true;

  try {
    clearQuoteSnapshotRegistry();
    const quote = createQuote(SAMPLE_REQUEST);
    registerQuoteSnapshot(quote.snapshot);
    snapshotLoaded = Boolean(quote.snapshot.quoteId);

    const catalogEntry = getProductCatalogEntry(quote.snapshot.sku);
    catalogLoaded = Boolean(catalogEntry.name && catalogEntry.sku);

    const result = await runSummaryPdfRuntime({ quoteId: quote.snapshot.quoteId });
    sectionCountOk = result.context.sections.length >= CP_MIN_SUMMARY_SECTION_COUNT;
    bufferGenerated = result.buffer.byteLength > 0;
    mimeTypeOk = result.pdfMeta.mimeType === "application/pdf";

    const serialized = JSON.stringify(result.context);
    noPlanIdDependency = !serialized.includes('"planId"');
    noBudgetIdDependency = !serialized.includes('"budgetId"');
  } catch {
    // flags remain false
  }

  const valid =
    snapshotLoaded &&
    catalogLoaded &&
    sectionCountOk &&
    bufferGenerated &&
    mimeTypeOk &&
    noPlanIdDependency &&
    noBudgetIdDependency;

  return {
    valid,
    snapshotLoaded,
    catalogLoaded,
    sectionCountOk,
    bufferGenerated,
    mimeTypeOk,
    noPlanIdDependency,
    noBudgetIdDependency,
    summary: [
      `snapshotLoaded=${snapshotLoaded}`,
      `catalogLoaded=${catalogLoaded}`,
      `sectionCountOk=${sectionCountOk}`,
      `bufferGenerated=${bufferGenerated}`,
      `mimeTypeOk=${mimeTypeOk}`,
      `noPlanIdDependency=${noPlanIdDependency}`,
      `noBudgetIdDependency=${noBudgetIdDependency}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
