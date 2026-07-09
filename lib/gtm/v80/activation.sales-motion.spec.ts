/**
 * V80 GTM P1 — Initial sales motion (tender / outbound / inbound prioritization)
 * Real-world channel priority — tender-first per POST P3 channel scaling
 */
import type { InitialSalesMotion } from "./activation.types";

export const INITIAL_SALES_MOTION: InitialSalesMotion[] = [
  {
    id: "GTM-MOT-001",
    rank: 1,
    channel: "tender",
    motion: "Active RFP response — intake → autopilot → proposal in 1 day",
    apiRoute: "/api/v80/tender/intake",
    priorityRationale: "Highest intent — buyer already has budget + deadline; closes fastest",
    postRef: "REV-SCL-CHA-007",
    required: true,
  },
  {
    id: "GTM-MOT-002",
    rank: 2,
    channel: "tender",
    motion: "Government gym infrastructure program — budget PDF compliance pack",
    apiRoute: "/api/v80/budget/calculate",
    priorityRationale: "Compliance deliverable unlocks ENTERPRISE pipeline — high ACV",
    postRef: "REV-SCL-CHA-008",
    required: true,
  },
  {
    id: "GTM-MOT-003",
    rank: 3,
    channel: "outbound",
    motion: "ABM top-50 integrators — live tender-pack demo call",
    apiRoute: "/api/v80/autopilot/job/run",
    priorityRationale: "Proven demo asset — 30min close to PRO trial on active bid",
    postRef: "REV-SCL-CHA-003",
    required: true,
  },
  {
    id: "GTM-MOT-004",
    rank: 4,
    channel: "outbound",
    motion: "Enterprise ABM — multi-site chain with integrity deck",
    apiRoute: "/api/v80/production/integrity",
    priorityRationale: "Longer cycle but $8k+ ACV — sales-assist after tender proof",
    postRef: "REV-SCL-CHA-004",
    required: true,
  },
  {
    id: "GTM-MOT-005",
    rank: 5,
    channel: "inbound",
    motion: "PLG — SEO gym RFP template → FitStart $49 trial",
    apiRoute: "/api/v80/tenant/run",
    priorityRationale: "Volume play — lower ACV but feeds autonomous lead loop",
    postRef: "REV-SCL-CHA-001",
    required: true,
  },
  {
    id: "GTM-MOT-006",
    rank: 6,
    channel: "inbound",
    motion: "FEATURE_GATE self-serve — budget calc upsell on trial",
    apiRoute: "/api/v80/budget/calculate",
    priorityRationale: "Converts trial users with zero sales touch — scales post-first-deal",
    postRef: "REV-SCL-CHA-002",
    required: true,
  },
];

export function isInitialSalesMotionComplete(): boolean {
  const channels = new Set(INITIAL_SALES_MOTION.map((m) => m.channel));

  return (
    INITIAL_SALES_MOTION.length === 6 &&
    channels.has("tender") &&
    channels.has("outbound") &&
    channels.has("inbound") &&
    INITIAL_SALES_MOTION.every((m, i) => m.rank === i + 1) &&
    INITIAL_SALES_MOTION[0]!.channel === "tender" &&
    INITIAL_SALES_MOTION.filter((m) => m.channel === "tender").length >= 2 &&
    INITIAL_SALES_MOTION.filter((m) => m.postRef?.startsWith("REV-SCL-CHA")).length >= 6
  );
}
