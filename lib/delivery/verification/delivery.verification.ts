/**
 * PI-6.4 — Delivery readiness verification catalogue (PD-7).
 * Reuses PI-6.1…PI-6.3 surfaces only — no new Domains/architecture.
 */

export const DELIVERY_VERIFICATION_ID =
  "product-delivery-verification-v1" as const;

export const DELIVERY_VERIFICATION_GATE =
  "product-delivery-verification-gate" as const;

export const DELIVERY_BASELINE_REF =
  "product-delivery-readiness-baseline-v1" as const;

export const DELIVERY_FREEZE_REF = "product-delivery-freeze-1" as const;

export const DELIVERY_FOUNDATION_REF =
  "product-delivery-foundation-v1" as const;

export const DELIVERY_RUNTIME_REF = "product-delivery-runtime-v1" as const;

export const DELIVERY_EXPOSURE_REF = "product-delivery-exposure-v1" as const;

export const PI64_PACKAGE_ID = "PI-6.4" as const;

/** Implementation packages that must remain PASS under verification. */
export const DELIVERY_VERIFICATION_PACKAGES = [
  "PI-6.1",
  "PI-6.2",
  "PI-6.3",
] as const;

export type DeliveryVerificationPackage =
  (typeof DELIVERY_VERIFICATION_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const DELIVERY_VERIFICATION_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-6.1.ts",
  "scripts/verify-pi-6.2.ts",
  "scripts/verify-pi-6.3.ts",
  "scripts/verify-pi-6.4.ts",
] as const;

/** Delivery module tree required for verification. */
export const DELIVERY_VERIFICATION_MODULES = [
  "lib/delivery/foundation/index.ts",
  "lib/delivery/runtime/index.ts",
  "lib/delivery/exposure/index.ts",
  "lib/delivery/verification/delivery.verification.ts",
  "lib/delivery/verify/delivery.foundation.gate.ts",
  "lib/delivery/verify/delivery.runtime.gate.ts",
  "lib/delivery/verify/delivery.exposure.gate.ts",
  "lib/delivery/verify/delivery.verification.gate.ts",
] as const;

/** Verification baseline inventory counts (must stay locked). */
export const DELIVERY_VERIFICATION_BASELINE = {
  domains: 5,
  readinessConcerns: 7,
  layers: 5,
  environments: 4,
  goldenPaths: 5,
  layerAdapters: 5,
  concernBindings: 7,
  environmentBindings: 4,
  concernExposures: 7,
  signals: 8,
} as const;

export type DeliveryVerificationInvariantId =
  | "INV-FOUNDATION"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE"
  | "INV-GATES";

export const DELIVERY_VERIFICATION_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
  "INV-GATES",
] as const satisfies readonly DeliveryVerificationInvariantId[];
