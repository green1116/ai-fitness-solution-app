/**
 * PI-6.1 — Closed inventory refs consumed by delivery readiness (PD-7.8).
 * Counts lock frozen upstream inventories — no new architecture.
 */
export const DELIVERY_INVENTORY_REFS = {
  readinessConcerns: 7,
  layers: 5,
  environments: 4,
  goldenPaths: 5,
  domains: 5,
  ownershipRows: 7,
  ownershipRules: 5,
  /** Upstream PI freeze evidence scripts. */
  upstreamEvidence: 8,
} as const;

/** Evidence / freeze paths that must remain present. */
export const DELIVERY_UPSTREAM_EVIDENCE = [
  "scripts/verify-pi-2.ts",
  "scripts/verify-pi-3.ts",
  "scripts/verify-pi-4.ts",
  "scripts/verify-pi-5.ts",
  "lib/frontend",
  "lib/backend/foundation/index.ts",
  "lib/data/foundation/index.ts",
  "lib/integration/foundation/index.ts",
] as const;

/** PD-7 docs that define the readiness baseline (must exist). */
export const DELIVERY_BASELINE_DOCS = [
  "docs/product-delivery/PD-7.1-release-readiness.md",
  "docs/product-delivery/PD-7.2-deployment-readiness.md",
  "docs/product-delivery/PD-7.3-operational-readiness.md",
  "docs/product-delivery/PD-7.4-customer-readiness.md",
  "docs/product-delivery/PD-7.5-documentation-readiness.md",
  "docs/product-delivery/PD-7.6-pilot-acceptance.md",
  "docs/product-delivery/PD-7.7-delivery-sign-off.md",
  "docs/product-delivery/PD-7.8-delivery-freeze.md",
] as const;
