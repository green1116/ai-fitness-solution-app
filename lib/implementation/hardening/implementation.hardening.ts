/**
 * PI-7.5 — Product Implementation verification / hardening catalogue (PD-7).
 * Reuses PI-7.1…PI-7.4 surfaces only — no new Domains/architecture.
 */

export const IMPLEMENTATION_HARDENING_ID =
  "product-implementation-hardening-v1" as const;

export const IMPLEMENTATION_HARDENING_GATE =
  "product-implementation-hardening-gate" as const;

export const IMPLEMENTATION_BASELINE_REF =
  "product-implementation-baseline-v1" as const;

export const IMPLEMENTATION_FREEZE_REF =
  "product-implementation-freeze-1" as const;

export const IMPLEMENTATION_FOUNDATION_REF =
  "product-implementation-foundation-v1" as const;

export const IMPLEMENTATION_ROUTING_REF =
  "product-implementation-routing-v1" as const;

export const IMPLEMENTATION_RUNTIME_REF =
  "product-implementation-runtime-v1" as const;

export const IMPLEMENTATION_EXPOSURE_REF =
  "product-implementation-exposure-v1" as const;

export const DELIVERY_READINESS_REF =
  "product-delivery-readiness-baseline-v1" as const;

export const PI6_FREEZE_REF = "pi-6-delivery-readiness-v1" as const;

export const PI75_PACKAGE_ID = "PI-7.5" as const;

/** Implementation packages that must remain PASS under hardening. */
export const IMPLEMENTATION_HARDENING_PACKAGES = [
  "PI-7.1",
  "PI-7.2",
  "PI-7.3",
  "PI-7.4",
] as const;

export type ImplementationHardeningPackage =
  (typeof IMPLEMENTATION_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const IMPLEMENTATION_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-7.1.ts",
  "scripts/verify-pi-7.2.ts",
  "scripts/verify-pi-7.3.ts",
  "scripts/verify-pi-7.4.ts",
  "scripts/verify-pi-7.5.ts",
  "scripts/verify-pi-7.ts",
] as const;

/** Implementation module tree required for hardening. */
export const IMPLEMENTATION_HARDENING_MODULES = [
  "lib/implementation/foundation/index.ts",
  "lib/implementation/routing/index.ts",
  "lib/implementation/runtime/index.ts",
  "lib/implementation/exposure/index.ts",
  "lib/implementation/hardening/implementation.hardening.ts",
  "lib/implementation/verify/implementation.foundation.gate.ts",
  "lib/implementation/verify/implementation.routing.gate.ts",
  "lib/implementation/verify/implementation.runtime.gate.ts",
  "lib/implementation/verify/implementation.exposure.gate.ts",
  "lib/implementation/verify/implementation.hardening.gate.ts",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const IMPLEMENTATION_HARDENING_BASELINE = {
  domains: 5,
  packages: 5,
  layers: 6,
  layerRoutes: 5,
  dependencyRoutes: 5,
  layerAdapters: 6,
  packageBindings: 5,
  exposures: 5,
  signals: 7,
} as const;

export type ImplementationHardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-ROUTING"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const IMPLEMENTATION_HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-ROUTING",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly ImplementationHardeningInvariantId[];
