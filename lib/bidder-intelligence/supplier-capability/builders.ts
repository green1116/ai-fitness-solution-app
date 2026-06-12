import type { SupplierCapabilitySnapshot } from "./types";

export function buildSupplierCapabilitySnapshot(input?: { deploymentId?: string }): SupplierCapabilitySnapshot {
  const deploymentId = input?.deploymentId ?? "supplier-capability-default";

  const serviceCoverage = [
    { coverageId: `svc-maint-${deploymentId}`, serviceType: "Preventive Maintenance", regions: ["East China", "North China", "South China"], responseHours: 24, availability: "business-hours" as const },
    { coverageId: `svc-repair-${deploymentId}`, serviceType: "Emergency Repair", regions: ["East China", "South China"], responseHours: 4, availability: "on-call" as const },
    { coverageId: `svc-consult-${deploymentId}`, serviceType: "Fitness Program Consulting", regions: ["National"], responseHours: 48, availability: "business-hours" as const },
  ];

  const deliveryCoverage = [
    { coverageId: `del-east-${deploymentId}`, region: "East China", maxDistanceKm: 500, avgLeadTimeDays: 7, logisticsPartners: ["SF Express", "JD Logistics"] },
    { coverageId: `del-north-${deploymentId}`, region: "North China", maxDistanceKm: 800, avgLeadTimeDays: 10, logisticsPartners: ["Deppon", "SF Express"] },
    { coverageId: `del-south-${deploymentId}`, region: "South China", maxDistanceKm: 600, avgLeadTimeDays: 8, logisticsPartners: ["JD Logistics", "YTO Express"] },
  ];

  const installationCapability = {
    capabilityId: `install-${deploymentId}`,
    teamSize: 24,
    certifications: ["Equipment Installation Level 2", "Electrical Safety"],
    maxDailyInstalls: 6,
    complexSiteReady: true,
  };

  const supportCapability = {
    capabilityId: `support-${deploymentId}`,
    supportTier: "premium" as const,
    slaResponseHours: 4,
    remoteDiagnostics: true,
    onSiteSupport: true,
  };

  const regionCount = deliveryCoverage.length;
  const serviceTypes = serviceCoverage.length;
  const supplierReadiness = Math.round(
    (regionCount / 3) * 40 +
      (serviceTypes / 3) * 30 +
      (installationCapability.complexSiteReady ? 15 : 0) +
      (supportCapability.onSiteSupport ? 15 : 0),
  );

  return {
    snapshotId: `supplier-capability-${deploymentId}`,
    serviceCoverage,
    deliveryCoverage,
    installationCapability,
    supportCapability,
    supplierReadiness,
  };
}
