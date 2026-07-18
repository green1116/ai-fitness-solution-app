/**
 * E08-P6 — Autonomous Market Agent verification
 * Market agent layer above E08 Ecosystem Intelligence
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
import { buildIntelligenceRegistryManifest } from "../lib/ecosystem/e08/intelligence/intelligence.registry";
import { E08_INTELLIGENCE_BASE } from "../lib/ecosystem/e08/intelligence/intelligence.constants";
import {
  runEcosystemIntelligenceOrThrow,
} from "../lib/ecosystem/e08/intelligence/intelligence.insight";
import { getIntelligenceById } from "../lib/ecosystem/e08/intelligence/intelligence.registry";
import {
  E08_MARKET_AGENT_ID,
  E08_MARKET_BASE,
  E08_MARKET_VERSION,
  MARKET_DIRECTIVE_KINDS,
  MARKET_MISSIONS,
  MARKET_POSTURES,
  MARKET_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/market/market.constants";
import {
  buildMarketAgentRegistryManifest,
  getMarketAgentById,
  getMarketAgentByMission,
  listMarketAgentsForIntelligence,
  MARKET_AGENT_CATALOG,
} from "../lib/ecosystem/e08/market/market.registry";
import { reasonMarketAgent } from "../lib/ecosystem/e08/market/market.agent";
import {
  executeMarketAgent,
  executeMarketAgentOrThrow,
} from "../lib/ecosystem/e08/market/market.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1_P5 = [
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
  "lib/ecosystem/e08/intelligence/intelligence.types.ts",
  "lib/ecosystem/e08/intelligence/intelligence.constants.ts",
  "lib/ecosystem/e08/intelligence/intelligence.registry.ts",
  "lib/ecosystem/e08/intelligence/intelligence.analyzer.ts",
  "lib/ecosystem/e08/intelligence/intelligence.insight.ts",
  "lib/ecosystem/e08/intelligence/intelligence.trace.ts",
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
    "lib/ecosystem/e08/market/market.types.ts",
    "lib/ecosystem/e08/market/market.constants.ts",
    "lib/ecosystem/e08/market/market.registry.ts",
    "lib/ecosystem/e08/market/market.agent.ts",
    "lib/ecosystem/e08/market/market.executor.ts",
    "lib/ecosystem/e08/market/market.trace.ts",
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
    buildIntelligenceRegistryManifest().catalogComplete === true,
    "E08-P5 intelligence still complete",
  );
  check(
    E08_INTELLIGENCE_BASE ===
      "enterprise-e08-p4-cross-enterprise-workflow-v1",
    "E08-P5 base constant",
  );
  check(
    E08_MARKET_BASE === "enterprise-e08-p5-ecosystem-intelligence-v1",
    "E08-P6 base constant",
  );
  console.log("✓ upstream + E08-P1..P5 unmodified / bases intact");
}

function testRegistryAndReasoner() {
  check(MARKET_MISSIONS.length === 3, "market missions");
  check(MARKET_POSTURES.length === 4, "market postures");
  check(MARKET_DIRECTIVE_KINDS.length === 4, "directive kinds");
  check(MARKET_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(MARKET_AGENT_CATALOG.length === 3, "agents");

  const manifest = buildMarketAgentRegistryManifest();
  check(manifest.catalogComplete === true, "market catalog complete");
  check(manifest.agentPlatformId === E08_MARKET_AGENT_ID, "agent platform id");
  check(manifest.version === E08_MARKET_VERSION, "version");
  check(manifest.base === E08_MARKET_BASE, "base e08-p5");
  check(manifest.missions.length === 3, "missions covered");

  check(
    getMarketAgentByMission("capture")?.id === "e08.market.capture",
    "by mission",
  );
  check(
    getMarketAgentById("e08.market.expand")?.intelligenceId ===
      "e08.intel.market-expansion",
    "by id",
  );
  check(
    listMarketAgentsForIntelligence("e08.intel.enterprise-coherence").length ===
      1,
    "for intelligence",
  );

  const capture = getMarketAgentById("e08.market.capture")!;
  const intelRun = runEcosystemIntelligenceOrThrow(
    getIntelligenceById(capture.intelligenceId)!,
    { input: { goal: "reason probe", ready: true, riskScore: 10 } },
  );
  const decision = reasonMarketAgent(capture, intelRun.result);
  check(decision.posture === "aggressive", "healthy preferred posture");
  check(decision.directives.length === 4, "directives");
  check(decision.directives[0].kind === "sense", "first sense");
  check(decision.confidence >= 0.3, "confidence");
  check(decision.rationale.includes("capture"), "rationale");

  console.log("✓ market registry + reasoner");
  console.log(decision.rationale);
}

function testExecutor() {
  const capture = getMarketAgentById("e08.market.capture")!;

  const run = executeMarketAgentOrThrow(capture, {
    input: {
      goal: "星河科技园健身中心自治市场捕获代理",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p6" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.intelligence?.success === true, "intelligence success");
  check(run.result.decision?.posture === "aggressive", "decision posture");
  check(run.result.decision?.directives.length === 4, "decision directives");
  check(run.result.output.mission === "capture", "output mission");

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["intelligence", "reason", "decide", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const agent of MARKET_AGENT_CATALOG) {
    const bundle = executeMarketAgentOrThrow(agent, {
      input: {
        goal: `probe:${agent.mission}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${agent.id} success`);
    check(
      bundle.result.intelligenceId === agent.intelligenceId,
      `${agent.id} intelligence binding`,
    );
  }

  const blocked = executeMarketAgent(capture, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  let threw = false;
  try {
    executeMarketAgent({
      ...capture,
      intelligenceId: "e08.intel.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error &&
      error.message.includes("missing E08 intelligence");
  }
  check(threw, "broken agent definition rejected");

  console.log("✓ market executor → E08 ecosystem intelligence bridge");
}

function main() {
  console.log("E08-P6 — Autonomous Market Agent Verification\n");

  const frozen = [...FROZEN_E08_P1_P5, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1..P5", FROZEN_E08_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndReasoner();
  testExecutor();
  checkFrozen("E08-P1..P5", FROZEN_E08_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P6 autonomous market agent");
}

main();
