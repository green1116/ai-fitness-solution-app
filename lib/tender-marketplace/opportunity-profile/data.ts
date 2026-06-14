import type { OpportunityProfile } from "../shared/types";

export const OPPORTUNITY_PROFILES: OpportunityProfile[] = [
  {
    tenderId: "tender-sh-commercial-gym-2025-001",
    estimatedValue: 1050000,
    competitionLevel: "high",
    targetBrands: ["brand-life-fitness", "brand-technogym", "brand-matrix"],
    targetSuppliers: ["supplier-life-fitness-cn", "supplier-technogym-cn", "supplier-matrix-cn"],
    status: "active",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-bj-hotel-2025-002",
    estimatedValue: 1850000,
    competitionLevel: "medium",
    targetBrands: ["brand-technogym", "brand-precor", "brand-life-fitness"],
    targetSuppliers: ["supplier-technogym-cn", "supplier-precor-cn", "supplier-life-fitness-cn"],
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cd-community-2025-003",
    estimatedValue: 725000,
    competitionLevel: "medium",
    targetBrands: ["brand-shuhua", "brand-impulse", "brand-dhz"],
    targetSuppliers: ["supplier-shuhua", "supplier-impulse-cn", "supplier-dhz-cn"],
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-gz-campus-2025-004",
    estimatedValue: 1275000,
    competitionLevel: "high",
    targetBrands: ["brand-matrix", "brand-life-fitness", "brand-technogym"],
    targetSuppliers: ["supplier-matrix-cn", "supplier-life-fitness-cn", "supplier-technogym-cn"],
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sh-enterprise-2025-005",
    estimatedValue: 925000,
    competitionLevel: "medium",
    targetBrands: ["brand-life-fitness", "brand-precor", "brand-matrix"],
    targetSuppliers: ["supplier-life-fitness-cn", "supplier-precor-cn", "supplier-matrix-cn"],
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sz-fitness-club-2025-006",
    estimatedValue: 680000,
    competitionLevel: "high",
    targetBrands: ["brand-relax", "brand-bodystrength", "brand-dhz"],
    targetSuppliers: ["supplier-relax-cn", "supplier-bodystrength-cn", "supplier-dhz-cn"],
    status: "active",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-nj-government-2025-007",
    estimatedValue: 540000,
    competitionLevel: "low",
    targetBrands: ["brand-precor", "brand-shuhua", "brand-sportsart"],
    targetSuppliers: ["supplier-precor-cn", "supplier-shuhua", "supplier-sportsart-cn"],
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-wh-corporate-2025-008",
    estimatedValue: 760000,
    competitionLevel: "medium",
    targetBrands: ["brand-impulse", "brand-dhz", "brand-relax"],
    targetSuppliers: ["supplier-impulse-cn", "supplier-dhz-cn", "supplier-relax-cn"],
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-hz-medical-2025-009",
    estimatedValue: 420000,
    competitionLevel: "low",
    targetBrands: ["brand-sportsart", "brand-shuhua", "brand-impulse"],
    targetSuppliers: ["supplier-sportsart-cn", "supplier-shuhua", "supplier-impulse-cn"],
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cq-residential-2025-010",
    estimatedValue: 390000,
    competitionLevel: "medium",
    targetBrands: ["brand-dhz", "brand-relax", "brand-bodystrength"],
    targetSuppliers: ["supplier-dhz-cn", "supplier-relax-cn", "supplier-bodystrength-cn"],
    status: "closed",
    mode: "tender-marketplace",
  },
];

export function getAllOpportunityProfiles(): OpportunityProfile[] {
  return [...OPPORTUNITY_PROFILES];
}

export function getOpportunityProfileByTenderId(tenderId: string): OpportunityProfile | undefined {
  return OPPORTUNITY_PROFILES.find((o) => o.tenderId === tenderId);
}
