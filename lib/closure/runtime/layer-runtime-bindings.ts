/**
 * PI-8.3 — Layer → closure runtime adapter bindings.
 * Each adapter reuses an existing layer module path (PI-8.1).
 */
import {
  CLOSURE_LAYER_CATALOGUE,
  type ClosureLayerId,
} from "../foundation/layer-refs";

export type ClosureRuntimeAdapter = Readonly<{
  adapterId: string;
  layerId: ClosureLayerId;
  modulePath: string;
  notes: string;
}>;

/**
 * Closed runtime adapters — one per closure layer.
 */
export const CLOSURE_LAYER_RUNTIME_BINDINGS = [
  {
    adapterId: "CRT-FRONTEND",
    layerId: "FRONTEND",
    modulePath: "lib/frontend",
    notes: "Frontend runtime surface (PI-2)",
  },
  {
    adapterId: "CRT-BACKEND",
    layerId: "BACKEND",
    modulePath: "lib/backend",
    notes: "Backend runtime surface (PI-3)",
  },
  {
    adapterId: "CRT-DATA",
    layerId: "DATA",
    modulePath: "lib/data",
    notes: "Data runtime surface (PI-4)",
  },
  {
    adapterId: "CRT-INTEGRATION",
    layerId: "INTEGRATION",
    modulePath: "lib/integration",
    notes: "Integration runtime surface (PI-5)",
  },
  {
    adapterId: "CRT-DELIVERY",
    layerId: "DELIVERY",
    modulePath: "lib/delivery",
    notes: "Delivery readiness runtime surface (PI-6)",
  },
  {
    adapterId: "CRT-IMPLEMENTATION",
    layerId: "IMPLEMENTATION",
    modulePath: "lib/implementation",
    notes: "Product implementation runtime surface (PI-7)",
  },
  {
    adapterId: "CRT-DOMAIN",
    layerId: "DOMAIN",
    modulePath: "lib/product",
    notes: "M11–M15 Domain runtime surface",
  },
] as const satisfies readonly ClosureRuntimeAdapter[];

export function closureLayerAdapterForId(
  layerId: ClosureLayerId,
): ClosureRuntimeAdapter | undefined {
  return CLOSURE_LAYER_RUNTIME_BINDINGS.find((b) => b.layerId === layerId);
}

export function closureLayerAdapterMatchesFoundation(
  adapter: ClosureRuntimeAdapter,
): boolean {
  const foundation = CLOSURE_LAYER_CATALOGUE.find(
    (l) => l.layerId === adapter.layerId,
  );
  return Boolean(foundation && foundation.modulePath === adapter.modulePath);
}
