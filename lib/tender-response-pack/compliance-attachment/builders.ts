import { buildCertifications } from "@/lib/bidder-intelligence/bidder-profile/builders";
import { buildComplianceStatus } from "@/lib/proposal-generation/compliance-matrix/builders";
import { buildResponsePackContext } from "../bridge/response-bridge";
import type { ResponsePackBidderBrand } from "../shared/types";

const BRAND_QUALIFICATIONS: Record<ResponsePackBidderBrand, string[]> = {
  Technogym: ["Authorized Technogym Distributor", "Premium Fitness Equipment Installer Level 3"],
  "Life Fitness": ["Life Fitness Authorized Partner", "Commercial Gym Equipment Specialist"],
  Matrix: ["Matrix Authorized Dealer", "Mid-Market Fitness Solutions Provider"],
  Shuhua: ["Shuhua Authorized Agent", "Government Procurement Qualified Supplier"],
};

const BRAND_LICENSES: Record<ResponsePackBidderBrand, string[]> = {
  Technogym: ["Business License", "Import/Export License", "Equipment Sales Permit"],
  "Life Fitness": ["Business License", "Import/Export License", "Equipment Sales Permit"],
  Matrix: ["Business License", "Equipment Sales Permit", "Regional Distribution License"],
  Shuhua: ["Business License", "Domestic Manufacturing License", "Government Procurement Registration"],
};

export function buildCompliancePackage(input?: {
  deploymentId?: string;
  bidderBrand?: ResponsePackBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "compliance-attachment-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildResponsePackContext({ deploymentId, bidderBrand });
  const compliance = buildComplianceStatus({ deploymentId });
  const certs = buildCertifications({ deploymentId });

  const complianceMatrix = compliance
    .map((c) => `${c.category}: ${c.compliantCount}/${c.totalRequirements} (${c.coverageRate}%)`)
    .join("; ");

  const certifications = certs
    .filter((c) => c.status === "active")
    .map((c) => `${c.name} (${c.issuer}, valid until ${c.validUntil})`);

  const qualifications = BRAND_QUALIFICATIONS[bidderBrand];
  const licenses = BRAND_LICENSES[bidderBrand];

  const checks = [
    complianceMatrix.length > 20,
    certifications.length >= 3,
    qualifications.length >= 2,
    licenses.length >= 3,
  ];
  const complianceReadiness = Math.min(
    100,
    Math.round(
      (checks.filter(Boolean).length / checks.length) * 70 +
        compliance.reduce((s, c) => s + c.coverageRate, 0) / compliance.length * 0.3,
    ),
  );

  return {
    packageId: `compliance-package-${bidderBrand}-${deploymentId}`,
    packLabel: ctx.packLabel,
    bidderBrand,
    complianceMatrix,
    certifications,
    qualifications,
    licenses,
    complianceReadiness,
  };
}
