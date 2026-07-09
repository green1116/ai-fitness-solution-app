/**
 * V80 APP P2 — Prisma module breakdown (models grouped by domain)
 */
import { PRODUCT_MODULE_MAP } from "./product.module.map";
import type { PrismaModuleEntry } from "./engineering.types";

export const ENGINEERING_PRISMA_MODULES: PrismaModuleEntry[] = [
  {
    id: "ENG-PRS-001",
    domain: "identity",
    schemaFile: "prisma/schema.prisma",
    models: ["User", "Organization", "OrganizationMember", "Session"],
    productModuleRef: "APP-MOD-001",
    relations: ["User→OrganizationMember→Organization"],
    required: true,
    description: "Identity + multi-tenant gym operator accounts",
  },
  {
    id: "ENG-PRS-002",
    domain: "commercial",
    schemaFile: "prisma/schema.prisma",
    models: ["Subscription", "Payment", "UsageRecord", "SaasInvoice", "Order"],
    productModuleRef: "APP-MOD-002",
    relations: ["Organization→Subscription→UsageRecord"],
    required: true,
    description: "Commercial tier, billing, usage ledger",
  },
  {
    id: "ENG-PRS-003",
    domain: "tender",
    schemaFile: "prisma/schema.prisma",
    models: ["Tender", "Project", "Solution", "Quote", "Budget"],
    productModuleRef: "APP-MOD-003",
    relations: ["Organization→Project→Tender→Quote→Budget"],
    required: true,
    description: "Tender intake, gym project, quote/budget chain",
  },
  {
    id: "ENG-PRS-004",
    domain: "document",
    schemaFile: "prisma/schema.prisma",
    models: ["DocumentExport", "PdfDownloadLog", "PdfDownloadTokenState"],
    productModuleRef: "APP-MOD-006",
    relations: ["Project→DocumentExport", "Budget→DocumentExport"],
    required: true,
    description: "PDF artifact storage + download audit",
  },
  {
    id: "ENG-PRS-005",
    domain: "workflow",
    schemaFile: "prisma/schema.prisma",
    models: ["PlanJob"],
    productModuleRef: "APP-MOD-003",
    relations: ["PlanJob→Project"],
    required: true,
    description: "Async job/workflow run tracking",
  },
  {
    id: "ENG-PRS-006",
    domain: "audit",
    schemaFile: "prisma/schema.prisma",
    models: ["LicenseBinding", "LicenseConsume", "StripeWebhookEvent"],
    productModuleRef: "APP-MOD-004",
    relations: ["Organization→LicenseBinding"],
    required: true,
    description: "Integrity audit, license, webhook trail",
  },
];

export function isEngineeringPrismaBreakdownComplete(): boolean {
  const domains = new Set(ENGINEERING_PRISMA_MODULES.map((m) => m.domain));
  const moduleRefs = new Set(PRODUCT_MODULE_MAP.map((m) => m.id));
  return (
    ENGINEERING_PRISMA_MODULES.length === 6 &&
    domains.size === 6 &&
    ENGINEERING_PRISMA_MODULES.every(
      (m) => moduleRefs.has(m.productModuleRef) && m.models.length >= 1,
    )
  );
}

export function getEngineeringPrismaModuleByDomain(
  domain: PrismaModuleEntry["domain"],
): PrismaModuleEntry | undefined {
  return ENGINEERING_PRISMA_MODULES.find((m) => m.domain === domain);
}
