/**
 * V60 P4 — Business expansion service (public API)
 */

export {
  registerVerticalIndustry,
  loadIndustryTemplate,
  listVerticalIndustries,
  scaleProductAcrossIndustries,
} from "./verticals/vertical.registry";

export { resolveTemplateBundle, cloneTemplatesForVertical } from "./templates/template.engine";
export { getQuoteTemplate, QUOTE_TEMPLATES } from "./templates/quote.templates";
export { getBudgetTemplate, BUDGET_TEMPLATES } from "./templates/budget.templates";
export { getTenderTemplate, TENDER_TEMPLATES } from "./templates/tender.templates";

export {
  createCustomBranding,
  generateWhiteLabelTheme,
  getBrandingForTenant,
} from "./white-label/branding.engine";
export { resolveThemeForOrganization, resolvePdfBranding } from "./white-label/theme.resolver";

export {
  registerAPIAccessPlan,
  listApiEndpoints,
  API_ACCESS_PLANS,
} from "./api-platform/api.registry";
export { createApiKey, validateApiAccess, resolvePlanForSaasTier } from "./api-platform/api.plan.manager";
export { runApiPlatformGate, getPlatformCatalog } from "./api-platform/api.gateway";

export {
  deployTenantInstance,
  listDeploymentsForOrganization,
} from "./deployment/multi-tenant.deploy";
export { resolveDeploymentEnvironment, getEnvironmentConfig } from "./deployment/environment.manager";

export {
  cloneBusinessModule,
  cloneBusinessToNewIndustry,
  generateIndustrySolution,
} from "./expansion.engine";

export type {
  VerticalIndustry,
  IndustryTemplateBundle,
  WhiteLabelTheme,
  TenantBrandingConfig,
  ApiAccessPlan,
  TenantDeployment,
  BusinessCloneResult,
} from "./expansion.types";
