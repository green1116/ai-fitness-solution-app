import type { CoverageProfile } from "../shared/types";

export const COVERAGE_PROFILES: CoverageProfile[] = [
  {
    coverageId: "coverage-shanghai",
    city: "Shanghai",
    coverageLevel: "tier-1",
    leadTime: "7-14 days",
    sla: "48h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-beijing",
    city: "Beijing",
    coverageLevel: "tier-1",
    leadTime: "7-14 days",
    sla: "48h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-guangzhou",
    city: "Guangzhou",
    coverageLevel: "tier-1",
    leadTime: "10-14 days",
    sla: "48h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-shenzhen",
    city: "Shenzhen",
    coverageLevel: "tier-1",
    leadTime: "10-14 days",
    sla: "48h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-chengdu",
    city: "Chengdu",
    coverageLevel: "tier-2",
    leadTime: "14-21 days",
    sla: "72h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-hangzhou",
    city: "Hangzhou",
    coverageLevel: "tier-2",
    leadTime: "14-21 days",
    sla: "72h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-nanjing",
    city: "Nanjing",
    coverageLevel: "tier-2",
    leadTime: "14-21 days",
    sla: "72h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-wuhan",
    city: "Wuhan",
    coverageLevel: "tier-2",
    leadTime: "14-21 days",
    sla: "72h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-suzhou",
    city: "Suzhou",
    coverageLevel: "tier-2",
    leadTime: "14-21 days",
    sla: "72h on-site",
    status: "active",
    mode: "supplier-portal",
  },
  {
    coverageId: "coverage-xian",
    city: "Xi'an",
    coverageLevel: "tier-3",
    leadTime: "21-30 days",
    sla: "96h on-site",
    status: "active",
    mode: "supplier-portal",
  },
];

export function getAllCoverageProfiles(): CoverageProfile[] {
  return [...COVERAGE_PROFILES];
}

export function getCoverageProfileById(coverageId: string): CoverageProfile | undefined {
  return COVERAGE_PROFILES.find((c) => c.coverageId === coverageId);
}

export function getCoverageProfilesByCity(city: string): CoverageProfile[] {
  return COVERAGE_PROFILES.filter((c) => c.city === city);
}
