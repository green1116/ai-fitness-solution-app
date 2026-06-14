import type { TenderProfile } from "../shared/types";

export const TENDER_PROFILES: TenderProfile[] = [
  {
    tenderId: "tender-sh-commercial-gym-2025-001",
    title: "Shanghai Pudong Commercial Gym Equipment Procurement",
    city: "Shanghai",
    industry: "commercial-gym",
    budget: 1050000,
    publishDate: "2025-11-01",
    deadline: "2025-11-30",
    status: "open",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-bj-hotel-2025-002",
    title: "Beijing CBD Hotel Fitness Center Upgrade",
    city: "Beijing",
    industry: "hotel",
    budget: 1850000,
    publishDate: "2025-10-05",
    deadline: "2025-10-25",
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cd-community-2025-003",
    title: "Chengdu Community Sports Center Equipment",
    city: "Chengdu",
    industry: "community",
    budget: 725000,
    publishDate: "2025-09-01",
    deadline: "2025-09-20",
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-gz-campus-2025-004",
    title: "Guangzhou University Campus Gym Renovation",
    city: "Guangzhou",
    industry: "campus",
    budget: 1275000,
    publishDate: "2025-08-10",
    deadline: "2025-08-31",
    status: "archived",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sh-enterprise-2025-005",
    title: "Shanghai Enterprise Wellness Center Build-out",
    city: "Shanghai",
    industry: "enterprise",
    budget: 925000,
    publishDate: "2025-07-01",
    deadline: "2025-07-25",
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-sz-fitness-club-2025-006",
    title: "Shenzhen Premium Fitness Club Equipment Package",
    city: "Shenzhen",
    industry: "commercial-gym",
    budget: 680000,
    publishDate: "2025-06-15",
    deadline: "2025-07-10",
    status: "open",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-nj-government-2025-007",
    title: "Nanjing Government Employee Fitness Facility",
    city: "Nanjing",
    industry: "enterprise",
    budget: 540000,
    publishDate: "2025-05-20",
    deadline: "2025-06-15",
    status: "closed",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-wh-corporate-2025-008",
    title: "Wuhan Corporate Headquarters Gym Project",
    city: "Wuhan",
    industry: "enterprise",
    budget: 760000,
    publishDate: "2025-04-10",
    deadline: "2025-05-05",
    status: "awarded",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-hz-medical-2025-009",
    title: "Hangzhou Medical Center Rehabilitation Gym",
    city: "Hangzhou",
    industry: "community",
    budget: 420000,
    publishDate: "2025-03-01",
    deadline: "2025-03-25",
    status: "archived",
    mode: "tender-marketplace",
  },
  {
    tenderId: "tender-cq-residential-2025-010",
    title: "Chongqing Residential Club Fitness Upgrade",
    city: "Chongqing",
    industry: "commercial-gym",
    budget: 390000,
    publishDate: "2025-02-01",
    deadline: "2025-02-28",
    status: "closed",
    mode: "tender-marketplace",
  },
];

export function getAllTenderProfiles(): TenderProfile[] {
  return [...TENDER_PROFILES];
}

export function getTenderProfileById(tenderId: string): TenderProfile | undefined {
  return TENDER_PROFILES.find((t) => t.tenderId === tenderId);
}

export function getTenderProfilesByCity(city: string): TenderProfile[] {
  return TENDER_PROFILES.filter((t) => t.city === city);
}

export function getTenderProfilesByIndustry(
  industry: TenderProfile["industry"],
): TenderProfile[] {
  return TENDER_PROFILES.filter((t) => t.industry === industry);
}
