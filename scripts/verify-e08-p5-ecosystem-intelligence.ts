/**
 * E08-P5 — Ecosystem Intelligence verification
 * Intelligence layer above E08 Cross Enterprise Workflow
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildEcosystemFoundation,
  E08_ECOSYSTEM_PLATFORM_ID,
} from "../lib/ecosystem/e08";
import { buildNetworkRegistryManifest } from "../lib/ecosystem/e08/network/network.registry";
import { buildExchangeRegistryManifest } from "../lib/ecosystem/e08/exchange/exchange.registry";
import { buildWorkflowRegistryManifest } from "../lib/ecosystem/e08/workflow/workflow.registry";
import { E08_WORKFLOW_BASE } from "../lib/ecosystem/e08/workflow/workflow.constants";
import {
  E08_INTELLIGENCE_BASE,
  E08_INTELLIGENCE_ID,
  E08_INTELLIGENCE_VERSION,
  INTELLIGENCE_INSTANCE_PHASES,
  INTELLIGENCE_KINDS,
  INTELLIGENCE_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/intelligence/intelligence.constants";
import {
  buildIntelligenceRegistryManifest,
  getIntelligenceById,
  getIntelligenceByKind,
  listIntelligenceForWorkflow,
  INTELLIGENCE_CATALOG,
} from "../lib/ecosystem/e08/intelligence/intelligence.registry";
import { analyzeWorkflowResult } from "../lib/ecosystem/e08/intelligence/intelligence.analyzer";
import {
  buildEcosystemInsight,
  runEcosystemIntelligence,
  runEcosystemIntelligenceOrThrow,
} from "../lib/ecosystem/e08/intelligence/intelligence.insight";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1_P4 = [
  "lib/ecosystem/e08/core/ecosystem.types.ts",
  "lib/ecosystem/e08/core/ecosystem.constants.ts",
  "lib/ecosystem/e08/core/ecosystem.lifecycle.ts",
  "lib/ecosystem/e08/core/ecosystem.registry.ts",
  "lib/ecosystem/e08/runtime/ecosystem.context.ts",
  "lib/ecosystem/e08/runtime/ecosystem.executor.ts",
  "lib/ecosystem/e08/relationship/relationship.types.ts",
  "lib/ecosystem/e08/relationship/relationship.registry.ts",
  "lib/ecosystem/e08/index.ts",
  "lib/ecosystem/e08/network/network.types.ts",
  "lib/ecosystem/e08/network/network.constants.ts",
  "lib/ecosystem/e08/network/network.registry.ts",
  "lib/ecosystem/e08/network/network.graph.ts",
  "lib/ecosystem/e08/network/network.executor.ts",
  "lib/ecosystem/e08/network/network.trace.ts",
  "lib/ecosystem/e08/exchange/exchange.types.ts",
  "lib/ecosystem/e08/exchange/exchange.constants.ts",
  "lib/ecosystem/e08/exchange/exchange.registry.ts",
  "lib/ecosystem/e08/exchange/exchange.catalog.ts",
  "lib/ecosystem/e08/exchange/exchange.matcher.ts",
  "lib/ecosystem/e08/exchange/exchange.trace.ts",
  "lib/ecosystem/e08/workflow/workflow.types.ts",
  "lib/ecosystem/e08/workflow/workflow.constants.ts",
  "lib/ecosystem/e08/workflow/workflow.registry.ts",
  "lib/ecosystem/e08/workflow/workflow.planner.ts",
  "lib/ecosystem/e08/workflow/workflow.executor.ts",
  "lib/ecosystem/e08/workflow/workflow.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/index.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
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
    "lib/ecosystem/e08/intelligence/intelligence.types.ts",
    "lib/ecosystem/e08/intelligence/intelligence.constants.ts",
    "lib/ecosystem/e08/intelligence/intelligence.registry.ts",
    "lib/ecosystem/e08/intelligence/intelligence.analyzer.ts",
    "lib/ecosystem/e08/intelligence/intelligence.insight.ts",
    "lib/ecosystem/e08/intelligence/intelligence.trace.ts",
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
  const foundation = buildEcosystemFoundation();
  check(foundation.ready === true, "E08-P1 foundation still ready");
  check(
    foundation.platformId === E08_ECOSYSTEM_PLATFORM_ID,
    "E08-P1 platform id intact",
  );
  check(
    buildNetworkRegistryManifest().catalogComplete === true,
    "E08-P2 networks still complete",
  );
  check(
    buildExchangeRegistryManifest().catalogComplete === true,
    "E08-P3 exchange still complete",
  );
  check(
    buildWorkflowRegistryManifest().catalogComplete === true,
    "E08-P4 workflows still complete",
  );
  check(
    E08_WORKFLOW_BASE === "enterprise-e08-p3-ai-partner-exchange-v1",
    "E08-P4 base constant",
  );
  check(
    E08_INTELLIGENCE_BASE ===
      "enterprise-e08-p4-cross-enterprise-workflow-v1",
    "E08-P5 base constant",
  );
  console.log("✓ upstream + E08-P1..P4 unmodified / bases intact");
}

function testRegistryAndAnalyzer() {
  check(INTELLIGENCE_KINDS.length === 3, "intelligence kinds");
  check(INTELLIGENCE_INSTANCE_PHASES.length === 4, "instance phases");
  check(INTELLIGENCE_TRACE_EVENT_KINDS.length === 5, "trace event kinds");
  check(INTELLIGENCE_CATALOG.length === 3, "definitions");

  const manifest = buildIntelligenceRegistryManifest();
  check(manifest.catalogComplete === true, "intelligence catalog complete");
  check(manifest.intelligenceId === E08_INTELLIGENCE_ID, "intelligence id");
  check(manifest.version === E08_INTELLIGENCE_VERSION, "version");
  check(manifest.base === E08_INTELLIGENCE_BASE, "base e08-p4");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getIntelligenceByKind("coverage")?.id === "e08.intel.supply-coverage",
    "by kind",
  );
  check(
    listIntelligenceForWorkflow("e08.workflow.enterprise-handoff").length === 1,
    "for workflow",
  );

  const empty = analyzeWorkflowResult(undefined, "e08.workflow.missing", 100);
  check(empty.needsInsight === true, "empty needs insight");
  check(empty.score === 0, "empty score");

  const coverage = getIntelligenceById("e08.intel.supply-coverage")!;
  const insight = buildEcosystemInsight(coverage, empty);
  check(insight.kind === "coverage", "insight kind");
  check(insight.recommendations.length > 0, "insight recommendations");
  check(insight.headline.includes("reinforcement"), "insight headline");

  console.log("✓ intelligence registry + analyzer");
}

function testInsightRunner() {
  const coverage = getIntelligenceById("e08.intel.supply-coverage")!;

  const run = runEcosystemIntelligenceOrThrow(coverage, {
    input: {
      goal: "星河科技园健身中心生态智能覆盖分析",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p5" },
  });

  check(run.result.success === true, "intelligence success");
  check(run.result.status === "result", "status result");
  check(run.result.analysis.score === 100, "analysis score");
  check(run.result.analysis.needsInsight === false, "healthy analysis");
  check(run.result.insight.kind === "coverage", "insight kind");
  check(run.result.workflow?.success === true, "workflow success");
  check(run.result.output.kind === "coverage", "output kind");

  check(run.trace.eventCount >= 4, "trace events recorded");
  for (const kind of ["analyze", "insight", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const definition of INTELLIGENCE_CATALOG) {
    const bundle = runEcosystemIntelligenceOrThrow(definition, {
      input: {
        goal: `probe:${definition.kind}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${definition.id} success`);
    check(
      bundle.result.workflowId === definition.workflowId,
      `${definition.id} workflow binding`,
    );
  }

  // Unsafe input blocks supply coverage (signals do not clear unsafe)
  const blocked = runEcosystemIntelligence(coverage, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  // Expansion intelligence clears unsafe via signals and recovers
  const expansion = getIntelligenceById("e08.intel.market-expansion")!;
  const recovered = runEcosystemIntelligenceOrThrow(expansion, {
    input: { goal: "recover probe", unsafe: true, ready: false },
  });
  check(recovered.result.success === true, "signal reinforcement success");
  check(recovered.result.appliedSignals.length > 0, "signals applied");

  let threw = false;
  try {
    runEcosystemIntelligence({
      ...coverage,
      workflowId: "e08.workflow.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error && error.message.includes("missing E08 workflow");
  }
  check(threw, "broken definition rejected");

  console.log("✓ intelligence insight → E08 workflow analysis bridge");
}

function main() {
  console.log("E08-P5 — Ecosystem Intelligence Verification\n");

  const frozen = [...FROZEN_E08_P1_P4, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1..P4", FROZEN_E08_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndAnalyzer();
  testInsightRunner();
  checkFrozen("E08-P1..P4", FROZEN_E08_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P5 ecosystem intelligence");
}

main();
