/**
 * V47 Commercial Products — Deliverable Package verification
 */
import {
  buildDeliverablePackage,
  validateCommercialDeliverablePackage,
} from "../lib/commercial-products/package";
import { CP_PACKAGE_API_PATH } from "../lib/commercial-products/package/deliverable-package-types";
import { createQuote } from "../lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "../lib/commercial-products/access-layer/pdf/quote-snapshot-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const sampleRequest = {
    sku: "kickstart-package" as const,
    projectName: "School Gym Project",
    areaSqm: 320,
    headcount: 180,
    budgetCny: 650_000,
    complexity: "medium" as const,
    slaTier: "7d" as const,
  };

  const quote = createQuote(sampleRequest);
  registerQuoteSnapshot(quote.snapshot);

  const result = await buildDeliverablePackage({
    quoteId: quote.snapshot.quoteId,
    snapshot: quote.snapshot,
  });

  assert(result.files.some((file) => file.name === "cover.pdf"), "cover file");
  console.log("✓ cover ok");
  console.log(`  bytes=${result.files.find((file) => file.name === "cover.pdf")?.byteLength ?? 0}`);

  assert(result.files.some((file) => file.name === "summary.pdf"), "summary file");
  console.log("✓ summary ok");

  assert(result.files.some((file) => file.name === "plan.pdf"), "plan file");
  console.log("✓ plan ok");

  assert(result.files.some((file) => file.name === "budget.pdf"), "budget file");
  console.log("✓ budget ok");

  assert(result.manifest.includedFiles.length >= 5, "manifest files");
  assert(result.manifest.quoteId === quote.snapshot.quoteId, "manifest quoteId");
  console.log("✓ manifest ok");
  console.log(`  files=${result.manifest.includedFiles.length}`);

  assert(result.mimeType === "application/zip", "zip mime");
  assert(result.buffer.byteLength > 0, "zip buffer");
  console.log("✓ zip ok");
  console.log(`  bytes=${result.buffer.byteLength}`);

  console.log("✓ deliverable package ok");
  console.log(`  quoteId=${quote.snapshot.quoteId}`);

  assert(CP_PACKAGE_API_PATH === "/api/commercial-products/package", "api route path");
  console.log("✓ api route ok");
  console.log(`  path=${CP_PACKAGE_API_PATH}`);

  const validation = await validateCommercialDeliverablePackage();
  assert(validation.valid, "deliverable package validation");

  console.log("✓ deliverable package validation");
  console.log(`  valid=${validation.valid} summary=${validation.summary}`);
  console.log("DELIVERABLE PACKAGE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
