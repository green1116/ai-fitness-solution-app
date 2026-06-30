/**
 * V65 P1 — Production Readiness Audit Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  BUILD_BLOCKER_INVENTORY,
  LEGACY_ISSUE_INVENTORY,
  PRISMA_BLOCKED_OPERATIONS,
  RUNTIME_BLOCKER_INVENTORY,
  V65_PRODUCTION_AUDIT_VERSION,
  auditDependencies,
  buildProductionReadinessReport,
  formatProductionReadinessSummary,
  runProductionReadinessAudit,
} from "../lib/production/v65";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v65-p1-production-audit";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/production/v65/index.ts",
    "lib/production/v65/audit.ts",
    "lib/production/v65/audit.types.ts",
    "lib/production/v65/audit.inventory.ts",
    "lib/production/v65/audit.blockers.ts",
    "lib/production/v65/audit.runtime.ts",
    "lib/production/v65/audit.dependencies.ts",
    "lib/production/v65/audit.checklist.ts",
    "lib/production/v65/audit.builder.ts",
    "lib/production/v65/audit.entry.ts",
    "docs/production/V65-PRODUCTION-AUDIT.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V65 production audit module structure");
}

function testInventory() {
  assert(LEGACY_ISSUE_INVENTORY.length >= 8, "legacy issue inventory");
  assert(BUILD_BLOCKER_INVENTORY.length >= 3, "build blockers");
  assert(RUNTIME_BLOCKER_INVENTORY.length >= 5, "runtime blockers");
  assert(PRISMA_BLOCKED_OPERATIONS.length === 19, "prisma blocked ops count");
  console.log("✓ legacy, build & runtime inventories");
}

function testReport() {
  const historical = runProductionReadinessAudit({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: false,
      buildPass: false,
      prismaPreflightPass: false,
    },
  });
  assert(!historical.productionReady, "historical signals not production ready");

  const ready = runProductionReadinessAudit({
    deploymentId: DEPLOYMENT_ID,
    signals: {
      verifyChainPass: true,
      typeScriptClean: true,
      buildPass: true,
      prismaPreflightPass: true,
    },
  });

  assert(ready.version === V65_PRODUCTION_AUDIT_VERSION, "audit version");
  assert(ready.repository.commercialLayerFrozen, "commercial frozen");
  assert(ready.legacyIssues.length === LEGACY_ISSUE_INVENTORY.length, "legacy issues in report");
  assert(ready.checklist.length >= 10, "release checklist");
  assert(ready.dependencies.productionCount > 0, "dependency audit");
  assert(ready.productionReady, "production ready with resolved blockers");
  assert(ready.readinessScore === 100, "readiness score 100");
  assert(ready.blockerCount === 0, "no open blockers");

  const deps = auditDependencies();
  assert(deps.lockfilePresent, "lockfile present");

  const built = buildProductionReadinessReport({ deploymentId: DEPLOYMENT_ID });
  assert(built.reportId.includes(DEPLOYMENT_ID), "report id");

  console.log("✓ production readiness report");
  console.log(formatProductionReadinessSummary(ready));
  console.log("\n✅ V65 P1 Production Readiness Audit — verify PASS");
}

function main() {
  console.log("V65 P1 Production Readiness Audit Verification\n");
  checkModuleStructure();
  testInventory();
  testReport();
}

main();
