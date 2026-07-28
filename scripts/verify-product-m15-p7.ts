/**
 * Product M15 — P7 Enterprise Evolution Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_CAPABILITY_ID } from "../lib/product/m15/capability-runtime/capability.constants";
import {
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES,
  EVOLUTION_GOVERNANCE_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_FRAME_KINDS,
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  EVOLUTION_GOVERNANCE_OVERSIGHT_MODES,
  EVOLUTION_GOVERNANCE_READINESS_VERDICTS,
  EVOLUTION_GOVERNANCE_REVIEW_KINDS,
  EVOLUTION_GOVERNANCE_REVIEW_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "../lib/product/m15/governance-runtime/governance.constants";
import {
  getEvolutionGovernanceRuntimeMetadata,
  isEvolutionGovernanceRuntimeMetadataIntact,
} from "../lib/product/m15/governance-runtime/governance.metadata";
import {
  assertProductEvolutionGovernanceReleaseGatePass,
  checkProductEvolutionGovernanceReleaseGate,
} from "../lib/product/m15/verify/evolution.governance.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/governance-runtime/governance.constants.ts",
    "lib/product/m15/governance-runtime/governance.types.ts",
    "lib/product/m15/governance-runtime/governance.metadata.ts",
    "lib/product/m15/governance-runtime/governance.registry.ts",
    "lib/product/m15/governance-runtime/review.registry.ts",
    "lib/product/m15/governance-runtime/governance.policy.ts",
    "lib/product/m15/governance-runtime/oversight.contract.ts",
    "lib/product/m15/governance-runtime/governance.manifest.ts",
    "lib/product/m15/verify/evolution.governance.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/capability-runtime/capability.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m15/vector",
    "lib/product/m15/rag",
    "lib/product/m15/embedding",
    "lib/product/m15/provider",
    "lib/product/m15/db",
    "lib/product/m15/runtime",
    "lib/product/m15/execution",
    "lib/product/m15/tool",
    "lib/product/m15/catalog",
    "lib/product/m15/dependency",
    "lib/product/m15/policy",
    "lib/product/m15/compatibility",
    "lib/product/m15/lifecycle",
    "lib/product/m15/learning",
    "lib/product/m15/optimization",
    "lib/product/m15/analysis",
    "lib/product/m15/recommendation",
    "lib/product/m15/deployment",
    "lib/product/m15/automation",
    "lib/product/m15/capability",
    "lib/product/m15/activation",
    "lib/product/m15/governance",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P8+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_ID ===
      "enterprise-product-evolution-governance-v1",
    "evolution governance id",
  );
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_VERSION === "product-evolution-governance-1",
    "evolution governance version",
  );
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION ===
      "product-evolution-governance-freeze-1",
    "evolution governance freeze",
  );
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_BASE === PRODUCT_EVOLUTION_CAPABILITY_ID,
    "evolution governance base = evolution capability",
  );
  check(
    PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG ===
      "product-evolution-governance-freeze-1",
    "evolution governance freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_ID ===
      "enterprise-product-evolution-capability-v1",
    "evolution capability preserved",
  );
  check(EVOLUTION_GOVERNANCE_FRAME_KINDS.length === 6, "governance kinds");
  check(
    EVOLUTION_GOVERNANCE_FRAME_STATUSES.length === 4,
    "governance statuses",
  );
  check(EVOLUTION_GOVERNANCE_REVIEW_KINDS.length === 6, "review kinds");
  check(EVOLUTION_GOVERNANCE_REVIEW_STATUSES.length === 4, "review statuses");
  check(EVOLUTION_GOVERNANCE_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(EVOLUTION_GOVERNANCE_OVERSIGHT_MODES.length === 3, "oversight modes");
  check(
    EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(
    EVOLUTION_GOVERNANCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isEvolutionGovernanceRuntimeMetadataIntact(
      getEvolutionGovernanceRuntimeMetadata(),
    ),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Governance (M15-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
