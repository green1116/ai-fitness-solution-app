/**
 * PI-5.1 — Existing integration seam points (PD-6.1).
 * Path references only — reuses FE / BE / Data / Domain modules; invents none.
 */
import type { IntegrationPipelineStage } from "./pipeline-stages";

export const INTEGRATION_POINT_IDS = [
  "INTP-FE-ADAPTER",
  "INTP-API-SURFACE",
  "INTP-SERVICE-LAYER",
  "INTP-DOMAIN-PORTS",
  "INTP-DATA-REPOSITORY",
  "INTP-DATA-RUNTIME",
  "INTP-DOMAIN-M11",
  "INTP-DOMAIN-M12",
  "INTP-DOMAIN-M13",
  "INTP-DOMAIN-M14",
  "INTP-DOMAIN-M15",
] as const;

export type IntegrationPointId = (typeof INTEGRATION_POINT_IDS)[number];

export type IntegrationPointRecord = Readonly<{
  pointId: IntegrationPointId;
  stageId: IntegrationPipelineStage;
  /** Existing module path (must already exist). */
  modulePath: string;
  role: string;
}>;

/**
 * Closed catalogue of existing integration seams.
 */
export const INTEGRATION_POINT_CATALOGUE = [
  {
    pointId: "INTP-FE-ADAPTER",
    stageId: "UI",
    modulePath: "lib/frontend/adapter-bindings.ts",
    role: "Frontend Adapter maps OBJ-* ↔ API DTOs",
  },
  {
    pointId: "INTP-API-SURFACE",
    stageId: "API",
    modulePath: "lib/backend/api/index.ts",
    role: "Existing API surface / exposure (PI-3.4)",
  },
  {
    pointId: "INTP-SERVICE-LAYER",
    stageId: "SERVICE",
    modulePath: "lib/backend/services/index.ts",
    role: "L4 service / command routing (PI-3.2)",
  },
  {
    pointId: "INTP-DOMAIN-PORTS",
    stageId: "DOMAIN",
    modulePath: "lib/backend/runtime/domain-port-registry.ts",
    role: "Domain capability ports (PI-3.3)",
  },
  {
    pointId: "INTP-DATA-REPOSITORY",
    stageId: "PERSISTENCE",
    modulePath: "lib/data/repositories/index.ts",
    role: "Repository access layer (PI-4.2)",
  },
  {
    pointId: "INTP-DATA-RUNTIME",
    stageId: "PERSISTENCE",
    modulePath: "lib/data/runtime/index.ts",
    role: "Persistence runtime bindings (PI-4.3)",
  },
  {
    pointId: "INTP-DOMAIN-M11",
    stageId: "DOMAIN",
    modulePath: "lib/product/m11",
    role: "Knowledge Domain",
  },
  {
    pointId: "INTP-DOMAIN-M12",
    stageId: "DOMAIN",
    modulePath: "lib/product/m12",
    role: "Agent Domain",
  },
  {
    pointId: "INTP-DOMAIN-M13",
    stageId: "DOMAIN",
    modulePath: "lib/product/m13",
    role: "OS Domain",
  },
  {
    pointId: "INTP-DOMAIN-M14",
    stageId: "DOMAIN",
    modulePath: "lib/product/m14",
    role: "Intelligence Domain",
  },
  {
    pointId: "INTP-DOMAIN-M15",
    stageId: "DOMAIN",
    modulePath: "lib/product/m15",
    role: "Evolution Domain",
  },
] as const satisfies readonly IntegrationPointRecord[];

export function getIntegrationPoint(
  pointId: IntegrationPointId,
): IntegrationPointRecord | undefined {
  return INTEGRATION_POINT_CATALOGUE.find((row) => row.pointId === pointId);
}

export function integrationPointsForStage(
  stageId: IntegrationPipelineStage,
): IntegrationPointRecord[] {
  return INTEGRATION_POINT_CATALOGUE.filter((row) => row.stageId === stageId);
}
