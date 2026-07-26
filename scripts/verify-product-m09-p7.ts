/**
 * Product M09 — P7 AI Audit verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  AI_AUDIT_EVENT_KINDS,
  AI_AUDIT_INTEGRITY_RESULTS,
  AI_AUDIT_READINESS_VERDICTS,
  AI_AUDIT_SEVERITIES,
  AI_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_TAG,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "../lib/product/m09/audit/audit.constants";
import {
  getAiAuditMetadata,
  isAiAuditMetadataIntact,
} from "../lib/product/m09/audit/audit.metadata";
import { PRODUCT_AI_GOVERNANCE_ID } from "../lib/product/m09/governance/governance.constants";
import {
  assertProductAiAuditReleaseGatePass,
  checkProductAiAuditReleaseGate,
} from "../lib/product/m09/verify/ai.audit.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m09/audit/audit.constants.ts",
    "lib/product/m09/audit/audit.types.ts",
    "lib/product/m09/audit/audit.metadata.ts",
    "lib/product/m09/audit/event.registry.ts",
    "lib/product/m09/audit/trail.registry.ts",
    "lib/product/m09/audit/integrity.registry.ts",
    "lib/product/m09/audit/query.registry.ts",
    "lib/product/m09/audit/audit.manifest.ts",
    "lib/product/m09/verify/ai.audit.gate.ts",
    "lib/product/m09/index.ts",
    "lib/product/m09/governance/governance.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m09/provider",
    "lib/product/m09/agent",
    "lib/product/m09/runtime",
    "lib/product/m09/monitoring",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AI_AUDIT_ID === "enterprise-product-ai-audit-v1",
    "ai audit id",
  );
  check(
    PRODUCT_AI_AUDIT_VERSION === "product-ai-audit-1",
    "ai audit version",
  );
  check(
    PRODUCT_AI_AUDIT_FREEZE_VERSION === "product-ai-audit-freeze-1",
    "ai audit freeze",
  );
  check(
    PRODUCT_AI_AUDIT_BASE === PRODUCT_AI_GOVERNANCE_ID,
    "audit base = governance",
  );
  check(
    PRODUCT_AI_AUDIT_FREEZE_TAG === "product-ai-audit-freeze-1",
    "audit freeze tag",
  );
  check(
    PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1",
    "governance preserved",
  );
  check(AI_AUDIT_EVENT_KINDS.length === 4, "event kinds");
  check(AI_AUDIT_SEVERITIES.length === 3, "severities");
  check(AI_AUDIT_TRAIL_STATUSES.length === 3, "trail statuses");
  check(AI_AUDIT_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(AI_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isAiAuditMetadataIntact(getAiAuditMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAiAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAiAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Audit (M09-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
