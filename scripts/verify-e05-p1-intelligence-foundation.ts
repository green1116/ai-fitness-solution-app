/**
 * E05-P1 — Intelligence Foundation verification
 * Intelligence foundation above E04 Business Agent Platform
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildBusinessAgentFoundation } from "../lib/business-agent/e04/core/business-agent.lifecycle";
import {
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "../lib/business-agent/e04/core/business-agent.constants";
import { E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION } from "../lib/business-agent/e04/signoff/signoff.types";
import {
  assertIntelligenceFoundationPass,
  buildInsightRegistryManifest,
  buildIntelligenceFoundation,
  canAdvanceIntelligenceLifecycle,
  createIntelligenceExecutionContext,
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
  executeIntelligenceOrThrow,
  getIntelligenceByDomain,
  getIntelligenceById,
  INTELLIGENCE_CATALOG,
  INTELLIGENCE_DOMAINS,
  INTELLIGENCE_LIFECYCLE_STAGES,
  INSIGHT_CATALOG,
  isIntelligenceDependencyGraphValid,
  listExecutableIntelligenceModules,
} from "../lib/intelligence/e05";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
  "lib/business-agent/e04/capability/capability.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.context.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
  "lib/business-agent/e04/signoff/signoff.types.ts",
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
    "lib/intelligence/e05/core/intelligence.types.ts",
    "lib/intelligence/e05/core/intelligence.constants.ts",
    "lib/intelligence/e05/core/intelligence.lifecycle.ts",
    "lib/intelligence/e05/core/intelligence.registry.ts",
    "lib/intelligence/e05/runtime/intelligence.context.ts",
    "lib/intelligence/e05/runtime/intelligence.executor.ts",
    "lib/intelligence/e05/insight/insight.types.ts",
    "lib/intelligence/e05/insight/insight.registry.ts",
    "lib/intelligence/e05/index.ts",
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
  const foundation = buildBusinessAgentFoundation();
  check(foundation.ready === true, "E04 foundation still ready");
  check(
    foundation.platformId === E04_BUSINESS_AGENT_PLATFORM_ID,
    "E04 platform id intact",
  );
  check(
    foundation.version === E04_BUSINESS_AGENT_VERSION,
    "E04 version intact",
  );
  check(
    E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION ===
      "e04-business-agent-platform-freeze-1",
    "E04 platform freeze version present",
  );
  check(
    E05_INTELLIGENCE_BASE ===
      "enterprise-e04-business-agent-platform-freeze-v1",
    "E05 base constant",
  );
  console.log("✓ E03 + E04 unmodified / bases intact");
}

function testFoundationAndInsights() {
  check(INTELLIGENCE_DOMAINS.length === 6, "domains");
  check(INTELLIGENCE_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(
    canAdvanceIntelligenceLifecycle("declared", "registered"),
    "declared→registered",
  );
  check(
    !canAdvanceIntelligenceLifecycle("declared", "completed"),
    "skip blocked",
  );

  check(INTELLIGENCE_CATALOG.length === 6, "intelligence modules");
  check(isIntelligenceDependencyGraphValid(), "dependency graph");
  check(INSIGHT_CATALOG.length === 6, "insights");

  const insights = buildInsightRegistryManifest();
  check(insights.catalogComplete === true, "insight catalog complete");

  const foundation = buildIntelligenceFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.platformId === E05_INTELLIGENCE_PLATFORM_ID, "platform id");
  check(foundation.base === E05_INTELLIGENCE_BASE, "base e04 freeze");
  check(foundation.version === E05_INTELLIGENCE_VERSION, "version");
  check(foundation.registry.catalogComplete === true, "registry complete");
  check(foundation.lifecycle.complete === true, "lifecycle complete");
  assertIntelligenceFoundationPass(foundation);

  check(
    getIntelligenceByDomain("opportunity")?.id === "e05.intel.opportunity",
    "by domain",
  );
  check(listExecutableIntelligenceModules().length === 5, "executable modules");
  console.log("✓ foundation + insights");
  console.log(foundation.summary);
}

function testExecutorBridge() {
  const opportunity = getIntelligenceById("e05.intel.opportunity");
  check(Boolean(opportunity), "opportunity module");

  const context = createIntelligenceExecutionContext({
    intelligenceId: opportunity!.id,
    businessAgentId: opportunity!.businessAgentId,
    insightId: "e05.insight.signal",
    input: {
      goal: "星河科技园健身中心招采情报",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p1" },
  });

  const run = executeIntelligenceOrThrow(opportunity!, context);
  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.business.result.success === true, "E04 business success");
  check(run.result.businessAgentId === "e04.business.tender", "bound agent");
  check(run.result.output.domain === "opportunity", "domain output");

  for (const module of listExecutableIntelligenceModules()) {
    const ctx = createIntelligenceExecutionContext({
      intelligenceId: module.id,
      businessAgentId: module.businessAgentId,
      insightId: module.insightIds[0],
      input: { goal: `probe:${module.domain}` },
    });
    const bundle = executeIntelligenceOrThrow(module, ctx);
    check(bundle.result.success === true, `${module.id} success`);
  }

  // synthesis via coordinator
  const synthesis = getIntelligenceById("e05.intel.synthesis");
  check(Boolean(synthesis), "synthesis module");
  const syn = executeIntelligenceOrThrow(
    synthesis!,
    createIntelligenceExecutionContext({
      intelligenceId: synthesis!.id,
      businessAgentId: synthesis!.businessAgentId,
      insightId: "e05.insight.recommendation",
      input: { goal: "synthesis probe" },
    }),
  );
  check(syn.result.success === true, "synthesis success");

  console.log("✓ intelligence executor → E04 business agent bridge");
}

function main() {
  console.log("E05-P1 — Intelligence Foundation Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [...FROZEN_E04, ...FROZEN_E03]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testFoundationAndInsights();
  testExecutorBridge();
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P1 intelligence foundation");
}

main();
