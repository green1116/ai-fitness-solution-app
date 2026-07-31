/**
 * PI-6.5 — Delivery readiness hardening catalogue (PD-7.8).
 * Reuses PI-6.1…PI-6.4 surfaces only — no new Domains/architecture.
 */

export const DELIVERY_HARDENING_ID =
  "product-delivery-hardening-v1" as const;

export const DELIVERY_HARDENING_GATE =
  "product-delivery-hardening-gate" as const;

export const DELIVERY_BASELINE_REF =
  "product-delivery-readiness-baseline-v1" as const;

export const DELIVERY_FREEZE_REF = "product-delivery-freeze-1" as const;

export const DELIVERY_FOUNDATION_REF =
  "product-delivery-foundation-v1" as const;

export const DELIVERY_RUNTIME_REF = "product-delivery-runtime-v1" as const;

export const DELIVERY_EXPOSURE_REF = "product-delivery-exposure-v1" as const;

export const DELIVERY_VERIFICATION_REF =
  "product-delivery-verification-v1" as const;

export const PI65_PACKAGE_ID = "PI-6.5" as const;

/** Implementation packages that must remain PASS under hardening. */
export const DELIVERY_HARDENING_PACKAGES = [
  "PI-6.1",
  "PI-6.2",
  "PI-6.3",
  "PI-6.4",
] as const;

export type DeliveryHardeningPackage =
  (typeof DELIVERY_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const DELIVERY_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-6.1.ts",
  "scripts/verify-pi-6.2.ts",
  "scripts/verify-pi-6.3.ts",
  "scripts/verify-pi-6.4.ts",
  "scripts/verify-pi-6.5.ts",
  "scripts/verify-pi-6.ts",
] as const;

/** Delivery module tree required for hardening. */
export const DELIVERY_HARDENING_MODULES = [
  "lib/delivery/foundation/index.ts",
  "lib/delivery/runtime/index.ts",
  "lib/delivery/exposure/index.ts",
  "lib/delivery/verification/delivery.verification.ts",
  "lib/delivery/hardening/delivery.hardening.ts",
  "lib/delivery/verify/delivery.foundation.gate.ts",
  "lib/delivery/verify/delivery.runtime.gate.ts",
  "lib/delivery/verify/delivery.exposure.gate.ts",
  "lib/delivery/verify/delivery.verification.gate.ts",
  "lib/delivery/verify/delivery.hardening.gate.ts",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const DELIVERY_HARDENING_BASELINE = {
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
  verificationPackages: 3,
  verificationInvariants: 8,
} as const;

export type DeliveryHardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-VERIFICATION"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const DELIVERY_HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-VERIFICATION",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly DeliveryHardeningInvariantId[];
