/**
 * E09-P3 — Market Release Gate
 * Checks market foundation, intelligence, cross-market engine → PASS / FAIL
 */

import { createGlobalNetworkNode } from "../network/network.node";
import {
  analyzeRelationship,
  buildCrossMarketInsight,
  clearCrossMarketInsights,
  detectMarketCorrelation,
} from "../market/cross-market.engine";
import {
  clearCrossSignals,
  getCrossSignals,
  recordCrossSignal,
} from "../market/cross-market.signal";
import {
  E09_MARKET_BASE,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
  MARKET_STATUSES,
  MARKET_TYPES,
} from "../market/market.constants";
import {
  analyzeMarket,
  clearMarketInsights,
  getMarketInsight,
} from "../market/market.intelligence";
import {
  buildMarketRegistryManifest,
  clearMarkets,
  getMarket,
  listMarkets,
  registerMarket,
  removeMarket,
} from "../market/market.registry";
import {
  clearSignals,
  getSignals,
  recordSignal,
} from "../market/market.signal";
import {
  clearRegions,
  registerRegion,
} from "../regional/regional.registry";
import {
  E09_P3_COMPONENT_LOCK,
  E09_P3_FREEZE_LOCK,
  e09P3FreezeLockMatchesExpected,
  isE09P3FreezeLockIntact,
} from "./market.freeze.lock";
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

function seedGateRegion(id: string, code: string) {
  const parent = createGlobalNetworkNode({
    id: `${id}.parent`,
    type: "REGION",
  });
  return registerRegion({
    id,
    name: `Gate Region ${code}`,
    code,
    parentGlobalNode: parent,
    status: "ACTIVE",
  });
}

function cleanupMarketGateState(): void {
  clearCrossMarketInsights();
  clearCrossSignals();
  clearMarketInsights();
  clearSignals();
  clearMarkets();
  clearRegions();
}

/** Probe P3 market modules via public APIs (no filesystem dependency). */
export function checkE09P3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "MK-P3-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P3FreezeLockIntact() && e09P3FreezeLockMatchesExpected(),
      `version=${E09_P3_FREEZE_LOCK.version} base=${E09_P3_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["foundation", "intelligence", "cross-market", "signoff"];
  const lockedIds = E09_P3_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "MK-P3-COMPONENTS",
      "signoff",
      "P3 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Market foundation (registry)
  try {
    cleanupMarketGateState();
    const region = seedGateRegion("e09.p3.gate.region", "MGFN");
    const market = registerMarket({
      id: "e09.p3.gate.market",
      name: "Gate Market",
      code: "GMKT",
      regionId: region.id,
      type: "ENTERPRISE",
      status: "ACTIVE",
    });
    const fetched = getMarket(market.id);
    const listed = listMarkets({ status: "ACTIVE", regionId: region.id });
    const manifest = buildMarketRegistryManifest();
    const removed = removeMarket(market.id);
    const foundationOk =
      fetched?.id === market.id &&
      listed.some((m) => m.id === market.id) &&
      removed === true &&
      manifest.marketId === E09_MARKET_ID &&
      manifest.version === E09_MARKET_VERSION &&
      manifest.base === E09_MARKET_BASE &&
      MARKET_TYPES.length === 5 &&
      MARKET_STATUSES.length === 3;
    checks.push(
      check(
        "MK-P3-FOUNDATION",
        "foundation",
        "Market foundation registry",
        foundationOk,
        `market=${market.id} base=${manifest.base}`,
      ),
    );
    cleanupMarketGateState();
  } catch (error) {
    checks.push(
      check(
        "MK-P3-FOUNDATION",
        "foundation",
        "Market foundation registry",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  // Market intelligence
  try {
    cleanupMarketGateState();
    const region = seedGateRegion("e09.p3.gate.intel.region", "MGIN");
    const market = registerMarket({
      id: "e09.p3.gate.intel.market",
      name: "Intel Gate Market",
      code: "GINT",
      regionId: region.id,
      type: "CONSUMER",
      status: "ACTIVE",
    });
    recordSignal({
      id: "e09.p3.gate.signal.demand",
      marketId: market.id,
      kind: "DEMAND",
      strength: 80,
      label: "Gate demand",
    });
    recordSignal({
      id: "e09.p3.gate.signal.opportunity",
      marketId: market.id,
      kind: "OPPORTUNITY",
      strength: 75,
      label: "Gate opportunity",
    });
    const signals = getSignals({ marketId: market.id });
    const analysis = analyzeMarket(market.id);
    const insight = getMarketInsight(market.id, { refresh: true });
    const intelligenceOk =
      signals.length === 2 &&
      analysis.marketId === market.id &&
      analysis.signalCount === 2 &&
      analysis.score >= 0 &&
      insight.marketId === market.id &&
      insight.signalCount === 2 &&
      insight.recommendations.length > 0;
    checks.push(
      check(
        "MK-P3-INTELLIGENCE",
        "intelligence",
        "Market intelligence",
        intelligenceOk,
        `signals=${signals.length} score=${analysis.score} level=${insight.level}`,
      ),
    );
    cleanupMarketGateState();
  } catch (error) {
    checks.push(
      check(
        "MK-P3-INTELLIGENCE",
        "intelligence",
        "Market intelligence",
        false,
        error instanceof Error ? error.message : "intelligence probe failed",
      ),
    );
  }

  // Cross-market engine
  try {
    cleanupMarketGateState();
    const region = seedGateRegion("e09.p3.gate.cross.region", "MGCX");
    const marketA = registerMarket({
      id: "e09.p3.gate.cross.a",
      name: "Cross Gate A",
      code: "CXA",
      regionId: region.id,
      type: "ENTERPRISE",
      status: "ACTIVE",
    });
    const marketB = registerMarket({
      id: "e09.p3.gate.cross.b",
      name: "Cross Gate B",
      code: "CXB",
      regionId: region.id,
      type: "PARTNER",
      status: "ACTIVE",
    });
    recordCrossSignal({
      id: "e09.p3.gate.cross.signal",
      sourceMarketId: marketA.id,
      targetMarketId: marketB.id,
      relation: "COMPLEMENTARY",
      strength: 70,
      label: "Gate complementary link",
    });
    const crossSignals = getCrossSignals({
      pair: { a: marketA.id, b: marketB.id },
    });
    const relationship = analyzeRelationship(marketA.id, marketB.id);
    const correlation = detectMarketCorrelation(marketA.id, marketB.id);
    const insight = buildCrossMarketInsight(marketA.id, marketB.id, {
      refresh: true,
    });
    const crossOk =
      crossSignals.length === 1 &&
      relationship.signalCount === 1 &&
      relationship.sharedRegion === true &&
      relationship.dominantRelation === "COMPLEMENTARY" &&
      correlation.kind !== "INSUFFICIENT" &&
      correlation.signalCount === 1 &&
      insight.sourceMarketId === marketA.id &&
      insight.targetMarketId === marketB.id &&
      insight.recommendations.length > 0;
    checks.push(
      check(
        "MK-P3-CROSS-MARKET",
        "cross-market",
        "Cross market signal engine",
        crossOk,
        `signals=${crossSignals.length} correlation=${correlation.kind} level=${insight.level}`,
      ),
    );
    cleanupMarketGateState();
  } catch (error) {
    checks.push(
      check(
        "MK-P3-CROSS-MARKET",
        "cross-market",
        "Cross market signal engine",
        false,
        error instanceof Error ? error.message : "cross-market probe failed",
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
      `e09-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P3ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P3 release gate failed: ${gate.summary}`);
  }
}
