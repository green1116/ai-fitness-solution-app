/**
 * Product M15 â€?P6 Enterprise Evolution Capability verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_OPTIMIZATION_ID } from "../lib/product/m15/optimization-runtime/optimization.constants";
import {
  EVOLUTION_CAPABILITY_ADVANCEMENT_MODES,
  EVOLUTION_CAPABILITY_DOMAIN_SCOPES,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_KINDS,
  EVOLUTION_CAPABILITY_READINESS_VERDICTS,
  EVOLUTION_CAPABILITY_REVISION_KINDS,
  EVOLUTION_CAPABILITY_REVISION_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "../lib/product/m15/capability-runtime/capability.constants";
import {
  getEvolutionCapabilityRuntimeMetadata,
  isEvolutionCapabilityRuntimeMetadataIntact,
} from "../lib/product/m15/capability-runtime/capability.metadata";
import {
  assertProductEvolutionCapabilityReleaseGatePass,
  checkProductEvolutionCapabilityReleaseGate,
} from "../lib/product/m15/verify/evolution.capability.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m15/capability-runtime/capability.constants.ts",
    "lib/product/m15/capability-runtime/capability.types.ts",
    "lib/product/m15/capability-runtime/capability.metadata.ts",
    "lib/product/m15/capability-runtime/capability.registry.ts",
    "lib/product/m15/capability-runtime/revision.registry.ts",
    "lib/product/m15/capability-runtime/governance.policy.ts",
    "lib/product/m15/capability-runtime/advancement.contract.ts",
    "lib/product/m15/capability-runtime/capability.manifest.ts",
    "lib/product/m15/verify/evolution.capability.gate.ts",
    "lib/product/m15/index.ts",
    "lib/product/m15/optimization-runtime/optimization.constants.ts",
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
    "lib/product/m15/governance-runtime",
    "lib/product/m15/lifecycle",
    "lib/product/m15/learning",
    "lib/product/m15/optimization",
    "lib/product/m15/analysis",
    "lib/product/m15/recommendation",
    "lib/product/m15/deployment",
    "lib/product/m15/automation",
    "lib/product/m15/capability",
    "lib/product/m15/activation",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P7+ path: ${rel}`);
  }

  console.log("âœ?module structure");
}

function checkConstants() {
  check(
    PRODUCT_EVOLUTION_CAPABILITY_ID ===
      "enterprise-product-evolution-capability-v1",
    "evolution capability id",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_VERSION === "product-evolution-capability-1",
    "evolution capability version",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION ===
      "product-evolution-capability-freeze-1",
    "evolution capability freeze",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_BASE === PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    "evolution capability base = evolution optimization",
  );
  check(
    PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG ===
      "product-evolution-capability-freeze-1",
    "evolution capability freeze tag",
  );
  check(
    PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
      "enterprise-product-evolution-optimization-v1",
    "evolution optimization preserved",
  );
  check(EVOLUTION_CAPABILITY_SPEC_KINDS.length === 6, "capability kinds");
  check(EVOLUTION_CAPABILITY_SPEC_STATUSES.length === 4, "capability statuses");
  check(EVOLUTION_CAPABILITY_REVISION_KINDS.length === 6, "revision kinds");
  check(
    EVOLUTION_CAPABILITY_REVISION_STATUSES.length === 4,
    "revision statuses",
  );
  check(EVOLUTION_CAPABILITY_DOMAIN_SCOPES.length === 4, "domain scopes");
  check(
    EVOLUTION_CAPABILITY_ADVANCEMENT_MODES.length === 3,
    "advancement modes",
  );
  check(
    EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS.length === 4,
    "policy kinds",
  );
  check(
    EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES.length === 3,
    "policy statuses",
  );
  check(
    EVOLUTION_CAPABILITY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isEvolutionCapabilityRuntimeMetadataIntact(
      getEvolutionCapabilityRuntimeMetadata(),
    ),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("âœ?constants + freeze tags");
}

function checkGate() {
  const gate = checkProductEvolutionCapabilityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductEvolutionCapabilityReleaseGatePass(gate);
  console.log("âœ?release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Evolution Capability (M15-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();
