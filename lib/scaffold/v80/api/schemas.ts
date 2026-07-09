/** V80 CODE P3 — hardened request schemas */
import { z } from "zod";

const cuidLike = z.string().min(1).max(128);
const shortText = z.string().min(1).max(200);
const email = z.string().email().max(320);

export const provisionTenantSchema = z.object({
  organizationName: shortText,
  plan: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
  adminEmail: email,
});

export const entitlementsQuerySchema = z.object({
  organizationId: cuidLike,
});

export const calculateBudgetSchema = z.object({
  quoteId: cuidLike,
  companySize: z.number().int().positive().max(1_000_000),
  budgetTier: z.enum(["low", "mid", "high"]),
  organizationId: cuidLike,
});

export const tenderIntakeSchema = z.object({
  projectId: cuidLike,
  tenderType: z.literal("enterprise-gym"),
  documentUrls: z.array(z.string().url().max(2048)).max(20).optional(),
});

export const enqueueWorkflowSchema = z.object({
  projectId: cuidLike,
  workflowKey: z.literal("tender-pack-complete"),
  deploymentId: z.string().max(128).optional(),
});

export const proposalPdfSchema = z.object({
  projectId: cuidLike,
  sections: z.array(shortText).min(1).max(50),
});

export const pdfGatewayQuerySchema = z.object({
  type: z.enum(["budget", "plan"]),
  projectId: cuidLike,
  budgetId: cuidLike.optional(),
  level: z.enum(["brand", "government"]).default("brand"),
  artifactId: cuidLike.optional(),
});

export const integrityQuerySchema = z.object({
  deploymentId: z.string().max(128).optional(),
});
