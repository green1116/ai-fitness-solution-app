/**
 * EWEB-1 — Action Execution Request
 * Deterministic read-only ActionExecutionRequest from frozen EWI intents.
 * Baseline: enterprise-saas-workspace-action-intent-v1.
 * Request signal only — no execution / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ACTION_INTENT_VERSION,
  EWI_1_ID,
  getActionIntents,
  type ActionIntent,
  type ActionIntentKind,
  type ActionIntents,
} from "../action-intent/action-intent";
import {
  ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
  getEwiFreeze,
} from "../action-intent/ewi-freeze-manifest";
import { getEwasFreeze } from "../../workflow/experience/ewas-freeze-manifest";
import { getEacFreeze } from "../action-consumption/eac-freeze-manifest";
import { getEadsFreeze } from "../action-delivery/eads-freeze-manifest";
import { getEwaFreeze } from "../workspace-action/ewa-freeze-manifest";

export const EWEB_1_ID = "EWEB-1" as const;
export const ACTION_EXECUTION_CAPABILITY = "ActionExecutionRequest" as const;
export const ACTION_EXECUTION_VERSION = "eweb-1-action-execution-1" as const;

export const ACTION_EXECUTION_REQUEST_STATES = ["READY", "BLOCKED"] as const;
export type ActionExecutionRequestState =
  (typeof ACTION_EXECUTION_REQUEST_STATES)[number];

export const ACTION_EXECUTION_PRIORITIES = ["P1", "P2", "P3", "P4"] as const;
export type ActionExecutionPriority =
  (typeof ACTION_EXECUTION_PRIORITIES)[number];

const REQUEST_STATE_RANK: Readonly<
  Record<ActionExecutionRequestState, number>
> = {
  READY: 0,
  BLOCKED: 1,
};

const PRIORITY_RANK: Readonly<Record<ActionExecutionPriority, number>> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

export type ActionExecutionRequest = Readonly<{
  id: string;
  intentId: string;
  actionId: string;
  customerId: string;
  intent: ActionIntentKind;
  priority: ActionExecutionPriority;
  requestState: ActionExecutionRequestState;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type ActionExecutionRequests = Readonly<{
  workPackageId: typeof EWEB_1_ID;
  capability: typeof ACTION_EXECUTION_CAPABILITY;
  version: typeof ACTION_EXECUTION_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1;
  parentPack: typeof EWI_1_ID;
  parentVersion: typeof ACTION_INTENT_VERSION;
  records: readonly ActionExecutionRequest[];
  recordCount: number;
  readyCount: number;
  blockedCount: number;
  ewaFreezeFingerprint: string;
  eadsFreezeFingerprint: string;
  eacFreezeFingerprint: string;
  ewasFreezeFingerprint: string;
  ewiFreezeFingerprint: string;
  actionIntentFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
  };
}>;

export type BuildActionExecutionRequestInput = Readonly<{
  intents?: ActionIntents;
}>;

let cached: ActionExecutionRequests | null = null;

function clonePack(row: ActionExecutionRequests): ActionExecutionRequests {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function requestFromIntent(intent: ActionIntentKind): {
  requestState: ActionExecutionRequestState;
  priority: ActionExecutionPriority;
  reason: string;
} {
  if (intent === "REVIEW") {
    return {
      requestState: "READY",
      priority: "P1",
      reason: "execution-ready-from-review",
    };
  }
  if (intent === "FOLLOW_UP") {
    return {
      requestState: "READY",
      priority: "P2",
      reason: "execution-ready-from-follow-up",
    };
  }
  if (intent === "MONITOR") {
    return {
      requestState: "READY",
      priority: "P3",
      reason: "execution-ready-from-monitor",
    };
  }
  return {
    requestState: "BLOCKED",
    priority: "P4",
    reason: "execution-blocked-from-hold",
  };
}

function recordFingerprint(
  row: Omit<ActionExecutionRequest, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: row.id,
        intentId: row.intentId,
        actionId: row.actionId,
        customerId: row.customerId,
        intent: row.intent,
        priority: row.priority,
        requestState: row.requestState,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePayload(
  row: Omit<ActionExecutionRequests, "fingerprint">,
): string {
  return JSON.stringify({
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    records: row.records,
    recordCount: row.recordCount,
    readyCount: row.readyCount,
    blockedCount: row.blockedCount,
    ewaFreezeFingerprint: row.ewaFreezeFingerprint,
    eadsFreezeFingerprint: row.eadsFreezeFingerprint,
    eacFreezeFingerprint: row.eacFreezeFingerprint,
    ewasFreezeFingerprint: row.ewasFreezeFingerprint,
    ewiFreezeFingerprint: row.ewiFreezeFingerprint,
    actionIntentFingerprint: row.actionIntentFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ActionExecutionRequests, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectRecord(
  row: ActionIntent,
): Omit<ActionExecutionRequest, "fingerprint" | "ordinal"> {
  const mapped = requestFromIntent(row.intent);
  return {
    id: row.id.replace(/^ewi-1:/, "eweb-1:"),
    intentId: row.id,
    actionId: row.actionId,
    customerId: row.customerId,
    intent: row.intent,
    priority: mapped.priority,
    requestState: mapped.requestState,
    reason: mapped.reason,
  };
}

function deriveRequests(intents: ActionIntents): ActionExecutionRequests {
  const ewa = getEwaFreeze();
  const eads = getEadsFreeze();
  const eac = getEacFreeze();
  const ewas = getEwasFreeze();
  const ewi = getEwiFreeze();
  const projected = intents.records.map(projectRecord);
  const sorted = [...projected].sort((a, b) => {
    const byState =
      REQUEST_STATE_RANK[a.requestState] - REQUEST_STATE_RANK[b.requestState];
    if (byState !== 0) return byState;
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    if (a.customerId < b.customerId) return -1;
    if (a.customerId > b.customerId) return 1;
    return 0;
  });
  const records: ActionExecutionRequest[] = sorted.map((row, ordinal) => {
    const withoutFp = { ...row, ordinal };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const withoutFp: Omit<ActionExecutionRequests, "fingerprint"> = {
    workPackageId: EWEB_1_ID,
    capability: ACTION_EXECUTION_CAPABILITY,
    version: ACTION_EXECUTION_VERSION,
    baselineTag: ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
    parentPack: EWI_1_ID,
    parentVersion: ACTION_INTENT_VERSION,
    records,
    recordCount: records.length,
    readyCount: records.filter((r) => r.requestState === "READY").length,
    blockedCount: records.filter((r) => r.requestState === "BLOCKED").length,
    ewaFreezeFingerprint: ewa.fingerprint,
    eadsFreezeFingerprint: eads.fingerprint,
    eacFreezeFingerprint: eac.fingerprint,
    ewasFreezeFingerprint: ewas.fingerprint,
    ewiFreezeFingerprint: ewi.fingerprint,
    actionIntentFingerprint: intents.fingerprint,
    scope: {
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
    },
  };
  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

export function buildActionExecutionRequests(
  input?: BuildActionExecutionRequestInput,
): ActionExecutionRequests {
  const out = deriveRequests(input?.intents ?? getActionIntents());
  cached = clonePack(out);
  return clonePack(cached);
}

export function getActionExecutionRequests(): ActionExecutionRequests {
  if (!cached) {
    return buildActionExecutionRequests();
  }
  return clonePack(cached);
}

export function clearActionExecutionRequests(): void {
  cached = null;
}
