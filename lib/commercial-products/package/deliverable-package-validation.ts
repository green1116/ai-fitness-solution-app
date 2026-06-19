import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import type { CommercialDeliverablePackageValidation } from "./deliverable-package-types";
import { CP_PACKAGE_API_PATH } from "./deliverable-package-types";
import { runDeliverablePackageRuntime } from "./deliverable-package-runtime";

const SAMPLE_REQUEST = {
  sku: "kickstart-package" as const,
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium" as const,
  slaTier: "7d" as const,
};

export async function validateCommercialDeliverablePackage(): Promise<CommercialDeliverablePackageValidation> {
  let coverOk = false;
  let summaryOk = false;
  let planOk = false;
  let budgetOk = false;
  let manifestOk = false;
  let zipOk = false;

  try {
    const quote = createQuote(SAMPLE_REQUEST);
    registerQuoteSnapshot(quote.snapshot);

    const result = await runDeliverablePackageRuntime({
      quoteId: quote.snapshot.quoteId,
      snapshot: quote.snapshot,
    });

    coverOk = result.files.some((file) => file.name === "cover.pdf" && file.byteLength > 0);
    summaryOk = result.files.some((file) => file.name === "summary.pdf" && file.byteLength > 0);
    planOk = result.files.some((file) => file.name === "plan.pdf" && file.byteLength > 0);
    budgetOk = result.files.some((file) => file.name === "budget.pdf" && file.byteLength > 0);
    manifestOk =
      result.manifest.includedFiles.length >= 5 &&
      result.manifest.quoteId === quote.snapshot.quoteId &&
      Boolean(result.manifest.generatedAt);
    zipOk =
      result.mimeType === "application/zip" &&
      result.source === "deliverable-package" &&
      result.buffer.byteLength > 0;
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_PACKAGE_API_PATH === "/api/commercial-products/package";
  const valid =
    coverOk && summaryOk && planOk && budgetOk && manifestOk && zipOk && apiPathRegistered;

  return {
    valid,
    coverOk,
    summaryOk,
    planOk,
    budgetOk,
    manifestOk,
    zipOk,
    apiPathRegistered,
    summary: [
      `coverOk=${coverOk}`,
      `summaryOk=${summaryOk}`,
      `planOk=${planOk}`,
      `budgetOk=${budgetOk}`,
      `manifestOk=${manifestOk}`,
      `zipOk=${zipOk}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
