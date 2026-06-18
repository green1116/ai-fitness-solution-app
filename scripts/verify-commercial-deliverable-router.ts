/**
 * V47 Commercial Products — Deliverable Router verification
 */
import {
  createQuote,
  registerQuoteSnapshot,
  routeDeliverablePdf,
  validateCommercialDeliverableRouter,
} from "../lib/commercial-products/access-layer";
import { CP_DELIVERABLE_PDF_API_PATH } from "../lib/commercial-products/access-layer/shared/deliverable-types";

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

  const base = {
    quoteId: quote.snapshot.quoteId,
    snapshot: quote.snapshot,
  };

  const summary = await routeDeliverablePdf({ ...base, type: "summary" });
  assert(summary.source === "summary-pdf", "summary route");
  assert(summary.buffer.byteLength > 0, "summary buffer");
  console.log("✓ summary route ok");
  console.log(`  bytes=${summary.buffer.byteLength}`);

  const plan = await routeDeliverablePdf({ ...base, type: "plan" });
  assert(plan.source === "plan-pdf", "plan route");
  assert(plan.buffer.byteLength > 0, "plan buffer");
  console.log("✓ plan route ok");
  console.log(`  bytes=${plan.buffer.byteLength}`);

  const budget = await routeDeliverablePdf({ ...base, type: "budget" });
  assert(budget.source === "budget-pdf", "budget route");
  assert(budget.buffer.byteLength > 0, "budget buffer");
  console.log("✓ budget route ok");
  console.log(`  bytes=${budget.buffer.byteLength}`);

  const zip = await routeDeliverablePdf({ ...base, type: "zip" });
  assert(zip.source === "zip-package", "zip route");
  assert(zip.mimeType === "application/zip", "zip mime");
  assert(zip.buffer.byteLength > 0, "zip buffer");
  console.log("✓ zip route ok");
  console.log(`  bytes=${zip.buffer.byteLength}`);

  console.log("✓ deliverable router ok");
  console.log(`  quoteId=${quote.snapshot.quoteId}`);

  assert(CP_DELIVERABLE_PDF_API_PATH === "/api/commercial-products/pdf/deliverable", "api route path");
  console.log("✓ api route ok");
  console.log(`  path=${CP_DELIVERABLE_PDF_API_PATH}`);

  const validation = await validateCommercialDeliverableRouter();
  assert(validation.valid, "deliverable router validation");

  console.log("✓ deliverable router validation");
  console.log(`  valid=${validation.valid} summary=${validation.summary}`);
  console.log("DELIVERABLE ROUTER PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
