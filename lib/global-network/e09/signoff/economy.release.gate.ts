/**
 * E09-P5 — Economy Release Gate
 * Checks economy foundation, value flow, runtime → PASS / FAIL
 */

import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
  ECONOMIC_NODE_STATUSES,
  ECONOMIC_NODE_TYPES,
  VALUE_FLOW_KINDS,
} from "../economy/economy.constants";
import {
  clearValueFlows,
  createValueFlow,
  getFlowPaths,
  linkFlow,
  settleFlow,
} from "../economy/economy.flow";
import {
  buildEconomyRegistryManifest,
  clearEconomicNodes,
  getEconomicNode,
  listEconomicNodes,
  registerEconomicNode,
  removeEconomicNode,
} from "../economy/economy.registry";
import { createEconomyRuntime } from "../economy/economy.runtime";
import {
  E09_P5_COMPONENT_LOCK,
  E09_P5_FREEZE_LOCK,
  e09P5FreezeLockMatchesExpected,
  isE09P5FreezeLockIntact,
} from "./economy.freeze.lock";
import type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
} from "./release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
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

function cleanupEconomyGateState(): void {
  clearValueFlows();
  clearEconomicNodes();
}

/** Probe P5 economy modules via public APIs (no filesystem dependency). */
export function checkE09P5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "EC-P5-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P5FreezeLockIntact() && e09P5FreezeLockMatchesExpected(),
      `version=${E09_P5_FREEZE_LOCK.version} base=${E09_P5_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["foundation", "flow", "runtime", "signoff"];
  const lockedIds = E09_P5_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "EC-P5-COMPONENTS",
      "signoff",
      "P5 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Economy foundation (registry)
  try {
    cleanupEconomyGateState();
    const node = registerEconomicNode({
      id: "e09.p5.gate.node",
      name: "Gate Producer",
      type: "PRODUCER",
      status: "ACTIVE",
      balance: 100,
    });
    const fetched = getEconomicNode(node.id);
    const listed = listEconomicNodes({ status: "ACTIVE", type: "PRODUCER" });
    const manifest = buildEconomyRegistryManifest();
    const removed = removeEconomicNode(node.id);
    const foundationOk =
      fetched?.id === node.id &&
      fetched.balance === 100 &&
      listed.some((n) => n.id === node.id) &&
      removed === true &&
      manifest.economyId === E09_ECONOMY_ID &&
      manifest.version === E09_ECONOMY_VERSION &&
      manifest.base === E09_ECONOMY_BASE &&
      ECONOMIC_NODE_TYPES.length === 5 &&
      ECONOMIC_NODE_STATUSES.length === 3 &&
      VALUE_FLOW_KINDS.length === 4;
    checks.push(
      check(
        "EC-P5-FOUNDATION",
        "foundation",
        "Economy foundation registry",
        foundationOk,
        `node=${node.id} base=${manifest.base}`,
      ),
    );
    cleanupEconomyGateState();
  } catch (error) {
    checks.push(
      check(
        "EC-P5-FOUNDATION",
        "foundation",
        "Economy foundation registry",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  // Value flow engine
  try {
    cleanupEconomyGateState();
    registerEconomicNode({
      id: "e09.p5.gate.flow.source",
      name: "Flow Source",
      type: "PRODUCER",
      balance: 200,
    });
    registerEconomicNode({
      id: "e09.p5.gate.flow.router",
      name: "Flow Router",
      type: "ROUTER",
      balance: 0,
    });
    registerEconomicNode({
      id: "e09.p5.gate.flow.target",
      name: "Flow Target",
      type: "CONSUMER",
      balance: 0,
    });
    const flow = createValueFlow({
      id: "e09.p5.gate.flow",
      kind: "TRANSFER",
      sourceId: "e09.p5.gate.flow.source",
      targetId: "e09.p5.gate.flow.target",
      amount: 50,
    });
    linkFlow({
      flowId: flow.id,
      fromId: "e09.p5.gate.flow.source",
      toId: "e09.p5.gate.flow.router",
      capacity: 50,
    });
    linkFlow({
      flowId: flow.id,
      fromId: "e09.p5.gate.flow.router",
      toId: "e09.p5.gate.flow.target",
      capacity: 50,
    });
    const paths = getFlowPaths(
      "e09.p5.gate.flow.source",
      "e09.p5.gate.flow.target",
      { flowId: flow.id },
    );
    const settled = settleFlow(flow.id);
    const source = getEconomicNode("e09.p5.gate.flow.source");
    const target = getEconomicNode("e09.p5.gate.flow.target");
    const flowOk =
      paths.length >= 1 &&
      paths[0]!.minCapacity >= 50 &&
      settled.status === "SETTLED" &&
      source?.balance === 150 &&
      target?.balance === 50;
    checks.push(
      check(
        "EC-P5-FLOW",
        "flow",
        "Value flow engine",
        flowOk,
        `paths=${paths.length} settled=${settled.status} source=${source?.balance} target=${target?.balance}`,
      ),
    );
    cleanupEconomyGateState();
  } catch (error) {
    checks.push(
      check(
        "EC-P5-FLOW",
        "flow",
        "Value flow engine",
        false,
        error instanceof Error ? error.message : "flow probe failed",
      ),
    );
  }

  // Economy runtime
  try {
    cleanupEconomyGateState();
    const runtime = createEconomyRuntime({ runtimeId: "e09-p5-gate" });
    runtime.initialize();
    runtime.start();
    runtime.registerEconomicNode({
      id: "e09.p5.gate.runtime.a",
      name: "Runtime A",
      type: "PRODUCER",
      balance: 80,
    });
    runtime.registerEconomicNode({
      id: "e09.p5.gate.runtime.b",
      name: "Runtime B",
      type: "CONSUMER",
      balance: 0,
    });
    const flow = runtime.createValueFlow({
      id: "e09.p5.gate.runtime.flow",
      kind: "EXCHANGE",
      sourceId: "e09.p5.gate.runtime.a",
      targetId: "e09.p5.gate.runtime.b",
      amount: 30,
    });
    runtime.linkFlow({
      flowId: flow.id,
      fromId: "e09.p5.gate.runtime.a",
      toId: "e09.p5.gate.runtime.b",
      capacity: 30,
    });
    const paths = runtime.getFlowPaths(
      "e09.p5.gate.runtime.a",
      "e09.p5.gate.runtime.b",
      { flowId: flow.id },
    );
    const settled = runtime.settleFlow(flow.id);
    const snap = runtime.status();
    runtime.stop();

    const runtimeOk =
      paths.length === 1 &&
      settled.status === "SETTLED" &&
      snap.status === "RUNNING" &&
      snap.nodeCount === 2 &&
      snap.flowCount === 1 &&
      snap.linkCount === 1 &&
      snap.settledCount === 1 &&
      runtime.getEconomicNode("e09.p5.gate.runtime.a")?.balance === 50 &&
      runtime.getEconomicNode("e09.p5.gate.runtime.b")?.balance === 30;
    checks.push(
      check(
        "EC-P5-RUNTIME",
        "runtime",
        "Economy runtime",
        runtimeOk,
        `status=${snap.status} nodes=${snap.nodeCount} settled=${snap.settledCount}`,
      ),
    );
    cleanupEconomyGateState();
  } catch (error) {
    checks.push(
      check(
        "EC-P5-RUNTIME",
        "runtime",
        "Economy runtime",
        false,
        error instanceof Error ? error.message : "runtime probe failed",
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
      `e09-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P5ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P5 release gate failed: ${gate.summary}`);
  }
}
