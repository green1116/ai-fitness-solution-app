/**
 * Commercialization P7 — Commercial Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../lib/commercialization/p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../lib/commercialization/p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../lib/commercialization/p3/pricing/pricing.constants";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../lib/commercialization/p4/onboarding/onboarding.constants";
import { COMMERCIALIZATION_DELIVERY_OPERATIONS_ID } from "../lib/commercialization/p5/delivery/delivery.constants";
import {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
} from "../lib/commercialization/p6/kpi/kpi.constants";
import {
  APPROVAL_STATES,
  AUDIT_EVENT_KINDS,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID,
  COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION,
  COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION,
  COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_SCOPES,
  RISK_LEVELS,
} from "../lib/commercialization/p7/governance/governance.constants";
import {
  assertCommercializationP7ReleaseGatePass,
  checkCommercializationP7ReleaseGate,
} from "../lib/commercialization/p7/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p7/governance/governance.constants.ts",
    "lib/commercialization/p7/governance/governance.types.ts",
    "lib/commercialization/p7/governance/governance.registry.ts",
    "lib/commercialization/p7/governance/governance.policy.ts",
    "lib/commercialization/p7/approval/approval.types.ts",
    "lib/commercialization/p7/approval/approval.workflow.ts",
    "lib/commercialization/p7/approval/approval.rules.ts",
    "lib/commercialization/p7/risk/risk.types.ts",
    "lib/commercialization/p7/risk/risk.assessment.ts",
    "lib/commercialization/p7/risk/risk.control.ts",
    "lib/commercialization/p7/audit/audit.types.ts",
    "lib/commercialization/p7/audit/audit.record.ts",
    "lib/commercialization/p7/audit/audit.trail.ts",
    "lib/commercialization/p7/compliance/compliance.types.ts",
    "lib/commercialization/p7/compliance/compliance.checks.ts",
    "lib/commercialization/p7/compliance/compliance.status.ts",
    "lib/commercialization/p7/governance.manager.ts",
    "lib/commercialization/p7/verify/commercialization.release.gate.ts",
    "lib/commercialization/p7/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_ID ===
      "enterprise-commercialization-p7-commercial-governance-v1",
    "commercial governance id",
  );
  check(
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_VERSION ===
      "commercialization-p7-1",
    "commercial governance version",
  );
  check(
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_FREEZE_VERSION ===
      "commercialization-commercial-governance-freeze-1",
    "commercial governance freeze",
  );
  check(
    COMMERCIALIZATION_COMMERCIAL_GOVERNANCE_BASE ===
      COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
    "governance base = p6 revenue-intelligence",
  );
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID ===
      "enterprise-commercialization-p6-revenue-intelligence-v1",
    "p6 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION ===
      "commercialization-p6-revenue-intelligence-freeze-1",
    "p6 freeze tag preserved",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
      "enterprise-commercialization-p5-delivery-operations-foundation-v1",
    "p5 freeze preserved",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
      "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
    "p4 freeze preserved",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "p3 freeze preserved",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "p2 freeze preserved",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "p1 freeze preserved",
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
    COMMERCIALIZATION_P7_GOVERNANCE_FREEZE_VERSION ===
      "commercialization-p7-commercial-governance-freeze-1",
    "p7 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(GOVERNANCE_SCOPES.length === 4, "governance scopes");
  check(GOVERNANCE_POLICY_STATUSES.length === 4, "policy statuses");
  check(APPROVAL_STATES.length === 4, "approval states");
  check(RISK_LEVELS.length === 4, "risk levels");
  check(AUDIT_EVENT_KINDS.length === 4, "audit event kinds");
  check(COMPLIANCE_VERDICTS.length === 3, "compliance verdicts");
  check(GOVERNANCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(GOVERNANCE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP7ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P7 Commercial Governance ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
