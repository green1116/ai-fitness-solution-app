/**
 * PI-8.1 — Closed inventory refs for Product Closure (PD-7 / PI-7).
 * Counts lock frozen upstream inventories — no new architecture.
 */
export const CLOSURE_INVENTORY_REFS = {
  packages: 6,
  layers: 7,
  domains: 5,
  ownershipRows: 8,
  ownershipRules: 5,
  upstreamEvidence: 12,
  baselineDocs: 8,
} as const;

/** Evidence / freeze paths that must remain present. */
export const CLOSURE_UPSTREAM_EVIDENCE = [
  "scripts/verify-pi-2.ts",
  "scripts/verify-pi-3.ts",
  "scripts/verify-pi-4.ts",
  "scripts/verify-pi-5.ts",
  "scripts/verify-pi-6.ts",
  "scripts/verify-pi-7.ts",
  "lib/frontend",
  "lib/backend/foundation/index.ts",
  "lib/data/foundation/index.ts",
  "lib/integration/foundation/index.ts",
  "lib/delivery/foundation/index.ts",
  "lib/implementation/foundation/index.ts",
] as const;

/** PD-7 docs that define the delivery readiness baseline (must exist). */
export const CLOSURE_BASELINE_DOCS = [
  "docs/product-delivery/PD-7.1-release-readiness.md",
  "docs/product-delivery/PD-7.2-deployment-readiness.md",
  "docs/product-delivery/PD-7.3-operational-readiness.md",
  "docs/product-delivery/PD-7.4-customer-readiness.md",
  "docs/product-delivery/PD-7.5-documentation-readiness.md",
  "docs/product-delivery/PD-7.6-pilot-acceptance.md",
  "docs/product-delivery/PD-7.7-delivery-sign-off.md",
  "docs/product-delivery/PD-7.8-delivery-freeze.md",
] as const;
