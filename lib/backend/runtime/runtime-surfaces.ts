/**
 * PI-3.3 — PD-2.4 DOM-* runtime surfaces → M11–M15 ownership (PD-5.1 §4.3).
 * Runtime surfaces are not product Domains.
 */
import type { ProductDomainId } from "../foundation/domain-ownership";

export const RUNTIME_SURFACE_IDS = [
  "DOM-AUTH",
  "DOM-PREF",
  "DOM-TENANT",
  "DOM-PLAN",
  "DOM-TENDER",
  "DOM-AUTOPILOT",
  "DOM-BUDGET",
  "DOM-PDF",
  "DOM-PROPOSAL",
  "DOM-PROJECT",
  "DOM-DOCS",
  "DOM-SALES",
  "DOM-OPS",
] as const;

export type RuntimeSurfaceId = (typeof RUNTIME_SURFACE_IDS)[number];

export type RuntimeSurfaceOwnership = Readonly<{
  surfaceId: RuntimeSurfaceId;
  ownerDomain: ProductDomainId;
  supportingDomains: readonly ProductDomainId[];
  notes: string;
}>;

export const RUNTIME_SURFACE_OWNERSHIP = [
  {
    surfaceId: "DOM-AUTH",
    ownerDomain: "M13",
    supportingDomains: [],
    notes: "OS access",
  },
  {
    surfaceId: "DOM-PREF",
    ownerDomain: "M13",
    supportingDomains: [],
    notes: "OS preference surface",
  },
  {
    surfaceId: "DOM-TENANT",
    ownerDomain: "M13",
    supportingDomains: [],
    notes: "OS tenant/workspace",
  },
  {
    surfaceId: "DOM-PLAN",
    ownerDomain: "M14",
    supportingDomains: ["M12"],
    notes: "Intelligence analysis / Agent session start",
  },
  {
    surfaceId: "DOM-TENDER",
    ownerDomain: "M11",
    supportingDomains: ["M12"],
    notes: "Knowledge intake; Agent pack generation",
  },
  {
    surfaceId: "DOM-AUTOPILOT",
    ownerDomain: "M12",
    supportingDomains: [],
    notes: "Agent orchestration",
  },
  {
    surfaceId: "DOM-BUDGET",
    ownerDomain: "M14",
    supportingDomains: [],
    notes: "Intelligence budget analysis",
  },
  {
    surfaceId: "DOM-PDF",
    ownerDomain: "M11",
    supportingDomains: ["M14"],
    notes: "Knowledge artifact; Intelligence review",
  },
  {
    surfaceId: "DOM-PROPOSAL",
    ownerDomain: "M14",
    supportingDomains: ["M12"],
    notes: "Intelligence result; Agent production",
  },
  {
    surfaceId: "DOM-PROJECT",
    ownerDomain: "M13",
    supportingDomains: [],
    notes: "OS project surface",
  },
  {
    surfaceId: "DOM-DOCS",
    ownerDomain: "M11",
    supportingDomains: ["M15"],
    notes: "Knowledge catalog; Evolution share/feedback",
  },
  {
    surfaceId: "DOM-SALES",
    ownerDomain: "M14",
    supportingDomains: [],
    notes: "Opportunity intelligence",
  },
  {
    surfaceId: "DOM-OPS",
    ownerDomain: "M13",
    supportingDomains: ["M15"],
    notes: "OS ops; Evolution governance",
  },
] as const satisfies readonly RuntimeSurfaceOwnership[];

export function getRuntimeSurfaceOwnership(
  surfaceId: RuntimeSurfaceId,
): RuntimeSurfaceOwnership | undefined {
  return RUNTIME_SURFACE_OWNERSHIP.find((row) => row.surfaceId === surfaceId);
}
