/**
 * Operations O3 — Support Operations verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import { OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID } from "../lib/operations/o2/usage/usage.constants";
import {
  KNOWLEDGE_CATEGORIES,
  O3_MANAGER_STATUSES,
  O3_READINESS_VERDICTS,
  OPERATIONS_O3_SUPPORT_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
  RESOLUTION_OUTCOMES,
  SLA_TARGETS,
  SUPPORT_WORKFLOW_STAGES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../lib/operations/o3/ticket/ticket.constants";
import {
  assertOperationsO3ReleaseGatePass,
  checkOperationsO3ReleaseGate,
} from "../lib/operations/o3/verify/operations.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/operations/o3/ticket/ticket.constants.ts",
    "lib/operations/o3/ticket/ticket.types.ts",
    "lib/operations/o3/ticket/ticket.registry.ts",
    "lib/operations/o3/ticket/ticket.status.ts",
    "lib/operations/o3/support/support.types.ts",
    "lib/operations/o3/support/support.workflow.ts",
    "lib/operations/o3/support/support.assignment.ts",
    "lib/operations/o3/knowledge/knowledge.types.ts",
    "lib/operations/o3/knowledge/knowledge.article.ts",
    "lib/operations/o3/knowledge/knowledge.index.ts",
    "lib/operations/o3/sla/sla.types.ts",
    "lib/operations/o3/sla/sla.policy.ts",
    "lib/operations/o3/sla/sla.metrics.ts",
    "lib/operations/o3/resolution/resolution.types.ts",
    "lib/operations/o3/resolution/resolution.tracking.ts",
    "lib/operations/o3/resolution/resolution.report.ts",
    "lib/operations/o3/resolution/resolution.readiness.ts",
    "lib/operations/o3/support.manager.ts",
    "lib/operations/o3/verify/operations.release.gate.ts",
    "lib/operations/o3/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    OPERATIONS_O3_SUPPORT_OPERATIONS_ID ===
      "enterprise-operations-o3-support-operations-v1",
    "o3 support operations id",
  );
  check(
    OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION === "operations-o3-1",
    "o3 support operations version",
  );
  check(
    OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION ===
      "operations-o3-support-operations-freeze-1",
    "o3 support operations freeze",
  );
  check(
    OPERATIONS_O3_SUPPORT_OPERATIONS_BASE ===
      OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
    "o3 base = o2 usage intelligence foundation",
  );
  check(
    OPERATIONS_O3_SUPPORT_FREEZE_VERSION ===
      "operations-o3-support-operations-freeze-1",
    "o3 freeze tag",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(TICKET_PRIORITIES.length === 4, "ticket priorities");
  check(TICKET_STATUSES.length === 5, "ticket statuses");
  check(SUPPORT_WORKFLOW_STAGES.length === 5, "support workflow stages");
  check(KNOWLEDGE_CATEGORIES.length === 4, "knowledge categories");
  check(SLA_TARGETS.length === 3, "sla targets");
  check(RESOLUTION_OUTCOMES.length === 4, "resolution outcomes");
  check(O3_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(O3_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkOperationsO3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertOperationsO3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Operations O3 Support Operations ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
