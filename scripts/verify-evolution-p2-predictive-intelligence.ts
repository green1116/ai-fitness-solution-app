/**
 * Evolution P2 — Predictive Intelligence verification
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
import {
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
} from "../lib/evolution/evolution.constants";
import {
  CAPACITY_OUTLOOKS,
  CUSTOMER_RISK_LEVELS,
  EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_ID,
  EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION,
  INCIDENT_PREDICTION_LEVELS,
  PREDICTION_HORIZONS,
  PREDICTIVE_MANAGER_STATUSES,
  PREDICTIVE_READINESS_VERDICTS,
  RISK_BANDS,
} from "../lib/evolution/predictive/predictive.constants";
import {
  assertEvolutionP2ReleaseGatePass,
  checkEvolutionP2ReleaseGate,
} from "../lib/evolution/predictive/verify/predictive.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/predictive/predictive.constants.ts",
    "lib/evolution/predictive/predictive.types.ts",
    "lib/evolution/predictive/predictive.model.ts",
    "lib/evolution/predictive/predictive.incident.ts",
    "lib/evolution/predictive/predictive.risk.ts",
    "lib/evolution/predictive/predictive.capacity.ts",
    "lib/evolution/predictive/predictive.customer.ts",
    "lib/evolution/predictive/predictive.readiness.ts",
    "lib/evolution/predictive/predictive.manager.ts",
    "lib/evolution/predictive/verify/predictive.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_ID ===
      "enterprise-evolution-p2-predictive-intelligence-v1",
    "predictive intelligence id",
  );
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_VERSION === "evolution-p2-1",
    "predictive intelligence version",
  );
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_FREEZE_VERSION ===
      "evolution-predictive-intelligence-freeze-1",
    "predictive intelligence freeze",
  );
  check(
    EVOLUTION_PREDICTIVE_INTELLIGENCE_BASE === EVOLUTION_AI_OPS_OPTIMIZATION_ID,
    "predictive base = p1 ai ops optimization",
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
    EVOLUTION_P2_PREDICTIVE_FREEZE_VERSION ===
      "evolution-p2-predictive-intelligence-freeze-1",
    "p2 freeze",
  );
  check(
    EVOLUTION_P1_AI_OPS_FREEZE_VERSION ===
      "evolution-p1-ai-operations-optimization-freeze-1",
    "p1 freeze tag preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PREDICTION_HORIZONS.length === 4, "horizons");
  check(INCIDENT_PREDICTION_LEVELS.length === 5, "incident levels");
  check(RISK_BANDS.length === 5, "risk bands");
  check(CAPACITY_OUTLOOKS.length === 5, "capacity outlooks");
  check(CUSTOMER_RISK_LEVELS.length === 5, "customer risk levels");
  check(PREDICTIVE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PREDICTIVE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P2 Predictive Intelligence ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
