/**
 * Evolution P3 — Autonomous Customer Success verification
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
import {
  EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
} from "../lib/evolution/predictive/predictive.constants";
import {
  AUTONOMOUS_CS_MANAGER_STATUSES,
  AUTONOMOUS_CS_READINESS_VERDICTS,
  CHURN_THREAT_LEVELS,
  CUSTOMER_INTELLIGENCE_MODES,
  ENGAGEMENT_CHANNELS,
  ENGAGEMENT_STATUSES,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
  EVOLUTION_P3_CUSTOMER_FREEZE_VERSION,
  EXPANSION_OPPORTUNITY_LEVELS,
  SUCCESS_RECOMMENDATION_KINDS,
} from "../lib/evolution/customer/customer.constants";
import {
  assertEvolutionP3ReleaseGatePass,
  checkEvolutionP3ReleaseGate,
} from "../lib/evolution/customer/verify/customer.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/customer/customer.constants.ts",
    "lib/evolution/customer/customer.types.ts",
    "lib/evolution/customer/customer.intelligence.ts",
    "lib/evolution/customer/customer.engagement.ts",
    "lib/evolution/customer/customer.recommendation.ts",
    "lib/evolution/customer/customer.churn.ts",
    "lib/evolution/customer/customer.expansion.ts",
    "lib/evolution/customer/customer.readiness.ts",
    "lib/evolution/customer/customer.manager.ts",
    "lib/evolution/customer/verify/customer.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID ===
      "enterprise-evolution-p3-autonomous-customer-success-v1",
    "autonomous cs id",
  );
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION === "evolution-p3-1",
    "autonomous cs version",
  );
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION ===
      "evolution-autonomous-customer-success-freeze-1",
    "autonomous cs freeze",
  );
  check(
    EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE ===
      EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
    "autonomous cs base = p2 predictive",
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
    EVOLUTION_P3_CUSTOMER_FREEZE_VERSION ===
      "evolution-p3-autonomous-customer-success-freeze-1",
    "p3 freeze",
  );
  check(
    EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION ===
      "evolution-p2-predictive-intelligence-freeze-1",
    "p2 freeze tag preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(CUSTOMER_INTELLIGENCE_MODES.length === 3, "intelligence modes");
  check(ENGAGEMENT_CHANNELS.length === 4, "engagement channels");
  check(ENGAGEMENT_STATUSES.length === 4, "engagement statuses");
  check(SUCCESS_RECOMMENDATION_KINDS.length === 4, "recommendation kinds");
  check(CHURN_THREAT_LEVELS.length === 5, "churn threat levels");
  check(EXPANSION_OPPORTUNITY_LEVELS.length === 5, "expansion levels");
  check(AUTONOMOUS_CS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(AUTONOMOUS_CS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P3 Autonomous Customer Success ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
