/**
 * Pilot P19 — Integration & Production Hardening verification
 */
import {
  PRODUCTION_HARDENING_VERSION,
  clearContinuousImprovementStoreForTests,
  clearIntakeStoreForTests,
  clearKnowledgeRecommendationStoreForTests,
  clearOrgKnowledgeGovernanceForTests,
  clearOrgKnowledgeStoreForTests,
  exportProductionHardeningJson,
  listRegressionSuiteCatalog,
  runProductionHardeningChecks,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== Pilot P19 / Integration & Production Hardening ===\n");
  clearIntakeStoreForTests();
  clearOrgKnowledgeStoreForTests();
  clearOrgKnowledgeGovernanceForTests();
  clearKnowledgeRecommendationStoreForTests();
  clearContinuousImprovementStoreForTests();

  const catalog = listRegressionSuiteCatalog();
  assert(catalog.length === 18, "18 regression scripts cataloged");
  assert(catalog.every((e) => e.present), "all P1-P18 scripts present");
  console.log("PASS Regression catalog");

  const report = runProductionHardeningChecks({
    organizationId: "org-p19-harden",
    seedDemoData: true,
  });

  assert(report.version === PRODUCTION_HARDENING_VERSION, "version");
  assert(report.checks.length >= 10, "enough checks");
  assert(report.summary.total === report.checks.length, "summary total");
  assert(report.summary.failed === 0, `no failures: ${report.narrative.blockers.join("; ")}`);
  assert(report.band === "ready" || report.band === "conditional", "band not blocked");
  assert(report.coverage.apiRoutesFound === report.coverage.apiRoutesExpected, "api coverage");
  assert(report.coverage.uiPagesFound === report.coverage.uiPagesExpected, "ui coverage");
  assert(report.coverage.navLinksFound === report.coverage.navLinksExpected, "nav coverage");
  assert(
    report.coverage.verifyScriptsFound === report.coverage.verifyScriptsExpected,
    "script coverage",
  );
  assert(report.contentHash.length === 64, "hash");
  assert(report.narrative.headline.length > 0, "headline");
  console.log("PASS Hardening checks + coverage");

  const again = runProductionHardeningChecks({
    organizationId: "org-p19-harden",
    seedDemoData: true,
  });
  // Band/summary should stay non-blocked; session counts may grow but coverage checks stable
  assert(again.summary.failed === 0, "second run no failures");
  assert(again.coverage.apiRoutesFound === report.coverage.apiRoutesFound, "stable api coverage");
  console.log("PASS Repeatable hardening run");

  const exported = exportProductionHardeningJson(report);
  assert(exported.fileName.includes("production-hardening"), "export name");
  assert(JSON.parse(exported.body).summary.passed === report.summary.passed, "export body");
  console.log("PASS Export report");

  const failedChecks = report.checks.filter((c) => c.status === "fail");
  if (failedChecks.length) {
    console.error(failedChecks);
  }
  assert(failedChecks.length === 0, "zero fail checks");

  console.log("\n=== ALL P19 CHECKS PASSED ===");
  console.log(`Readiness band: ${report.band} · passRate ${(report.summary.passRate * 100).toFixed(0)}%`);
}

main();
