/**
 * V80 REAL EXEC P2 — First contact script (outreach → opening → hook)
 * Maps GTM P1 tender-first entry + GTM P2 deal flow step 1
 */
import { GTM_ENTRY_POINTS } from "@/lib/gtm/v80/activation.entry-channel.spec";
import type { FirstContactScript } from "./closing.types";

export const FIRST_CONTACT_SCRIPT: FirstContactScript[] = [
  {
    id: "REX-CNT-001",
    order: 1,
    phase: "outreach",
    channel: "email",
    script:
      "Subject: Your [gym name] equipment RFP — response pack in 30 min?\n\nHi [Name], I noticed [org] has an active gym infrastructure RFP due [date]. We help bid managers deliver plan+budget+proposal in one session. Worth 15 minutes?",
    apiHook: "/api/v80/tender/intake",
    gtmRef: "GTM-ENT-001",
    required: true,
  },
  {
    id: "REX-CNT-002",
    order: 2,
    phase: "outreach",
    channel: "linkedin",
    script:
      "Hi [Name] — saw you're managing gym equipment tenders at [org]. We run live RFP responses (budget PDF + full proposal pack) in under 30 min. Open to a quick demo on your current bid?",
    apiHook: "/api/v80/autopilot/job/run",
    gtmRef: "GTM-MOT-003",
    required: true,
  },
  {
    id: "REX-CNT-003",
    order: 3,
    phase: "opening",
    channel: "call",
    script:
      "Thanks for taking the call. Before I show anything — what's your current RFP deadline, and are you building the budget in Excel or another tool?",
    required: true,
  },
  {
    id: "REX-CNT-004",
    order: 4,
    phase: "opening",
    channel: "call",
    script:
      "Got it. I'll provision a workspace for you now and we'll run your actual tender live — you'll have a budget PDF and proposal pack before we hang up.",
    apiHook: "/api/v80/tenant/run",
    gtmRef: "GTM-EXE-001",
    required: true,
  },
  {
    id: "REX-CNT-005",
    order: 5,
    phase: "hook",
    channel: "call",
    script:
      "The hook: every minute you spend formatting spreadsheets is a minute you're not pricing equipment. In 10 minutes I'll show you equipment totals + a procurement-ready budget PDF from your real spec.",
    apiHook: "/api/v80/budget/calculate",
    gtmRef: "GTM-SCR-004",
    required: true,
  },
  {
    id: "REX-CNT-006",
    order: 6,
    phase: "hook",
    channel: "call",
    script:
      "And if procurement needs the full response — plan, budget, and client-ready proposal — we automate that in one workflow. That's what wins shortlists.",
    apiHook: "/api/v80/proposal-pdf/render",
    gtmRef: "GTM-SCR-006",
    required: true,
  },
];

export function isFirstContactScriptComplete(): boolean {
  const entryRoute = GTM_ENTRY_POINTS[0]?.apiRoute;
  const phases = new Set(FIRST_CONTACT_SCRIPT.map((s) => s.phase));

  return (
    FIRST_CONTACT_SCRIPT.length === 6 &&
    phases.has("outreach") &&
    phases.has("opening") &&
    phases.has("hook") &&
    FIRST_CONTACT_SCRIPT.every((s, i) => s.order === i + 1) &&
    FIRST_CONTACT_SCRIPT.filter((s) => s.phase === "outreach").length >= 2 &&
    FIRST_CONTACT_SCRIPT.some((s) => s.apiHook === entryRoute)
  );
}
