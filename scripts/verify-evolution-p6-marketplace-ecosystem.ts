/**
 * Evolution P6 — Marketplace Ecosystem verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
} from "../lib/launch/signoff/governance.freeze.lock";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../lib/operations/signoff/governance.freeze.lock";
import { EVOLUTION_AI_OPS_OPTIMIZATION_ID } from "../lib/evolution/evolution.constants";
import { EVOLUTION_PREDICTIVE_INTELLIGENCE_ID } from "../lib/evolution/predictive/predictive.constants";
import { EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID } from "../lib/evolution/customer/customer.constants";
import { EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID } from "../lib/evolution/dashboard/dashboard.constants";
import {
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
} from "../lib/evolution/global/global.constants";
import {
  EXTENSION_KINDS,
  EXTENSION_STATUSES,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION,
  EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
  INTEGRATION_CATEGORIES,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_READINESS_VERDICTS,
  MARKETPLACE_STATUSES,
  PARTNER_STATUSES,
  PARTNER_TIERS,
} from "../lib/evolution/marketplace/marketplace.constants";
import {
  assertEvolutionP6ReleaseGatePass,
  checkEvolutionP6ReleaseGate,
} from "../lib/evolution/marketplace/verify/marketplace.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/marketplace/marketplace.constants.ts",
    "lib/evolution/marketplace/marketplace.types.ts",
    "lib/evolution/marketplace/marketplace.model.ts",
    "lib/evolution/marketplace/marketplace.partner.ts",
    "lib/evolution/marketplace/marketplace.extension.ts",
    "lib/evolution/marketplace/marketplace.integration.ts",
    "lib/evolution/marketplace/marketplace.analytics.ts",
    "lib/evolution/marketplace/marketplace.readiness.ts",
    "lib/evolution/marketplace/marketplace.manager.ts",
    "lib/evolution/marketplace/verify/marketplace.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_ID ===
      "enterprise-evolution-p6-marketplace-ecosystem-v1",
    "marketplace ecosystem id",
  );
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_VERSION === "evolution-p6-1",
    "marketplace ecosystem version",
  );
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_FREEZE_VERSION ===
      "evolution-marketplace-ecosystem-freeze-1",
    "marketplace ecosystem freeze",
  );
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE ===
      EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
    "marketplace base = p5 global deployment",
  );
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID ===
      "enterprise-evolution-p5-global-deployment-network-v1",
    "p5 freeze preserved",
  );
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID ===
      "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1",
    "p4 freeze preserved",
  );
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID ===
      "enterprise-evolution-p3-autonomous-customer-success-v1",
    "p3 freeze preserved",
  );
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_ID ===
      "enterprise-evolution-p2-predictive-intelligence-v1",
    "p2 freeze preserved",
  );
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_ID ===
      "enterprise-evolution-p1-ai-operations-optimization-v1",
    "p1 freeze preserved",
  );
  check(
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
      "enterprise-post-launch-operations-complete-v1",
    "operations complete freeze preserved",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete alias preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias preserved",
  );
  check(
    LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID ===
      "enterprise-launch-commercial-release-complete-v1",
    "commercial release complete preserved",
  );
  check(
    EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION ===
      "evolution-p6-marketplace-ecosystem-freeze-1",
    "p6 freeze",
  );
  check(
    EVOLUTION_P5_GLOBAL_FREEZE_VERSION ===
      "evolution-p5-global-deployment-network-freeze-1",
    "p5 freeze tag preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(MARKETPLACE_STATUSES.length === 4, "marketplace statuses");
  check(PARTNER_TIERS.length === 4, "partner tiers");
  check(PARTNER_STATUSES.length === 4, "partner statuses");
  check(EXTENSION_KINDS.length === 4, "extension kinds");
  check(EXTENSION_STATUSES.length === 3, "extension statuses");
  check(INTEGRATION_CATEGORIES.length === 5, "integration categories");
  check(MARKETPLACE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(MARKETPLACE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP6ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P6 Marketplace Ecosystem ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
