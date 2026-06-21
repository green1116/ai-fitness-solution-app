/**
 * V60 P3 — Lead scoring engine (AI + CRM composite)
 */

export { scoreLeadQuality, resolveLeadQualityTier, type LeadQualityTier } from "../ai/lead-scoring.ai";
export { scoreLead as scoreLeadBase } from "@/lib/crm/lead/lead.scoring";
