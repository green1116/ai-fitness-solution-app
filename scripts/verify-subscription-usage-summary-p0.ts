/**
 * WP subscription latency P0 — getUsageSummary parallel aggregates
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== Subscription Usage Summary Latency P0 ===\n");

  const src = fs.readFileSync(
    path.join(ROOT, "lib/usage/usage-aggregator.service.ts"),
    "utf8",
  );

  const fnStart = src.indexOf("export async function getUsageSummary");
  assert(fnStart > 0, "getUsageSummary exported");
  const summary = src.slice(fnStart);

  assert(summary.includes("Promise.all"), "getUsageSummary uses Promise.all");
  assert(
    summary.includes('["QUOTE", "BUDGET", "TENDER", "PDF"]'),
    "usage type order preserved",
  );
  assert(summary.includes("periodStart: from.toISOString()"), "periodStart shape preserved");
  assert(summary.includes("totals"), "totals shape preserved");
  assert(
    !/for\s*\(\s*const type of types\s*\)\s*\{\s*totals\[type\]\s*=\s*await/.test(summary),
    "no sequential await loop over usage types",
  );

  const route = fs.readFileSync(
    path.join(ROOT, "app/api/billing/subscription/route.ts"),
    "utf8",
  );
  assert(route.includes("getUsageSummary"), "subscription route still uses getUsageSummary");
  assert(route.includes("resolveOrganizationFeatures"), "features path unchanged");

  console.log("✓ getUsageSummary parallelized");
  console.log("\nSTATUS: PASS");
}

main();
