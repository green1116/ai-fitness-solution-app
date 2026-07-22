/**
 * Evolution P4 — Enterprise Intelligence Dashboard verification
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
import {
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_P3_CUSTOMER_FREEZE_VERSION,
} from "../lib/evolution/customer/customer.constants";
import {
  BI_VIEW_MODES,
  CROSS_PLATFORM_DOMAINS,
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  DASHBOARD_SCOPES,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
  EVOLUTION_P4_DASHBOARD_FREEZE_VERSION,
  EXECUTIVE_TRENDS,
  OPERATIONAL_INSIGHT_KINDS,
} from "../lib/evolution/dashboard/dashboard.constants";
import {
  assertEvolutionP4ReleaseGatePass,
  checkEvolutionP4ReleaseGate,
} from "../lib/evolution/dashboard/verify/dashboard.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/evolution/dashboard/dashboard.constants.ts",
    "lib/evolution/dashboard/dashboard.types.ts",
    "lib/evolution/dashboard/dashboard.model.ts",
    "lib/evolution/dashboard/dashboard.executive.ts",
    "lib/evolution/dashboard/dashboard.metrics.ts",
    "lib/evolution/dashboard/dashboard.insights.ts",
    "lib/evolution/dashboard/dashboard.bi.ts",
    "lib/evolution/dashboard/dashboard.readiness.ts",
    "lib/evolution/dashboard/dashboard.manager.ts",
    "lib/evolution/dashboard/verify/dashboard.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID ===
      "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1",
    "enterprise intelligence dashboard id",
  );
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION === "evolution-p4-1",
    "enterprise intelligence dashboard version",
  );
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION ===
      "evolution-enterprise-intelligence-dashboard-freeze-1",
    "enterprise intelligence dashboard freeze",
  );
  check(
    EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE ===
      EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
    "dashboard base = p3 autonomous cs",
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
    EVOLUTION_P4_DASHBOARD_FREEZE_VERSION ===
      "evolution-p4-enterprise-intelligence-dashboard-freeze-1",
    "p4 freeze",
  );
  check(
    EVOLUTION_P3_CUSTOMER_FREEZE_VERSION ===
      "evolution-p3-autonomous-customer-success-freeze-1",
    "p3 freeze tag preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(DASHBOARD_SCOPES.length === 4, "dashboard scopes");
  check(EXECUTIVE_TRENDS.length === 4, "executive trends");
  check(CROSS_PLATFORM_DOMAINS.length === 5, "cross-platform domains");
  check(OPERATIONAL_INSIGHT_KINDS.length === 5, "insight kinds");
  check(BI_VIEW_MODES.length === 3, "bi view modes");
  check(DASHBOARD_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DASHBOARD_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkEvolutionP4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertEvolutionP4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Evolution P4 Enterprise Intelligence Dashboard ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
