/**
 * V65 P5 — Runtime Risk Gate Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V65_RUNTIME_RISK_LAYER_VERSION,
  assertRuntimeRiskPass,
  buildRuntimeRiskReport,
  isRuntimeRiskGatePass,
  runRuntimeRiskGate,
} from "../lib/production/v65/runtime";
import { normalizeSaasPlan } from "../lib/saas/plan.compat";
import {
  resolveOrganizationDisplayName,
  resolveOrganizationSlug,
} from "../lib/organization/org.compat";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v65-p5-runtime-risk";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/production/v65/runtime.ts",
    "lib/production/v65/runtime.types.ts",
    "lib/production/v65/runtime.mitigations.ts",
    "lib/production/v65/runtime.guards.ts",
    "lib/production/v65/runtime.builder.ts",
    "lib/production/v65/runtime.entry.ts",
    "lib/saas/plan.compat.ts",
    "lib/organization/org.compat.ts",
    "docs/production/V65-RUNTIME-RISK.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V65 runtime risk module structure");
}

function testCompatGuards() {
  assert(normalizeSaasPlan("professional") === "PRO", "plan alias professional");
  assert(normalizeSaasPlan("unknown") === "BASIC", "plan fallback");
  assert(
    resolveOrganizationSlug({ id: "org_abc123", slug: null, name: "Acme Gym" }) === "acme-gym",
    "slug from name",
  );
  assert(
    resolveOrganizationSlug({ id: "org_abc123", slug: null, name: null }) === "org-org_abc1",
    "slug fallback from id",
  );
  assert(
    resolveOrganizationDisplayName(null, "org_abc123") === "Organization org_abc1",
    "display name fallback",
  );
  console.log("✓ compatibility guards");
}

function testRuntimeRiskGate() {
  assert(isRuntimeRiskGatePass(), "runtime risk gate");
  const report = runRuntimeRiskGate({ deploymentId: DEPLOYMENT_ID });
  assert(report.version === V65_RUNTIME_RISK_LAYER_VERSION, "report version");
  assert(report.runtimeRiskOk, "runtime risk ok");
  assert(report.openRiskCount === 0, "no open risks");
  assert(report.mitigations.every((m) => m.mitigated), "all mitigations");

  const asserted = assertRuntimeRiskPass({ deploymentId: DEPLOYMENT_ID });
  assert(asserted.runtimeRiskOk, "assert runtime risk pass");

  console.log("✓ runtime risk gate");
  console.log(" ", buildRuntimeRiskReport({ deploymentId: DEPLOYMENT_ID }).summary);
  console.log("\n✅ V65 P5 Runtime Risk — verify PASS");
}

function main() {
  console.log("V65 P5 Runtime Risk Gate Verification\n");
  checkModuleStructure();
  testCompatGuards();
  testRuntimeRiskGate();
}

main();
