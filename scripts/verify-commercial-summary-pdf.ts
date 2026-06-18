/**
 * V47 Commercial Products — Summary PDF verification
 */
import {
  createQuote,
  registerQuoteSnapshot,
  runSummaryPdfRuntime,
  validateCommercialSummaryPdf,
} from "../lib/commercial-products/access-layer";
import { getProductCatalogEntry } from "../lib/commercial-products/product-catalog/product-catalog";

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

  const catalogEntry = getProductCatalogEntry(quote.snapshot.sku);
  assert(Boolean(catalogEntry.name), "product catalog connected");

  console.log("✓ product catalog connected");
  console.log(`  sku=${catalogEntry.sku} name=${catalogEntry.name}`);

  assert(quote.snapshot.quoteId.length > 0, "quote snapshot connected");

  console.log("✓ quote snapshot connected");
  console.log(`  quoteId=${quote.snapshot.quoteId}`);

  const result = await runSummaryPdfRuntime({ quoteId: quote.snapshot.quoteId });
  assert(result.buffer.byteLength > 0, "pdf buffer generated");
  assert(result.pdfMeta.mimeType === "application/pdf", "pdf mime type");
  assert(result.context.sections.length >= 5, "summary sections");

  console.log("✓ summary runtime ok");
  console.log(`  sections=${result.context.sections.length} quoteId=${result.quoteId}`);

  console.log("✓ summary pdf ok");
  console.log(`  bytes=${result.buffer.byteLength} filename=${result.pdfMeta.filename}`);

  console.log("✓ pdf buffer generated");
  console.log(`  pageCount=${result.pdfMeta.pageCount}`);

  const validation = await validateCommercialSummaryPdf();
  assert(validation.valid, "commercial summary pdf validation");

  console.log("✓ commercial summary pdf validation");
  console.log(`  valid=${validation.valid} summary=${validation.summary}`);
  console.log("SUMMARY PDF PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
