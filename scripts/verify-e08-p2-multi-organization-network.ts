/**
 * E08-P2 — Multi Organization Network verification
 * Network layer above E08 Enterprise Ecosystem Foundation
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildEcosystemFoundation,
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_PLATFORM_ID,
} from "../lib/ecosystem/e08";
import {
  E08_NETWORK_BASE,
  E08_NETWORK_RUNTIME_ID,
  E08_NETWORK_VERSION,
  NETWORK_INSTANCE_PHASES,
  NETWORK_KINDS,
  NETWORK_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/network/network.constants";
import {
  buildNetworkRegistryManifest,
  getNetworkById,
  getNetworkByKind,
  listNetworksForPartner,
  NETWORK_CATALOG,
} from "../lib/ecosystem/e08/network/network.registry";
import {
  buildNetworkGraph,
  isNetworkGraphAcyclic,
  resolveNetworkExecutionOrder,
} from "../lib/ecosystem/e08/network/network.graph";
import {
  executeNetwork,
  executeNetworkOrThrow,
} from "../lib/ecosystem/e08/network/network.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1 = [
  "lib/ecosystem/e08/core/ecosystem.types.ts",
  "lib/ecosystem/e08/core/ecosystem.constants.ts",
  "lib/ecosystem/e08/core/ecosystem.lifecycle.ts",
  "lib/ecosystem/e08/core/ecosystem.registry.ts",
  "lib/ecosystem/e08/runtime/ecosystem.context.ts",
  "lib/ecosystem/e08/runtime/ecosystem.executor.ts",
  "lib/ecosystem/e08/relationship/relationship.types.ts",
  "lib/ecosystem/e08/relationship/relationship.registry.ts",
  "lib/ecosystem/e08/index.ts",
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
    "lib/ecosystem/e08/network/network.types.ts",
    "lib/ecosystem/e08/network/network.constants.ts",
    "lib/ecosystem/e08/network/network.registry.ts",
    "lib/ecosystem/e08/network/network.graph.ts",
    "lib/ecosystem/e08/network/network.executor.ts",
    "lib/ecosystem/e08/network/network.trace.ts",
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
    E08_ECOSYSTEM_BASE ===
      "enterprise-e07-digital-workforce-platform-freeze-v1",
    "E08-P1 base constant",
  );
  check(
    E08_NETWORK_BASE ===
      "enterprise-e08-p1-enterprise-ecosystem-foundation-v1",
    "E08-P2 base constant",
  );
  console.log("✓ upstream + E08-P1 unmodified / bases intact");
}

function testRegistryAndGraph() {
  check(NETWORK_KINDS.length === 3, "network kinds");
  check(NETWORK_INSTANCE_PHASES.length === 4, "instance phases");
  check(NETWORK_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(NETWORK_CATALOG.length === 3, "networks");

  const manifest = buildNetworkRegistryManifest();
  check(manifest.catalogComplete === true, "network catalog complete");
  check(manifest.runtimeId === E08_NETWORK_RUNTIME_ID, "runtime id");
  check(manifest.version === E08_NETWORK_VERSION, "version");
  check(manifest.base === E08_NETWORK_BASE, "base e08-p1");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getNetworkByKind("supply-chain")?.id === "e08.network.supply-chain",
    "by kind",
  );
  check(
    listNetworksForPartner("e08.partner.supplier").length === 2,
    "networks for partner",
  );

  const supply = getNetworkById("e08.network.supply-chain")!;
  check(isNetworkGraphAcyclic(supply.nodes), "supply acyclic");
  const order = resolveNetworkExecutionOrder(supply.nodes);
  check(order[0] === "e08.org.supply.supplier", "supplier first");
  check(order[1] === "e08.org.supply.customer", "customer second");

  const graph = buildNetworkGraph(supply);
  check(graph.acyclic === true, "graph acyclic");
  check(graph.edges.length === 1, "supply edges");
  check(graph.order.length === 2, "supply order");

  const compliance = getNetworkById("e08.network.compliance")!;
  const compGraph = buildNetworkGraph(compliance);
  check(compGraph.order.length === 4, "compliance order length");
  check(
    compGraph.order.indexOf("e08.org.comp.regulator") >
      compGraph.order.indexOf("e08.org.comp.channel"),
    "regulator after channel",
  );
  check(
    compGraph.order.indexOf("e08.org.comp.hub") >
      compGraph.order.indexOf("e08.org.comp.regulator"),
    "hub after regulator",
  );

  console.log("✓ network registry + graph");
  console.log(`supply order: ${graph.order.join(" → ")}`);
}

function testExecutor() {
  const supply = getNetworkById("e08.network.supply-chain")!;

  const run = executeNetworkOrThrow(supply, {
    input: {
      goal: "星河科技园健身中心多组织供应网络",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p2" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedNodes === 2, "all nodes completed");
  check(
    run.result.nodeResults.every((n) => n.success && n.status === "result"),
    "node results",
  );
  check(run.result.output.kind === "supply-chain", "output kind");

  check(run.trace.eventCount >= 6, "trace events recorded");
  for (const kind of ["graph", "node", "partner", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const network of NETWORK_CATALOG) {
    const bundle = executeNetworkOrThrow(network, {
      input: { goal: `probe:${network.kind}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${network.id} success`);
    check(
      bundle.result.completedNodes === network.nodes.length,
      `${network.id} nodes`,
    );
  }

  const blocked = executeNetwork(supply, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedNodes === 0, "no nodes completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  const broken = executeNetwork({
    ...supply,
    nodes: [
      {
        id: "e08.org.broken",
        name: "Broken Org",
        description: "invalid relationship binding",
        partnerId: "e08.partner.supplier",
        relationshipId: "e08.rel.coordinate",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
    ],
  });
  check(broken.result.success === false, "broken binding not success");
  check(broken.result.status === "failed", "broken binding failed");

  console.log("✓ network executor → E08 ecosystem partner graph bridge");
}

function main() {
  console.log("E08-P2 — Multi Organization Network Verification\n");

  const frozen = [...FROZEN_E08_P1, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1", FROZEN_E08_P1, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndGraph();
  testExecutor();
  checkFrozen("E08-P1", FROZEN_E08_P1, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P2 multi organization network");
}

main();
