/**
 * V3.5 compat + V3.7-H2 Production Observability Foundation
 */

export {
  OBSERVABILITY_FOUNDATION_VERSION,
  runObservabilityFoundation,
  formatObservabilityRuntimeHook,
  buildObservabilitySummary,
  buildObservabilityProfile,
  type ObservabilityFoundationInput,
  type ObservabilityFoundationResult,
  type RuntimeObservabilityProfile,
} from "./foundation-compat";

export {
  RUNTIME_OBSERVABILITY_VERSION,
  buildRuntimeObservabilitySnapshot,
  type RuntimeObservabilitySnapshot,
  type ObservabilityStatus,
  type FreezeObservabilityStatus,
} from "./runtime-observability";

export {
  OPS_SUMMARY_VERSION,
  buildOpsSummaryLayer,
  type OpsSummaryLayer,
} from "./ops-summary";

export {
  RELEASE_GATE_VIEW_VERSION,
  buildReleaseGateView,
  type ReleaseGateView,
} from "./release-gate-view";

export {
  PRODUCTION_STATUS_MANIFEST_VERSION,
  buildProductionStatusManifest,
  type ProductionStatusManifest,
} from "./production-status-manifest";

export const PRODUCTION_OBSERVABILITY_VERSION = "3.7-h2-foundation-1" as const;

import { memoFoundation } from "../foundation-memo";
import { buildOpsSummaryLayer, type OpsSummaryLayer } from "./ops-summary";
import {
  buildProductionStatusManifest,
  type ProductionStatusManifest,
} from "./production-status-manifest";
import { buildReleaseGateView, type ReleaseGateView } from "./release-gate-view";
import {
  buildRuntimeObservabilitySnapshot,
  type RuntimeObservabilitySnapshot,
} from "./runtime-observability";

export type ProductionObservabilityFoundation = {
  version: typeof PRODUCTION_OBSERVABILITY_VERSION;
  foundationId: string;
  observability: RuntimeObservabilitySnapshot;
  ops: OpsSummaryLayer;
  releaseGate: ReleaseGateView;
  status: ProductionStatusManifest;
  summary: string;
};

export function buildProductionObservabilityFoundation(input?: {
  deploymentId?: string;
}): ProductionObservabilityFoundation {
  const deploymentId = input?.deploymentId ?? "obs-foundation";
  return memoFoundation("production-observability-foundation", deploymentId, () => {
    const foundationId = `PO-V37H2-${deploymentId.slice(0, 8)}`;
    const observability = buildRuntimeObservabilitySnapshot({ deploymentId });
    const ops = buildOpsSummaryLayer({ deploymentId });
    const releaseGate = buildReleaseGateView({ deploymentId });
    const status = buildProductionStatusManifest({ deploymentId });

    return {
      version: PRODUCTION_OBSERVABILITY_VERSION,
      foundationId,
      observability,
      ops,
      releaseGate,
      status,
      summary: `production-observability id=${foundationId} releaseReady=${status.releaseReady} releasable=${releaseGate.releasable} confidence=${releaseGate.confidenceScore}`,
    };
  });
}
