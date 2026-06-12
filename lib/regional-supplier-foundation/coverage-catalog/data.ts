import type { CoverageEntry } from "../shared/types";

export const COVERAGE_CATALOG: CoverageEntry[] = [
  {
    id: "coverage-shanghai",
    city: "Shanghai",
    coverageLevel: "tier-1",
    responseTime: "24h",
    installationLeadTime: "7-14 days",
    maintenanceSla: "48h on-site",
    mode: "supplier-network",
  },
  {
    id: "coverage-beijing",
    city: "Beijing",
    coverageLevel: "tier-1",
    responseTime: "24h",
    installationLeadTime: "7-14 days",
    maintenanceSla: "48h on-site",
    mode: "supplier-network",
  },
  {
    id: "coverage-guangzhou",
    city: "Guangzhou",
    coverageLevel: "tier-1",
    responseTime: "24h",
    installationLeadTime: "10-14 days",
    maintenanceSla: "48h on-site",
    mode: "supplier-network",
  },
  {
    id: "coverage-chengdu",
    city: "Chengdu",
    coverageLevel: "tier-2",
    responseTime: "48h",
    installationLeadTime: "14-21 days",
    maintenanceSla: "72h on-site",
    mode: "supplier-network",
  },
  {
    id: "coverage-wuhan",
    city: "Wuhan",
    coverageLevel: "tier-2",
    responseTime: "48h",
    installationLeadTime: "14-21 days",
    maintenanceSla: "72h on-site",
    mode: "supplier-network",
  },
];

export function getCoverageByCity(city: string): CoverageEntry | undefined {
  return COVERAGE_CATALOG.find((c) => c.city === city);
}

export function getAllCoverage(): CoverageEntry[] {
  return [...COVERAGE_CATALOG];
}
