import type { EvaluationProfile } from "../shared/types";

export const EVALUATION_PROFILES: EvaluationProfile[] = [
  {
    tenderId: "tender-sh-commercial-gym-2025-001",
    priceWeight: 30,
    technicalWeight: 25,
    serviceWeight: 20,
    deliveryWeight: 15,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-bj-hotel-2025-002",
    priceWeight: 20,
    technicalWeight: 30,
    serviceWeight: 25,
    deliveryWeight: 15,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cd-community-2025-003",
    priceWeight: 35,
    technicalWeight: 20,
    serviceWeight: 15,
    deliveryWeight: 20,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-gz-campus-2025-004",
    priceWeight: 25,
    technicalWeight: 25,
    serviceWeight: 20,
    deliveryWeight: 15,
    brandWeight: 15,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sh-enterprise-2025-005",
    priceWeight: 25,
    technicalWeight: 25,
    serviceWeight: 25,
    deliveryWeight: 15,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sz-fitness-club-2025-006",
    priceWeight: 30,
    technicalWeight: 20,
    serviceWeight: 20,
    deliveryWeight: 20,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-nj-government-2025-007",
    priceWeight: 20,
    technicalWeight: 30,
    serviceWeight: 20,
    deliveryWeight: 15,
    brandWeight: 15,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-wh-corporate-2025-008",
    priceWeight: 30,
    technicalWeight: 20,
    serviceWeight: 20,
    deliveryWeight: 20,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-hz-medical-2025-009",
    priceWeight: 15,
    technicalWeight: 35,
    serviceWeight: 25,
    deliveryWeight: 15,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cq-residential-2025-010",
    priceWeight: 35,
    technicalWeight: 20,
    serviceWeight: 15,
    deliveryWeight: 20,
    brandWeight: 10,
    mode: "tender-marketplace",
  },
];

export function getAllEvaluationProfiles(): EvaluationProfile[] {
  return [...EVALUATION_PROFILES];
}

export function getEvaluationProfileByTenderId(tenderId: string): EvaluationProfile | undefined {
  return EVALUATION_PROFILES.find((e) => e.tenderId === tenderId);
}
