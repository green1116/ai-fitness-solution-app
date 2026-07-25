/**
 * Product P2 — Organization Workspace verification
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
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../lib/operations/o5/freeze/freeze.lock";
import { PRODUCT_P1_CUSTOMER_ONBOARDING_ID } from "../lib/product/p1/onboarding/onboarding.constants";
import {
  DEPARTMENT_STATUSES,
  INVITATION_STATUSES,
  MEMBER_STATUSES,
  ORGANIZATION_STATUSES,
  P2_MANAGER_STATUSES,
  P2_READINESS_VERDICTS,
  PERMISSION_SCOPES,
  PRODUCT_P2_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
  ROLE_KINDS,
  WORKSPACE_STATUSES,
} from "../lib/product/p2/organization/organization.constants";
import {
  assertProductP2ReleaseGatePass,
  checkProductP2ReleaseGate,
} from "../lib/product/p2/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p2/organization/organization.constants.ts",
    "lib/product/p2/organization/organization.types.ts",
    "lib/product/p2/organization/organization.registry.ts",
    "lib/product/p2/department/department.types.ts",
    "lib/product/p2/department/department.registry.ts",
    "lib/product/p2/member/member.types.ts",
    "lib/product/p2/member/member.registry.ts",
    "lib/product/p2/role/role.types.ts",
    "lib/product/p2/role/role.registry.ts",
    "lib/product/p2/permission/permission.types.ts",
    "lib/product/p2/permission/permission.registry.ts",
    "lib/product/p2/workspace/workspace.types.ts",
    "lib/product/p2/workspace/workspace.registry.ts",
    "lib/product/p2/invitation/invitation.types.ts",
    "lib/product/p2/invitation/invitation.registry.ts",
    "lib/product/p2/directory/directory.types.ts",
    "lib/product/p2/directory/directory.index.ts",
    "lib/product/p2/directory/directory.readiness.ts",
    "lib/product/p2/organization.manager.ts",
    "lib/product/p2/verify/product.release.gate.ts",
    "lib/product/p2/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P2_ORGANIZATION_WORKSPACE_ID ===
      "enterprise-product-p2-organization-workspace-v1",
    "p2 organization workspace id",
  );
  check(
    PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION === "product-p2-1",
    "p2 organization workspace version",
  );
  check(
    PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION ===
      "product-p2-organization-workspace-freeze-1",
    "p2 organization workspace freeze",
  );
  check(
    PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE === PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
    "p2 base = p1 customer onboarding",
  );
  check(
    PRODUCT_P2_ORGANIZATION_FREEZE_VERSION ===
      "product-p2-organization-workspace-freeze-1",
    "p2 freeze tag",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete preserved",
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
  check(ORGANIZATION_STATUSES.length === 4, "organization statuses");
  check(DEPARTMENT_STATUSES.length === 3, "department statuses");
  check(MEMBER_STATUSES.length === 4, "member statuses");
  check(ROLE_KINDS.length === 5, "role kinds");
  check(PERMISSION_SCOPES.length === 4, "permission scopes");
  check(WORKSPACE_STATUSES.length === 4, "workspace statuses");
  check(INVITATION_STATUSES.length === 4, "invitation statuses");
  check(P2_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P2_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P2 Organization Workspace ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
