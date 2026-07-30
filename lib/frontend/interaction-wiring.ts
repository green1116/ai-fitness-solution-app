/**
 * PD-3.5 / PD-4.5 interaction wiring.
 * INT-* emit presentation intents only — Screens own ACT-*; no Adapter/API here.
 */

export const INTERACTION_KINDS = [
  "Navigate",
  "Access",
  "Intake",
  "Input",
  "Observe",
  "Work",
  "Artifact",
  "Select",
] as const;

export type InteractionKind = (typeof INTERACTION_KINDS)[number];

/**
 * PD-4.5 pipeline branch after Screen Action (presentation classification).
 * NAV/PREF never invent HTTP; others remain command-ready for later Adapter.
 */
export const DATA_FLOW_KINDS = [
  "NAV",
  "PREF",
  "OBSERVE",
  "INPUT",
  "WORK",
  "ARTIFACT",
  "SELECT",
] as const;

export type DataFlowKind = (typeof DATA_FLOW_KINDS)[number];

export const INTERACTION_IDS = [
  "INT-NAV-SHELL",
  "INT-ACCESS-SIGNIN",
  "INT-ACCESS-LANGUAGE",
  "INT-ENTRY-GOAL",
  "INT-ENTRY-CONTINUITY",
  "INT-INTAKE-START",
  "INT-INTAKE-INPUT",
  "INT-INTAKE-UPLOAD",
  "INT-INTAKE-STATUS",
  "INT-FORWARD-PRIMARY",
  "INT-WS-CONVERSE",
  "INT-WS-TASK",
  "INT-WS-CONTEXT",
  "INT-WS-OUTCOME",
  "INT-RESULT-REVIEW",
  "INT-ARTIFACT-PREVIEW",
  "INT-ARTIFACT-DOWNLOAD",
  "INT-ARTIFACT-SHARE",
  "INT-FORWARD-GROUP",
  "INT-LIST-BROWSE",
  "INT-LIST-CONTINUE",
  "INT-LIST-DOCS",
  "INT-LIB-CATEGORY",
  "INT-LIB-SELECT",
  "INT-OPS-VIEW",
] as const;

export type InteractionId = (typeof INTERACTION_IDS)[number];

export type InteractionBinding = Readonly<{
  id: InteractionId;
  kind: InteractionKind;
  flowKind: DataFlowKind;
  componentIds: readonly string[];
  screenIds: readonly string[];
  actionIds: readonly string[];
  nextTypical: readonly InteractionId[];
}>;

/**
 * Frozen PD-3.5 catalogue (25) with PD-4.5 flow classification.
 */
export const INTERACTION_BINDINGS = [
  {
    id: "INT-NAV-SHELL",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-SHELL-HEADER"],
    screenIds: [
      "SCR-01",
      "SCR-02",
      "SCR-03",
      "SCR-04",
      "SCR-05",
      "SCR-06",
      "SCR-07",
      "SCR-08",
      "SCR-09",
    ],
    actionIds: [],
    nextTypical: [],
  },
  {
    id: "INT-ACCESS-SIGNIN",
    kind: "Access",
    flowKind: "NAV",
    componentIds: ["CMP-ACCESS-SIGNIN"],
    screenIds: ["SCR-01"],
    actionIds: ["ACT-01-01"],
    nextTypical: ["INT-ENTRY-GOAL", "INT-ENTRY-CONTINUITY"],
  },
  {
    id: "INT-ACCESS-LANGUAGE",
    kind: "Access",
    flowKind: "PREF",
    componentIds: ["CMP-ACCESS-LANGUAGE"],
    screenIds: ["SCR-01"],
    actionIds: ["ACT-01-02"],
    nextTypical: [],
  },
  {
    id: "INT-ENTRY-GOAL",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-GOAL-CARD"],
    screenIds: ["SCR-01"],
    actionIds: ["ACT-01-03", "ACT-01-04", "ACT-01-05"],
    nextTypical: ["INT-INTAKE-START", "INT-WS-TASK"],
  },
  {
    id: "INT-ENTRY-CONTINUITY",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-NAV-CONTINUITY"],
    screenIds: ["SCR-01"],
    actionIds: ["ACT-01-06"],
    nextTypical: ["INT-LIST-BROWSE"],
  },
  {
    id: "INT-INTAKE-START",
    kind: "Intake",
    flowKind: "OBSERVE",
    componentIds: ["CMP-GUIDE-PANEL"],
    screenIds: ["SCR-02"],
    actionIds: ["ACT-02-01"],
    nextTypical: ["INT-INTAKE-INPUT"],
  },
  {
    id: "INT-INTAKE-INPUT",
    kind: "Input",
    flowKind: "INPUT",
    componentIds: ["CMP-INPUT-PLANNING"],
    screenIds: ["SCR-02"],
    actionIds: ["ACT-02-02"],
    nextTypical: ["INT-FORWARD-PRIMARY"],
  },
  {
    id: "INT-INTAKE-UPLOAD",
    kind: "Input",
    flowKind: "INPUT",
    componentIds: ["CMP-UPLOAD-TENDER"],
    screenIds: ["SCR-03"],
    actionIds: ["ACT-03-01"],
    nextTypical: ["INT-INTAKE-STATUS"],
  },
  {
    id: "INT-INTAKE-STATUS",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: ["CMP-STATUS-PROCESS"],
    screenIds: ["SCR-03"],
    actionIds: ["ACT-03-02"],
    nextTypical: ["INT-FORWARD-PRIMARY"],
  },
  {
    id: "INT-FORWARD-PRIMARY",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-FORWARD-PRIMARY"],
    screenIds: ["SCR-02", "SCR-03", "SCR-05", "SCR-06"],
    actionIds: ["ACT-02-03", "ACT-03-03", "ACT-05-05", "ACT-06-03"],
    nextTypical: [],
  },
  {
    id: "INT-WS-CONVERSE",
    kind: "Work",
    flowKind: "WORK",
    componentIds: ["CMP-CONV-PANEL"],
    screenIds: ["SCR-04"],
    actionIds: ["ACT-04-01"],
    nextTypical: ["INT-WS-CONTEXT", "INT-WS-TASK"],
  },
  {
    id: "INT-WS-TASK",
    kind: "Work",
    flowKind: "WORK",
    componentIds: ["CMP-TASK-PANEL"],
    screenIds: ["SCR-04"],
    actionIds: ["ACT-04-03", "ACT-04-04", "ACT-04-05", "ACT-04-01"],
    nextTypical: ["INT-WS-OUTCOME"],
  },
  {
    id: "INT-WS-CONTEXT",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: ["CMP-CONTEXT-PANEL"],
    screenIds: ["SCR-04"],
    actionIds: ["ACT-04-02", "ACT-04-08"],
    nextTypical: ["INT-WS-CONVERSE", "INT-WS-OUTCOME", "INT-LIB-CATEGORY"],
  },
  {
    id: "INT-WS-OUTCOME",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-OUTCOME-LINKS"],
    screenIds: ["SCR-04"],
    actionIds: ["ACT-04-06", "ACT-04-07"],
    nextTypical: ["INT-RESULT-REVIEW"],
  },
  {
    id: "INT-RESULT-REVIEW",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: [
      "CMP-RESULT-SUMMARY",
      "CMP-RESULT-BLOCKS",
      "CMP-BUDGET-OVERVIEW",
    ],
    screenIds: ["SCR-05", "SCR-06"],
    actionIds: ["ACT-05-01", "ACT-05-02", "ACT-06-01"],
    nextTypical: [
      "INT-ARTIFACT-PREVIEW",
      "INT-ARTIFACT-DOWNLOAD",
      "INT-ARTIFACT-SHARE",
      "INT-FORWARD-GROUP",
      "INT-FORWARD-PRIMARY",
    ],
  },
  {
    id: "INT-ARTIFACT-PREVIEW",
    kind: "Artifact",
    flowKind: "ARTIFACT",
    componentIds: ["CMP-ARTIFACT-ACTIONS", "CMP-DOC-ITEM"],
    screenIds: ["SCR-08"],
    actionIds: ["ACT-08-02"],
    nextTypical: ["INT-ARTIFACT-DOWNLOAD"],
  },
  {
    id: "INT-ARTIFACT-DOWNLOAD",
    kind: "Artifact",
    flowKind: "ARTIFACT",
    componentIds: ["CMP-ARTIFACT-ACTIONS"],
    screenIds: ["SCR-05", "SCR-06", "SCR-08"],
    actionIds: ["ACT-05-03", "ACT-06-02", "ACT-08-03"],
    nextTypical: ["INT-FORWARD-GROUP"],
  },
  {
    id: "INT-ARTIFACT-SHARE",
    kind: "Artifact",
    flowKind: "ARTIFACT",
    componentIds: ["CMP-ARTIFACT-ACTIONS"],
    screenIds: ["SCR-05", "SCR-08"],
    actionIds: ["ACT-05-04", "ACT-08-04"],
    nextTypical: [],
  },
  {
    id: "INT-FORWARD-GROUP",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-FORWARD-GROUP"],
    screenIds: ["SCR-05", "SCR-06", "SCR-08"],
    actionIds: [
      "ACT-05-05",
      "ACT-05-06",
      "ACT-05-07",
      "ACT-06-03",
      "ACT-06-04",
      "ACT-06-05",
      "ACT-08-05",
      "ACT-08-06",
    ],
    nextTypical: [],
  },
  {
    id: "INT-LIST-BROWSE",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: ["CMP-PROJECT-LIST"],
    screenIds: ["SCR-07"],
    actionIds: ["ACT-07-01"],
    nextTypical: ["INT-LIST-CONTINUE", "INT-LIST-DOCS"],
  },
  {
    id: "INT-LIST-CONTINUE",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-PROJECT-ROW"],
    screenIds: ["SCR-07"],
    actionIds: ["ACT-07-02"],
    nextTypical: ["INT-WS-CONVERSE"],
  },
  {
    id: "INT-LIST-DOCS",
    kind: "Navigate",
    flowKind: "NAV",
    componentIds: ["CMP-PROJECT-ROW"],
    screenIds: ["SCR-07"],
    actionIds: ["ACT-07-03"],
    nextTypical: ["INT-LIB-CATEGORY"],
  },
  {
    id: "INT-LIB-CATEGORY",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: ["CMP-DOC-CATEGORIES"],
    screenIds: ["SCR-08"],
    actionIds: ["ACT-08-01"],
    nextTypical: ["INT-LIB-SELECT"],
  },
  {
    id: "INT-LIB-SELECT",
    kind: "Select",
    flowKind: "SELECT",
    componentIds: ["CMP-DOC-ITEM"],
    screenIds: ["SCR-08"],
    actionIds: ["ACT-08-02", "ACT-08-03", "ACT-08-04"],
    nextTypical: [
      "INT-ARTIFACT-PREVIEW",
      "INT-ARTIFACT-DOWNLOAD",
      "INT-ARTIFACT-SHARE",
    ],
  },
  {
    id: "INT-OPS-VIEW",
    kind: "Observe",
    flowKind: "OBSERVE",
    componentIds: ["CMP-OPS-AREA"],
    screenIds: ["SCR-09"],
    actionIds: [
      "ACT-09-01",
      "ACT-09-02",
      "ACT-09-03",
      "ACT-09-04",
      "ACT-09-05",
      "ACT-09-06",
    ],
    nextTypical: ["INT-OPS-VIEW"],
  },
] as const satisfies readonly InteractionBinding[];

export const INTERACTION_COUNT = INTERACTION_IDS.length;

export function getInteractionBinding(
  id: InteractionId,
): InteractionBinding {
  const binding = INTERACTION_BINDINGS.find((entry) => entry.id === id);
  if (!binding) {
    throw new Error(`Unknown interaction ${id}`);
  }
  return binding;
}

/**
 * Screen owns Action selection for a fired INT (IR-01 / PD-4.5).
 * Presentation validation only — no Adapter or Domain call.
 */
export function resolveScreenAction(input: {
  intId: InteractionId;
  screenId: string;
  actionId?: string;
}): { ok: true; actionId: string | null; flowKind: DataFlowKind } | {
  ok: false;
  reason: string;
} {
  const binding = getInteractionBinding(input.intId);
  if (!binding.screenIds.includes(input.screenId)) {
    return {
      ok: false,
      reason: `${input.intId} not bound to ${input.screenId}`,
    };
  }

  if (!input.actionId) {
    if (binding.actionIds.length === 0) {
      return { ok: true, actionId: null, flowKind: binding.flowKind };
    }
    return {
      ok: false,
      reason: `${input.intId} requires a Screen Action on ${input.screenId}`,
    };
  }

  if (!binding.actionIds.includes(input.actionId)) {
    return {
      ok: false,
      reason: `${input.actionId} not allowed for ${input.intId}`,
    };
  }

  return {
    ok: true,
    actionId: input.actionId,
    flowKind: binding.flowKind,
  };
}

/**
 * Presentation intent envelope (PD-4.5 stage: INT → ACT).
 * Does not invoke Adapter/API.
 */
export type PresentationIntent = Readonly<{
  intId: InteractionId;
  screenId: string;
  actionId?: string;
  componentId?: string;
}>;

export function emitPresentationIntent(
  intent: PresentationIntent,
): PresentationIntent & { flowKind: DataFlowKind; accepted: true } {
  const resolved = resolveScreenAction({
    intId: intent.intId,
    screenId: intent.screenId,
    actionId: intent.actionId,
  });
  if (!resolved.ok) {
    throw new Error(resolved.reason);
  }
  return {
    ...intent,
    flowKind: resolved.flowKind,
    accepted: true,
  };
}

/** Props helpers for CMP markup wiring. */
export function interactionProps(
  intId: InteractionId,
  actionId?: string,
): Record<string, string> {
  return actionId
    ? { "data-int-id": intId, "data-action-id": actionId }
    : { "data-int-id": intId };
}

/** Golden Path INT chains (PD-3.5 §6 reference) — verification only. */
export const GOLDEN_PATH_INT_CHAINS = {
  "GP-01": [
    "INT-ENTRY-GOAL",
    "INT-INTAKE-START",
    "INT-INTAKE-INPUT",
    "INT-FORWARD-PRIMARY",
    "INT-WS-CONVERSE",
    "INT-WS-CONTEXT",
    "INT-WS-OUTCOME",
    "INT-RESULT-REVIEW",
    "INT-FORWARD-GROUP",
    "INT-ARTIFACT-DOWNLOAD",
    "INT-LIB-CATEGORY",
    "INT-LIB-SELECT",
  ],
  "GP-01R": [
    "INT-ENTRY-CONTINUITY",
    "INT-LIST-BROWSE",
    "INT-LIST-CONTINUE",
    "INT-WS-CONVERSE",
  ],
  "GP-02": [
    "INT-ENTRY-GOAL",
    "INT-INTAKE-UPLOAD",
    "INT-INTAKE-STATUS",
    "INT-FORWARD-PRIMARY",
    "INT-WS-TASK",
    "INT-WS-OUTCOME",
    "INT-RESULT-REVIEW",
    "INT-FORWARD-GROUP",
  ],
  "GP-03": [
    "INT-ENTRY-GOAL",
    "INT-WS-TASK",
    "INT-WS-CONVERSE",
    "INT-WS-OUTCOME",
    "INT-RESULT-REVIEW",
    "INT-FORWARD-GROUP",
  ],
  "GP-04": ["INT-OPS-VIEW"],
} as const satisfies Record<string, readonly InteractionId[]>;
