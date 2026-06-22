/**
 * V60 P4 — Business scaling & cloning engine
 */

import type { BusinessCloneResult, VerticalIndustry } from "./expansion.types";
import { loadIndustryTemplate, registerVerticalIndustry, scaleProductAcrossIndustries } from "./verticals/vertical.registry";
import { cloneTemplatesForVertical } from "./templates/template.engine";
import { deployTenantInstance } from "./deployment/multi-tenant.deploy";

export function cloneBusinessModule(input: {
  sourceVertical: VerticalIndustry;
  targetVertical: VerticalIndustry;
}): BusinessCloneResult {
  registerVerticalIndustry(input.sourceVertical);
  registerVerticalIndustry(input.targetVertical);

  const source = loadIndustryTemplate(input.sourceVertical);
  const templates = cloneTemplatesForVertical(input.sourceVertical, input.targetVertical);

  return {
    sourceVertical: input.sourceVertical,
    targetVertical: input.targetVertical,
    clonedModules: templates.features,
    templates,
  };
}

export function generateIndustrySolution(industry: VerticalIndustry) {
  const vertical = registerVerticalIndustry(industry);
  const templates = loadIndustryTemplate(industry);

  return {
    industry,
    name: vertical.name,
    description: vertical.description,
    templates,
    modules: vertical.modules,
    deployable: true,
  };
}

export function cloneBusinessToNewIndustry(input: {
  organizationId: string;
  sourceVertical: VerticalIndustry;
  targetVertical: VerticalIndustry;
  branding?: { companyName: string; logoUrl?: string };
}) {
  const clone = cloneBusinessModule({
    sourceVertical: input.sourceVertical,
    targetVertical: input.targetVertical,
  });

  const deployment = deployTenantInstance({
    organizationId: input.organizationId,
    vertical: input.targetVertical,
    branding: input.branding,
  });

  return { clone, deployment };
}

export { scaleProductAcrossIndustries };
