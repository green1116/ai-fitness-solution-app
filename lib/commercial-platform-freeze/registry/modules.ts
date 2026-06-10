import { AI_INTEGRATION_DOMAINS } from "@/lib/ai-integration/evidence";
import { AI_READINESS_DOMAINS } from "@/lib/ai-readiness/evidence";
import { AUTOPILOT_DOMAINS } from "@/lib/autopilot/evidence";
import { COMMERCIAL_DELIVERY_DOMAINS } from "@/lib/commercial-delivery/evidence";
import { CUSTOMER_SUCCESS_DOMAINS } from "@/lib/customer-success/evidence";
import { ENTERPRISE_SAAS_DOMAINS } from "@/lib/enterprise-saas/evidence";
import { GTM_DOMAINS } from "@/lib/go-to-market/evidence";
import { KNOWLEDGE_BASE_DOMAINS } from "@/lib/knowledge-base/evidence";
import { PAYMENT_READINESS_DOMAINS } from "@/lib/payment-readiness/evidence";
import { PROPOSAL_GENERATION_DOMAINS } from "@/lib/proposal-generation/evidence";
import { PROPOSAL_PDF_DOMAINS } from "@/lib/proposal-pdf/evidence";
import { REVENUE_FOUNDATION_DOMAINS } from "@/lib/revenue-foundation/evidence";
import { REVENUE_OPS_DOMAINS } from "@/lib/revenue-operations/evidence";
import { TENDER_INTELLIGENCE_DOMAINS } from "@/lib/tender-intelligence/evidence";
import type { CommercialLayerKey } from "../shared/types";

export const COMMERCIAL_FREEZE_TAG = "v18-commercial-platform-freeze" as const;

export interface CommercialModuleDomainMeta {
  domainId: string;
  capability: string;
  runtimeFn: string;
  apiSlug: string;
  verifyScript: string;
}

export interface CommercialModuleMeta {
  moduleId: string;
  layer: CommercialLayerKey;
  libPath: string;
  version: string;
  tag: string;
  docPath: string;
  domains: CommercialModuleDomainMeta[];
  dependencies: string[];
}

const REVENUE_FOUNDATION_META: CommercialModuleMeta = {
  moduleId: "revenue-foundation",
  layer: "revenue",
  libPath: "lib/revenue-foundation",
  version: "v10.0-revenue-foundation-1",
  tag: "v10-revenue-foundation",
  docPath: "docs/commercialization/V10-REVENUE-FOUNDATION.md",
  dependencies: [],
  domains: [
    { domainId: "trial", capability: "Trial Plan / Limits / Conversion", runtimeFn: "runTrialRuntime", apiSlug: "trial", verifyScript: "verify:trial" },
    { domainId: "order", capability: "Order Model / Lifecycle", runtimeFn: "runOrderRuntime", apiSlug: "order", verifyScript: "verify:order" },
    { domainId: "subscription", capability: "Subscription / Renewal", runtimeFn: "runSubscriptionRuntime", apiSlug: "subscription", verifyScript: "verify:subscription" },
    { domainId: "invoice", capability: "Invoice Model / Status", runtimeFn: "runInvoiceRuntime", apiSlug: "invoice", verifyScript: "verify:invoice" },
    { domainId: "billing", capability: "Billing Snapshot / History", runtimeFn: "runBillingRuntime", apiSlug: "billing", verifyScript: "verify:billing" },
    { domainId: "revenue-dashboard", capability: "Revenue Dashboard / MRR / ARR", runtimeFn: "runRevenueDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:revenue-dashboard" },
  ],
};

const PAYMENT_READINESS_META: CommercialModuleMeta = {
  moduleId: "payment-readiness",
  layer: "revenue",
  libPath: "lib/payment-readiness",
  version: "v10.1-payment-readiness-1",
  tag: "v10.1-payment-readiness",
  docPath: "docs/commercialization/V10.1-PAYMENT-READINESS.md",
  dependencies: ["revenue-foundation"],
  domains: [
    { domainId: "payment-gateway", capability: "Payment Gateway Abstraction", runtimeFn: "runPaymentGatewayRuntime", apiSlug: "gateway", verifyScript: "verify:payment-gateway" },
    { domainId: "payment-events", capability: "Payment Events Contract", runtimeFn: "runPaymentEventsRuntime", apiSlug: "events", verifyScript: "verify:payment-events" },
    { domainId: "webhook-contract", capability: "Webhook Contract", runtimeFn: "runWebhookContractRuntime", apiSlug: "webhook", verifyScript: "verify:webhook-contract" },
    { domainId: "subscription-sync", capability: "Subscription Sync", runtimeFn: "runSubscriptionSyncRuntime", apiSlug: "subscription-sync", verifyScript: "verify:subscription-sync" },
    { domainId: "invoice-settlement", capability: "Invoice Settlement", runtimeFn: "runInvoiceSettlementRuntime", apiSlug: "invoice-settlement", verifyScript: "verify:invoice-settlement" },
    { domainId: "payment-readiness", capability: "Payment Readiness Dashboard", runtimeFn: "runPaymentReadinessDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:payment-readiness" },
  ],
};

const REVENUE_OPERATIONS_META: CommercialModuleMeta = {
  moduleId: "revenue-operations",
  layer: "revenue",
  libPath: "lib/revenue-operations",
  version: "v15.0-revenue-operations-1",
  tag: "v15-revenue-operations",
  docPath: "docs/commercialization/V15-REVENUE-OPERATIONS.md",
  dependencies: ["revenue-foundation", "payment-readiness"],
  domains: [
    { domainId: "lead-runtime", capability: "Lead Pipeline Runtime", runtimeFn: "runLeadRuntime", apiSlug: "lead", verifyScript: "verify:lead-runtime" },
    { domainId: "opportunity-runtime", capability: "Opportunity Runtime", runtimeFn: "runOpportunityRuntime", apiSlug: "opportunity", verifyScript: "verify:opportunity-runtime" },
    { domainId: "customer-runtime", capability: "Customer Runtime", runtimeFn: "runCustomerRuntime", apiSlug: "customer", verifyScript: "verify:customer-runtime" },
    { domainId: "trial-operations", capability: "Trial Operations", runtimeFn: "runTrialOperationsRuntime", apiSlug: "trial", verifyScript: "verify:trial-operations" },
    { domainId: "conversion-runtime", capability: "Conversion Runtime", runtimeFn: "runConversionRuntime", apiSlug: "conversion", verifyScript: "verify:conversion-runtime" },
    { domainId: "renewal-runtime", capability: "Renewal Runtime", runtimeFn: "runRenewalRuntime", apiSlug: "renewal", verifyScript: "verify:renewal-runtime" },
    { domainId: "churn-runtime", capability: "Churn Runtime", runtimeFn: "runChurnRuntime", apiSlug: "churn", verifyScript: "verify:churn-runtime" },
    { domainId: "revenue-analytics", capability: "Revenue Analytics", runtimeFn: "runRevenueAnalyticsRuntime", apiSlug: "revenue-analytics", verifyScript: "verify:revenue-analytics" },
    { domainId: "revenue-dashboard", capability: "Revenue Ops Dashboard", runtimeFn: "runRevenueOpsDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:revenue-ops-dashboard" },
  ],
};

const ENTERPRISE_SAAS_META: CommercialModuleMeta = {
  moduleId: "enterprise-saas",
  layer: "enterprise",
  libPath: "lib/enterprise-saas",
  version: "v10.5-enterprise-saas-1",
  tag: "v10.5-enterprise-saas",
  docPath: "docs/commercialization/V10.5-ENTERPRISE-SAAS.md",
  dependencies: [],
  domains: [
    { domainId: "tenant", capability: "Tenant Model", runtimeFn: "runTenantRuntime", apiSlug: "tenant", verifyScript: "verify:tenant" },
    { domainId: "workspace", capability: "Workspace Model", runtimeFn: "runWorkspaceRuntime", apiSlug: "workspace", verifyScript: "verify:workspace" },
    { domainId: "user", capability: "User Model", runtimeFn: "runUserRuntime", apiSlug: "user", verifyScript: "verify:user" },
    { domainId: "role", capability: "Role Model", runtimeFn: "runRoleRuntime", apiSlug: "role", verifyScript: "verify:role" },
    { domainId: "permission", capability: "Permission Model", runtimeFn: "runPermissionRuntime", apiSlug: "permission", verifyScript: "verify:permission" },
    { domainId: "seat", capability: "Seat Model", runtimeFn: "runSeatRuntime", apiSlug: "seat", verifyScript: "verify:seat" },
    { domainId: "usage", capability: "Usage Model", runtimeFn: "runUsageRuntime", apiSlug: "usage", verifyScript: "verify:usage" },
    { domainId: "enterprise-dashboard", capability: "Enterprise Dashboard", runtimeFn: "runEnterpriseDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:enterprise-dashboard" },
  ],
};

const PROPOSAL_GENERATION_META: CommercialModuleMeta = {
  moduleId: "proposal-generation",
  layer: "proposal",
  libPath: "lib/proposal-generation",
  version: "v11.0-proposal-generation-1",
  tag: "v11-proposal-generation",
  docPath: "docs/commercialization/V11-PROPOSAL-GENERATION.md",
  dependencies: [],
  domains: [
    { domainId: "executive-summary", capability: "Executive Summary", runtimeFn: "runExecutiveSummaryRuntime", apiSlug: "executive-summary", verifyScript: "verify:executive-summary" },
    { domainId: "technical-proposal", capability: "Technical Proposal", runtimeFn: "runTechnicalProposalRuntime", apiSlug: "technical-proposal", verifyScript: "verify:technical-proposal" },
    { domainId: "implementation-plan", capability: "Implementation Plan", runtimeFn: "runImplementationPlanRuntime", apiSlug: "implementation-plan", verifyScript: "verify:implementation-plan" },
    { domainId: "risk-analysis", capability: "Risk Analysis", runtimeFn: "runRiskAnalysisRuntime", apiSlug: "risk-analysis", verifyScript: "verify:risk-analysis" },
    { domainId: "delivery-schedule", capability: "Delivery Schedule", runtimeFn: "runDeliveryScheduleRuntime", apiSlug: "delivery-schedule", verifyScript: "verify:delivery-schedule" },
    { domainId: "compliance-matrix", capability: "Compliance Matrix", runtimeFn: "runComplianceMatrixRuntime", apiSlug: "compliance-matrix", verifyScript: "verify:compliance-matrix" },
    { domainId: "proposal-assembly", capability: "Proposal Assembly", runtimeFn: "runProposalAssemblyRuntime", apiSlug: "assembly", verifyScript: "verify:proposal-assembly" },
    { domainId: "proposal-dashboard", capability: "Proposal Dashboard", runtimeFn: "runProposalDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:proposal-dashboard" },
  ],
};

const PROPOSAL_PDF_META: CommercialModuleMeta = {
  moduleId: "proposal-pdf",
  layer: "proposal",
  libPath: "lib/proposal-pdf",
  version: "v11.2-proposal-pdf-1",
  tag: "v11.2-proposal-pdf",
  docPath: "docs/commercialization/V11.2-PROPOSAL-PDF.md",
  dependencies: ["proposal-generation"],
  domains: [
    { domainId: "proposal-cover", capability: "Proposal Cover", runtimeFn: "runProposalCoverRuntime", apiSlug: "cover", verifyScript: "verify:proposal-cover" },
    { domainId: "proposal-section", capability: "Proposal Section", runtimeFn: "runProposalSectionRuntime", apiSlug: "sections", verifyScript: "verify:proposal-section" },
    { domainId: "proposal-toc", capability: "Proposal TOC", runtimeFn: "runProposalTocRuntime", apiSlug: "toc", verifyScript: "verify:proposal-toc" },
    { domainId: "proposal-pdf-assembly", capability: "Proposal PDF Assembly", runtimeFn: "runProposalPdfAssemblyRuntime", apiSlug: "assembly", verifyScript: "verify:proposal-assembly" },
    { domainId: "proposal-pdf-dashboard", capability: "Proposal PDF Dashboard", runtimeFn: "runProposalPdfDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:proposal-pdf-dashboard" },
  ],
};

const AI_READINESS_META: CommercialModuleMeta = {
  moduleId: "ai-readiness",
  layer: "ai",
  libPath: "lib/ai-readiness",
  version: "v11.5-ai-readiness-1",
  tag: "v11.5-ai-readiness",
  docPath: "docs/commercialization/V11.5-AI-READINESS.md",
  dependencies: [],
  domains: [
    { domainId: "ai-provider", capability: "AI Provider Contract", runtimeFn: "runAiProviderRuntime", apiSlug: "provider", verifyScript: "verify:ai-provider" },
    { domainId: "model-runtime", capability: "Model Runtime", runtimeFn: "runModelRuntime", apiSlug: "model", verifyScript: "verify:model-runtime" },
    { domainId: "prompt-runtime", capability: "Prompt Runtime", runtimeFn: "runPromptRuntime", apiSlug: "prompt", verifyScript: "verify:prompt-runtime" },
    { domainId: "completion-runtime", capability: "Completion Runtime", runtimeFn: "runCompletionRuntime", apiSlug: "completion", verifyScript: "verify:completion-runtime" },
    { domainId: "token-runtime", capability: "Token Runtime", runtimeFn: "runTokenRuntime", apiSlug: "token", verifyScript: "verify:token-runtime" },
    { domainId: "cost-runtime", capability: "Cost Runtime", runtimeFn: "runCostRuntime", apiSlug: "cost", verifyScript: "verify:cost-runtime" },
    { domainId: "ai-adapter", capability: "AI Adapter", runtimeFn: "runAiAdapterRuntime", apiSlug: "adapter", verifyScript: "verify:ai-adapter" },
    { domainId: "ai-readiness", capability: "AI Readiness Dashboard", runtimeFn: "runAiReadinessDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:ai-readiness" },
  ],
};

const AI_INTEGRATION_META: CommercialModuleMeta = {
  moduleId: "ai-integration",
  layer: "ai",
  libPath: "lib/ai-integration",
  version: "v13.0-ai-integration-1",
  tag: "v13-ai-integration",
  docPath: "docs/commercialization/V13-AI-INTEGRATION.md",
  dependencies: ["ai-readiness", "knowledge-base"],
  domains: [
    { domainId: "ai-provider-adapter", capability: "AI Provider Adapter", runtimeFn: "runAiProviderAdapterRuntime", apiSlug: "gateway", verifyScript: "verify:ai-provider-adapter" },
    { domainId: "prompt-orchestration", capability: "Prompt Orchestration", runtimeFn: "runPromptOrchestrationRuntime", apiSlug: "prompt-orchestration", verifyScript: "verify:prompt-orchestration" },
    { domainId: "model-routing", capability: "Model Routing", runtimeFn: "runModelRoutingRuntime", apiSlug: "model-routing", verifyScript: "verify:model-routing" },
    { domainId: "ai-safety", capability: "AI Safety", runtimeFn: "runAiSafetyRuntime", apiSlug: "safety", verifyScript: "verify:ai-safety" },
    { domainId: "ai-cost-control", capability: "AI Cost Control", runtimeFn: "runAiCostControlRuntime", apiSlug: "cost-control", verifyScript: "verify:ai-cost-control" },
    { domainId: "ai-audit", capability: "AI Audit", runtimeFn: "runAiAuditRuntime", apiSlug: "audit", verifyScript: "verify:ai-audit" },
    { domainId: "ai-knowledge-fusion", capability: "AI Knowledge Fusion", runtimeFn: "runAiKnowledgeFusionRuntime", apiSlug: "knowledge-fusion", verifyScript: "verify:ai-knowledge-fusion" },
    { domainId: "ai-generation-dashboard", capability: "AI Generation Dashboard", runtimeFn: "runAiGenerationDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:ai-generation-dashboard" },
  ],
};

const AUTOPILOT_META: CommercialModuleMeta = {
  moduleId: "autopilot",
  layer: "ai",
  libPath: "lib/autopilot",
  version: "v13.5-autopilot-1",
  tag: "v13.5-autopilot",
  docPath: "docs/commercialization/V13.5-AUTOPILOT.md",
  dependencies: ["ai-integration", "proposal-generation", "commercial-delivery"],
  domains: [
    { domainId: "autopilot-job", capability: "Autopilot Job", runtimeFn: "runAutopilotJobRuntime", apiSlug: "job", verifyScript: "verify:autopilot-job" },
    { domainId: "workflow", capability: "Workflow Runtime", runtimeFn: "runWorkflowRuntime", apiSlug: "workflow", verifyScript: "verify:workflow" },
    { domainId: "stage-orchestration", capability: "Stage Orchestration", runtimeFn: "runStageOrchestrationRuntime", apiSlug: "stage-orchestration", verifyScript: "verify:stage-orchestration" },
    { domainId: "retry-runtime", capability: "Retry Runtime", runtimeFn: "runRetryRuntime", apiSlug: "retry", verifyScript: "verify:retry-runtime" },
    { domainId: "human-review", capability: "Human Review", runtimeFn: "runHumanReviewRuntime", apiSlug: "human-review", verifyScript: "verify:human-review" },
    { domainId: "delivery-runtime", capability: "Autopilot Delivery", runtimeFn: "runAutopilotDeliveryRuntime", apiSlug: "delivery", verifyScript: "verify:delivery-runtime" },
    { domainId: "autopilot-audit", capability: "Autopilot Audit", runtimeFn: "runAutopilotAuditRuntime", apiSlug: "audit", verifyScript: "verify:autopilot-audit" },
    { domainId: "autopilot-dashboard", capability: "Autopilot Dashboard", runtimeFn: "runAutopilotDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:autopilot-dashboard" },
  ],
};

const TENDER_INTELLIGENCE_META: CommercialModuleMeta = {
  moduleId: "tender-intelligence",
  layer: "knowledge",
  libPath: "lib/tender-intelligence",
  version: "v12.0-tender-intelligence-1",
  tag: "v12-tender-intelligence",
  docPath: "docs/commercialization/V12-TENDER-INTELLIGENCE.md",
  dependencies: [],
  domains: [
    { domainId: "project-classification", capability: "Project Classification", runtimeFn: "runProjectClassificationRuntime", apiSlug: "classification", verifyScript: "verify:project-classification" },
    { domainId: "project-scale", capability: "Project Scale", runtimeFn: "runProjectScaleRuntime", apiSlug: "scale", verifyScript: "verify:project-scale" },
    { domainId: "risk-intelligence", capability: "Risk Intelligence", runtimeFn: "runRiskIntelligenceRuntime", apiSlug: "risk", verifyScript: "verify:risk-intelligence" },
    { domainId: "equipment-intelligence", capability: "Equipment Intelligence", runtimeFn: "runEquipmentIntelligenceRuntime", apiSlug: "equipment", verifyScript: "verify:equipment-intelligence" },
    { domainId: "budget-intelligence", capability: "Budget Intelligence", runtimeFn: "runBudgetIntelligenceRuntime", apiSlug: "budget", verifyScript: "verify:budget-intelligence" },
    { domainId: "compliance-intelligence", capability: "Compliance Intelligence", runtimeFn: "runComplianceIntelligenceRuntime", apiSlug: "compliance", verifyScript: "verify:compliance-intelligence" },
    { domainId: "tender-intelligence", capability: "Tender Intelligence Assembly", runtimeFn: "runTenderIntelligenceRuntime", apiSlug: "assembly", verifyScript: "verify:tender-intelligence" },
    { domainId: "tender-dashboard", capability: "Tender Dashboard", runtimeFn: "runTenderDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:tender-dashboard" },
  ],
};

const KNOWLEDGE_BASE_META: CommercialModuleMeta = {
  moduleId: "knowledge-base",
  layer: "knowledge",
  libPath: "lib/knowledge-base",
  version: "v12.5-knowledge-base-1",
  tag: "v12.5-knowledge-base",
  docPath: "docs/commercialization/V12.5-KNOWLEDGE-BASE.md",
  dependencies: ["tender-intelligence"],
  domains: [
    { domainId: "project-knowledge", capability: "Project Knowledge", runtimeFn: "runProjectKnowledgeRuntime", apiSlug: "project", verifyScript: "verify:project-knowledge" },
    { domainId: "equipment-knowledge", capability: "Equipment Knowledge", runtimeFn: "runEquipmentKnowledgeRuntime", apiSlug: "equipment", verifyScript: "verify:equipment-knowledge" },
    { domainId: "proposal-knowledge", capability: "Proposal Knowledge", runtimeFn: "runProposalKnowledgeRuntime", apiSlug: "proposal", verifyScript: "verify:proposal-knowledge" },
    { domainId: "risk-knowledge", capability: "Risk Knowledge", runtimeFn: "runRiskKnowledgeRuntime", apiSlug: "risk", verifyScript: "verify:risk-knowledge" },
    { domainId: "compliance-knowledge", capability: "Compliance Knowledge", runtimeFn: "runComplianceKnowledgeRuntime", apiSlug: "compliance", verifyScript: "verify:compliance-knowledge" },
    { domainId: "knowledge-catalog", capability: "Knowledge Catalog", runtimeFn: "runKnowledgeCatalogRuntime", apiSlug: "catalog", verifyScript: "verify:knowledge-catalog" },
    { domainId: "knowledge-search", capability: "Knowledge Search", runtimeFn: "runKnowledgeSearchRuntime", apiSlug: "search", verifyScript: "verify:knowledge-search" },
    { domainId: "knowledge-assembly", capability: "Knowledge Assembly", runtimeFn: "runKnowledgeAssemblyRuntime", apiSlug: "assembly", verifyScript: "verify:knowledge-assembly" },
    { domainId: "knowledge-dashboard", capability: "Knowledge Dashboard", runtimeFn: "runKnowledgeDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:knowledge-dashboard" },
  ],
};

const COMMERCIAL_DELIVERY_META: CommercialModuleMeta = {
  moduleId: "commercial-delivery",
  layer: "delivery",
  libPath: "lib/commercial-delivery",
  version: "v14.0-commercial-delivery-1",
  tag: "v14-commercial-delivery",
  docPath: "docs/commercialization/V14-COMMERCIAL-DELIVERY.md",
  dependencies: ["proposal-pdf", "enterprise-saas"],
  domains: [
    { domainId: "delivery-workspace", capability: "Delivery Workspace", runtimeFn: "runDeliveryWorkspaceRuntime", apiSlug: "workspace", verifyScript: "verify:delivery-workspace" },
    { domainId: "customer-portal", capability: "Customer Portal", runtimeFn: "runCustomerPortalRuntime", apiSlug: "customer-portal", verifyScript: "verify:customer-portal" },
    { domainId: "delivery-ledger", capability: "Delivery Ledger", runtimeFn: "runDeliveryLedgerRuntime", apiSlug: "ledger", verifyScript: "verify:delivery-ledger" },
    { domainId: "version-runtime", capability: "Version Runtime", runtimeFn: "runVersionRuntime", apiSlug: "version", verifyScript: "verify:version-runtime" },
    { domainId: "approval-runtime", capability: "Approval Runtime", runtimeFn: "runApprovalRuntime", apiSlug: "approval", verifyScript: "verify:approval-runtime" },
    { domainId: "download-runtime", capability: "Download Runtime", runtimeFn: "runDownloadRuntime", apiSlug: "download", verifyScript: "verify:download-runtime" },
    { domainId: "commercial-dashboard", capability: "Commercial Delivery Dashboard", runtimeFn: "runCommercialDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:commercial-dashboard" },
  ],
};

const CUSTOMER_SUCCESS_META: CommercialModuleMeta = {
  moduleId: "customer-success",
  layer: "customer-success",
  libPath: "lib/customer-success",
  version: "v16.0-customer-success-1",
  tag: "v16-customer-success",
  docPath: "docs/commercialization/V16-CUSTOMER-SUCCESS.md",
  dependencies: ["revenue-operations"],
  domains: [
    { domainId: "customer-health", capability: "Customer Health", runtimeFn: "runCustomerHealthRuntime", apiSlug: "health", verifyScript: "verify:customer-health" },
    { domainId: "adoption-runtime", capability: "Adoption Runtime", runtimeFn: "runAdoptionRuntime", apiSlug: "adoption", verifyScript: "verify:adoption-runtime" },
    { domainId: "expansion-runtime", capability: "Expansion Runtime", runtimeFn: "runExpansionRuntime", apiSlug: "expansion", verifyScript: "verify:expansion-runtime" },
    { domainId: "renewal-risk", capability: "Renewal Risk", runtimeFn: "runRenewalRiskRuntime", apiSlug: "renewal-risk", verifyScript: "verify:renewal-risk" },
    { domainId: "success-playbook", capability: "Success Playbook", runtimeFn: "runSuccessPlaybookRuntime", apiSlug: "playbook", verifyScript: "verify:success-playbook" },
    { domainId: "success-audit", capability: "Success Audit", runtimeFn: "runSuccessAuditRuntime", apiSlug: "audit", verifyScript: "verify:success-audit" },
    { domainId: "customer-success-dashboard", capability: "Customer Success Dashboard", runtimeFn: "runCustomerSuccessDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:customer-success-dashboard" },
  ],
};

const GO_TO_MARKET_META: CommercialModuleMeta = {
  moduleId: "go-to-market",
  layer: "go-to-market",
  libPath: "lib/go-to-market",
  version: "v17.0-go-to-market-1",
  tag: "v17-go-to-market",
  docPath: "docs/commercialization/V17-GO-TO-MARKET.md",
  dependencies: ["revenue-operations"],
  domains: [
    { domainId: "product-launch", capability: "Product Launch", runtimeFn: "runProductLaunchRuntime", apiSlug: "product-launch", verifyScript: "verify:product-launch" },
    { domainId: "campaign-runtime", capability: "Campaign Runtime", runtimeFn: "runCampaignRuntime", apiSlug: "campaign", verifyScript: "verify:campaign-runtime" },
    { domainId: "lead-acquisition", capability: "Lead Acquisition", runtimeFn: "runLeadAcquisitionRuntime", apiSlug: "lead-acquisition", verifyScript: "verify:lead-acquisition" },
    { domainId: "outreach-runtime", capability: "Outreach Runtime", runtimeFn: "runOutreachRuntime", apiSlug: "outreach", verifyScript: "verify:outreach-runtime" },
    { domainId: "market-segment", capability: "Market Segment", runtimeFn: "runMarketSegmentRuntime", apiSlug: "market-segment", verifyScript: "verify:market-segment" },
    { domainId: "gtm-analytics", capability: "GTM Analytics", runtimeFn: "runGtmAnalyticsRuntime", apiSlug: "gtm-analytics", verifyScript: "verify:gtm-analytics" },
    { domainId: "gtm-dashboard", capability: "GTM Dashboard", runtimeFn: "runGtmDashboardRuntime", apiSlug: "dashboard", verifyScript: "verify:gtm-dashboard" },
  ],
};

export const COMMERCIAL_MODULE_REGISTRY: readonly CommercialModuleMeta[] = [
  REVENUE_FOUNDATION_META,
  PAYMENT_READINESS_META,
  REVENUE_OPERATIONS_META,
  ENTERPRISE_SAAS_META,
  PROPOSAL_GENERATION_META,
  PROPOSAL_PDF_META,
  AI_READINESS_META,
  AI_INTEGRATION_META,
  AUTOPILOT_META,
  TENDER_INTELLIGENCE_META,
  KNOWLEDGE_BASE_META,
  COMMERCIAL_DELIVERY_META,
  CUSTOMER_SUCCESS_META,
  GO_TO_MARKET_META,
];

export const COMMERCIAL_LAYER_ORDER: readonly CommercialLayerKey[] = [
  "revenue",
  "enterprise",
  "proposal",
  "ai",
  "knowledge",
  "delivery",
  "customer-success",
  "go-to-market",
];

const DOMAIN_COUNTS: Record<string, number> = {
  "revenue-foundation": REVENUE_FOUNDATION_DOMAINS.length,
  "payment-readiness": PAYMENT_READINESS_DOMAINS.length,
  "revenue-operations": REVENUE_OPS_DOMAINS.length,
  "enterprise-saas": ENTERPRISE_SAAS_DOMAINS.length,
  "proposal-generation": PROPOSAL_GENERATION_DOMAINS.length,
  "proposal-pdf": PROPOSAL_PDF_DOMAINS.length,
  "ai-readiness": AI_READINESS_DOMAINS.length,
  "ai-integration": AI_INTEGRATION_DOMAINS.length,
  autopilot: AUTOPILOT_DOMAINS.length,
  "tender-intelligence": TENDER_INTELLIGENCE_DOMAINS.length,
  "knowledge-base": KNOWLEDGE_BASE_DOMAINS.length,
  "commercial-delivery": COMMERCIAL_DELIVERY_DOMAINS.length,
  "customer-success": CUSTOMER_SUCCESS_DOMAINS.length,
  "go-to-market": GTM_DOMAINS.length,
};

export function assertRegistryDomainAlignment(): void {
  for (const module of COMMERCIAL_MODULE_REGISTRY) {
    const expected = DOMAIN_COUNTS[module.moduleId];
    if (expected !== module.domains.length) {
      throw new Error(
        `Registry domain count mismatch for ${module.moduleId}: registry=${module.domains.length} evidence=${expected}`,
      );
    }
  }
}

export function getModulesByLayer(layer: CommercialLayerKey): CommercialModuleMeta[] {
  return COMMERCIAL_MODULE_REGISTRY.filter((module) => module.layer === layer);
}
