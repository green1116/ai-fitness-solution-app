/**
 * PI-5.3 — Seam → integration runtime adapter bindings.
 * Each adapter reuses an existing INTP-* module path (PI-5.1).
 */
import {
  getIntegrationPoint,
  type IntegrationPointId,
} from "../foundation/integration-points";
import type { IntegrationPipelineStage } from "../foundation/pipeline-stages";

export type IntegrationRuntimeAdapter = Readonly<{
  adapterId: string;
  pointId: IntegrationPointId;
  stageId: IntegrationPipelineStage;
  /** Existing module path from PI-5.1 catalogue. */
  modulePath: string;
  notes: string;
}>;

/**
 * Closed runtime adapters — one per integration seam point.
 */
export const SEAM_RUNTIME_BINDINGS = [
  {
    adapterId: "IRT-FE-ADAPTER",
    pointId: "INTP-FE-ADAPTER",
    stageId: "UI",
    modulePath: "lib/frontend/adapter-bindings.ts",
    notes: "FE Adapter presentation seam",
  },
  {
    adapterId: "IRT-API-SURFACE",
    pointId: "INTP-API-SURFACE",
    stageId: "API",
    modulePath: "lib/backend/api/index.ts",
    notes: "Existing API surface seam",
  },
  {
    adapterId: "IRT-SERVICE-LAYER",
    pointId: "INTP-SERVICE-LAYER",
    stageId: "SERVICE",
    modulePath: "lib/backend/services/index.ts",
    notes: "L4 service orchestration seam",
  },
  {
    adapterId: "IRT-DOMAIN-PORTS",
    pointId: "INTP-DOMAIN-PORTS",
    stageId: "DOMAIN",
    modulePath: "lib/backend/runtime/domain-port-registry.ts",
    notes: "Domain capability ports seam",
  },
  {
    adapterId: "IRT-DATA-REPOSITORY",
    pointId: "INTP-DATA-REPOSITORY",
    stageId: "PERSISTENCE",
    modulePath: "lib/data/repositories/index.ts",
    notes: "Repository access seam",
  },
  {
    adapterId: "IRT-DATA-RUNTIME",
    pointId: "INTP-DATA-RUNTIME",
    stageId: "PERSISTENCE",
    modulePath: "lib/data/runtime/index.ts",
    notes: "Persistence runtime seam",
  },
  {
    adapterId: "IRT-DOMAIN-M11",
    pointId: "INTP-DOMAIN-M11",
    stageId: "DOMAIN",
    modulePath: "lib/product/m11",
    notes: "Knowledge Domain runtime",
  },
  {
    adapterId: "IRT-DOMAIN-M12",
    pointId: "INTP-DOMAIN-M12",
    stageId: "DOMAIN",
    modulePath: "lib/product/m12",
    notes: "Agent Domain runtime",
  },
  {
    adapterId: "IRT-DOMAIN-M13",
    pointId: "INTP-DOMAIN-M13",
    stageId: "DOMAIN",
    modulePath: "lib/product/m13",
    notes: "OS Domain runtime",
  },
  {
    adapterId: "IRT-DOMAIN-M14",
    pointId: "INTP-DOMAIN-M14",
    stageId: "DOMAIN",
    modulePath: "lib/product/m14",
    notes: "Intelligence Domain runtime",
  },
  {
    adapterId: "IRT-DOMAIN-M15",
    pointId: "INTP-DOMAIN-M15",
    stageId: "DOMAIN",
    modulePath: "lib/product/m15",
    notes: "Evolution Domain runtime",
  },
] as const satisfies readonly IntegrationRuntimeAdapter[];

export function getSeamRuntimeAdapter(
  adapterId: string,
): IntegrationRuntimeAdapter | undefined {
  return SEAM_RUNTIME_BINDINGS.find((row) => row.adapterId === adapterId);
}

export function seamAdapterForPoint(
  pointId: IntegrationPointId,
): IntegrationRuntimeAdapter | undefined {
  return SEAM_RUNTIME_BINDINGS.find((row) => row.pointId === pointId);
}

/** Ensure adapter modulePath matches PI-5.1 point catalogue. */
export function seamAdapterMatchesFoundationPoint(
  adapter: IntegrationRuntimeAdapter,
): boolean {
  const point = getIntegrationPoint(adapter.pointId);
  return (
    !!point &&
    point.modulePath === adapter.modulePath &&
    point.stageId === adapter.stageId
  );
}
