import { resolveRegionFromCity } from "@/lib/procurement-intelligence";
import type { ProposalIntelligenceInput, TenderContextProfile } from "../shared/types";

const TIER1_CITIES = new Set(["Shanghai", "Beijing", "Guangzhou"]);

const PROJECT_TENDER_TYPE: Record<string, string> = {
  "commercial-gym": "Commercial Fitness Equipment Procurement",
  hotel: "Hospitality Fitness Equipment Procurement",
  campus: "Campus Sports Facility Procurement",
  community: "Community Fitness Center Procurement",
  enterprise: "Enterprise Wellness Facility Procurement",
};

function resolveBudgetPressure(projectType: ProposalIntelligenceInput["projectType"]): TenderContextProfile["budgetPressure"] {
  if (projectType === "hotel" || projectType === "enterprise") return "high";
  if (projectType === "commercial-gym" || projectType === "campus") return "medium";
  return "low";
}

function resolveDeliveryPressure(
  quantity: number,
  projectType: ProposalIntelligenceInput["projectType"],
): TenderContextProfile["deliveryPressure"] {
  if (quantity >= 20 || projectType === "hotel") return "high";
  if (quantity >= 10 || projectType === "commercial-gym") return "medium";
  return "low";
}

function resolveCompetitionLevel(city: string): TenderContextProfile["competitionLevel"] {
  if (TIER1_CITIES.has(city)) return "high";
  if (city === "Chengdu" || city === "Wuhan") return "medium";
  return "low";
}

export function buildTenderContextProfile(
  input: ProposalIntelligenceInput,
): TenderContextProfile {
  return {
    tenderType: PROJECT_TENDER_TYPE[input.projectType] ?? "Commercial Equipment Procurement",
    region: resolveRegionFromCity(input.city),
    budgetPressure: resolveBudgetPressure(input.projectType),
    deliveryPressure: resolveDeliveryPressure(input.quantity, input.projectType),
    competitionLevel: resolveCompetitionLevel(input.city),
  };
}
