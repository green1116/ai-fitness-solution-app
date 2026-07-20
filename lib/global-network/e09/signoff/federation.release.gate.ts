/**
 * E09-P4 — Federation Release Gate
 * Checks federation foundation, trust graph, runtime → PASS / FAIL
 */

import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
  FEDERATION_SCOPES,
  FEDERATION_STATUSES,
} from "../federation/federation.constants";
import {
  buildTrustGraph,
  clearTrustGraph,
  getTrustPaths,
  linkFederations,
} from "../federation/federation.graph";
import {
  buildFederationRegistryManifest,
  clearFederations,
  getFederation,
  listFederations,
  registerFederation,
  removeFederation,
} from "../federation/federation.registry";
import { createFederationRuntime } from "../federation/federation.runtime";
import {
  adjustTrustLevel,
  evaluateTrust,
  isTrustValid,
} from "../federation/federation.trust";
import {
  clearIdentities,
  createIdentity,
} from "../identity/global.identity";
import {
  E09_P4_COMPONENT_LOCK,
  E09_P4_FREEZE_LOCK,
  e09P4FreezeLockMatchesExpected,
  isE09P4FreezeLockIntact,
} from "./federation.freeze.lock";
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

function cleanupFederationGateState(): void {
  clearTrustGraph();
  clearFederations();
  clearIdentities();
}

/** Probe P4 federation modules via public APIs (no filesystem dependency). */
export function checkE09P4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "FD-P4-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P4FreezeLockIntact() && e09P4FreezeLockMatchesExpected(),
      `version=${E09_P4_FREEZE_LOCK.version} base=${E09_P4_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["foundation", "trust-graph", "runtime", "signoff"];
  const lockedIds = E09_P4_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "FD-P4-COMPONENTS",
      "signoff",
      "P4 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Federation foundation (registry)
  try {
    cleanupFederationGateState();
    const identity = createIdentity({
      id: "e09.p4.gate.identity",
      nodeId: "e09.p4.gate.node",
      type: "ENTERPRISE",
      issuer: "e09-p4-gate",
      trustLevel: 80,
    });
    const federation = registerFederation({
      id: "e09.p4.gate.federation",
      identityId: identity.id,
      scope: "GLOBAL",
      trustLevel: 80,
      status: "ACTIVE",
    });
    const fetched = getFederation(federation.id);
    const listed = listFederations({ status: "ACTIVE", scope: "GLOBAL" });
    const manifest = buildFederationRegistryManifest();
    const removed = removeFederation(federation.id);
    const foundationOk =
      fetched?.id === federation.id &&
      fetched.identityId === identity.id &&
      fetched.ownerNodeId === identity.nodeId &&
      listed.some((f) => f.id === federation.id) &&
      removed === true &&
      manifest.federationId === E09_FEDERATION_ID &&
      manifest.version === E09_FEDERATION_VERSION &&
      manifest.base === E09_FEDERATION_BASE &&
      FEDERATION_SCOPES.length === 5 &&
      FEDERATION_STATUSES.length === 3;
    checks.push(
      check(
        "FD-P4-FOUNDATION",
        "foundation",
        "Federation foundation registry",
        foundationOk,
        `federation=${federation.id} base=${manifest.base}`,
      ),
    );
    cleanupFederationGateState();
  } catch (error) {
    checks.push(
      check(
        "FD-P4-FOUNDATION",
        "foundation",
        "Federation foundation registry",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  // Trust graph
  try {
    cleanupFederationGateState();
    const identityA = createIdentity({
      id: "e09.p4.gate.trust.identity.a",
      nodeId: "e09.p4.gate.trust.node.a",
      type: "ENTERPRISE",
      issuer: "e09-p4-gate",
      trustLevel: 85,
    });
    const identityB = createIdentity({
      id: "e09.p4.gate.trust.identity.b",
      nodeId: "e09.p4.gate.trust.node.b",
      type: "PARTNER",
      issuer: "e09-p4-gate",
      trustLevel: 70,
    });
    const fedA = registerFederation({
      id: "e09.p4.gate.trust.a",
      identityId: identityA.id,
      scope: "PARTNER",
      trustLevel: 85,
    });
    const fedB = registerFederation({
      id: "e09.p4.gate.trust.b",
      identityId: identityB.id,
      scope: "PARTNER",
      trustLevel: 70,
    });
    const edge = linkFederations({
      sourceId: fedA.id,
      targetId: fedB.id,
      kind: "TRUST",
      weight: 75,
    });
    const graph = buildTrustGraph({ status: "ACTIVE" });
    const paths = getTrustPaths(fedA.id, fedB.id);
    const evaluation = evaluateTrust(fedA.id, fedB.id, { minTrust: 50 });
    const adjusted = adjustTrustLevel(fedB.id, 5);
    const valid = isTrustValid(fedB.id, { minTrustLevel: 50 });
    const trustOk =
      edge.source === fedA.id &&
      edge.target === fedB.id &&
      graph.nodeCount === 2 &&
      graph.edgeCount === 1 &&
      paths.length >= 1 &&
      paths[0]!.pathTrust > 0 &&
      evaluation.valid === true &&
      adjusted.trustLevel === 75 &&
      valid === true;
    checks.push(
      check(
        "FD-P4-TRUST-GRAPH",
        "trust-graph",
        "Federation trust graph",
        trustOk,
        `edges=${graph.edgeCount} trust=${evaluation.trust} adjusted=${adjusted.trustLevel}`,
      ),
    );
    cleanupFederationGateState();
  } catch (error) {
    checks.push(
      check(
        "FD-P4-TRUST-GRAPH",
        "trust-graph",
        "Federation trust graph",
        false,
        error instanceof Error ? error.message : "trust graph probe failed",
      ),
    );
  }

  // Federation runtime
  try {
    cleanupFederationGateState();
    const identityA = createIdentity({
      id: "e09.p4.gate.runtime.identity.a",
      nodeId: "e09.p4.gate.runtime.node.a",
      type: "AGENT",
      issuer: "e09-p4-gate",
      trustLevel: 90,
    });
    const identityB = createIdentity({
      id: "e09.p4.gate.runtime.identity.b",
      nodeId: "e09.p4.gate.runtime.node.b",
      type: "PARTNER",
      issuer: "e09-p4-gate",
      trustLevel: 80,
    });

    const runtime = createFederationRuntime({ runtimeId: "e09-p4-gate" });
    runtime.initialize();
    runtime.start();
    const registeredA = runtime.execute({
      kind: "register",
      input: {
        id: "e09.p4.gate.runtime.fed.a",
        identityId: identityA.id,
        scope: "NODE",
        trustLevel: 90,
      },
    });
    const registeredB = runtime.execute({
      kind: "register",
      input: {
        id: "e09.p4.gate.runtime.fed.b",
        identityId: identityB.id,
        scope: "NODE",
        trustLevel: 80,
      },
    });
    const linked = runtime.execute({
      kind: "link",
      input: {
        sourceId: "e09.p4.gate.runtime.fed.a",
        targetId: "e09.p4.gate.runtime.fed.b",
        kind: "DELEGATE",
        weight: 80,
      },
    });
    const evaluated = runtime.execute({
      kind: "evaluate",
      sourceId: "e09.p4.gate.runtime.fed.a",
      targetId: "e09.p4.gate.runtime.fed.b",
      minTrust: 40,
    });
    const adjusted = runtime.execute({
      kind: "adjust",
      federationId: "e09.p4.gate.runtime.fed.b",
      delta: -5,
    });
    const snap = runtime.status();
    runtime.stop();

    const runtimeOk =
      registeredA.success &&
      registeredB.success &&
      linked.success &&
      evaluated.success &&
      evaluated.output.valid === true &&
      adjusted.success &&
      adjusted.output.trustLevel === 75 &&
      snap.status === "RUNNING" &&
      snap.federationCount === 2 &&
      snap.trustEdgeCount === 1;
    checks.push(
      check(
        "FD-P4-RUNTIME",
        "runtime",
        "Federation runtime",
        runtimeOk,
        `status=${snap.status} federations=${snap.federationCount} edges=${snap.trustEdgeCount}`,
      ),
    );
    cleanupFederationGateState();
  } catch (error) {
    checks.push(
      check(
        "FD-P4-RUNTIME",
        "runtime",
        "Federation runtime",
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
      `e09-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P4ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P4 release gate failed: ${gate.summary}`);
  }
}
