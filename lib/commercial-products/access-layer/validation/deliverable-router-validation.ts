import { CP_DELIVERABLE_PDF_API_PATH } from "../shared/deliverable-types";
import { createQuote } from "../quote/quote-service";
import type { CommercialDeliverableRouterValidation } from "../pdf/deliverable-pdf-types";
import { runDeliverablePdfRuntime } from "../pdf/deliverable-pdf-runtime";
import { clearQuoteSnapshotRegistry, registerQuoteSnapshot } from "../pdf/quote-snapshot-registry";

const SAMPLE_REQUEST = {
  sku: "kickstart-package" as const,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

export async function validateCommercialDeliverableRouter(): Promise<CommercialDeliverableRouterValidation> {
  let summaryRouteOk = false;
  let planRouteOk = false;
  let budgetRouteOk = false;
  let zipRouteOk = false;

  try {
    clearQuoteSnapshotRegistry();
    const quote = createQuote(SAMPLE_REQUEST);
    registerQuoteSnapshot(quote.snapshot);

    const base = {
      quoteId: quote.snapshot.quoteId,
      snapshot: quote.snapshot,
    };

    const summary = await runDeliverablePdfRuntime({ ...base, type: "summary" });
    summaryRouteOk =
      summary.source === "summary-pdf" &&
      summary.mimeType === "application/pdf" &&
      summary.buffer.byteLength > 0;

    const plan = await runDeliverablePdfRuntime({ ...base, type: "plan" });
    planRouteOk =
      plan.source === "plan-pdf" &&
      plan.mimeType === "application/pdf" &&
      plan.buffer.byteLength > 0;

    const budget = await runDeliverablePdfRuntime({ ...base, type: "budget" });
    budgetRouteOk =
      budget.source === "budget-pdf" &&
      budget.mimeType === "application/pdf" &&
      budget.buffer.byteLength > 0;

    const zip = await runDeliverablePdfRuntime({ ...base, type: "zip" });
    zipRouteOk =
      zip.source === "zip-package" &&
      zip.mimeType === "application/zip" &&
      zip.buffer.byteLength > 0;
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_DELIVERABLE_PDF_API_PATH === "/api/commercial-products/pdf/deliverable";
  const valid =
    summaryRouteOk && planRouteOk && budgetRouteOk && zipRouteOk && apiPathRegistered;

  return {
    valid,
    summaryRouteOk,
    planRouteOk,
    budgetRouteOk,
    zipRouteOk,
    apiPathRegistered,
    summary: [
      `summaryRouteOk=${summaryRouteOk}`,
      `planRouteOk=${planRouteOk}`,
      `budgetRouteOk=${budgetRouteOk}`,
      `zipRouteOk=${zipRouteOk}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
