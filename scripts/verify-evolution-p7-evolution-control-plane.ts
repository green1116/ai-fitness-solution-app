/**
 * Evolution P7 — Evolution Control Plane verification
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
  EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
  EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION,
} from "../lib/evolution/marketplace/marketplace.constants";
import {
  EVO_COMMAND_MODES,
  EVO_CONTROL_MANAGER_STATUSES,
  EVO_CONTROL_READINESS_VERDICTS,
  EVO_DECISION_VERDICTS,
  EVO_LOOP_STATUSES,
  EVO_ORCHESTRATION_DOMAINS,
  EVO_ORCHESTRATION_STATUSES,
  EVOLUTION_CONTROL_PLANE_BASE,
  EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_ID,
  EVOLUTION_CONTROL_PLANE_VERSION,
  EVOLUTION_P7_CONTROL_FREEZE_VERSION,
} from "../lib/evolution/control/control.constants";
import {
  assertEvolutionP7ReleaseGatePass,
  checkEvolutionP7ReleaseGate,
} from "../lib/evolution/control/verify/evolution.control.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/control/control.constants.ts",
    "lib/evolution/control/control.types.ts",
    "lib/evolution/control/control.orchestration.ts",
    "lib/evolution/control/control.command.ts",
    "lib/evolution/control/control.loop.ts",
    "lib/evolution/control/control.decision.ts",
    "lib/evolution/control/control.metrics.ts",
    "lib/evolution/control/control.readiness.ts",
    "lib/evolution/control/control.manager.ts",
    "lib/evolution/control/verify/evolution.control.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_CONTROL_PLANE_ID ===
      "enterprise-evolution-p7-evolution-control-plane-v1",
    "control plane id",
  );
  check(
    EVOLUTION_CONTROL_PLANE_VERSION === "evolution-p7-1",
    "control plane version",
  );
  check(
    EVOLUTION_CONTROL_PLANE_FREEZE_VERSION ===
      "evolution-control-plane-freeze-1",
    "control plane freeze",
  );
  check(
    EVOLUTION_CONTROL_PLANE_BASE === EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
    "control base = p6 marketplace",
  );
  check(
    EVOLUTION_MARKETPLACE_ECOSYSTEM_ID ===
      "enterprise-evolution-p6-marketplace-ecosystem-v1",
    "p6 freeze preserved",
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
    EVOLUTION_P7_CONTROL_FREEZE_VERSION ===
      "evolution-p7-evolution-control-plane-freeze-1",
    "p7 freeze",
  );
  check(
    EVOLUTION_P6_MARKETPLACE_FREEZE_VERSION ===
      "evolution-p6-marketplace-ecosystem-freeze-1",
    "p6 freeze tag preserved",
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
  check(EVO_ORCHESTRATION_STATUSES.length === 5, "orchestration statuses");
  check(EVO_ORCHESTRATION_DOMAINS.length === 6, "orchestration domains");
  check(EVO_COMMAND_MODES.length === 4, "command modes");
  check(EVO_LOOP_STATUSES.length === 4, "loop statuses");
  check(EVO_DECISION_VERDICTS.length === 4, "decision verdicts");
  check(EVO_CONTROL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(EVO_CONTROL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP7ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P7 Evolution Control Plane ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
