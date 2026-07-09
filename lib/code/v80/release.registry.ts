/**
 * V80 CODE P4 — Release ops module registry
 */
import type { ReleaseOpsModule } from "./release.types";

export const RELEASE_OPS_REGISTRY: ReleaseOpsModule[] = [
  { id: "SCF-OPS-001", path: "lib/scaffold/v80/ops/deployment.model.ts", kind: "deployment", productionRef: "PRD-DEP-*" },
  { id: "SCF-OPS-002", path: "lib/scaffold/v80/ops/observability.ts", kind: "observability", productionRef: "PRD-OBS-001" },
  { id: "SCF-OPS-003", path: "lib/scaffold/v80/ops/governance.ts", kind: "governance", productionRef: "PRD-OBS-002" },
  { id: "SCF-OPS-004", path: "lib/scaffold/v80/ops/commercial.ts", kind: "commercial", productionRef: "PRD-BIL-*" },
  { id: "SCF-OPS-005", path: "lib/scaffold/v80/ops/ops.middleware.ts", kind: "observability", productionRef: "PRD-OBS-003" },
  { id: "SCF-OPS-006", path: "app/api/v80/ops/health/route.ts", kind: "deployment", productionRef: "PRD-DEP-001" },
  { id: "SCF-OPS-007", path: "app/api/v80/ops/metrics/route.ts", kind: "observability", productionRef: "PRD-OBS-003" },
  { id: "SCF-OPS-008", path: "app/api/v80/ops/governance/audit/route.ts", kind: "governance", productionRef: "PRD-OBS-004" },
];

export function isReleaseOpsRegistryComplete(): boolean {
  const kinds = new Set(RELEASE_OPS_REGISTRY.map((m) => m.kind));
  return RELEASE_OPS_REGISTRY.length === 8 && kinds.size === 4;
}

export function getReleaseOpsByKind(kind: ReleaseOpsModule["kind"]) {
  return RELEASE_OPS_REGISTRY.filter((m) => m.kind === kind);
}
