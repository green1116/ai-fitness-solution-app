/**
 * V65 P7 — Final production artifact surface (read-only)
 */
import type { ProductionArtifactSurface } from "./freeze.types";

export const V65_PRODUCTION_ARTIFACT_SURFACE: ProductionArtifactSurface = {
  libEntry: "lib/production/v65",
  freezeDoc: "docs/production/V65-PRODUCTION-FREEZE.md",
  auditDoc: "docs/production/V65-PRODUCTION-AUDIT.md",
  runtimeDoc: "docs/production/V65-RUNTIME-RISK.md",
  releaseDoc: "docs/production/V65-RELEASE-READY.md",
  verifyProduction: "npm run verify:v65-production",
  verifyFreeze: "npm run verify:v65-p7-production-freeze",
};

export function getProductionArtifactPath(key: keyof ProductionArtifactSurface): string {
  return V65_PRODUCTION_ARTIFACT_SURFACE[key];
}
