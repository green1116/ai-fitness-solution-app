/**
 * V60 P4 — Business expansion domain types
 */

export type VerticalIndustry =
  | "fitness"
  | "education"
  | "procurement"
  | "enterprise"
  | "hr_admin";

export type QuoteTemplateId =
  | "fitness_quote_v1"
  | "education_quote_v1"
  | "enterprise_quote_v1";

export type BudgetTemplateId = "cost_model_fitness" | "cost_model_enterprise";

export type TenderTemplateId = "tender_standard_cn" | "tender_enterprise_pro";

export type DeploymentEnvironment = "development" | "staging" | "production";

export type VerticalDefinition = {
  id: VerticalIndustry;
  name: string;
  description: string;
  quoteTemplate: QuoteTemplateId;
  budgetTemplate: BudgetTemplateId;
  tenderTemplate: TenderTemplateId;
  modules: string[];
};

export type IndustryTemplateBundle = {
  vertical: VerticalIndustry;
  quote: QuoteTemplateId;
  budget: BudgetTemplateId;
  tender: TenderTemplateId;
  features: string[];
};

export type WhiteLabelTheme = {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  companyName: string;
  domain?: string;
  pdfHeader?: string;
  pdfFooter?: string;
};

export type TenantBrandingConfig = {
  organizationId: string;
  theme: WhiteLabelTheme;
  enabled: boolean;
  updatedAt: string;
};

export type ApiAccessPlan = {
  planId: string;
  name: string;
  saasPlan: "BASIC" | "PRO" | "ENTERPRISE";
  rateLimitPerMinute: number;
  allowedEndpoints: string[];
};

export type TenantDeployment = {
  deploymentId: string;
  organizationId: string;
  vertical: VerticalIndustry;
  environment: DeploymentEnvironment;
  status: "pending" | "active" | "suspended";
  createdAt: string;
};

export type BusinessCloneResult = {
  sourceVertical: VerticalIndustry;
  targetVertical: VerticalIndustry;
  clonedModules: string[];
  templates: IndustryTemplateBundle;
};
