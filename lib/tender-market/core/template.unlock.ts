/**
 * V64+ — Template unlock via Feature Gate (no billing bypass)
 */

import { evaluatePaywall } from "@/lib/growth/conversion/paywall.engine";
import { getMarketplaceTemplate } from "../marketplace/template.store";
import { resolveTemplateLicense } from "../pricing/template.license";
import { trackTemplateUsage } from "../analytics/template.usage";

export async function evaluateTemplateUnlock(input: {
  templateId: string;
  organizationId: string;
  userId?: string;
}): Promise<{
  templateId: string;
  priceCny: number;
  license: ReturnType<typeof resolveTemplateLicense>;
  paywall: Awaited<ReturnType<typeof evaluatePaywall>>;
  checkoutHint: string;
}> {
  const listing = getMarketplaceTemplate(input.templateId);
  if (!listing) throw new Error(`Template not found: ${input.templateId}`);

  const license = resolveTemplateLicense(listing.priceTier);

  trackTemplateUsage({
    templateId: input.templateId,
    event: "unlock_attempt",
    industry: listing.industry,
  });

  const paywall = await evaluatePaywall({
    organizationId: input.organizationId,
    userId: input.userId,
    trigger: listing.priceTier === "ENTERPRISE" ? "tender_generation_click" : "pdf_download_attempt",
  });

  return {
    templateId: input.templateId,
    priceCny: listing.priceCny,
    license,
    paywall,
    checkoutHint:
      paywall.showPaywall
        ? `Upgrade to ${paywall.recommendedPlan} via /api/billing/create-checkout-session`
        : "Feature access granted — proceed to PDF download",
  };
}

export async function resolvePdfDownloadGate(input: {
  templateId: string;
  organizationId: string;
  userId?: string;
}) {
  const unlock = await evaluateTemplateUnlock(input);
  const allowed = !unlock.paywall.showPaywall && unlock.license.allowsPdfDownload;

  if (allowed) {
    trackTemplateUsage({
      templateId: input.templateId,
      event: "download",
      industry: getMarketplaceTemplate(input.templateId)?.industry,
    });
  }

  return { ...unlock, allowed };
}
