import { CANONICAL_EQUIVALENT_TENDER_ID } from "@/lib/equivalent-product-intelligence";
import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import type { ProcurementDecisionLevel } from "@/lib/procurement-intelligence";
import { WLI_CANONICAL_ID } from "../shared/constants";
import type { TenderOutcome, TenderOutcomeStatus } from "../shared/types";
import type { OutcomeRegistry } from "./outcome-types";

const STUB_OUTCOMES: TenderOutcome[] = [
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-win-001",
    outcome: "win",
    reasonCodes: ["brand-trust", "price-fit", "delivery-fit"],
    confidence: 88,
  },
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-win-002",
    outcome: "win",
    reasonCodes: ["evidence-coverage", "spec-compliance"],
    confidence: 82,
  },
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-loss-001",
    outcome: "loss",
    reasonCodes: ["price-too-high", "lead-time-risk"],
    confidence: 76,
  },
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-loss-002",
    outcome: "loss",
    reasonCodes: ["brand-mismatch", "availability-gap"],
    confidence: 71,
  },
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-loss-003",
    outcome: "loss",
    reasonCodes: ["supplier-coverage-gap", "procurement-score-low"],
    confidence: 68,
  },
  {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: "wli-outcome-stub-pending-001",
    outcome: "pending",
    reasonCodes: ["evaluation-in-progress"],
    confidence: 55,
  },
];

function mapProcurementLevelToOutcome(level: ProcurementDecisionLevel): TenderOutcomeStatus {
  if (level === "preferred") return "win";
  if (level === "acceptable") return "win";
  if (level === "fallback") return "loss";
  return "pending";
}

function buildReasonCodes(level: ProcurementDecisionLevel, totalScore: number): string[] {
  if (level === "preferred") {
    return ["procurement-preferred", "decision-fit-high", `score=${totalScore}`];
  }
  if (level === "acceptable") {
    return ["procurement-acceptable", "decision-fit-medium", `score=${totalScore}`];
  }
  if (level === "fallback") {
    return ["procurement-fallback", "decision-fit-low", `score=${totalScore}`];
  }
  return ["procurement-defer", "outcome-pending", `score=${totalScore}`];
}

function buildOutcomeFromProcurementDecision(
  decision: ReturnType<typeof runProcurementDecisionEngine>[number],
): TenderOutcome {
  const outcome = mapProcurementLevelToOutcome(decision.procurementLevel);

  return {
    tenderId: CANONICAL_EQUIVALENT_TENDER_ID,
    decisionId: decision.decisionId,
    outcome,
    reasonCodes: buildReasonCodes(decision.procurementLevel, decision.totalScore),
    confidence: Math.min(95, Math.max(40, decision.totalScore)),
  };
}

let cachedRegistry: OutcomeRegistry | undefined;

export function buildOutcomeRegistry(): OutcomeRegistry {
  if (cachedRegistry) return cachedRegistry;

  const procurementDecisions = runProcurementDecisionEngine();
  const derivedOutcomes = procurementDecisions.map(buildOutcomeFromProcurementDecision);
  const seen = new Set(derivedOutcomes.map((outcome) => outcome.decisionId));
  const records = [
    ...derivedOutcomes,
    ...STUB_OUTCOMES.filter((stub) => !seen.has(stub.decisionId)),
  ];

  cachedRegistry = {
    registryId: "wli-outcome-registry-v44-p1",
    records,
    count: records.length,
    mode: WLI_CANONICAL_ID,
  };

  return cachedRegistry;
}
