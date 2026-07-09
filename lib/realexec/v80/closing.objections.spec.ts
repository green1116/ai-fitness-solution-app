/**
 * V80 REAL EXEC P2 — Objection handling (price / trust / timing / competition)
 * Responses map to V80 API proof points + GTM P2 offer pack
 */
import { FIRST_DEAL_OFFER_PACK } from "@/lib/gtm/v80/execution.offer-pack.spec";
import type { ObjectionResponse } from "./closing.types";

export const OBJECTION_HANDLING: ObjectionResponse[] = [
  {
    id: "REX-OBJ-001",
    category: "price",
    objection: "$299/mo is too expensive for one bid.",
    response:
      "One autopilot tender-pack saves 2 days of bid-team time — that's $2k+ in labor. Annual prepay is $3,588/yr (2 months free). You already have a submission-ready proposal from today's demo.",
    proofApi: "/api/v80/autopilot/job/run",
    required: true,
  },
  {
    id: "REX-OBJ-002",
    category: "price",
    objection: "We only need this for one RFP — not a subscription.",
    response:
      "FitStart is $49/mo for single projects. But you have [X] bids this quarter — PRO at $299 covers 50 tenders/mo. Metered usage is only ¢50 budget + ¢200 per pack on top.",
    proofApi: "/api/v80/budget/calculate",
    required: true,
  },
  {
    id: "REX-OBJ-003",
    category: "trust",
    objection: "How do we know the budget numbers are defensible for procurement?",
    response:
      "Every calculation is logged in the governance audit trail — entitlement + usage records procurement can review. I'll export the audit log with your proposal pack now.",
    proofApi: "/api/v80/ops/governance/audit",
    required: true,
  },
  {
    id: "REX-OBJ-004",
    category: "trust",
    objection: "We've never used AI for tender responses — compliance risk.",
    response:
      "You control every input. The system structures your spec into budget line items — no black-box pricing. Production integrity score shows release readiness for enterprise DD.",
    proofApi: "/api/v80/production/integrity",
    required: true,
  },
  {
    id: "REX-OBJ-005",
    category: "timing",
    objection: "RFP is due in 48 hours — no time to onboard a new tool.",
    response:
      "We just ran your full response in 30 minutes on this call. Sign annual PRO now and your workspace stays live — upload the next tender tonight.",
    proofApi: "/api/v80/tender/intake",
    required: true,
  },
  {
    id: "REX-OBJ-006",
    category: "timing",
    objection: "Need to check with procurement / CFO before buying.",
    response:
      "Send them the budget PDF and proposal we just generated — that's your internal business case. Governance audit export answers vendor DD questions proactively.",
    proofApi: "/api/v80/pdf?type=budget",
    required: true,
  },
  {
    id: "REX-OBJ-007",
    category: "competition",
    objection: "We already use Excel + Word templates.",
    response:
      "Templates break when specs change. You saw autopilot assemble plan+budget+proposal in 8 steps — no copy-paste. Switching cost drops after your second tender.",
    proofApi: "/api/v80/autopilot/job/run",
    required: true,
  },
  {
    id: "REX-OBJ-008",
    category: "competition",
    objection: "Competitor quoted us a custom build for less.",
    response:
      "Custom builds take 6+ weeks and no audit trail. You have a live proposal PDF right now. For multi-site rollouts, FitEnterprise adds unlimited workspaces + governance SLA.",
    proofApi: "/api/v80/pdf?artifactId",
    required: true,
  },
];

export function isObjectionHandlingComplete(): boolean {
  const categories = new Set(OBJECTION_HANDLING.map((o) => o.category));

  return (
    OBJECTION_HANDLING.length === 8 &&
    categories.has("price") &&
    categories.has("trust") &&
    categories.has("timing") &&
    categories.has("competition") &&
    OBJECTION_HANDLING.filter((o) => o.category === "price").length >= 2 &&
    OBJECTION_HANDLING.every((o) => o.proofApi.startsWith("/api/v80")) &&
    FIRST_DEAL_OFFER_PACK.length >= 6
  );
}
