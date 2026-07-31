/**
 * PI-7.3 — Layer → implementation runtime adapter bindings.
 * Each adapter reuses an existing layer module path (PI-7.1).
 */
import {
  IMPLEMENTATION_LAYER_CATALOGUE,
  type ImplementationLayerId,
} from "../foundation/layer-refs";

export type ImplementationRuntimeAdapter = Readonly<{
  adapterId: string;
  layerId: ImplementationLayerId;
  /** Existing module path from PI-7.1 catalogue. */
  modulePath: string;
  notes: string;
}>;

/**
 * Closed runtime adapters — one per implementation layer.
 */
export const LAYER_RUNTIME_BINDINGS = [
  {
    adapterId: "IRT-FRONTEND",
    layerId: "FRONTEND",
    modulePath: "lib/frontend",
    notes: "Frontend implementation runtime surface (PI-2)",
  },
  {
    adapterId: "IRT-BACKEND",
    layerId: "BACKEND",
    modulePath: "lib/backend",
    notes: "Backend implementation runtime surface (PI-3)",
  },
  {
    adapterId: "IRT-DATA",
    layerId: "DATA",
    modulePath: "lib/data",
    notes: "Data implementation runtime surface (PI-4)",
  },
  {
    adapterId: "IRT-INTEGRATION",
    layerId: "INTEGRATION",
    modulePath: "lib/integration",
    notes: "Integration implementation runtime surface (PI-5)",
  },
  {
    adapterId: "IRT-DELIVERY",
    layerId: "DELIVERY",
    modulePath: "lib/delivery",
    notes: "Delivery readiness runtime surface (PI-6)",
  },
  {
    adapterId: "IRT-DOMAIN",
    layerId: "DOMAIN",
    modulePath: "lib/product",
    notes: "M11–M15 Domain runtime surface",
  },
] as const satisfies readonly ImplementationRuntimeAdapter[];

export function layerAdapterForId(
  layerId: ImplementationLayerId,
): ImplementationRuntimeAdapter | undefined {
  return LAYER_RUNTIME_BINDINGS.find((b) => b.layerId === layerId);
}

export function layerAdapterMatchesFoundation(
  adapter: ImplementationRuntimeAdapter,
): boolean {
  const foundation = IMPLEMENTATION_LAYER_CATALOGUE.find(
    (l) => l.layerId === adapter.layerId,
  );
  return Boolean(foundation && foundation.modulePath === adapter.modulePath);
}
