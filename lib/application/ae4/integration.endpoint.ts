/**
 * AE-4 — Declarative integration endpoints.
 * Endpoint labels only — not live HTTP / RPC / monitoring surfaces.
 */
import type { Ae4BindingId } from "./integration.binding";

export const AE4_ENDPOINT_IDS = [
  "EP-FE-ADAPTER",
  "EP-BE-API",
  "EP-DATA-PORT",
  "EP-DOMAIN-PORT",
  "EP-INT-SEAM",
  "EP-DEL-READY",
] as const;

export type Ae4EndpointId = (typeof AE4_ENDPOINT_IDS)[number];

export type Ae4IntegrationEndpoint = Readonly<{
  endpointId: Ae4EndpointId;
  bindingId: Ae4BindingId;
  surfaceRef: string;
  pathRef: string;
  notes: string;
}>;

/**
 * Closed endpoint catalogue — path refs into existing layers (no imports).
 */
export const AE4_INTEGRATION_ENDPOINTS = [
  {
    endpointId: "EP-FE-ADAPTER",
    bindingId: "B-FE-BE",
    surfaceRef: "FRONTEND",
    pathRef: "lib/frontend",
    notes: "Frontend adapter surface label",
  },
  {
    endpointId: "EP-BE-API",
    bindingId: "B-FE-BE",
    surfaceRef: "BACKEND",
    pathRef: "lib/backend",
    notes: "Backend API edge surface label",
  },
  {
    endpointId: "EP-DATA-PORT",
    bindingId: "B-BE-DATA",
    surfaceRef: "DATA",
    pathRef: "lib/data",
    notes: "Data persistence port label",
  },
  {
    endpointId: "EP-DOMAIN-PORT",
    bindingId: "B-BE-DOMAIN",
    surfaceRef: "DOMAIN",
    pathRef: "lib/product",
    notes: "Domain port label (M11–M15)",
  },
  {
    endpointId: "EP-INT-SEAM",
    bindingId: "B-INT-STACK",
    surfaceRef: "INTEGRATION",
    pathRef: "lib/integration",
    notes: "Integration seam label (PI-5)",
  },
  {
    endpointId: "EP-DEL-READY",
    bindingId: "B-DEL-STACK",
    surfaceRef: "DELIVERY",
    pathRef: "lib/delivery",
    notes: "Delivery readiness label (PI-6)",
  },
] as const satisfies readonly Ae4IntegrationEndpoint[];

export function getAe4IntegrationEndpoint(
  endpointId: Ae4EndpointId,
): Ae4IntegrationEndpoint | undefined {
  return AE4_INTEGRATION_ENDPOINTS.find((e) => e.endpointId === endpointId);
}
