/**
 * Product M13 — P1 Enterprise Operating System Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AGENT_BASELINE_ID } from "../lib/product/m12/baseline/freeze/freeze.lock";
import {
  OS_CAPABILITY_KINDS,
  OS_CAPABILITY_STATUSES,
  OS_DOMAIN_SCOPES,
  OS_GOVERNANCE_POLICY_KINDS,
  OS_GOVERNANCE_POLICY_STATUSES,
  OS_OPERATION_MODES,
  OS_READINESS_VERDICTS,
  OS_SURFACE_KINDS,
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
  PRODUCT_OS_FREEZE_TAG,
} from "../lib/product/m13/foundation/os.constants";
import {
  getOsFoundationMetadata,
  isOsFoundationMetadataIntact,
} from "../lib/product/m13/foundation/os.metadata";
import {
  assertProductOsFoundationReleaseGatePass,
  checkProductOsFoundationReleaseGate,
} from "../lib/product/m13/verify/os.foundation.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/foundation/os.constants.ts",
    "lib/product/m13/foundation/os.types.ts",
    "lib/product/m13/foundation/os.metadata.ts",
    "lib/product/m13/foundation/os.registry.ts",
    "lib/product/m13/foundation/capability.registry.ts",
    "lib/product/m13/foundation/governance.policy.ts",
    "lib/product/m13/foundation/operation.contract.ts",
    "lib/product/m13/foundation/os.manifest.ts",
    "lib/product/m13/verify/os.foundation.gate.ts",
    "lib/product/m13/index.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P2+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1",
    "os foundation id",
  );
  check(
    PRODUCT_OS_FOUNDATION_VERSION === "product-os-1",
    "os foundation version",
  );
  check(
    PRODUCT_OS_FOUNDATION_FREEZE_VERSION === "product-os-foundation-freeze-1",
    "os foundation freeze",
  );
  check(
    PRODUCT_OS_FOUNDATION_BASE === ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
    "os base = agent baseline",
  );
  check(
    PRODUCT_OS_FREEZE_TAG === "product-os-foundation-freeze-1",
    "os freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_AGENT_BASELINE_ID ===
      "enterprise-product-agent-baseline-v1",
    "agent baseline preserved",
  );
  check(OS_SURFACE_KINDS.length === 6, "surface kinds");
  check(OS_SURFACE_STATUSES.length === 4, "surface statuses");
  check(OS_CAPABILITY_KINDS.length === 6, "capability kinds");
  check(OS_CAPABILITY_STATUSES.length === 4, "capability statuses");
  check(OS_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(OS_OPERATION_MODES.length === 3, "operation modes");
  check(OS_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(OS_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(OS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isOsFoundationMetadataIntact(getOsFoundationMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsFoundationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsFoundationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Operating System Foundation (M13-P1) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
