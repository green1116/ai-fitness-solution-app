/**
 * PI-5.5 — Integration verification / hardening catalogue (PD-6.8).
 * Reuses PI-5.1…PI-5.4 surfaces only — no new Domains/integration families.
 */

export const INTEGRATION_HARDENING_ID =
  "product-integration-hardening-v1" as const;

export const INTEGRATION_HARDENING_GATE =
  "product-integration-hardening-gate" as const;

export const INTEGRATION_BASELINE_REF =
  "product-integration-baseline-v1" as const;

export const INTEGRATION_FREEZE_REF = "product-integration-freeze-1" as const;

export const INTEGRATION_ARCHITECTURE_REF =
  "product-integration-architecture-v1" as const;

export const INTEGRATION_FOUNDATION_REF =
  "product-integration-foundation-v1" as const;

export const PI55_PACKAGE_ID = "PI-5.5" as const;

/** Implementation packages that must remain PASS under hardening. */
export const INTEGRATION_HARDENING_PACKAGES = [
  "PI-5.1",
  "PI-5.2",
  "PI-5.3",
  "PI-5.4",
] as const;

export type IntegrationHardeningPackage =
  (typeof INTEGRATION_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const INTEGRATION_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-5.1.ts",
  "scripts/verify-pi-5.2.ts",
  "scripts/verify-pi-5.3.ts",
  "scripts/verify-pi-5.4.ts",
  "scripts/verify-pi-5.5.ts",
  "scripts/verify-pi-5.ts",
] as const;

/** Integration module tree required for hardening. */
export const INTEGRATION_HARDENING_MODULES = [
  "lib/integration/foundation/index.ts",
  "lib/integration/routing/index.ts",
  "lib/integration/runtime/index.ts",
  "lib/integration/exposure/index.ts",
  "lib/integration/hardening/integration.hardening.ts",
  "lib/integration/verify/integration.foundation.gate.ts",
  "lib/integration/verify/integration.routing.gate.ts",
  "lib/integration/verify/integration.runtime.gate.ts",
  "lib/integration/verify/integration.exposure.gate.ts",
  "lib/integration/verify/integration.hardening.gate.ts",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const INTEGRATION_HARDENING_BASELINE = {
  domains: 5,
  pipelineStages: 5,
  bindingKinds: 5,
  integrationPoints: 11,
  workflows: 6,
  goldenPaths: 5,
  seamAdapters: 11,
  contracts: 8,
  kindExposures: 5,
} as const;

export type IntegrationHardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-ROUTING"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const INTEGRATION_HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-ROUTING",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly IntegrationHardeningInvariantId[];
