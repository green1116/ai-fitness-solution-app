/**
 * PI-3.1 — Backend Foundation constants (PD-5.1).
 * Registry only — reuses M11–M15; invents no Domains/APIs.
 */
export const BACKEND_ARCHITECTURE_ID =
  "product-backend-architecture-v1" as const;

export const BACKEND_ARCHITECTURE_GATE =
  "product-backend-architecture-gate" as const;

export const BACKEND_ARCHITECTURE_BASELINE_ID =
  "product-backend-architecture-baseline-v1" as const;

export const BACKEND_FOUNDATION_ID =
  "product-backend-foundation-v1" as const;

export const PI31_PACKAGE_ID = "PI-3.1" as const;

/** PD-5.1 §10 — delivery layers (top → bottom). */
export const BACKEND_LAYER_IDS = [
  "L5-API-EDGE",
  "L4-APPLICATION-SERVICES",
  "L3-DOMAIN-CAPABILITIES",
  "L2-DOMAIN-RUNTIME-ADAPTERS",
  "L1-PERSISTENCE-PORTS",
] as const;

export type BackendLayerId = (typeof BACKEND_LAYER_IDS)[number];

export const BACKEND_LAYER_OWNERS = {
  "L5-API-EDGE": "Existing PD-2.4 routes / auth gates",
  "L4-APPLICATION-SERVICES": "Command/Query orchestration (≠ Domain)",
  "L3-DOMAIN-CAPABILITIES": "M11–M15 business outcomes",
  "L2-DOMAIN-RUNTIME-ADAPTERS": "Existing DOM-* / lib runtimes under M ownership",
  "L1-PERSISTENCE-PORTS": "Domain-owned stores",
} as const satisfies Record<BackendLayerId, string>;

export const FE_BASELINE_REF =
  "product-frontend-architecture-baseline-v1" as const;

export const UI_BASELINE_REF = "product-ui-baseline-v1" as const;

export const PRIMARY_COMMAND_TOTAL = 47 as const;
