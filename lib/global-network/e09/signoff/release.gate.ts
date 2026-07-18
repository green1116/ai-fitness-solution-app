/**
 * E09-P1 — Release Gate
 * Checks P1 modules and returns PASS / FAIL
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
  GLOBAL_NODE_TYPES,
} from "../core/global.constants";
import { buildGlobalNetworkFoundation } from "../core/global.lifecycle";
import { createNetworkGraph } from "../network/network.graph";
import { createGlobalNetworkNode } from "../network/network.node";
import { buildTopology } from "../network/network.topology";
import { createNetworkRuntime } from "../runtime/network.runtime";
import {
  clearIdentities,
  createIdentity,
  revokeIdentity,
  verifyIdentity,
} from "../identity/global.identity";
import {
  E09_P1_COMPONENT_LOCK,
  E09_P1_FREEZE_LOCK,
  e09P1FreezeLockMatchesExpected,
  isE09P1FreezeLockIntact,
} from "./freeze.lock";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

/** Probe P1 modules via public APIs (no filesystem dependency). */
export function checkE09P1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "GN-P1-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P1FreezeLockIntact() && e09P1FreezeLockMatchesExpected(),
      `version=${E09_P1_FREEZE_LOCK.version} base=${E09_P1_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["core", "network", "runtime", "identity", "signoff"];
  const lockedIds = E09_P1_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "GN-P1-COMPONENTS",
      "signoff",
      "P1 component lock complete",
      requiredIds.every((id) => lockedIds.includes(id as (typeof lockedIds)[number])),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Core
  try {
    const foundation = buildGlobalNetworkFoundation();
    const coreOk =
      foundation.ready === true &&
      foundation.platformId === E09_GLOBAL_NETWORK_PLATFORM_ID &&
      foundation.version === E09_GLOBAL_NETWORK_VERSION &&
      foundation.base === E09_GLOBAL_NETWORK_BASE &&
      GLOBAL_NODE_TYPES.length === 6;
    checks.push(
      check(
        "GN-P1-CORE",
        "core",
        "Global network foundation core",
        coreOk,
        foundation.summary,
      ),
    );
  } catch (error) {
    checks.push(
      check(
        "GN-P1-CORE",
        "core",
        "Global network foundation core",
        false,
        error instanceof Error ? error.message : "core probe failed",
      ),
    );
  }

  // Network graph engine
  try {
    const graph = createNetworkGraph();
    const a = createGlobalNetworkNode({
      id: "e09.gate.node.a",
      type: "ENTERPRISE",
    });
    const b = createGlobalNetworkNode({
      id: "e09.gate.node.b",
      type: "PARTNER",
    });
    graph.addNode(a);
    graph.addNode(b);
    graph.connect({
      source: a.id,
      target: b.id,
      relation: "PARTNER",
      weight: 1,
    });
    const topology = buildTopology(graph);
    const networkOk =
      graph.nodeCount() === 2 &&
      graph.edgeCount() === 1 &&
      topology.nodeCount === 2;
    checks.push(
      check(
        "GN-P1-NETWORK",
        "network",
        "Network graph engine",
        networkOk,
        `nodes=${graph.nodeCount()} edges=${graph.edgeCount()}`,
      ),
    );
  } catch (error) {
    checks.push(
      check(
        "GN-P1-NETWORK",
        "network",
        "Network graph engine",
        false,
        error instanceof Error ? error.message : "network probe failed",
      ),
    );
  }

  // Runtime kernel
  try {
    const runtime = createNetworkRuntime({ runtimeId: "e09-p1-gate" });
    runtime.initialize();
    runtime.start();
    const node = createGlobalNetworkNode({
      id: "e09.gate.runtime.node",
      type: "AGENT",
    });
    const added = runtime.execute({ kind: "add_node", node });
    const snap = runtime.status();
    runtime.stop();
    const runtimeOk =
      added.success &&
      snap.status === "RUNNING" &&
      runtime.getTraces().length > 0;
    checks.push(
      check(
        "GN-P1-RUNTIME",
        "runtime",
        "Global network runtime kernel",
        runtimeOk,
        `status=${snap.status} traces=${runtime.getTraces().length}`,
      ),
    );
  } catch (error) {
    checks.push(
      check(
        "GN-P1-RUNTIME",
        "runtime",
        "Global network runtime kernel",
        false,
        error instanceof Error ? error.message : "runtime probe failed",
      ),
    );
  }

  // Identity layer
  try {
    clearIdentities();
    const identity = createIdentity({
      nodeId: "e09.gate.identity.node",
      type: "ENTERPRISE",
      issuer: "e09-p1-gate",
      trustLevel: 80,
    });
    const verified = verifyIdentity(identity.id, { minTrustLevel: 50 });
    revokeIdentity(identity.id);
    const afterRevoke = verifyIdentity(identity.id);
    const identityOk = verified.valid === true && afterRevoke.valid === false;
    checks.push(
      check(
        "GN-P1-IDENTITY",
        "identity",
        "Global identity layer",
        identityOk,
        `identity=${identity.id} verified=${verified.valid}`,
      ),
    );
    clearIdentities();
  } catch (error) {
    checks.push(
      check(
        "GN-P1-IDENTITY",
        "identity",
        "Global identity layer",
        false,
        error instanceof Error ? error.message : "identity probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e09-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P1ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P1 release gate failed: ${gate.summary}`);
  }
}
