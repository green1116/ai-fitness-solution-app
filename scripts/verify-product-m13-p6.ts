/**
 * Product M13 — P6 OS Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_OS_COMPATIBILITY_ID } from "../lib/product/m13/compatibility-runtime/compatibility.constants";
import {
  OS_GOVERNANCE_APPROVALS,
  OS_GOVERNANCE_BINDING_STATUSES,
  OS_GOVERNANCE_READINESS_VERDICTS,
  OS_GOVERNANCE_REVIEW_STATUSES,
  OS_GOVERNANCE_RISK_LEVELS,
  OS_GOVERNANCE_STANDARD_KINDS,
  OS_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_TAG,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "../lib/product/m13/governance/governance.constants";
import {
  getOsGovernanceMetadata,
  isOsGovernanceMetadataIntact,
} from "../lib/product/m13/governance/governance.metadata";
import {
  assertProductOsGovernanceReleaseGatePass,
  checkProductOsGovernanceReleaseGate,
} from "../lib/product/m13/verify/os.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/governance/governance.constants.ts",
    "lib/product/m13/governance/governance.types.ts",
    "lib/product/m13/governance/governance.metadata.ts",
    "lib/product/m13/governance/standard.registry.ts",
    "lib/product/m13/governance/review.registry.ts",
    "lib/product/m13/governance/binding.registry.ts",
    "lib/product/m13/governance/governance.manifest.ts",
    "lib/product/m13/verify/os.governance.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/compatibility-runtime/compatibility.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m13/vector",
    "lib/product/m13/rag",
    "lib/product/m13/embedding",
    "lib/product/m13/provider",
    "lib/product/m13/db",
    "lib/product/m13/runtime",
    "lib/product/m13/execution",
    "lib/product/m13/tool",
    "lib/product/m13/catalog",
    "lib/product/m13/dependency",
    "lib/product/m13/policy",
    "lib/product/m13/compatibility",
    "lib/product/m13/governance-runtime",
    "lib/product/m13/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P7+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_GOVERNANCE_ID === "enterprise-product-os-governance-v1",
    "os governance id",
  );
  check(
    PRODUCT_OS_GOVERNANCE_VERSION === "product-os-governance-1",
    "os governance version",
  );
  check(
    PRODUCT_OS_GOVERNANCE_FREEZE_VERSION === "product-os-governance-freeze-1",
    "os governance freeze",
  );
  check(
    PRODUCT_OS_GOVERNANCE_BASE === PRODUCT_OS_COMPATIBILITY_ID,
    "os governance base = os compatibility",
  );
  check(
    PRODUCT_OS_GOVERNANCE_FREEZE_TAG === "product-os-governance-freeze-1",
    "os governance freeze tag",
  );
  check(
    PRODUCT_OS_COMPATIBILITY_ID === "enterprise-product-os-compatibility-v1",
    "os compatibility preserved",
  );
  check(OS_GOVERNANCE_STANDARD_KINDS.length === 4, "standard kinds");
  check(OS_GOVERNANCE_STANDARD_STATUSES.length === 4, "standard statuses");
  check(OS_GOVERNANCE_REVIEW_STATUSES.length === 4, "review statuses");
  check(OS_GOVERNANCE_APPROVALS.length === 4, "approvals");
  check(OS_GOVERNANCE_RISK_LEVELS.length === 4, "risk levels");
  check(OS_GOVERNANCE_BINDING_STATUSES.length === 3, "binding statuses");
  check(OS_GOVERNANCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isOsGovernanceMetadataIntact(getOsGovernanceMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Operating System Governance (M13-P6) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
