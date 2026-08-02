/**
 * WP-10 / FEAT-16 — Download Budget Package verification.
 * Available package → Download Started via existing budget PDF API.
 */
import {
  DOWNLOAD_BUDGET_PACKAGE_CAPABILITY,
  downloadBudgetPackage,
  FEAT_16_ID,
  generateBudgetPackage,
  runBudgetEngine,
  toBudgetPackageAvailable,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-10 FEAT-16 / Download Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp10",
    workspaceId: "ws-wp10",
    companySize: 40,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp10", engine);
  const generated = generateBudgetPackage(ready);
  const available = toBudgetPackageAvailable(generated);
  assert(available.generationStatus === "GENERATED", "Budget Package Available");
  assert(available.packageId.length > 0, "available packageId");
  console.log("PASS Budget Package Available accepted");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await downloadBudgetPackage({
    available,
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      });
    }) as typeof fetch,
  });

  assert(result.downloadStarted === true, "Download Started");
  assert(result.packageId === available.packageId, "same packageId");
  assert(result.featId === FEAT_16_ID, "FEAT-16");
  assert(
    result.capability === DOWNLOAD_BUDGET_PACKAGE_CAPABILITY,
    "DownloadBudgetPackage",
  );
  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.httpMethod === "GET", "GET");
  assert(fetchedMethod === "GET", "fetched GET");
  assert(fetchedUrl.startsWith("/api/v80/pdf"), `url=${fetchedUrl}`);
  assert(fetchedUrl.includes("type=budget"), "reuses type=budget API");
  assert(fetchedUrl.includes("budgetId=budget-wp10"), "budgetId query");
  assert(result.shared === false, "No Share");
  assert(result.emailed === false, "No Email");
  assert(result.zipExported === false, "No ZIP Export");
  assert(result.packageGenerated === false, "No Package generation");
  console.log("PASS Download Budget Package → Download Started");

  let rejected = false;
  try {
    await downloadBudgetPackage({
      available: {
        ...available,
        generationStatus: "FAILED" as "GENERATED",
      },
      fetchImpl: (async () => new Response(null, { status: 200 })) as typeof fetch,
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects non-available package");
  console.log("PASS non-available package rejected");

  console.log("");
  console.log("PASS FEAT-16 Download Budget Package");
  console.log("WP-10 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
