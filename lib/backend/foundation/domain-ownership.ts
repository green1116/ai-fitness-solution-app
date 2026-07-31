/**
 * PI-3.1 — Existing Domain ownership (PD-5.1 / PD-2.5).
 * References frozen M11–M15 paths only — no new Domains.
 */
export const PRODUCT_DOMAIN_IDS = [
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
] as const;

export type ProductDomainId = (typeof PRODUCT_DOMAIN_IDS)[number];

export type DomainOwnershipRow = Readonly<{
  id: ProductDomainId;
  name: string;
  path: string;
  baselineId: string;
  role: string;
  primaryCommandCount: number;
}>;

/**
 * PD-5.1 §3.1 frozen catalogue + PD-2.5 primary Command counts.
 */
export const DOMAIN_OWNERSHIP = [
  {
    id: "M11",
    name: "Knowledge",
    path: "lib/product/m11",
    baselineId: "enterprise-product-knowledge-baseline-v1",
    role: "Knowledge entities, tender/requirement knowledge, document catalog, artifact export",
    primaryCommandCount: 13,
  },
  {
    id: "M12",
    name: "Agent",
    path: "lib/product/m12",
    baselineId: "enterprise-product-agent-baseline-v1",
    role: "Agent invocation, guided workspace interaction, generation orchestration",
    primaryCommandCount: 3,
  },
  {
    id: "M13",
    name: "OS",
    path: "lib/product/m13",
    baselineId: "enterprise-product-os-baseline-v1",
    role: "Access, projects/workspace platform ops, admin ops, navigation/tenant surfaces",
    primaryCommandCount: 20,
  },
  {
    id: "M14",
    name: "Intelligence",
    path: "lib/product/m14",
    baselineId: "enterprise-product-intelligence-baseline-v1",
    role: "Solution/budget/proposal/opportunity analysis lenses",
    primaryCommandCount: 8,
  },
  {
    id: "M15",
    name: "Evolution",
    path: "lib/product/m15",
    baselineId: "enterprise-product-evolution-baseline-v1",
    role: "Share/feedback signals, continuity experience, governance oversight",
    primaryCommandCount: 3,
  },
] as const satisfies readonly DomainOwnershipRow[];

/** Forbidden product Domain folders under this foundation. */
export const FORBIDDEN_DOMAIN_PATHS = [
  "lib/product/m16",
  "lib/product/m17",
  "lib/domains",
] as const;

export function getDomainOwnership(
  id: ProductDomainId,
): DomainOwnershipRow | undefined {
  return DOMAIN_OWNERSHIP.find((row) => row.id === id);
}

export function totalPrimaryCommands(): number {
  return DOMAIN_OWNERSHIP.reduce(
    (sum, row) => sum + row.primaryCommandCount,
    0,
  );
}
