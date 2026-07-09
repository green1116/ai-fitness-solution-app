/**
 * V80 CODE P4 — Production release verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertCodeReleasePass,
  buildCodeRelease,
  formatCodeReleaseSummary,
  RELEASE_OPS_REGISTRY,
} from "../lib/code/v80/release.entry";
import { buildV80DeploymentBinding } from "../lib/scaffold/v80/ops/deployment.model";
import { enforceV80CommercialGate, mapUsageToCharge } from "../lib/scaffold/v80/ops/commercial";
import { getV80MetricsSnapshot, percentile, recordV80Request, resetV80MetricsForTests } from "../lib/scaffold/v80/ops/observability";
import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { calculateBudgetScaffold } from "../lib/scaffold/v80/services/budget.service";
import { createTenderFromIntake } from "../lib/scaffold/v80/services/tender-intake.service";
import { V80RuntimeError } from "../lib/scaffold/v80/runtime/errors";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOpsModulesOnDisk() {
  for (const mod of RELEASE_OPS_REGISTRY) {
    if (mod.path.startsWith("app/")) continue;
    check(fs.existsSync(path.join(ROOT, mod.path)), `missing ops: ${mod.path}`);
  }
  console.log("✓ ops modules on disk");
}

function testDeploymentBinding() {
  const binding = buildV80DeploymentBinding("v80-p4");
  check(binding.routes.length === 8, "8 route bindings");
  check(binding.queue.pdfMaxConcurrentPerOrg === 2, "pdf worker concurrency");
  console.log("✓ deployment model");
}

function testObservability() {
  resetV80MetricsForTests();
  const samples = [10, 20, 30, 40, 100, 200];
  for (const ms of samples) {
    recordV80Request({
      endpoint: "/api/v80/test",
      traceId: "t1",
      correlationId: "c1",
      durationMs: ms,
      status: 200,
    });
  }
  const snap = getV80MetricsSnapshot();
  check(snap.endpoints["/api/v80/test"]?.p95 >= 40, "p95 captured");
  check(percentile(samples, 99) >= 100, "p99 calc");
  console.log("✓ observability");
}

async function testCommercial() {
  const tenant = await provisionTenant({
    organizationName: `P4 Commercial ${Date.now()}`,
    plan: "BASIC",
    adminEmail: "p4@test.local",
  });
  const intake = await createTenderFromIntake({
    projectId: tenant.workspaceId,
    tenderType: "enterprise-gym",
  });

  let denied = false;
  try {
    await enforceV80CommercialGate({
      endpoint: "/api/v80/budget/calculate",
      organizationId: tenant.organizationId,
      traceId: "t-budget",
      correlationId: "c-budget",
    });
  } catch (e) {
    denied = e instanceof V80RuntimeError && e.code === "FEATURE_GATE";
  }
  check(denied, "BASIC budget gated");

  const charge = mapUsageToCharge({ usageType: "TENDER", units: 1, plan: "PRO" });
  check(charge.chargeCents === 200, "usage→charge mapping");
  console.log("✓ commercial runtime");

  await calculateBudgetScaffold({
    quoteId: intake.quoteId,
    companySize: 10,
    budgetTier: "low",
    organizationId: tenant.organizationId,
  }).catch(() => undefined);
}

function testReleaseReport() {
  const report = buildCodeRelease({ deploymentId: "v80-code-p4-release" });
  check(report.manifest.commercialGates === 8, "8 commercial gates");
  assertCodeReleasePass(report);
  console.log("✓ release report");
  console.log(formatCodeReleaseSummary(report));
  console.log("\n✅ V80 CODE P4 Release — verify PASS");
}

async function main() {
  console.log("V80 CODE P4 Production Release Verification\n");
  testOpsModulesOnDisk();
  testDeploymentBinding();
  testObservability();
  await testCommercial();
  testReleaseReport();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
