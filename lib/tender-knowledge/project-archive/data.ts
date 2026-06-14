import type { HistoricalTender } from "../shared/types";

export const PROJECT_ARCHIVE: HistoricalTender[] = [
  {
    tenderId: "tender-sh-commercial-gym-2025-001",
    projectName: "Shanghai Pudong Commercial Gym Equipment Procurement",
    city: "Shanghai",
    industry: "commercial-gym",
    budgetMin: 900000,
    budgetMax: 1200000,
    tenderDate: "2025-11-15",
    status: "completed",
    mode: "tender-knowledge",
  },
  {
    tenderId: "tender-bj-hotel-2025-002",
    projectName: "Beijing CBD Hotel Fitness Center Upgrade",
    city: "Beijing",
    industry: "hotel",
    budgetMin: 1500000,
    budgetMax: 2200000,
    tenderDate: "2025-10-20",
    status: "completed",
    mode: "tender-knowledge",
  },
  {
    tenderId: "tender-cd-community-2025-003",
    projectName: "Chengdu Community Sports Center Equipment",
    city: "Chengdu",
    industry: "community",
    budgetMin: 600000,
    budgetMax: 850000,
    tenderDate: "2025-09-08",
    status: "completed",
    mode: "tender-knowledge",
  },
  {
    tenderId: "tender-gz-campus-2025-004",
    projectName: "Guangzhou University Campus Gym Renovation",
    city: "Guangzhou",
    industry: "campus",
    budgetMin: 1100000,
    budgetMax: 1450000,
    tenderDate: "2025-08-22",
    status: "archived",
    mode: "tender-knowledge",
  },
  {
    tenderId: "tender-sh-enterprise-2025-005",
    projectName: "Shanghai Enterprise Wellness Center Build-out",
    city: "Shanghai",
    industry: "enterprise",
    budgetMin: 800000,
    budgetMax: 1050000,
    tenderDate: "2025-07-10",
    status: "completed",
    mode: "tender-knowledge",
  },
];

export function getAllHistoricalTenders(): HistoricalTender[] {
  return [...PROJECT_ARCHIVE];
}

export function getHistoricalTenderById(tenderId: string): HistoricalTender | undefined {
  return PROJECT_ARCHIVE.find((t) => t.tenderId === tenderId);
}

export function getHistoricalTendersByCity(city: string): HistoricalTender[] {
  return PROJECT_ARCHIVE.filter((t) => t.city === city);
}

export function getHistoricalTendersByIndustry(
  industry: HistoricalTender["industry"],
): HistoricalTender[] {
  return PROJECT_ARCHIVE.filter((t) => t.industry === industry);
}
