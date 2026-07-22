/**
 * Evolution P1 — AI Operations Optimization verification
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
  EFFICIENCY_BANDS,
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
  EVOLUTION_MANAGER_STATUSES,
  EVOLUTION_P1_AI_OPS_FREEZE_VERSION,
  EVOLUTION_READINESS_VERDICTS,
  IMPROVEMENT_STATUSES,
  INTELLIGENCE_SIGNAL_KINDS,
  OPTIMIZATION_PRIORITIES,
} from "../lib/evolution/evolution.constants";
import {
  assertEvolutionP1ReleaseGatePass,
  checkEvolutionP1ReleaseGate,
} from "../lib/evolution/verify/evolution.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/evolution.constants.ts",
    "lib/evolution/evolution.types.ts",
    "lib/evolution/evolution.intelligence.ts",
    "lib/evolution/evolution.efficiency.ts",
    "lib/evolution/evolution.recommendation.ts",
    "lib/evolution/evolution.resource.ts",
    "lib/evolution/evolution.improvement.ts",
    "lib/evolution/evolution.readiness.ts",
    "lib/evolution/evolution.manager.ts",
    "lib/evolution/verify/evolution.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_ID ===
      "enterprise-evolution-p1-ai-operations-optimization-v1",
    "evolution ai ops id",
  );
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_VERSION === "evolution-p1-1",
    "evolution ai ops version",
  );
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION ===
      "evolution-ai-ops-optimization-freeze-1",
    "evolution ai ops freeze",
  );
  check(
    EVOLUTION_AI_OPS_OPTIMIZATION_BASE === OPERATIONS_GOVERNANCE_COMPLETE_ID,
    "evolution base = post-launch operations complete",
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
    EVOLUTION_P1_AI_OPS_FREEZE_VERSION ===
      "evolution-p1-ai-operations-optimization-freeze-1",
    "p1 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(INTELLIGENCE_SIGNAL_KINDS.length === 5, "signal kinds");
  check(EFFICIENCY_BANDS.length === 5, "efficiency bands");
  check(OPTIMIZATION_PRIORITIES.length === 4, "priorities");
  check(IMPROVEMENT_STATUSES.length === 5, "improvement statuses");
  check(EVOLUTION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(EVOLUTION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP1ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P1 AI Operations Optimization ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
