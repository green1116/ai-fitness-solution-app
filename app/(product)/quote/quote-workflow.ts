/**
 * F5 guided Quote workflow — pure helpers (no React, no network; storage is injected).
 *
 * The workflow stage is a DISPLAY state derived from canonical facts:
 * the current quoteId and the Product Intelligence read for exactly that quoteId.
 * The only persisted business fact is "the current Quote has saved productSelections".
 * Requirement / strategy acknowledgements are navigation state, not business facts: they may be
 * restored within the browser session for the exact userId + projectId + quoteId, never inherited.
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

/** Dedicated sessionStorage key; deliberately separate from product-commercial-context. */
export const QUOTE_WORKFLOW_ACK_STORAGE_KEY = "product-quote-workflow-ack";
export const QUOTE_WORKFLOW_ACK_MAX_RECORDS = 50;

export type WorkflowAckScope = { userId: string; projectId: string; quoteId: string };

export type WorkflowAckRecord = {
  requirementsAck: boolean;
  strategyAck: boolean;
  at: number;
};

export type WorkflowAckStorage = Pick<Storage, "getItem" | "setItem">;

const EMPTY_ACK = { requirementsAck: false, strategyAck: false } as const;

function workflowAckRecordKey(scope: WorkflowAckScope): string | null {
  const userId = trimId(scope.userId);
  const projectId = trimId(scope.projectId);
  const quoteId = trimId(scope.quoteId);
  if (!userId || !projectId || !quoteId) return null;
  return JSON.stringify([userId, projectId, quoteId]);
}

function readWorkflowAckMap(storage: WorkflowAckStorage): Record<string, WorkflowAckRecord> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(QUOTE_WORKFLOW_ACK_STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, WorkflowAckRecord> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const row = value as Partial<WorkflowAckRecord>;
      out[key] = {
        requirementsAck: row.requirementsAck === true,
        strategyAck: row.strategyAck === true,
        at: typeof row.at === "number" && Number.isFinite(row.at) ? row.at : 0,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function readWorkflowAck(
  storage: WorkflowAckStorage,
  scope: WorkflowAckScope,
): { requirementsAck: boolean; strategyAck: boolean } {
  const key = workflowAckRecordKey(scope);
  if (!key) return { ...EMPTY_ACK };
  const row = readWorkflowAckMap(storage)[key];
  return row
    ? { requirementsAck: row.requirementsAck, strategyAck: row.strategyAck }
    : { ...EMPTY_ACK };
}

/** Merges an acknowledgement for exactly this scope; keeps only the most recent records. */
export function writeWorkflowAck(
  storage: WorkflowAckStorage,
  scope: WorkflowAckScope,
  patch: { requirementsAck?: true; strategyAck?: true },
  now: number = Date.now(),
): void {
  const key = workflowAckRecordKey(scope);
  if (!key) return;
  const map = readWorkflowAckMap(storage);
  const prev = map[key];
  map[key] = {
    requirementsAck: prev?.requirementsAck === true || patch.requirementsAck === true,
    strategyAck: prev?.strategyAck === true || patch.strategyAck === true,
    at: now,
  };
  const kept = Object.entries(map)
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, QUOTE_WORKFLOW_ACK_MAX_RECORDS);
  try {
    storage.setItem(QUOTE_WORKFLOW_ACK_STORAGE_KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch {
    // Storage full / unavailable: acknowledgement simply stays in memory for this page.
  }
}

/**
 * Acknowledgement quoteIds to restore. Only once PI has loaded for exactly the scoped quoteId
 * (which also proves server-side tenant/project ownership); strategy requires requirements.
 */
export function restoredWorkflowAckQuoteIds(input: {
  scope: WorkflowAckScope;
  facts: WorkflowFactsInput;
  record: { requirementsAck: boolean; strategyAck: boolean };
}): { requirementsAckQuoteId: string; strategyAckQuoteId: string } {
  const qid = trimId(input.scope.quoteId);
  if (!workflowAckRecordKey(input.scope) || trimId(input.facts.quoteId) !== qid || !isQuoteReady(input.facts)) {
    return { requirementsAckQuoteId: "", strategyAckQuoteId: "" };
  }
  const requirements = input.record.requirementsAck;
  return {
    requirementsAckQuoteId: requirements ? qid : "",
    strategyAckQuoteId: requirements && input.record.strategyAck ? qid : "",
  };
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
