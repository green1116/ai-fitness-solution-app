/**
 * V80 GTM P2 — Sales execution script (how deal is actually closed)
 * Real-world AE dialogue mapped to API triggers — GTM P1 tender-first motion
 */
import { GTM_ENTRY_POINTS } from "./activation.entry-channel.spec";
import type { SalesScriptBeat } from "./execution.types";

export const SALES_EXECUTION_SCRIPT: SalesScriptBeat[] = [
  {
    id: "GTM-SCR-001",
    order: 1,
    stage: "open",
    speaker: "ae",
    script: "I see you have an active gym equipment RFP due in [X] days — can we run your response live in 30 minutes?",
    apiTrigger: "/api/v80/tender/intake",
    required: true,
  },
  {
    id: "GTM-SCR-002",
    order: 2,
    stage: "demo",
    speaker: "system",
    script: "[SYSTEM] Provision PRO workspace → entitlements confirm budget+tender+PDF unlocked",
    apiTrigger: "/api/v80/tenant/run",
    required: true,
  },
  {
    id: "GTM-SCR-003",
    order: 3,
    stage: "demo",
    speaker: "ae",
    script: "Upload your tender spec now — I'll generate your equipment budget in real time.",
    apiTrigger: "/api/v80/tender/intake",
    required: true,
  },
  {
    id: "GTM-SCR-004",
    order: 4,
    stage: "value",
    speaker: "system",
    script: "[SYSTEM] Budget calculated — equipment totals displayed; plan PDF auto-rendered",
    apiTrigger: "/api/v80/budget/calculate",
    required: true,
  },
  {
    id: "GTM-SCR-005",
    order: 5,
    stage: "value",
    speaker: "buyer",
    script: "This budget PDF is exactly what procurement needs — can you deliver the full response pack?",
    apiTrigger: "/api/v80/autopilot/job/run",
    required: true,
  },
  {
    id: "GTM-SCR-006",
    order: 6,
    stage: "value",
    speaker: "system",
    script: "[SYSTEM] Autopilot complete — proposal PDF rendered; downloadUrl delivered",
    apiTrigger: "/api/v80/proposal-pdf/render",
    required: true,
  },
  {
    id: "GTM-SCR-007",
    order: 7,
    stage: "close",
    speaker: "ae",
    script: "FitScale PRO is $299/mo — annual prepay saves 2 months ($3,588/yr). You keep this workspace for all upcoming bids.",
    apiTrigger: "/api/v80/budget/calculate",
    required: true,
  },
  {
    id: "GTM-SCR-008",
    order: 8,
    stage: "handoff",
    speaker: "system",
    script: "[SYSTEM] Subscription active; governance audit logged — entitlement trail for procurement DD",
    apiTrigger: "/api/v80/ops/governance/audit",
    required: true,
  },
];

export function isSalesExecutionScriptComplete(): boolean {
  const entryRoute = GTM_ENTRY_POINTS[0]?.apiRoute;
  const stages = new Set(SALES_EXECUTION_SCRIPT.map((s) => s.stage));

  return (
    SALES_EXECUTION_SCRIPT.length === 8 &&
    stages.has("open") &&
    stages.has("demo") &&
    stages.has("value") &&
    stages.has("close") &&
    stages.has("handoff") &&
    SALES_EXECUTION_SCRIPT.every((s, i) => s.order === i + 1) &&
    SALES_EXECUTION_SCRIPT[0]!.apiTrigger === entryRoute &&
    SALES_EXECUTION_SCRIPT.filter((s) => s.apiTrigger).length >= 8
  );
}
