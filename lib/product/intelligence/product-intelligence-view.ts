/**
 * EPI-WP1 — Product Intelligence View Foundation
 * Deterministic read-only projection of frozen ESOS OperationsSurface.
 * Baseline: enterprise-saas-operations-surface-v1.
 * View only — no new engine / persistence / side effects / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ESOS_1_ID,
  getOperationsSurface,
  type OperationsSurface,
  type OperationsSurfaceSummary,
} from "../../commercial/operations-surface";
import {
  ESPO_FREEZE_DATE,
  type OperatingQueueStatus,
} from "../../commercial/production-ops";

export const EPI_WP1_ID = "EPI-WP1" as const;
export const PRODUCT_INTELLIGENCE_VIEW_CAPABILITY =
  "ProductIntelligenceView" as const;
export const PRODUCT_INTELLIGENCE_VIEW_VERSION =
  "epi-wp1-product-intelligence-view-1" as const;
export const ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1 =
  "enterprise-saas-operations-surface-v1" as const;

export type ProductIntelligenceView = Readonly<{
  id: typeof EPI_WP1_ID;
  scope: {
    baseline: typeof ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1;
    parentPack: typeof ESOS_1_ID;
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noFrozenLayerChanges: true;
  };
  status: OperatingQueueStatus;
  signals: Pick<
    OperationsSurfaceSummary,
    "openCount" | "queuedCount" | "watchCount" | "heldCount" | "escalateCount"
  >;
  attention: Pick<OperationsSurfaceSummary, "openCount" | "escalateCount">;
  recommendations: Pick<
    OperationsSurfaceSummary,
    "actCount" | "recordedCount"
  >;
  generatedAt: string;
  fingerprint: string;
}>;

let cached: ProductIntelligenceView | null = null;

function cloneView(row: ProductIntelligenceView): ProductIntelligenceView {
  return {
    ...row,
    scope: { ...row.scope },
    signals: { ...row.signals },
    attention: { ...row.attention },
    recommendations: { ...row.recommendations },
  };
}

function statusFromSummary(
  summary: OperationsSurfaceSummary,
): OperatingQueueStatus {
  if (summary.openCount >= 1) return "OPEN";
  if (summary.queuedCount >= 1) return "QUEUED";
  if (summary.watchCount >= 1) return "WATCH";
  return "HELD";
}

function stablePayload(
  row: Omit<ProductIntelligenceView, "fingerprint">,
): string {
  return JSON.stringify({
    id: row.id,
    scope: row.scope,
    status: row.status,
    signals: row.signals,
    attention: row.attention,
    recommendations: row.recommendations,
    generatedAt: row.generatedAt,
  });
}

function computeFingerprint(
  row: Omit<ProductIntelligenceView, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveView(surface: OperationsSurface): ProductIntelligenceView {
  const { summary } = surface;
  const withoutFp: Omit<ProductIntelligenceView, "fingerprint"> = {
    id: EPI_WP1_ID,
    scope: {
      baseline: ENTERPRISE_SAAS_OPERATIONS_SURFACE_V1,
      parentPack: ESOS_1_ID,
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noFrozenLayerChanges: true,
    },
    status: statusFromSummary(summary),
    signals: {
      openCount: summary.openCount,
      queuedCount: summary.queuedCount,
      watchCount: summary.watchCount,
      heldCount: summary.heldCount,
      escalateCount: summary.escalateCount,
    },
    attention: {
      openCount: summary.openCount,
      escalateCount: summary.escalateCount,
    },
    recommendations: {
      actCount: summary.actCount,
      recordedCount: summary.recordedCount,
    },
    generatedAt: `${ESPO_FREEZE_DATE}T00:00:00.000Z`,
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildProductIntelligenceView(): ProductIntelligenceView {
  const out = deriveView(getOperationsSurface());
  cached = cloneView(out);
  return cloneView(cached);
}

export function getProductIntelligenceView(): ProductIntelligenceView {
  if (!cached) {
    return buildProductIntelligenceView();
  }
  return cloneView(cached);
}

export function productIntelligenceViewFingerprint(
  row?: ProductIntelligenceView,
): string {
  const v = row ?? getProductIntelligenceView();
  return v.fingerprint;
}

export function clearProductIntelligenceView(): void {
  cached = null;
}
