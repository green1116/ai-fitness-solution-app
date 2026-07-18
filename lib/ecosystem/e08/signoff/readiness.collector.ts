/**
 * E08-P8 — Collect per-phase readiness via P1–P7 ecosystem chain (read-only)
 */

import { buildEcosystemFoundation } from "../core/ecosystem.lifecycle";
import { buildNetworkRegistryManifest } from "../network/network.registry";
import { buildExchangeRegistryManifest } from "../exchange/exchange.registry";
import { buildWorkflowRegistryManifest } from "../workflow/workflow.registry";
import { buildIntelligenceRegistryManifest } from "../intelligence/intelligence.registry";
import { buildMarketAgentRegistryManifest } from "../market/market.registry";
import {
  buildNetworkOsRegistryManifest,
  getNetworkOsById,
} from "../network-os/networkos.registry";
import { executeNetworkOsOrThrow } from "../network-os/networkos.executor";

import type {
  NetworkOsBaselineSnapshot,
  ReadinessReport,
} from "./signoff.types";

function runNetworkOsBaseline(deploymentId: string) {
  const networkOs = getNetworkOsById("e08.networkos.capture-sector");
  if (!networkOs) {
    throw new Error("missing network os e08.networkos.capture-sector");
  }

  return executeNetworkOsOrThrow(networkOs, {
    taskId: `${deploymentId}-network-os`,
    input: {
      goal: "E08 P8 ecosystem governance freeze baseline",
      ready: true,
      riskScore: 10,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "e08-p8-signoff", deploymentId },
  });
}

export function collectNetworkOsBaseline(
  deploymentId: string,
): NetworkOsBaselineSnapshot {
  const run = runNetworkOsBaseline(`${deploymentId}-baseline`);

  return {
    ready:
      run.result.success &&
      run.result.completedSlots === run.result.plan.slotCount,
    networkOsId: run.result.networkOsId,
    kind: run.result.kind,
    mission: run.result.mission,
    slotCount: run.result.plan.slotCount,
    completedSlots: run.result.completedSlots,
    readinessScore: run.result.success ? 100 : 0,
  };
}

export function collectEcosystemPhaseReadiness(
  deploymentId: string,
): ReadinessReport {
  try {
    const foundation = buildEcosystemFoundation();
    const networks = buildNetworkRegistryManifest();
    const exchanges = buildExchangeRegistryManifest();
    const workflows = buildWorkflowRegistryManifest();
    const intelligence = buildIntelligenceRegistryManifest();
    const markets = buildMarketAgentRegistryManifest();
    const networkOs = buildNetworkOsRegistryManifest();
    const baseline = collectNetworkOsBaseline(deploymentId);

    const p1 = foundation.ready === true;
    const p2 = networks.catalogComplete === true;
    const p3 = exchanges.catalogComplete === true;
    const p4 = workflows.catalogComplete === true;
    const p5 = intelligence.catalogComplete === true;
    const p6 = markets.catalogComplete === true;
    const p7 = networkOs.catalogComplete === true && baseline.ready;

    const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
    const blocked = !ready;

    return {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      ready,
      blocked,
      summary: [
        `readiness ready=${ready}`,
        `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
        `blocked=${blocked}`,
      ].join(" "),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "readiness failed";
    return {
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p6: false,
      p7: false,
      ready: false,
      blocked: true,
      summary: `readiness ready=false blocked=true error=${message}`,
    };
  }
}
