/**
 * F5 guided Quote workflow — pure helpers (no React, no storage, no network).
 *
 * The workflow stage is a DISPLAY state derived from canonical facts:
 * the current quoteId and the Product Intelligence read for exactly that quoteId.
 * The only persisted confirmation fact is "the current Quote has saved productSelections".
 * Requirement / strategy acknowledgements are client navigation only and are keyed by quoteId.
 */

export type QuoteWorkflowStage =
  | "requirements"
  | "confirmation"
  | "strategy"
  | "products"
  | "ready_for_budget";

export type QuoteWorkflowPanel = Exclude<QuoteWorkflowStage, "ready_for_budget">;

export type PiLoadStatus = "idle" | "loading" | "success" | "error";

export type WorkflowPiFacts = {
  quoteId: string;
  selections: readonly unknown[];
} | null;

export type WorkflowFactsInput = {
  quoteId: string;
  piStatus: PiLoadStatus;
  piView: WorkflowPiFacts;
};

export type DeriveQuoteWorkflowStageInput = WorkflowFactsInput & {
  projectId: string;
  requirementsAckQuoteId: string;
  strategyAckQuoteId: string;
};

export const QUOTE_WORKFLOW_STEPS: ReadonlyArray<{
  key: QuoteWorkflowPanel | "budget" | "delivery";
  label: string;
}> = [
  { key: "requirements", label: "项目需求" },
  { key: "confirmation", label: "AI 需求确认" },
  { key: "strategy", label: "方案策略" },
  { key: "products", label: "产品配置" },
  { key: "budget", label: "预算" },
  { key: "delivery", label: "投标与交付" },
];

/** Existing requirement statuses that the user must explicitly acknowledge (never auto-resolved). */
export const ACK_REQUIRED_REQUIREMENT_STATUSES: readonly string[] = [
  "NEEDS_CLARIFICATION",
  "CONFLICT",
  "NEW_SCOPE",
  "CONDITIONAL",
];

const STAGE_ORDER: Record<QuoteWorkflowStage, number> = {
  requirements: 0,
  confirmation: 1,
  strategy: 2,
  products: 3,
  ready_for_budget: 4,
};

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function requirementsNeedingAck<T extends { status: string }>(items: readonly T[]): T[] {
  return items.filter((item) => ACK_REQUIRED_REQUIREMENT_STATUSES.includes(item.status));
}

/** PI loaded successfully for exactly the current quoteId (a stale view never counts). */
export function isQuoteReady(input: WorkflowFactsInput): boolean {
  const qid = trimId(input.quoteId);
  return Boolean(qid) && input.piStatus === "success" && trimId(input.piView?.quoteId) === qid;
}

/** Persisted confirmation: the current Quote has saved productSelections. Candidates alone never count. */
export function isProductConfigConfirmed(input: WorkflowFactsInput): boolean {
  return isQuoteReady(input) && (input.piView?.selections.length ?? 0) > 0;
}

export function deriveQuoteWorkflowStage(input: DeriveQuoteWorkflowStageInput): QuoteWorkflowStage {
  const qid = trimId(input.quoteId);
  if (!trimId(input.projectId) || !qid) return "requirements";
  if (isProductConfigConfirmed(input)) return "ready_for_budget";
  if (!isQuoteReady(input)) return "confirmation";
  if (trimId(input.requirementsAckQuoteId) !== qid) return "confirmation";
  if (trimId(input.strategyAckQuoteId) !== qid) return "strategy";
  return "products";
}

export function isPanelReachable(panel: QuoteWorkflowPanel, stage: QuoteWorkflowStage): boolean {
  return STAGE_ORDER[panel] <= Math.min(STAGE_ORDER[stage], STAGE_ORDER.products);
}

/** The panel to render: a user-selected reachable panel for this quote, else the stage itself. */
export function resolveActivePanel(
  stage: QuoteWorkflowStage,
  quoteId: string,
  viewPanel: { quoteId: string; panel: QuoteWorkflowPanel } | null,
): QuoteWorkflowPanel {
  const fallback: QuoteWorkflowPanel = stage === "ready_for_budget" ? "products" : stage;
  if (
    viewPanel &&
    trimId(viewPanel.quoteId) === trimId(quoteId) &&
    isPanelReachable(viewPanel.panel, stage)
  ) {
    return viewPanel.panel;
  }
  return fallback;
}

export type ExplicitTemplateConfirmation = {
  slotKey: string;
  action: "confirm";
  candidateId: null;
};

/**
 * Turns the diff payload (only changed slots) into an explicit confirmation of EVERY slot:
 * untouched slots become `{ action: "confirm", candidateId: null }` (keep template),
 * so an all-template configuration still persists as productSelections.
 */
export function withExplicitTemplateConfirmations<T extends { slotKey: string }>(
  slots: readonly { slotKey: string }[],
  diff: readonly T[],
): Array<T | ExplicitTemplateConfirmation> {
  const bySlot = new Map(diff.map((item) => [item.slotKey, item]));
  return slots.map(
    (slot) =>
      bySlot.get(slot.slotKey) ?? {
        slotKey: slot.slotKey,
        action: "confirm" as const,
        candidateId: null,
      },
  );
}
