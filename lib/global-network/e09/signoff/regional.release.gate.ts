/**
 * E09-P2 — Regional Release Gate
 * Checks regional foundation, hub runtime, policy engine → PASS / FAIL
 */

import { createGlobalNetworkNode } from "../network/network.node";
import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
  REGIONAL_STATUSES,
} from "../regional/regional.constants";
import {
  clearPolicies,
  attachPolicy,
  createPolicy,
  evaluatePolicy,
  removePolicy,
} from "../regional/regional.policy";
import {
  buildRegionalRegistryManifest,
  clearRegions,
  getRegion,
  listRegions,
  registerRegion,
  removeRegion,
} from "../regional/regional.registry";
import { clearHubs } from "../regional/regional.hub";
import { createRegionalRuntime } from "../regional/regional.runtime";
import {
  E09_P2_COMPONENT_LOCK,
  E09_P2_FREEZE_LOCK,
  e09P2FreezeLockMatchesExpected,
  isE09P2FreezeLockIntact,
} from "./regional.freeze.lock";
import type { GateCheckItem, GateVerdict, ReleaseGateResult } from "./release.gate";

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

/** Probe P2 regional modules via public APIs (no filesystem dependency). */
export function checkE09P2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "RG-P2-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P2FreezeLockIntact() && e09P2FreezeLockMatchesExpected(),
      `version=${E09_P2_FREEZE_LOCK.version} base=${E09_P2_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["foundation", "hub-runtime", "policy", "signoff"];
  const lockedIds = E09_P2_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "RG-P2-COMPONENTS",
      "signoff",
      "P2 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Regional foundation (registry)
  try {
    clearRegions();
    const parent = createGlobalNetworkNode({
      id: "e09.p2.gate.parent",
      type: "REGION",
    });
    const region = registerRegion({
      id: "e09.p2.gate.region",
      name: "Gate Region",
      code: "GATE",
      parentGlobalNode: parent,
      status: "ACTIVE",
    });
    const fetched = getRegion(region.id);
    const listed = listRegions({ status: "ACTIVE" });
    const manifest = buildRegionalRegistryManifest();
    const removed = removeRegion(region.id);
    const foundationOk =
      fetched?.id === region.id &&
      listed.some((r) => r.id === region.id) &&
      removed === true &&
      manifest.regionalId === E09_REGIONAL_ID &&
      manifest.version === E09_REGIONAL_VERSION &&
      manifest.base === E09_REGIONAL_BASE &&
      REGIONAL_STATUSES.length === 3;
    checks.push(
      check(
        "RG-P2-FOUNDATION",
        "foundation",
        "Regional foundation registry",
        foundationOk,
        `region=${region.id} base=${manifest.base}`,
      ),
    );
    clearRegions();
  } catch (error) {
    checks.push(
      check(
        "RG-P2-FOUNDATION",
        "foundation",
        "Regional foundation registry",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  // Hub runtime
  try {
    clearHubs();
    clearRegions();
    const parent = createGlobalNetworkNode({
      id: "e09.p2.gate.hub.parent",
      type: "REGION",
    });
    const region = registerRegion({
      id: "e09.p2.gate.hub.region",
      name: "Hub Gate Region",
      code: "HUBG",
      parentGlobalNode: parent,
    });
    const runtime = createRegionalRuntime({ runtimeId: "e09-p2-gate" });
    runtime.initialize();
    runtime.start();
    const hub = runtime.createHub({
      id: "e09.p2.gate.hub",
      name: "Gate Hub",
    });
    const attached = runtime.attachRegion(hub.id, region);
    const snap = runtime.status();
    runtime.stop();
    const hubOk =
      attached.regionIds.includes(region.id) &&
      snap.status === "RUNNING" &&
      snap.hubCount === 1 &&
      snap.regionAttachmentCount === 1 &&
      runtime.getHub(hub.id)?.id === hub.id;
    checks.push(
      check(
        "RG-P2-HUB-RUNTIME",
        "hub-runtime",
        "Regional hub runtime",
        hubOk,
        `status=${snap.status} hubs=${snap.hubCount} attachments=${snap.regionAttachmentCount}`,
      ),
    );
    clearHubs();
    clearRegions();
  } catch (error) {
    checks.push(
      check(
        "RG-P2-HUB-RUNTIME",
        "hub-runtime",
        "Regional hub runtime",
        false,
        error instanceof Error ? error.message : "hub runtime probe failed",
      ),
    );
  }

  // Policy engine
  try {
    clearPolicies();
    clearRegions();
    const parent = createGlobalNetworkNode({
      id: "e09.p2.gate.policy.parent",
      type: "REGION",
    });
    const region = registerRegion({
      id: "e09.p2.gate.policy.region",
      name: "Policy Gate Region",
      code: "POLG",
      parentGlobalNode: parent,
      status: "ACTIVE",
    });
    const policy = createPolicy({
      id: "e09.p2.gate.policy",
      name: "Gate Policy",
      rules: [
        { field: "region.status", operator: "eq", value: "ACTIVE" },
        { field: "region.code", operator: "eq", value: "POLG" },
      ],
      priority: 10,
      status: "DRAFT",
    });
    const attached = attachPolicy(policy.id, region);
    const evaluation = evaluatePolicy(policy.id, { region });
    const removed = removePolicy(policy.id);
    const policyOk =
      attached.regionId === region.id &&
      attached.status === "ACTIVE" &&
      evaluation.passed === true &&
      evaluation.matchedRules === 2 &&
      removed === true;
    checks.push(
      check(
        "RG-P2-POLICY",
        "policy",
        "Regional policy engine",
        policyOk,
        `policy=${policy.id} passed=${evaluation.passed} matched=${evaluation.matchedRules}`,
      ),
    );
    clearPolicies();
    clearRegions();
  } catch (error) {
    checks.push(
      check(
        "RG-P2-POLICY",
        "policy",
        "Regional policy engine",
        false,
        error instanceof Error ? error.message : "policy probe failed",
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
      `e09-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P2ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P2 release gate failed: ${gate.summary}`);
  }
}
