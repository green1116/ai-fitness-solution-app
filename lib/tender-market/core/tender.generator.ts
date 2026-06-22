/**
 * V64+ — Tender generation from marketplace template
 */

import { getTenderTemplate } from "@/lib/expansion/templates/tender.templates";
import { generateDemoTender } from "@/lib/demo/tender.demo.engine";
import { getMarketplaceTemplate } from "../marketplace/template.store";
import { trackTemplateUsage } from "../analytics/template.usage";

export function generateTenderFromTemplate(input: {
  templateId: string;
  companyName: string;
  companySize?: string;
}): {
  templateId: string;
  tenderTemplateId: string;
  preview: ReturnType<typeof generateDemoTender>;
  attachments: string[];
  mode: "preview";
} {
  const listing = getMarketplaceTemplate(input.templateId);
  if (!listing) throw new Error(`Template not found: ${input.templateId}`);

  const tenderTpl = getTenderTemplate(listing.tenderTemplateId);
  const preview = generateDemoTender({
    companyName: input.companyName,
    companySize: input.companySize,
    industry: listing.industry,
  });

  trackTemplateUsage({
    templateId: input.templateId,
    event: "generate",
    industry: listing.industry,
  });
  trackTemplateUsage({
    templateId: input.templateId,
    event: "preview",
    industry: listing.industry,
  });

  return {
    templateId: input.templateId,
    tenderTemplateId: listing.tenderTemplateId,
    preview,
    attachments: tenderTpl.attachments,
    mode: "preview",
  };
}

export function previewTenderResult(templateId: string, companyName: string) {
  return generateTenderFromTemplate({ templateId, companyName });
}
