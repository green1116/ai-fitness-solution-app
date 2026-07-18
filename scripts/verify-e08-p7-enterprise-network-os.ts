/**
 * E08-P7 — Enterprise Network OS verification
 * Network operating layer above E08 Autonomous Market Agent
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
import { buildMarketAgentRegistryManifest } from "../lib/ecosystem/e08/market/market.registry";
import { E08_MARKET_BASE } from "../lib/ecosystem/e08/market/market.constants";
import {
  E08_NETWORK_OS_BASE,
  E08_NETWORK_OS_ID,
  E08_NETWORK_OS_VERSION,
  NETWORK_OS_INSTANCE_PHASES,
  NETWORK_OS_KINDS,
  NETWORK_OS_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/network-os/networkos.constants";
import {
  buildNetworkOsRegistryManifest,
  getNetworkOsById,
  getNetworkOsByKind,
  listNetworkOsForMarketAgent,
  NETWORK_OS_CATALOG,
} from "../lib/ecosystem/e08/network-os/networkos.registry";
import { controlNetworkOs } from "../lib/ecosystem/e08/network-os/networkos.controller";
import {
  executeNetworkOs,
  executeNetworkOsOrThrow,
} from "../lib/ecosystem/e08/network-os/networkos.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1_P6 = [
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
  "lib/ecosystem/e08/market/market.types.ts",
  "lib/ecosystem/e08/market/market.constants.ts",
  "lib/ecosystem/e08/market/market.registry.ts",
  "lib/ecosystem/e08/market/market.agent.ts",
  "lib/ecosystem/e08/market/market.executor.ts",
  "lib/ecosystem/e08/market/market.trace.ts",
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
    "lib/ecosystem/e08/network-os/networkos.types.ts",
    "lib/ecosystem/e08/network-os/networkos.constants.ts",
    "lib/ecosystem/e08/network-os/networkos.registry.ts",
    "lib/ecosystem/e08/network-os/networkos.controller.ts",
    "lib/ecosystem/e08/network-os/networkos.executor.ts",
    "lib/ecosystem/e08/network-os/networkos.trace.ts",
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
    buildMarketAgentRegistryManifest().catalogComplete === true,
    "E08-P6 market agents still complete",
  );
  check(
    E08_MARKET_BASE === "enterprise-e08-p5-ecosystem-intelligence-v1",
    "E08-P6 base constant",
  );
  check(
    E08_NETWORK_OS_BASE === "enterprise-e08-p6-autonomous-market-agent-v1",
    "E08-P7 base constant",
  );
  console.log("✓ upstream + E08-P1..P6 unmodified / bases intact");
}

function testRegistryAndController() {
  check(NETWORK_OS_KINDS.length === 3, "network os kinds");
  check(NETWORK_OS_INSTANCE_PHASES.length === 4, "instance phases");
  check(NETWORK_OS_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(NETWORK_OS_CATALOG.length === 3, "definitions");

  const manifest = buildNetworkOsRegistryManifest();
  check(manifest.catalogComplete === true, "network os catalog complete");
  check(manifest.networkOsId === E08_NETWORK_OS_ID, "network os id");
  check(manifest.version === E08_NETWORK_OS_VERSION, "version");
  check(manifest.base === E08_NETWORK_OS_BASE, "base e08-p6");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getNetworkOsByKind("sector")?.id === "e08.networkos.capture-sector",
    "by kind",
  );
  check(
    listNetworkOsForMarketAgent("e08.market.capture").length === 3,
    "for market agent",
  );

  const enterprise = getNetworkOsById("e08.networkos.enterprise")!;
  const plan = controlNetworkOs(enterprise);
  check(plan.slotCount === 3, "enterprise slots");
  check(plan.slots[0].marketMission === "capture", "first capture");
  check(plan.slots[1].marketMission === "expand", "second expand");
  check(plan.slots[2].marketMission === "stabilize", "third stabilize");
  check(
    plan.slots.every((s, i) => s.order === i + 1),
    "slot order",
  );
  check(plan.narrative.includes("3 market agent slots"), "narrative");
  console.log("✓ network os registry + controller");
  console.log(plan.narrative);
}

function testExecutor() {
  const sector = getNetworkOsById("e08.networkos.capture-sector")!;

  const run = executeNetworkOsOrThrow(sector, {
    input: {
      goal: "星河科技园健身中心企业网络操作系统",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p7" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedSlots === 1, "all slots completed");
  check(
    run.result.slotResults.every((s) => s.success && s.status === "result"),
    "slot results",
  );
  check(run.result.output.kind === "sector", "output kind");
  check(
    run.result.marketAgentIds[0] === "e08.market.capture",
    "market agent binding",
  );

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["control", "slot", "market", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const definition of NETWORK_OS_CATALOG) {
    const bundle = executeNetworkOsOrThrow(definition, {
      input: {
        goal: `probe:${definition.kind}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${definition.id} success`);
    check(
      bundle.result.completedSlots === definition.marketAgentIds.length,
      `${definition.id} slots`,
    );
  }

  const blocked = executeNetworkOs(sector, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedSlots === 0, "no slots completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  const broken = executeNetworkOs({
    ...sector,
    marketAgentIds: ["e08.market.missing"],
  });
  check(broken.result.success === false, "broken binding not success");
  check(broken.result.status === "failed", "broken binding failed");

  console.log("✓ network os executor → E08 market agent bridge");
}

function main() {
  console.log("E08-P7 — Enterprise Network OS Verification\n");

  const frozen = [...FROZEN_E08_P1_P6, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1..P6", FROZEN_E08_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndController();
  testExecutor();
  checkFrozen("E08-P1..P6", FROZEN_E08_P1_P6, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P7 enterprise network os");
}

main();
