/**
 * PI-6.2 — Layer → delivery readiness runtime adapter bindings.
 * Each adapter reuses an existing layer module path (PI-6.1).
 */
import {
  DELIVERY_LAYER_CATALOGUE,
  type DeliveryLayerId,
} from "../foundation/layer-refs";

export type DeliveryRuntimeAdapter = Readonly<{
  adapterId: string;
  layerId: DeliveryLayerId;
  /** Existing module path from PI-6.1 catalogue. */
  modulePath: string;
  notes: string;
}>;

/**
 * Closed runtime adapters — one per delivery layer.
 */
export const LAYER_RUNTIME_BINDINGS = [
  {
    adapterId: "DRT-FRONTEND",
    layerId: "FRONTEND",
    modulePath: "lib/frontend",
    notes: "FE presentation / routes readiness surface",
  },
  {
    adapterId: "DRT-BACKEND",
    layerId: "BACKEND",
    modulePath: "lib/backend",
    notes: "BE API / services / domain ports readiness surface",
  },
  {
    adapterId: "DRT-DATA",
    layerId: "DATA",
    modulePath: "lib/data",
    notes: "Data persistence readiness surface",
  },
  {
    adapterId: "DRT-INTEGRATION",
    layerId: "INTEGRATION",
    modulePath: "lib/integration",
    notes: "Integration pipeline readiness surface (PI-5)",
  },
  {
    adapterId: "DRT-DOMAIN",
    layerId: "DOMAIN",
    modulePath: "lib/product",
    notes: "M11–M15 Domain readiness surface",
  },
] as const satisfies readonly DeliveryRuntimeAdapter[];

export function layerAdapterForId(
  layerId: DeliveryLayerId,
): DeliveryRuntimeAdapter | undefined {
  return LAYER_RUNTIME_BINDINGS.find((b) => b.layerId === layerId);
}

/** Adapter modulePath must match PI-6.1 layer catalogue. */
export function layerAdapterMatchesFoundation(
  adapter: DeliveryRuntimeAdapter,
): boolean {
  const foundation = DELIVERY_LAYER_CATALOGUE.find(
    (l) => l.layerId === adapter.layerId,
  );
  return Boolean(foundation && foundation.modulePath === adapter.modulePath);
}
