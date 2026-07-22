/**
 * Evolution P8 — Evolution Governance Freeze verification
 * Freeze Evolution P1–P7 into evolution complete baseline
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { OPERATIONS_GOVERNANCE_COMPLETE_ID } from "../lib/operations/signoff/governance.freeze.lock";
import { EVOLUTION_CONTROL_PLANE_ID } from "../lib/evolution/control/control.constants";
import { EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID } from "../lib/evolution/customer/customer.constants";
import { EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID } from "../lib/evolution/dashboard/dashboard.constants";
import { EVOLUTION_AI_OPS_OPTIMIZATION_ID } from "../lib/evolution/evolution.constants";
import { EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID } from "../lib/evolution/global/global.constants";
import { EVOLUTION_MARKETPLACE_ECOSYSTEM_ID } from "../lib/evolution/marketplace/marketplace.constants";
import { EVOLUTION_PREDICTIVE_INTELLIGENCE_ID } from "../lib/evolution/predictive/predictive.constants";
import {
  assertEvolutionP8FinalVerificationPass,
  runEvolutionP8FinalVerification,
} from "../lib/evolution/signoff/final.verification";
import {
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
  EVOLUTION_P8_COMPONENT_LOCK,
  EVOLUTION_P8_EXPECTED_BASE_CHAIN,
  EVOLUTION_P8_FREEZE_LOCK,
  EVOLUTION_P8_GOVERNANCE_BASE,
  EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION,
  EVOLUTION_P8_SIGNOFF_VERSION,
  isEvolutionP8FreezeLockIntact,
  evolutionP8FreezeLockMatchesExpected,
  validateEvolutionP8DependencyChain,
} from "../lib/evolution/signoff/governance.freeze.lock";
import { assertEvolutionP8ReleaseGatePass } from "../lib/evolution/signoff/governance.release.gate";
import { assertEvolutionImmutableManifestFrozen } from "../lib/evolution/signoff/immutable.manifest";
import {
  buildEvolutionRollbackSnapshotIndex,
  getEvolutionRollbackSnapshotByLayer,
  EVOLUTION_ROLLBACK_SNAPSHOT_INDEX,
} from "../lib/evolution/signoff/rollback.snapshot.index";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "evolution-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/evolution/signoff/governance.freeze.lock.ts",
    "lib/evolution/signoff/governance.release.gate.ts",
    "lib/evolution/signoff/immutable.manifest.ts",
    "lib/evolution/signoff/rollback.snapshot.index.ts",
    "lib/evolution/signoff/final.verification.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_P8_GOVERNANCE_FREEZE_VERSION ===
      "evolution-p8-evolution-governance-freeze-1",
    "p8 freeze version",
  );
  check(
    EVOLUTION_P8_SIGNOFF_VERSION === "evolution-p8-signoff-1",
    "p8 signoff",
  );
  check(
    EVOLUTION_P8_GOVERNANCE_BASE ===
      "enterprise-evolution-p7-evolution-control-plane-v1",
    "p8 governance base",
  );
  check(
    EVOLUTION_GOVERNANCE_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete id",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete alias",
  );
  check(
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
      "enterprise-post-launch-operations-complete-v1",
    "operations complete integrated",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete integrated",
  );
  check(
    EVOLUTION_P8_FREEZE_LOCK.operationsBaseline ===
      OPERATIONS_GOVERNANCE_COMPLETE_ID,
    "freeze lock operations baseline",
  );
  check(
    EVOLUTION_P8_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID,
    "freeze lock launch baseline",
  );
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_ID ===
      "enterprise-evolution-p1-ai-operations-optimization-v1",
    "p1 id preserved",
  );
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_ID ===
      "enterprise-evolution-p2-predictive-intelligence-v1",
    "p2 id preserved",
  );
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID ===
      "enterprise-evolution-p3-autonomous-customer-success-v1",
    "p3 id preserved",
  );
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID ===
      "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1",
    "p4 id preserved",
  );
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID ===
      "enterprise-evolution-p5-global-deployment-network-v1",
    "p5 id preserved",
  );
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_ID ===
      "enterprise-evolution-p6-marketplace-ecosystem-v1",
    "p6 id preserved",
  );
  check(
    EVOLUTION_CONTROL_PLANE_ID ===
      "enterprise-evolution-p7-evolution-control-plane-v1",
    "p7 id preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(EVOLUTION_P8_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    EVOLUTION_P8_EXPECTED_BASE_CHAIN.p1 === OPERATIONS_GOVERNANCE_COMPLETE_ID,
    "expected chain p1 = operations complete",
  );

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkLockAndChain() {
  check(isEvolutionP8FreezeLockIntact(), "freeze lock intact");
  check(evolutionP8FreezeLockMatchesExpected(), "freeze lock matches");
  const chain = validateEvolutionP8DependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  console.log("✓ freeze lock + dependency chain");
}

function checkRollback() {
  const rollback = buildEvolutionRollbackSnapshotIndex();
  check(rollback.indexComplete === true, "rollback index complete");
  check(EVOLUTION_ROLLBACK_SNAPSHOT_INDEX.length === 8, "rollback entries");
  check(!!getEvolutionRollbackSnapshotByLayer("P7"), "rollback p7 entry");
  console.log("✓ rollback snapshot index");
}

function checkFinal() {
  const result = runEvolutionP8FinalVerification({
    deploymentId: DEPLOYMENT_ID,
    pathExists,
  });
  check(result.ok === true, `final verification: ${result.summary}`);
  assertEvolutionP8FinalVerificationPass(result);
  assertEvolutionP8ReleaseGatePass(result.gate);
  assertEvolutionImmutableManifestFrozen(result.manifest);
  console.log("✓ final verification PASS");
  console.log(`  ${result.summary}`);
  console.log(`  gate: ${result.gate.summary}`);
}

function main() {
  console.log("=== Evolution P8 Evolution Governance Freeze ===");
  checkModules();
  checkConstants();
  checkLockAndChain();
  checkRollback();
  checkFinal();
  console.log("ALL PASS");
}

main();
