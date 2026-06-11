import type {
  BidderProfileSnapshot,
  Certification,
  CompanyPositioning,
  CompanyProfile,
  DeliveryCapability,
} from "./types";

export function buildCompanyProfile(input?: { deploymentId?: string }): CompanyProfile {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  return {
    companyId: `company-${deploymentId}`,
    legalName: "AI Fitness Solution Co., Ltd.",
    displayName: "AI Fitness Solution",
    foundedYear: 2018,
    headquarters: "Shanghai, China",
    industry: "Smart Fitness & Wellness Technology",
    mode: "readiness-stub",
  };
}

export function buildCompanyPositioning(input?: { deploymentId?: string }): CompanyPositioning {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  return {
    positioningId: `positioning-${deploymentId}`,
    tagline: "Intelligent fitness solutions for enterprise and public sector",
    primaryMarket: "Enterprise / Government / Campus",
    differentiator: "AI-driven tender intelligence + end-to-end delivery",
    competitiveFocus: "Integrated hardware-software-service bundles",
  };
}

export function buildCertifications(input?: { deploymentId?: string }): Certification[] {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  return [
    { certificationId: `cert-iso9001-${deploymentId}`, name: "ISO 9001", issuer: "SGS", validUntil: "2027-06-30", status: "active" },
    { certificationId: `cert-iso27001-${deploymentId}`, name: "ISO 27001", issuer: "BSI", validUntil: "2026-12-31", status: "active" },
    { certificationId: `cert-cmii-${deploymentId}`, name: "CMMI Level 3", issuer: "CMMI Institute", validUntil: "2026-09-15", status: "active" },
  ];
}

export function buildDeliveryCapabilities(input?: { deploymentId?: string }): DeliveryCapability[] {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  return [
    { capabilityId: `delivery-east-${deploymentId}`, region: "East China", maxConcurrentProjects: 12, avgDeliveryDays: 45, onTimeRate: 0.94 },
    { capabilityId: `delivery-north-${deploymentId}`, region: "North China", maxConcurrentProjects: 8, avgDeliveryDays: 52, onTimeRate: 0.91 },
    { capabilityId: `delivery-south-${deploymentId}`, region: "South China", maxConcurrentProjects: 10, avgDeliveryDays: 48, onTimeRate: 0.93 },
  ];
}

export function buildBidderProfileSnapshot(input?: { deploymentId?: string }): BidderProfileSnapshot {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  const profile = buildCompanyProfile({ deploymentId });
  const positioning = buildCompanyPositioning({ deploymentId });
  const certifications = buildCertifications({ deploymentId });
  const deliveryCapabilities = buildDeliveryCapabilities({ deploymentId });
  const activeCerts = certifications.filter((cert) => cert.status === "active").length;
  const avgOnTime =
    deliveryCapabilities.reduce((sum, cap) => sum + cap.onTimeRate, 0) / deliveryCapabilities.length;

  return {
    profile,
    positioning,
    scale: "enterprise",
    employeeCount: 320,
    annualRevenueTier: "50M-100M CNY",
    certifications,
    deliveryCapabilities,
    profileReadiness: Math.round((activeCerts / certifications.length) * avgOnTime * 100),
  };
}
