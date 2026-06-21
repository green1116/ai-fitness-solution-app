/**
 * V64+ — Template license model
 */

import type { TemplateLicenseType, TemplatePriceTier } from "../tender-market.types";

export type TemplateLicense = {
  type: TemplateLicenseType;
  label: string;
  allowsPdfDownload: boolean;
  allowsFullTender: boolean;
  requiresPaywall: boolean;
};

export const LICENSE_BY_TIER: Record<TemplatePriceTier, TemplateLicense> = {
  FREE: {
    type: "preview",
    label: "免费预览",
    allowsPdfDownload: false,
    allowsFullTender: false,
    requiresPaywall: true,
  },
  INDUSTRY: {
    type: "single_download",
    label: "单次下载授权",
    allowsPdfDownload: true,
    allowsFullTender: true,
    requiresPaywall: true,
  },
  ENTERPRISE: {
    type: "enterprise_unlimited",
    label: "企业无限授权",
    allowsPdfDownload: true,
    allowsFullTender: true,
    requiresPaywall: true,
  },
};

export function resolveTemplateLicense(tier: TemplatePriceTier): TemplateLicense {
  return LICENSE_BY_TIER[tier];
}

export function canDownloadWithLicense(
  license: TemplateLicense,
  hasPaid: boolean,
): { allowed: boolean; reason?: string } {
  if (!license.requiresPaywall) return { allowed: true };
  if (hasPaid && license.allowsPdfDownload) return { allowed: true };
  return {
    allowed: false,
    reason: "Paywall unlock required — use Feature Gate + Stripe checkout",
  };
}
