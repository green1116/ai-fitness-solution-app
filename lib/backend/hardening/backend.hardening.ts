/**
 * PI-3.5 — Backend verification / hardening catalogue (PD-5.8).
 * Reuses PI-3.1…PI-3.4 surfaces only — no new Domains/API families.
 */
import { BACKEND_ARCHITECTURE_BASELINE_ID } from "../foundation/backend.constants";

export const BACKEND_HARDENING_ID = "product-backend-hardening-v1" as const;

export const BACKEND_HARDENING_GATE =
  "product-backend-hardening-gate" as const;

export const BACKEND_ARCHITECTURE_FREEZE_ID =
  "product-backend-architecture-freeze-1" as const;

export const BACKEND_ARCHITECTURE_BASELINE_GATE =
  "product-backend-architecture-baseline-gate" as const;

export const BACKEND_HARDENING_BASELINE_REF =
  BACKEND_ARCHITECTURE_BASELINE_ID;

export const PI35_PACKAGE_ID = "PI-3.5" as const;

/** Implementation packages that must remain PASS under hardening. */
export const BACKEND_HARDENING_PACKAGES = [
  "PI-3.1",
  "PI-3.2",
  "PI-3.3",
  "PI-3.4",
] as const;

export type BackendHardeningPackage =
  (typeof BACKEND_HARDENING_PACKAGES)[number];

/** Child evidence scripts (must exist). */
export const BACKEND_HARDENING_EVIDENCE_SCRIPTS = [
  "scripts/verify-pi-3.1.ts",
  "scripts/verify-pi-3.2.ts",
  "scripts/verify-pi-3.3.ts",
  "scripts/verify-pi-3.4.ts",
  "scripts/verify-pi-3.5.ts",
  "scripts/verify-pi-3.ts",
] as const;

/** Backend module tree required for hardening. */
export const BACKEND_HARDENING_MODULES = [
  "lib/backend/foundation/index.ts",
  "lib/backend/services/index.ts",
  "lib/backend/runtime/index.ts",
  "lib/backend/api/index.ts",
  "lib/backend/hardening/backend.hardening.ts",
  "lib/backend/verify/backend.foundation.gate.ts",
  "lib/backend/verify/backend.service.gate.ts",
  "lib/backend/verify/backend.runtime.gate.ts",
  "lib/backend/verify/backend.api.gate.ts",
  "lib/backend/verify/backend.hardening.gate.ts",
] as const;

/** PD-5 child architecture gate IDs (reference lock — docs remain SoT). */
export const BACKEND_CHILD_ARCHITECTURE_GATES = [
  "product-backend-architecture-gate",
  "product-backend-service-architecture-gate",
  "product-backend-api-architecture-gate",
  "product-backend-persistence-architecture-gate",
  "product-backend-security-architecture-gate",
  "product-backend-reliability-observability-gate",
  "product-backend-deployment-architecture-gate",
] as const;

/** Hardening baseline inventory counts (must stay locked). */
export const BACKEND_HARDENING_BASELINE = {
  domains: 5,
  commands: 47,
  services: 8,
  runtimeSurfaces: 13,
  runtimeAdapters: 7,
  apiFamilies: 11,
  apiBindings: 47,
  layers: 5,
} as const;

export type HardeningInvariantId =
  | "INV-FOUNDATION"
  | "INV-SERVICE"
  | "INV-RUNTIME"
  | "INV-API"
  | "INV-NO-NEW"
  | "INV-NO-FE"
  | "INV-CROSS-LAYER"
  | "INV-BASELINE";

export const HARDENING_INVARIANT_IDS = [
  "INV-FOUNDATION",
  "INV-SERVICE",
  "INV-RUNTIME",
  "INV-API",
  "INV-NO-NEW",
  "INV-NO-FE",
  "INV-CROSS-LAYER",
  "INV-BASELINE",
] as const satisfies readonly HardeningInvariantId[];
