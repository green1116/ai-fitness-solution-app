/**
 * Product M10 — P7 Runtime Audit verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AI_RUNTIME_AUDIT_EVENT_KINDS,
  AI_RUNTIME_AUDIT_INTEGRITY_RESULTS,
  AI_RUNTIME_AUDIT_READINESS_VERDICTS,
  AI_RUNTIME_AUDIT_SEVERITIES,
  AI_RUNTIME_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "../lib/product/m10/runtime-audit/audit.constants";
import {
  getAiRuntimeAuditMetadata,
  isAiRuntimeAuditMetadataIntact,
} from "../lib/product/m10/runtime-audit/audit.metadata";
import { PRODUCT_AI_RUNTIME_GOVERNANCE_ID } from "../lib/product/m10/runtime-governance/governance.constants";
import {
  assertProductAiRuntimeAuditReleaseGatePass,
  checkProductAiRuntimeAuditReleaseGate,
} from "../lib/product/m10/verify/runtime.audit.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m10/runtime-audit/audit.constants.ts",
    "lib/product/m10/runtime-audit/audit.types.ts",
    "lib/product/m10/runtime-audit/audit.metadata.ts",
    "lib/product/m10/runtime-audit/event.registry.ts",
    "lib/product/m10/runtime-audit/trail.registry.ts",
    "lib/product/m10/runtime-audit/integrity.registry.ts",
    "lib/product/m10/runtime-audit/query.registry.ts",
    "lib/product/m10/runtime-audit/audit.manifest.ts",
    "lib/product/m10/verify/runtime.audit.gate.ts",
    "lib/product/m10/index.ts",
    "lib/product/m10/runtime-governance/governance.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m10/provider",
    "lib/product/m10/agent",
    "lib/product/m10/retry",
    "lib/product/m10/autoscaling",
    "lib/product/m10/monitoring",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_RUNTIME_AUDIT_ID === "enterprise-product-ai-runtime-audit-v1",
    "runtime audit id",
  );
  check(
    PRODUCT_AI_RUNTIME_AUDIT_VERSION === "product-ai-runtime-audit-1",
    "runtime audit version",
  );
  check(
    PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION ===
      "product-ai-runtime-audit-freeze-1",
    "runtime audit freeze",
  );
  check(
    PRODUCT_AI_RUNTIME_AUDIT_BASE === PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
    "audit base = runtime governance",
  );
  check(
    PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG ===
      "product-ai-runtime-audit-freeze-1",
    "audit freeze tag",
  );
  check(
    PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
      "enterprise-product-ai-runtime-governance-v1",
    "runtime governance preserved",
  );
  check(AI_RUNTIME_AUDIT_EVENT_KINDS.length === 4, "event kinds");
  check(AI_RUNTIME_AUDIT_SEVERITIES.length === 3, "severities");
  check(AI_RUNTIME_AUDIT_TRAIL_STATUSES.length === 3, "trail statuses");
  check(AI_RUNTIME_AUDIT_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(AI_RUNTIME_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAiRuntimeAuditMetadataIntact(getAiRuntimeAuditMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiRuntimeAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiRuntimeAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Runtime Audit (M10-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
