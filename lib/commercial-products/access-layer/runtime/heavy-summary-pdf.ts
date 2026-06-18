import type { SummaryPdfRequest, SummaryPdfResult } from "../pdf/pdf-context";

/**
 * Heavy PDF runtime — dynamic import only. Do not import from API route top-level.
 */
export async function runSummaryPdfRuntimeHeavy(
  request: SummaryPdfRequest,
): Promise<SummaryPdfResult> {
  const { runSummaryPdfRuntime } = await import("../pdf/summary-pdf-runtime");
  return runSummaryPdfRuntime(request);
}

export async function resolveQuoteSnapshotForPdfHeavy(
  input: Parameters<
    Awaited<typeof import("../pdf/summary-pdf-runtime")>["resolveQuoteSnapshotForPdf"]
  >[0],
) {
  const { resolveQuoteSnapshotForPdf } = await import("../pdf/summary-pdf-runtime");
  return resolveQuoteSnapshotForPdf(input);
}

export async function registerQuoteSnapshotHeavy(
  snapshot: Parameters<
    Awaited<typeof import("../pdf/quote-snapshot-registry")>["registerQuoteSnapshot"]
  >[0],
) {
  const { registerQuoteSnapshot } = await import("../pdf/quote-snapshot-registry");
  return registerQuoteSnapshot(snapshot);
}
