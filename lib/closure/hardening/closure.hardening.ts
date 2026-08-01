/**
 * PI-8.5 — Product Closure verification / hardening catalogue (PD-7).
 * Reuses PI-8.1…PI-8.4 surfaces only — no new Domains/architecture.
 */

export const CLOSURE_HARDENING_ID = "product-closure-hardening-v1" as const;

export const CLOSURE_HARDENING_GATE = "product-closure-hardening-gate" as const;

export const CLOSURE_BASELINE_REF = "product-closure-baseline-v1" as const;

export const CLOSURE_FREEZE_REF = "product-closure-freeze-1" as const;

export const CLOSURE_FOUNDATION_REF =
  "product-closure-foundation-v1" as const;

export const CLOSURE_ROUTING_REF = "product-closure-routing-v1" as const;

export const CLOSURE_RUNTIME_REF = "product-closure-runtime-v1" as const;

export const CLOSURE_EXPOSURE_REF = "product-closure-exposure-v1" as const;

export const IMPLEMENTATION_BASELINE_REF =
  "product-implementation-baseline-v1" as const;

export const PI7_FREEZE_REF = "pi-7-product-implementation-v1" as const;

export const PI85_PACKAGE_ID = "PI-8.5" as const;

/** Closure packages that must remain PASS under hardening. */
export const CLOSURE_HARDENING_PACKAGES = [
  "PI-8.1",
  "PI-8.2",
  "PI-8.3",
  "PI-8.4",
] as const;

export type ClosureHardeningPackage =
  (typeof CLOSURE_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const CLOSURE_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-8.1.ts",
  "scripts/verify-pi-8.2.ts",
  "scripts/verify-pi-8.3.ts",
  "scripts/verify-pi-8.4.ts",
  "scripts/verify-pi-8.5.ts",
  "scripts/verify-pi-8.ts",
] as const;

/** Closure module tree required for hardening. */
export const CLOSURE_HARDENING_MODULES = [
  "lib/closure/foundation/index.ts",
  "lib/closure/routing/index.ts",
  "lib/closure/runtime/index.ts",
  "lib/closure/exposure/index.ts",
  "lib/closure/hardening/closure.hardening.ts",
  "lib/closure/verify/closure.foundation.gate.ts",
  "lib/closure/verify/closure.routing.gate.ts",
  "lib/closure/verify/closure.runtime.gate.ts",
  "lib/closure/verify/closure.exposure.gate.ts",
  "lib/closure/verify/closure.hardening.gate.ts",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const CLOSURE_HARDENING_BASELINE = {
  domains: 5,
  packages: 6,
  layers: 7,
  layerRoutes: 6,
  dependencyRoutes: 6,
  layerAdapters: 7,
  packageBindings: 6,
  exposures: 6,
  signals: 8,
} as const;

export type ClosureHardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-ROUTING"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const CLOSURE_HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-ROUTING",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly ClosureHardeningInvariantId[];
