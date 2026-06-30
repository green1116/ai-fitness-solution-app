/**
 * V64 P1 — Feature matrix (catalog-backed)
 */
import { buildFeatureMatrix } from "@/lib/productization/catalog";

import type { CommercialFeatureMatrix } from "./types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildCommercialFeatureMatrix(input?: {
  deploymentId?: string;
}): CommercialFeatureMatrix {
  const deploymentId = input?.deploymentId ?? "v64-commercial-foundation-default";
  const matrix = buildFeatureMatrix({ deploymentId });
  return {
    ...matrix,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
  };
}
