/**
 * PI-3.1 — API Edge ownership map (PD-5.1 §5 / PD-2.4 families).
 * Existing route families only — no new /api inventories.
 */
import type { ProductDomainId } from "./domain-ownership";

export type ApiFamilyOwnership = Readonly<{
  family: string;
  ownerDomain: ProductDomainId;
  notes: string;
}>;

/** Preferred / typical existing API families (reference, not new routes). */
export const API_FAMILY_OWNERSHIP = [
  {
    family: "/api/auth/*",
    ownerDomain: "M13",
    notes: "Session / access",
  },
  {
    family: "/api/v80/tenant/run",
    ownerDomain: "M13",
    notes: "Tenant / workspace bootstrap",
  },
  {
    family: "/api/v80/entitlements",
    ownerDomain: "M13",
    notes: "Plan entitlements observe",
  },
  {
    family: "/api/v80/tender/intake",
    ownerDomain: "M11",
    notes: "Tender knowledge intake",
  },
  {
    family: "/api/v80/autopilot/job/run",
    ownerDomain: "M12",
    notes: "Agent orchestration",
  },
  {
    family: "/api/v80/budget/calculate",
    ownerDomain: "M14",
    notes: "Budget intelligence",
  },
  {
    family: "/api/v80/pdf",
    ownerDomain: "M11",
    notes: "Artifact export (+ M14 review)",
  },
  {
    family: "/api/v80/proposal-pdf/render",
    ownerDomain: "M11",
    notes: "Proposal artifact (+ M14)",
  },
  {
    family: "/api/project/*",
    ownerDomain: "M13",
    notes: "Project OS surfaces",
  },
  {
    family: "/api/documents/*",
    ownerDomain: "M11",
    notes: "Document knowledge catalog",
  },
  {
    family: "/api/v80/ops/*",
    ownerDomain: "M13",
    notes: "Ops (+ M15 governance)",
  },
  {
    family: "/api/sales/signals",
    ownerDomain: "M14",
    notes: "Opportunity intelligence",
  },
] as const satisfies readonly ApiFamilyOwnership[];

/**
 * L2 runtime adapter path declarations (existing modules under M ownership).
 * Does not relocate code or invent Domains.
 */
export const RUNTIME_ADAPTER_PATHS = [
  {
    path: "lib/scaffold/v80",
    ownerHint: "M11–M14 runtime surfaces (v80 preferred APIs)",
  },
  {
    path: "lib/services",
    ownerHint: "Legacy application orchestrators — not product Domains",
  },
] as const;
