/**
 * E06-P1 — Autonomous Operation Foundation verification
 * Autonomous operation foundation above E05 Intelligence Layer
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildIntelligenceFoundation } from "../lib/intelligence/e05/core/intelligence.lifecycle";
import {
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
} from "../lib/intelligence/e05/core/intelligence.constants";
import { E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION } from "../lib/intelligence/e05/signoff/signoff.types";
import {
  assertOperationFoundationPass,
  buildOperationFoundation,
  buildOperationPolicyRegistryManifest,
  canAdvanceOperationLifecycle,
  createOperationExecutionContext,
  E06_OPERATION_BASE,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
  executeOperation,
  executeOperationOrThrow,
  getOperationByDomain,
  getOperationById,
  isOperationDependencyGraphValid,
  listExecutableOperations,
  OPERATION_CATALOG,
  OPERATION_DOMAINS,
  OPERATION_LIFECYCLE_STAGES,
  OPERATION_POLICY_CATALOG,
  OPERATION_POLICY_KINDS,
  selectOperationPolicyEffect,
} from "../lib/autonomous/e06";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E05 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/core/intelligence.lifecycle.ts",
  "lib/intelligence/e05/runtime/intelligence.context.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/index.ts",
  "lib/intelligence/e05/signoff/signoff.types.ts",
] as const;

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/autonomous/e06/core/operation.types.ts",
    "lib/autonomous/e06/core/operation.constants.ts",
    "lib/autonomous/e06/core/operation.lifecycle.ts",
    "lib/autonomous/e06/core/operation.registry.ts",
    "lib/autonomous/e06/runtime/operation.context.ts",
    "lib/autonomous/e06/runtime/operation.executor.ts",
    "lib/autonomous/e06/policy/operation.policy.ts",
    "lib/autonomous/e06/policy/operation.policy.registry.ts",
    "lib/autonomous/e06/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildIntelligenceFoundation();
  check(foundation.ready === true, "E05 foundation still ready");
  check(
    foundation.platformId === E05_INTELLIGENCE_PLATFORM_ID,
    "E05 platform id intact",
  );
  check(
    foundation.version === E05_INTELLIGENCE_VERSION,
    "E05 version intact",
  );
  check(
    E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION ===
      "e05-intelligence-platform-freeze-1",
    "E05 platform freeze version present",
  );
  check(
    E06_OPERATION_BASE === "enterprise-e05-intelligence-platform-freeze-v1",
    "E06 base constant",
  );
  console.log("✓ E03 + E04 + E05 unmodified / bases intact");
}

function testFoundationAndPolicies() {
  check(OPERATION_DOMAINS.length === 6, "domains");
  check(OPERATION_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(
    canAdvanceOperationLifecycle("declared", "registered"),
    "declared→registered",
  );
  check(
    !canAdvanceOperationLifecycle("declared", "completed"),
    "skip blocked",
  );

  check(OPERATION_CATALOG.length === 6, "operations");
  check(isOperationDependencyGraphValid(), "dependency graph");
  check(OPERATION_POLICY_CATALOG.length === 6, "policies");
  check(OPERATION_POLICY_KINDS.length === 6, "policy kinds");

  const policies = buildOperationPolicyRegistryManifest();
  check(policies.catalogComplete === true, "policy catalog complete");

  const foundation = buildOperationFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.platformId === E06_OPERATION_PLATFORM_ID, "platform id");
  check(foundation.base === E06_OPERATION_BASE, "base e05 freeze");
  check(foundation.version === E06_OPERATION_VERSION, "version");
  check(foundation.registry.catalogComplete === true, "registry complete");
  check(foundation.policies.catalogComplete === true, "policies complete");
  check(foundation.lifecycle.complete === true, "lifecycle complete");
  assertOperationFoundationPass(foundation);

  check(
    getOperationByDomain("observe")?.id === "e06.op.observe-opportunity",
    "by domain",
  );
  check(listExecutableOperations().length === 5, "executable operations");

  const denied = selectOperationPolicyEffect(
    OPERATION_POLICY_CATALOG,
    { unsafe: true, goal: "x" },
    "allow",
  );
  check(denied.allowed === false, "unsafe denied");
  check(denied.effect === "deny", "deny effect");

  console.log("✓ foundation + policies");
  console.log(foundation.summary);
}

function testExecutorBridge() {
  const observe = getOperationById("e06.op.observe-opportunity");
  check(Boolean(observe), "observe operation");

  const context = createOperationExecutionContext({
    operationId: observe!.id,
    intelligenceId: observe!.intelligenceId,
    insightId: observe!.insightId,
    input: {
      goal: "星河科技园健身中心自主观测",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      domain: "observe",
    },
    metadata: { source: "verify-e06-p1" },
  });

  const run = executeOperationOrThrow(observe!, context);
  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.policy.allowed === true, "policy allowed");
  check(
    run.result.intelligence?.result.success === true,
    "E05 intelligence success",
  );
  check(run.result.intelligenceId === "e05.intel.opportunity", "bound intel");
  check(run.result.output.domain === "observe", "domain output");

  for (const operation of listExecutableOperations()) {
    const ctx = createOperationExecutionContext({
      operationId: operation.id,
      intelligenceId: operation.intelligenceId,
      insightId: operation.insightId,
      input: {
        goal: `probe:${operation.domain}`,
        ready: true,
        riskScore: 10,
      },
    });
    const bundle = executeOperationOrThrow(operation, ctx);
    check(bundle.result.success === true, `${operation.id} success`);
  }

  const coordinate = getOperationById("e06.op.coordinate-synthesis");
  check(Boolean(coordinate), "coordinate operation");
  const syn = executeOperationOrThrow(
    coordinate!,
    createOperationExecutionContext({
      operationId: coordinate!.id,
      intelligenceId: coordinate!.intelligenceId,
      insightId: coordinate!.insightId,
      input: { goal: "coordinate probe", ready: true },
    }),
  );
  check(syn.result.success === true, "coordinate success");

  const blocked = executeOperation(
    observe!,
    createOperationExecutionContext({
      operationId: observe!.id,
      intelligenceId: observe!.intelligenceId,
      input: { goal: "blocked", unsafe: true },
    }),
  );
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");

  console.log("✓ operation executor → E05 intelligence bridge");
}

function main() {
  console.log("E06-P1 — Autonomous Operation Foundation Verification\n");

  const frozen = [...FROZEN_E05, ...FROZEN_E04, ...FROZEN_E03];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E05", FROZEN_E05, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testFoundationAndPolicies();
  testExecutorBridge();
  checkFrozen("E05", FROZEN_E05, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P1 autonomous operation foundation");
}

main();
