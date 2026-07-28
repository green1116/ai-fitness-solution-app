/**
 * Product M12 — P8 AI Agent Platform Baseline Freeze verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID } from "../lib/product/m11/baseline/freeze/freeze.lock";
import {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  isProductAgentFreezeLockIntact,
  PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_COMPONENT_LOCK,
  PRODUCT_AGENT_FREEZE_LOCK,
} from "../lib/product/m12/baseline/freeze/freeze.lock";
import {
  isProductAgentImmutableManifestIntact,
  PRODUCT_AGENT_IMMUTABLE_MANIFEST,
} from "../lib/product/m12/baseline/freeze/immutable.manifest";
import {
  isProductAgentRollbackSnapshotIntact,
  PRODUCT_AGENT_ROLLBACK_SNAPSHOT,
} from "../lib/product/m12/baseline/freeze/rollback.snapshot";
import { PRODUCT_AGENT_CATALOG_ID } from "../lib/product/m12/catalog/catalog.constants";
import { PRODUCT_AGENT_COMPATIBILITY_ID } from "../lib/product/m12/compatibility-runtime/compatibility.constants";
import { PRODUCT_AGENT_DEPENDENCY_ID } from "../lib/product/m12/dependency-runtime/dependency.constants";
import { PRODUCT_AGENT_FOUNDATION_ID } from "../lib/product/m12/foundation/agent.constants";
import { PRODUCT_AGENT_GOVERNANCE_ID } from "../lib/product/m12/governance/governance.constants";
import { PRODUCT_AGENT_LIFECYCLE_ID } from "../lib/product/m12/lifecycle-runtime/lifecycle.constants";
import { PRODUCT_AGENT_POLICY_ID } from "../lib/product/m12/policy-runtime/policy.constants";
import {
  assertProductAgentBaselineReleaseGatePass,
  checkProductAgentBaselineReleaseGate,
} from "../lib/product/m12/verify/agent.baseline.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/baseline/freeze/freeze.lock.ts",
    "lib/product/m12/baseline/freeze/immutable.manifest.ts",
    "lib/product/m12/baseline/freeze/rollback.snapshot.ts",
    "lib/product/m12/baseline/index.ts",
    "lib/product/m12/verify/agent.baseline.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/foundation/agent.constants.ts",
    "lib/product/m12/catalog/catalog.constants.ts",
    "lib/product/m12/dependency-runtime/dependency.constants.ts",
    "lib/product/m12/policy-runtime/policy.constants.ts",
    "lib/product/m12/compatibility-runtime/compatibility.constants.ts",
    "lib/product/m12/governance/governance.constants.ts",
    "lib/product/m12/lifecycle-runtime/lifecycle.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m12/vector",
    "lib/product/m12/rag",
    "lib/product/m12/embedding",
    "lib/product/m12/provider",
    "lib/product/m12/db",
    "lib/product/m12/runtime",
    "lib/product/m12/execution",
    "lib/product/m12/tool",
    "lib/product/m12/dependency",
    "lib/product/m12/policy",
    "lib/product/m12/compatibility",
    "lib/product/m12/governance-runtime",
    "lib/product/m12/lifecycle",
    "lib/product/m12/compliance",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_BASELINE_ID === "enterprise-product-agent-baseline-v1",
    "agent baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_AGENT_BASELINE_ID === PRODUCT_AGENT_BASELINE_ID,
    "agent baseline alias",
  );
  check(
    PRODUCT_AGENT_BASELINE_FREEZE_VERSION === "product-agent-baseline-freeze-1",
    "agent freeze version",
  );
  check(
    PRODUCT_AGENT_BASELINE_FREEZE_BASE === PRODUCT_AGENT_LIFECYCLE_ID,
    "freeze base = agent lifecycle",
  );
  check(
    PRODUCT_AGENT_FOUNDATION_ID === "enterprise-product-agent-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1",
    "catalog preserved",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_ID === "enterprise-product-agent-dependency-v1",
    "dependency preserved",
  );
  check(
    PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1",
    "policy preserved",
  );
  check(
    PRODUCT_AGENT_COMPATIBILITY_ID ===
      "enterprise-product-agent-compatibility-v1",
    "compatibility preserved",
  );
  check(
    PRODUCT_AGENT_GOVERNANCE_ID === "enterprise-product-agent-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_AGENT_LIFECYCLE_ID === "enterprise-product-agent-lifecycle-v1",
    "lifecycle preserved",
  );
  check(
    ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID ===
      "enterprise-product-knowledge-baseline-v1",
    "knowledge baseline preserved",
  );
  check(isProductAgentFreezeLockIntact(), "freeze lock intact");
  check(
    isProductAgentImmutableManifestIntact(PRODUCT_AGENT_IMMUTABLE_MANIFEST),
    "immutable manifest",
  );
  check(
    isProductAgentRollbackSnapshotIntact(PRODUCT_AGENT_ROLLBACK_SNAPSHOT),
    "rollback snapshot",
  );
  check(PRODUCT_AGENT_COMPONENT_LOCK.length === 8, "component lock count");
  check(
    PRODUCT_AGENT_FREEZE_LOCK.knowledgeBaseline ===
      ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
    "knowledge baseline soft-ref",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Baseline Freeze (M12-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
