/**
 * V80 POST-LAUNCH P4 — Autonomous lead generation (signal → intake → tenant creation)
 * Zero human initiation — reuses P3 channel + P1 tenant/intake surfaces
 */
import { CHANNEL_SCALING_SYSTEM } from "./scaling.channels.spec";
import type { AutonomousLeadSignal } from "./autonomy.types";

export const AUTONOMOUS_LEAD_GENERATION: AutonomousLeadSignal[] = [
  {
    id: "REV-AUT-LDG-001",
    order: 1,
    signal: "PDF share link opened by external viewer",
    apiRoute: "/api/v80/pdf?type=plan",
    p3Ref: "REV-SCL-CMP-003",
    autonomousAction: "Auto-create inbound lead record → trigger tenant/run with FitStart tier",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-002",
    order: 2,
    signal: "Partner referral webhook — OEM co-sell signal",
    apiRoute: "/api/v80/tenant/run",
    p3Ref: "REV-SCL-CHA-005",
    autonomousAction: "Provision partner-branded workspace — no SDR handoff",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-003",
    order: 3,
    signal: "Tender marketplace listing matched — procurement RFP detected",
    apiRoute: "/api/v80/tender/intake",
    p3Ref: "REV-SCL-CHA-007",
    autonomousAction: "Auto-submit intake from marketplace signal → quoteId issued",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-004",
    order: 4,
    signal: "Entitlements usage spike — sibling org detected",
    apiRoute: "/api/v80/entitlements",
    p3Ref: "REV-SCL-CMP-006",
    autonomousAction: "Expansion signal → auto-provision subsidiary tenant under parent org",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-005",
    order: 5,
    signal: "Governance audit — new domain in access log",
    apiRoute: "/api/v80/ops/governance/audit",
    p3Ref: "REV-SCL-AUT-008",
    autonomousAction: "Unknown domain → inbound nurture + tenant/run invite link",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-006",
    order: 6,
    signal: "Budget PDF watermark preview completed on BASIC",
    apiRoute: "/api/v80/pdf?type=budget",
    p3Ref: "REV-SCL-AUT-006",
    autonomousAction: "Preview completion → auto-intake with saved quote context",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-007",
    order: 7,
    signal: "Inbound SEO template download — gym RFP calculator",
    apiRoute: "/api/v80/tenant/run",
    p3Ref: "REV-SCL-CHA-001",
    autonomousAction: "Template download → self-serve tenant provision + sample tender intake",
    humanRequired: false,
    required: true,
  },
  {
    id: "REV-AUT-LDG-008",
    order: 8,
    signal: "Closed-loop reinvest — compounding cycle 4 CAC surplus",
    apiRoute: "/api/v80/tenant/run",
    p3Ref: "REV-SCL-CMP-008",
    autonomousAction: "Surplus ARR → auto-fund PLG tenant slots for inbound conversion",
    humanRequired: false,
    required: true,
  },
];

export function isAutonomousLeadGenerationComplete(): boolean {
  const channelIds = new Set(CHANNEL_SCALING_SYSTEM.map((c) => c.id));

  return (
    channelIds.size >= 8 &&
    AUTONOMOUS_LEAD_GENERATION.length === 8 &&
    AUTONOMOUS_LEAD_GENERATION.every((s, i) => s.order === i + 1) &&
    AUTONOMOUS_LEAD_GENERATION.every((s) => s.humanRequired === false) &&
    AUTONOMOUS_LEAD_GENERATION.filter((s) => s.p3Ref).every((s) => s.p3Ref!.startsWith("REV-SCL")) &&
    AUTONOMOUS_LEAD_GENERATION.some((s) => s.apiRoute.includes("tender/intake")) &&
    AUTONOMOUS_LEAD_GENERATION.some((s) => s.apiRoute.includes("tenant/run"))
  );
}
