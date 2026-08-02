/**
 * WP-11 / FEAT-17 — Share Budget Package verification.
 * Available package → Share Started via existing download-token API.
 */
import {
  FEAT_17_ID,
  generateBudgetPackage,
  runBudgetEngine,
  SHARE_BUDGET_PACKAGE_CAPABILITY,
  shareBudgetPackage,
  toBudgetPackageAvailable,
  toBudgetReadyState,
} from "../lib/product-engine";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== WP-11 FEAT-17 / Share Budget Package ===");

  const engine = runBudgetEngine({
    quoteId: "quote-wp11",
    workspaceId: "ws-wp11",
    companySize: 35,
    budgetTier: "mid",
  });
  const ready = toBudgetReadyState("budget-wp11", engine);
  const generated = generateBudgetPackage(ready);
  const available = toBudgetPackageAvailable(generated);
  assert(available.generationStatus === "GENERATED", "Budget Package Available");
  console.log("PASS Budget Package Available accepted");

  let fetchedUrl = "";
  let fetchedMethod = "";
  const result = await shareBudgetPackage({
    available,
    fetchImpl: (async (input, init) => {
      fetchedUrl = String(input);
      fetchedMethod = String(init?.method ?? "GET");
      return Response.json({
        ok: true,
        downloadToken: "share-token-wp11",
        mode: "budget",
      });
    }) as typeof fetch,
  });

  assert(result.shareStarted === true, "Share Started");
  assert(result.packageId === available.packageId, "same packageId");
  assert(result.featId === FEAT_17_ID, "FEAT-17");
  assert(
    result.capability === SHARE_BUDGET_PACKAGE_CAPABILITY,
    "ShareBudgetPackage",
  );
  assert(result.httpInvoked === true, "httpInvoked");
  assert(result.httpMethod === "GET", "GET");
  assert(fetchedMethod === "GET", "fetched GET");
  assert(fetchedUrl.startsWith("/api/download-token"), `url=${fetchedUrl}`);
  assert(fetchedUrl.includes("mode=budget"), "mode=budget share surface");
  assert(fetchedUrl.includes("planId=budget-wp11"), "planId from budget");
  assert(result.downloaded === false, "No Download");
  assert(result.emailed === false, "No Email sending");
  assert(result.zipExported === false, "No ZIP Export");
  assert(result.packageGenerated === false, "No Package generation");
  console.log("PASS Share Budget Package → Share Started");

  let rejected = false;
  try {
    await shareBudgetPackage({
      available: {
        ...available,
        generationStatus: "FAILED" as "GENERATED",
      },
      fetchImpl: (async () =>
        Response.json({ ok: true })) as typeof fetch,
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "rejects non-available package");
  console.log("PASS non-available package rejected");

  console.log("");
  console.log("PASS FEAT-17 Share Budget Package");
  console.log("WP-11 verification complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
