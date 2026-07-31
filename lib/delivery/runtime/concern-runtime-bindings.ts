/**
 * PI-6.2 — Readiness concern → runtime bindings (PD-7.1…7.7).
 * Reuses PI-6.1 concerns / layers / environments — invents none.
 */
import type { DeliveryEnvironmentId } from "../foundation/environments";
import type { DeliveryLayerId } from "../foundation/layer-refs";
import {
  DELIVERY_READINESS_CONCERN_CATALOGUE,
  type DeliveryReadinessConcernId,
} from "../foundation/readiness-concerns";

export type DeliveryRuntimeMode =
  | "evaluate"
  | "promote"
  | "observe"
  | "enable"
  | "document"
  | "accept"
  | "signoff";

export type ConcernRuntimeBinding = Readonly<{
  concernId: DeliveryReadinessConcernId;
  mode: DeliveryRuntimeMode;
  requiredLayerIds: readonly DeliveryLayerId[];
  targetEnvIds: readonly DeliveryEnvironmentId[];
  requiresGoldenPaths: boolean;
  notes: string;
}>;

/**
 * Closed concern runtime bindings — one per PI-6.1 readiness concern.
 */
export const CONCERN_RUNTIME_BINDINGS = [
  {
    concernId: "RELEASE",
    mode: "evaluate",
    requiredLayerIds: [
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DOMAIN",
    ],
    targetEnvIds: ["ENV-STAGING", "ENV-PROD"],
    requiresGoldenPaths: false,
    notes: "RELEASE_READY ∧ GNG-* against frozen baselines",
  },
  {
    concernId: "DEPLOYMENT",
    mode: "promote",
    requiredLayerIds: ["BACKEND", "DATA", "INTEGRATION"],
    targetEnvIds: ["ENV-LOCAL", "ENV-DEV", "ENV-STAGING", "ENV-PROD"],
    requiresGoldenPaths: false,
    notes: "ENV-* promote / ART-META; no new architecture",
  },
  {
    concernId: "OPERATIONAL",
    mode: "observe",
    requiredLayerIds: ["BACKEND", "DATA", "INTEGRATION"],
    targetEnvIds: ["ENV-STAGING", "ENV-PROD"],
    requiresGoldenPaths: false,
    notes: "Health / jobs / integrity readiness",
  },
  {
    concernId: "CUSTOMER",
    mode: "enable",
    requiredLayerIds: ["FRONTEND", "DOMAIN"],
    targetEnvIds: ["ENV-STAGING", "ENV-PROD"],
    requiresGoldenPaths: false,
    notes: "Customer enablement against existing surfaces",
  },
  {
    concernId: "DOCUMENTATION",
    mode: "document",
    requiredLayerIds: ["FRONTEND", "INTEGRATION"],
    targetEnvIds: ["ENV-STAGING"],
    requiresGoldenPaths: false,
    notes: "Docs readiness cites FE / Integration baselines",
  },
  {
    concernId: "PILOT",
    mode: "accept",
    requiredLayerIds: [
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DOMAIN",
    ],
    targetEnvIds: ["ENV-STAGING"],
    requiresGoldenPaths: true,
    notes: "Pilot acceptance over GP-* on staging",
  },
  {
    concernId: "SIGN_OFF",
    mode: "signoff",
    requiredLayerIds: [
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DOMAIN",
    ],
    targetEnvIds: ["ENV-PROD"],
    requiresGoldenPaths: false,
    notes: "Multi-party sign-off after RELEASE_READY",
  },
] as const satisfies readonly ConcernRuntimeBinding[];

export function getConcernRuntimeBinding(
  concernId: DeliveryReadinessConcernId,
): ConcernRuntimeBinding | undefined {
  return CONCERN_RUNTIME_BINDINGS.find((b) => b.concernId === concernId);
}

export function concernMatchesFoundation(
  binding: ConcernRuntimeBinding,
): boolean {
  return DELIVERY_READINESS_CONCERN_CATALOGUE.some(
    (c) => c.concernId === binding.concernId,
  );
}
