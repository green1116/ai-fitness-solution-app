import { buildPackagingContext } from "../bridge/packaging-bridge";
import type { PackagingBidderBrand } from "../shared/types";

const SERVICE_PROFILES: Record<PackagingBidderBrand, { coverage: string; frequency: string; spareParts: string; support: number }> = {
  Technogym: {
    coverage: "Global premium service network — 48h on-site response, dedicated account manager, preventive maintenance program",
    frequency: "Quarterly preventive inspection + monthly remote diagnostics via Mywellness cloud",
    spareParts: "Premium OEM parts inventory — 95% same-day availability for critical components",
    support: 95,
  },
  "Life Fitness": {
    coverage: "Enterprise SLA — 24/7 hotline, 24h on-site response, certified technician network across 200+ cities",
    frequency: "Bi-monthly preventive maintenance + quarterly full-system audit",
    spareParts: "Global parts logistics — 90% next-day delivery for standard components",
    support: 98,
  },
  Matrix: {
    coverage: "Regional authorized service — 72h response, scheduled maintenance windows, remote monitoring",
    frequency: "Quarterly maintenance cycle with annual comprehensive overhaul",
    spareParts: "Regional warehouse — 85% parts availability within 48h",
    support: 88,
  },
  Shuhua: {
    coverage: "Domestic nationwide service — 48h response in tier-1 cities, local technician dispatch",
    frequency: "Semi-annual preventive maintenance with on-call support",
    spareParts: "Domestic supply chain — 80% parts availability, low-cost replacement program",
    support: 82,
  },
};

export function buildMaintenanceNarrative(input?: {
  deploymentId?: string;
  bidderBrand?: PackagingBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "maintenance-narrative-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const profile = SERVICE_PROFILES[bidderBrand];

  const maintenanceReadiness = Math.min(
    100,
    Math.round(profile.support * 0.6 + ctx.equipmentStrategyScore * 0.4),
  );

  return {
    narrativeId: `maintenance-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    serviceCoverage: `${profile.coverage} for ${ctx.equipmentCount} units in ${ctx.packageLabel}.`,
    maintenanceFrequency: profile.frequency,
    sparePartsProfile: profile.spareParts,
    supportReadiness: profile.support,
    maintenanceReadiness,
  };
}
