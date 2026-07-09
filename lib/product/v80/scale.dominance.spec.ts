/**
 * V80 PRODUCT P3 — Market dominance (positioning + wedge + differentiation)
 */
import { PRODUCT_PACKAGING_TIERS } from "./product.packaging.spec";
import type { MarketDominancePillar } from "./scale.types";

export const MARKET_DOMINANCE_PILLARS: MarketDominancePillar[] = [
  {
    id: "PRD-DOM-001",
    pillar: "positioning",
    headline: "The only tender-to-PDF platform built for enterprise gym procurement",
    targetSegment: "Equipment integrators + gym operators in RFP-driven markets",
    proofPoint: "8-step tender-pack-complete workflow — single autopilot run",
    p2Ref: "PRD-GTM-002",
    required: true,
  },
  {
    id: "PRD-DOM-002",
    pillar: "wedge",
    headline: "Free floor plan PDF from any gym RFP — land in 15 minutes",
    targetSegment: "Solo consultants (FitStart BASIC)",
    proofPoint: "PRD-FUN-004 activation — plan-pdf without sales call",
    p2Ref: "PRD-FUN-004",
    required: true,
  },
  {
    id: "PRD-DOM-003",
    pillar: "wedge",
    headline: "One-click tender response pack beats manual bid teams",
    targetSegment: "Regional integrators (FitScale PRO)",
    proofPoint: "Autopilot DAG: intake → budget → proposal → bundle",
    p2Ref: "PRD-CNV-002",
    required: true,
  },
  {
    id: "PRD-DOM-004",
    pillar: "differentiation",
    headline: "Governed SaaS with audit trail — not generic document AI",
    targetSegment: "Enterprise procurement (FitEnterprise)",
    proofPoint: "Entitlement enforcement trail + integrity dashboard",
    p2Ref: "PRD-GTM-003",
    required: true,
  },
  {
    id: "PRD-DOM-005",
    pillar: "differentiation",
    headline: "Usage-metered billing aligned to tender outcomes, not seats",
    targetSegment: "CFO / procurement finance",
    proofPoint: "BUDGET/TENDER/PDF charge mapping — pay per deliverable",
    p2Ref: "PRD-PRC-002",
    required: true,
  },
  {
    id: "PRD-DOM-006",
    pillar: "positioning",
    headline: "Category leader: Gym Tender Ops Platform (GTOP)",
    targetSegment: "Global fitness infrastructure market",
    proofPoint: `3-tier packaging — ${PRODUCT_PACKAGING_TIERS.map((p) => p.marketName).join(" / ")}`,
    required: true,
  },
];

export function isMarketDominanceComplete(): boolean {
  const pillars = new Set(MARKET_DOMINANCE_PILLARS.map((p) => p.pillar));
  return (
    MARKET_DOMINANCE_PILLARS.length === 6 &&
    pillars.has("positioning") &&
    pillars.has("wedge") &&
    pillars.has("differentiation")
  );
}
