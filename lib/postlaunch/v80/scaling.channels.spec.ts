/**
 * V80 POST-LAUNCH P3 — Channel scaling system (inbound / outbound / tender / partner)
 * Scales PRODUCT P3 CHANNEL_SCALING_MODELS via P1/P2 revenue surfaces
 */
import { CHANNEL_SCALING_MODELS } from "@/lib/product/v80/scale.channel.spec";
import type { ChannelScalingSystem } from "./scaling.types";

export const CHANNEL_SCALING_SYSTEM: ChannelScalingSystem[] = [
  {
    id: "REV-SCL-CHA-001",
    channel: "inbound",
    motion: "PLG — SEO templates → plan PDF trial",
    apiEntry: "/api/v80/tenant/run",
    productChannelRef: "PRD-CHA-001",
    scaleLever: "Self-serve FitStart $49/mo — zero sales touch",
    automationLevel: "self-serve",
    required: true,
  },
  {
    id: "REV-SCL-CHA-002",
    channel: "inbound",
    motion: "FEATURE_GATE CTAs — automated BASIC→PRO",
    apiEntry: "/api/v80/budget/calculate",
    productChannelRef: "PRD-CHA-002",
    scaleLever: "REV-OPT-CNV-001 partial-totals gate conversion",
    automationLevel: "self-serve",
    required: true,
  },
  {
    id: "REV-SCL-CHA-003",
    channel: "outbound",
    motion: "ABM integrators — tender-pack demo in 30min",
    apiEntry: "/api/v80/autopilot/job/run",
    productChannelRef: "PRD-CHA-003",
    scaleLever: "SDR→AE playbook on pre-packaged workflow",
    automationLevel: "semi-auto",
    required: true,
  },
  {
    id: "REV-SCL-CHA-004",
    channel: "outbound",
    motion: "Enterprise ABM — multi-site gym chains",
    apiEntry: "/api/v80/production/integrity",
    productChannelRef: "PRD-CHA-004",
    scaleLever: "REV-OPT-ENT-006 integrity deck closes ACV",
    automationLevel: "sales-assist",
    required: true,
  },
  {
    id: "REV-SCL-CHA-005",
    channel: "partner",
    motion: "OEM co-sell — white-label plan+budget PDF",
    apiEntry: "/api/v80/proposal-pdf/render",
    productChannelRef: "PRD-CHA-005",
    scaleLever: "Rev-share PRO seats + per-tender usage",
    automationLevel: "semi-auto",
    required: true,
  },
  {
    id: "REV-SCL-CHA-006",
    channel: "partner",
    motion: "Consulting referral — partner workspace provision",
    apiEntry: "/api/v80/tenant/run",
    productChannelRef: "PRD-CHA-006",
    scaleLever: "20% first-year ARR referral automation",
    automationLevel: "semi-auto",
    required: true,
  },
  {
    id: "REV-SCL-CHA-007",
    channel: "tender",
    motion: "Procurement portal — intake as marketplace entry",
    apiEntry: "/api/v80/tender/intake",
    productChannelRef: "PRD-CHA-007",
    scaleLever: "Tender marketplace → autopilot upsell loop",
    automationLevel: "self-serve",
    required: true,
  },
  {
    id: "REV-SCL-CHA-008",
    channel: "tender",
    motion: "Government RFP — budget PDF compliance deliverable",
    apiEntry: "/api/v80/budget/calculate",
    productChannelRef: "PRD-CHA-008",
    scaleLever: "Compliance GTM → ENTERPRISE contract pipeline",
    automationLevel: "sales-assist",
    required: true,
  },
];

export function isChannelScalingSystemComplete(): boolean {
  const channelIds = new Set(CHANNEL_SCALING_MODELS.map((c) => c.id));
  const channels = new Set(CHANNEL_SCALING_SYSTEM.map((c) => c.channel));

  return (
    CHANNEL_SCALING_SYSTEM.length === 8 &&
    channels.has("inbound") &&
    channels.has("outbound") &&
    channels.has("tender") &&
    channels.has("partner") &&
    CHANNEL_SCALING_SYSTEM.every((c) => channelIds.has(c.productChannelRef)) &&
    CHANNEL_SCALING_SYSTEM.filter((c) => c.automationLevel === "self-serve").length >= 3
  );
}
