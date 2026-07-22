/**
 * Evolution P5 — Global Deployment Network verification
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
import {
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_P4_DASHBOARD_FREEZE_VERSION,
} from "../lib/evolution/dashboard/dashboard.constants";
import {
  DEPLOYMENT_INTELLIGENCE_MODES,
  DEPLOYMENT_OPTIMIZATION_ACTIONS,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
  EVOLUTION_P5_GLOBAL_FREEZE_VERSION,
  GLOBAL_MANAGER_STATUSES,
  GLOBAL_READINESS_VERDICTS,
  GLOBAL_REGIONS,
  REGION_ROLES,
  REGIONAL_HEALTH_LEVELS,
  ROUTING_STRATEGIES,
} from "../lib/evolution/global/global.constants";
import {
  assertEvolutionP5ReleaseGatePass,
  checkEvolutionP5ReleaseGate,
} from "../lib/evolution/global/verify/global.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/global/global.constants.ts",
    "lib/evolution/global/global.types.ts",
    "lib/evolution/global/global.region.ts",
    "lib/evolution/global/global.deployment.ts",
    "lib/evolution/global/global.health.ts",
    "lib/evolution/global/global.routing.ts",
    "lib/evolution/global/global.optimization.ts",
    "lib/evolution/global/global.readiness.ts",
    "lib/evolution/global/global.manager.ts",
    "lib/evolution/global/verify/global.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID ===
      "enterprise-evolution-p5-global-deployment-network-v1",
    "global deployment network id",
  );
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION === "evolution-p5-1",
    "global deployment network version",
  );
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION ===
      "evolution-global-deployment-network-freeze-1",
    "global deployment network freeze",
  );
  check(
    EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE ===
      EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
    "global base = p4 intelligence dashboard",
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
    EVOLUTION_P5_GLOBAL_FREEZE_VERSION ===
      "evolution-p5-global-deployment-network-freeze-1",
    "p5 freeze",
  );
  check(
    EVOLUTION_P4_DASHBOARD_FREEZE_VERSION ===
      "evolution-p4-enterprise-intelligence-dashboard-freeze-1",
    "p4 freeze tag preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(GLOBAL_REGIONS.length === 5, "global regions");
  check(REGION_ROLES.length === 4, "region roles");
  check(DEPLOYMENT_INTELLIGENCE_MODES.length === 3, "intelligence modes");
  check(REGIONAL_HEALTH_LEVELS.length === 4, "regional health levels");
  check(ROUTING_STRATEGIES.length === 4, "routing strategies");
  check(DEPLOYMENT_OPTIMIZATION_ACTIONS.length === 4, "optimization actions");
  check(GLOBAL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(GLOBAL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP5ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P5 Global Deployment Network ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
