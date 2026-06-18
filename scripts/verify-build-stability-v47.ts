/**
 * V47 → V50 Build Stability verification
 */
import fs from "node:fs";
import path from "node:path";

import { assertPrismaSingleton, getPrismaInitCount, prisma } from "../lib/prisma";
import {
  assertRouteTierSeparation,
  COMMERCIAL_PRODUCTS_ROUTE_TIERS,
  getRouteTier,
} from "../lib/runtime/route-tier-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`BUILD_STABILITY: ${msg}`);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function checkPrismaSingleton() {
  assert(getPrismaInitCount() <= 1, "prisma multi-init");
  assert(assertPrismaSingleton(), "prisma singleton guard");
  assert(prisma !== undefined, "prisma exported");
  console.log("✓ no prisma multi-init");
  console.log(`  initCount=${getPrismaInitCount()}`);
}

function checkPdfLazyLoading() {
  const root = path.resolve(__dirname, "..");
  const heavyRoute = readText(
    path.join(root, "app/api/commercial-products/pdf/summary/route.ts"),
  );
  const summaryRuntime = readText(
    path.join(root, "lib/commercial-products/access-layer/pdf/summary-pdf-runtime.ts"),
  );
  const pdfRoute = readText(path.join(root, "app/api/pdf/route.ts"));
  const quoteRoute = readText(path.join(root, "app/api/commercial-products/quote/route.ts"));

  assert(heavyRoute.includes("heavy-summary-pdf"), "summary route uses heavy lazy loader");
  assert(!heavyRoute.includes('from "@/lib/commercial-products/access-layer"'), "summary route avoids access-layer barrel");
  assert(summaryRuntime.includes('await import("./render-summary-pdf")'), "summary runtime lazy loads renderer");
  assert(pdfRoute.includes("loadBudgetPdfRenderer"), "pdf route lazy loads budget renderer");
  assert(pdfRoute.includes("loadPlanPdfRenderer"), "pdf route lazy loads plan renderer");
  assert(quoteRoute.includes("access-layer/light"), "quote route uses light access layer");

  console.log("✓ no pdf import at build time (commercial heavy routes)");
}

function checkRouteSeparation() {
  assert(assertRouteTierSeparation(), "route tier separation");
  const catalogTier = getRouteTier("/api/commercial-products/catalog");
  const quoteTier = getRouteTier("/api/commercial-products/quote");
  const summaryTier = getRouteTier("/api/commercial-products/pdf/summary");
  assert(catalogTier === "light", "catalog is light");
  assert(quoteTier === "light", "quote is light");
  assert(summaryTier === "heavy", "summary is heavy");
  console.log("✓ route separation valid");
  console.log(`  tiers=${COMMERCIAL_PRODUCTS_ROUTE_TIERS.length}`);
}

function checkBuildConfig() {
  const pkg = JSON.parse(readText(path.join(__dirname, "../package.json"))) as {
    scripts?: Record<string, string>;
  };
  const buildScript = pkg.scripts?.build ?? "";
  assert(buildScript.includes("--max-old-space-size=8192"), "build memory limit configured");
  assert(buildScript.includes("next build"), "next build configured");
  console.log("✓ build memory stable config");
}

function checkRuntimePolicyFiles() {
  const root = path.resolve(__dirname, "..");
  const routes = [
    "app/api/commercial-products/catalog/route.ts",
    "app/api/commercial-products/quote/route.ts",
    "app/api/commercial-products/pdf/summary/route.ts",
  ];

  for (const routePath of routes) {
    const content = readText(path.join(root, routePath));
    assert(content.includes('export { runtime, dynamic }'), `runtime policy: ${routePath}`);
    assert(fs.existsSync(path.join(root, routePath)), `route exists: ${routePath}`);
  }

  console.log("✓ nodejs runtime isolation (commercial-products)");
}

async function checkSummaryPdfRuntime() {
  const { createQuote, registerQuoteSnapshot, runSummaryPdfRuntime } = await import(
    "../lib/commercial-products/access-layer"
  );

  const quote = createQuote({
    sku: "kickstart-package",
    projectName: "Build Stability Sample",
    areaSqm: 320,
    headcount: 180,
    budgetCny: 650_000,
    complexity: "medium",
    slaTier: "7d",
  });
  registerQuoteSnapshot(quote.snapshot);

  const result = await runSummaryPdfRuntime({ quoteId: quote.snapshot.quoteId });
  assert(result.buffer.byteLength > 0, "summary pdf buffer");
  assert(result.pdfMeta.mimeType === "application/pdf", "summary pdf mime");

  console.log("✓ summary pdf runtime ok");
  console.log(`  bytes=${result.buffer.byteLength}`);
}

async function main() {
  checkPrismaSingleton();
  checkPdfLazyLoading();
  checkRouteSeparation();
  checkBuildConfig();
  checkRuntimePolicyFiles();
  await checkSummaryPdfRuntime();
  console.log("BUILD STABILITY PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
