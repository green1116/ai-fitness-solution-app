/**
 * PI-4.5 — Data verification / hardening catalogue (PD-5.4 / PD-5.8).
 * Reuses PI-4.1…PI-4.4 surfaces only — no new Domains/repo/storage families.
 */

export const DATA_HARDENING_ID = "product-data-hardening-v1" as const;

export const DATA_HARDENING_GATE = "product-data-hardening-gate" as const;

export const PERSISTENCE_ARCHITECTURE_REF =
  "product-backend-persistence-architecture-v1" as const;

export const PERSISTENCE_ARCHITECTURE_GATE_REF =
  "product-backend-persistence-architecture-gate" as const;

export const DATA_FOUNDATION_REF = "product-data-foundation-v1" as const;

export const PI45_PACKAGE_ID = "PI-4.5" as const;

/** Implementation packages that must remain PASS under hardening. */
export const DATA_HARDENING_PACKAGES = [
  "PI-4.1",
  "PI-4.2",
  "PI-4.3",
  "PI-4.4",
] as const;

export type DataHardeningPackage = (typeof DATA_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const DATA_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-4.1.ts",
  "scripts/verify-pi-4.2.ts",
  "scripts/verify-pi-4.3.ts",
  "scripts/verify-pi-4.4.ts",
  "scripts/verify-pi-4.5.ts",
  "scripts/verify-pi-4.ts",
] as const;

/** Data module tree required for hardening. */
export const DATA_HARDENING_MODULES = [
  "lib/data/foundation/index.ts",
  "lib/data/repositories/index.ts",
  "lib/data/runtime/index.ts",
  "lib/data/exposure/index.ts",
  "lib/data/hardening/data.hardening.ts",
  "lib/data/verify/data.foundation.gate.ts",
  "lib/data/verify/data.repository.gate.ts",
  "lib/data/verify/data.persistence.gate.ts",
  "lib/data/verify/data.exposure.gate.ts",
  "lib/data/verify/data.hardening.gate.ts",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const DATA_HARDENING_BASELINE = {
  domains: 5,
  storageFamilies: 7,
  dataClasses: 9,
  durableClasses: 8,
  repositories: 9,
  persistenceModels: 20,
  storageAdapters: 6,
  exposures: 9,
} as const;

export type DataHardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-REPOSITORY"
  | "INV-RUNTIME"
  | "INV-EXPOSURE"
  | "INV-NO-NEW"
  | "INV-NO-COUPLE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const DATA_HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-REPOSITORY",
  "INV-RUNTIME",
  "INV-EXPOSURE",
  "INV-NO-NEW",
  "INV-NO-COUPLE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly DataHardeningInvariantId[];
