/**
 * PI-6.2 — Environment → delivery runtime bindings (PD-7.2).
 * Reuses PI-6.1 ENV-* catalogue — invents no environment family.
 */
import {
  DELIVERY_ENVIRONMENT_CATALOGUE,
  type DeliveryEnvironmentId,
} from "../foundation/environments";
import type { DeliveryReadinessConcernId } from "../foundation/readiness-concerns";

export type EnvironmentRuntimeBinding = Readonly<{
  envId: DeliveryEnvironmentId;
  /** Concerns that must evaluate before operating this env. */
  prerequisiteConcernIds: readonly DeliveryReadinessConcernId[];
  promotionFrom: DeliveryEnvironmentId | null;
  notes: string;
}>;

export const ENVIRONMENT_RUNTIME_BINDINGS = [
  {
    envId: "ENV-LOCAL",
    prerequisiteConcernIds: [],
    promotionFrom: null,
    notes: "Local build / synthetic data",
  },
  {
    envId: "ENV-DEV",
    prerequisiteConcernIds: [],
    promotionFrom: "ENV-LOCAL",
    notes: "Shared dev; isolated stores",
  },
  {
    envId: "ENV-STAGING",
    prerequisiteConcernIds: ["DEPLOYMENT", "OPERATIONAL", "PILOT"],
    promotionFrom: "ENV-DEV",
    notes: "READY_STAGING + AC-REL-* / pilot surface",
  },
  {
    envId: "ENV-PROD",
    prerequisiteConcernIds: [
      "RELEASE",
      "DEPLOYMENT",
      "OPERATIONAL",
      "SIGN_OFF",
    ],
    promotionFrom: "ENV-STAGING",
    notes: "PROD cutover requires RELEASE_READY ∧ deploy readiness",
  },
] as const satisfies readonly EnvironmentRuntimeBinding[];

export function getEnvironmentRuntimeBinding(
  envId: DeliveryEnvironmentId,
): EnvironmentRuntimeBinding | undefined {
  return ENVIRONMENT_RUNTIME_BINDINGS.find((b) => b.envId === envId);
}

export function environmentMatchesFoundation(
  binding: EnvironmentRuntimeBinding,
): boolean {
  return DELIVERY_ENVIRONMENT_CATALOGUE.some((e) => e.envId === binding.envId);
}
