/**
 * V80 PRODUCT P3 — Channel scaling (inbound / outbound / partners / tender)
 */
import { SALES_FUNNEL_STAGES } from "./growth.funnel.spec";
import { CONVERSION_TRIGGERS } from "./growth.conversion.spec";
import type { ChannelScalingModel } from "./scale.types";

export const CHANNEL_SCALING_MODELS: ChannelScalingModel[] = [
  {
    id: "PRD-CHA-001",
    channel: "inbound",
    motion: "Content + SEO — gym RFP templates, budget calculators",
    funnelStage: SALES_FUNNEL_STAGES[0]!.stage,
    conversionHook: "Free plan PDF trial → tenant/run signup",
    scaleLever: "PLG — self-serve FitStart at $49/mo",
    required: true,
  },
  {
    id: "PRD-CHA-002",
    channel: "inbound",
    motion: "Product-led upgrade CTAs on FEATURE_GATE",
    funnelStage: "paid",
    conversionHook: CONVERSION_TRIGGERS[0]!.cta,
    scaleLever: "Automated BASIC→PRO without sales touch",
    required: true,
  },
  {
    id: "PRD-CHA-003",
    channel: "outbound",
    motion: "ABM — target top 200 gym equipment integrators",
    funnelStage: "lead",
    conversionHook: "Demo: tender-pack-complete in 30 min",
    scaleLever: "SDR → AE → FitScale close",
    required: true,
  },
  {
    id: "PRD-CHA-004",
    channel: "outbound",
    motion: "Enterprise sales — multi-site gym chains",
    funnelStage: "paid",
    conversionHook: CONVERSION_TRIGGERS[6]!.cta,
    scaleLever: "Sales-assist FitEnterprise ACV",
    required: true,
  },
  {
    id: "PRD-CHA-005",
    channel: "partners",
    motion: "Equipment OEM / distributor co-sell",
    funnelStage: "intake",
    conversionHook: "White-label plan+budget PDF under partner brand",
    scaleLever: "Rev-share on PRO seats + per-tender usage",
    required: true,
  },
  {
    id: "PRD-CHA-006",
    channel: "partners",
    motion: "Consulting firm referral network",
    funnelStage: "org",
    conversionHook: "Partner workspace provisioning",
    scaleLever: "20% referral on first-year ARR",
    required: true,
  },
  {
    id: "PRD-CHA-007",
    channel: "tender",
    motion: "Procurement portal listing — respond inside platform",
    funnelStage: "intake",
    conversionHook: "/api/v80/tender/intake as procurement entry",
    scaleLever: "Tender marketplace → autopilot upsell",
    required: true,
  },
  {
    id: "PRD-CHA-008",
    channel: "tender",
    motion: "Government gym infrastructure RFP programs",
    funnelStage: "pdf",
    conversionHook: "Government-tier budget PDF deliverable",
    scaleLever: "Compliance GTM → ENTERPRISE contract",
    required: true,
  },
];

export function isChannelScalingComplete(): boolean {
  const channels = new Set(CHANNEL_SCALING_MODELS.map((c) => c.channel));
  return (
    CHANNEL_SCALING_MODELS.length === 8 &&
    channels.has("inbound") &&
    channels.has("outbound") &&
    channels.has("partners") &&
    channels.has("tender")
  );
}

export function getChannelsByType(channel: ChannelScalingModel["channel"]) {
  return CHANNEL_SCALING_MODELS.filter((c) => c.channel === channel);
}
