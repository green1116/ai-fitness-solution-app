/**
 * V96 — Audit retrieval (read from V95 actions / V94 briefing / V92 governance / V93 reporting)
 */

import { listGovernanceActions } from "@/lib/pilot/v92";
import { listBoardPackets } from "@/lib/pilot/v93";
import { listBriefingActions, listBriefingPacks } from "@/lib/pilot/v94";
import {
  getExecutiveActionRecord,
  listExecutiveActionsForOrg,
  listExecutiveActionsForSession,
} from "@/lib/pilot/v95";

import type { AuditTrail, LinkedIds } from "./archive.types";

const CLOSURE_ACTIONS = new Set([
  "mark_acted",
  "mark_deferred",
  "mark_closed",
  "confirm_decision",
  "record_outcome",
]);

export function buildLinkedIds(
  organizationId: string,
  sessionId: string,
): LinkedIds {
  const briefingPacks = listBriefingPacks(organizationId).filter((pack) =>
    pack.decisionSupport.some((d) => d.sessionId === sessionId),
  );
  const briefingActions = listBriefingActions(organizationId).filter(
    (a) => a.sessionId === sessionId,
  );
  const boardPackets = listBoardPackets(organizationId).filter((pack) =>
    pack.decisionHistory.some((d) => d.sessionId === sessionId),
  );
  const governanceActions = listGovernanceActions(sessionId).filter(
    (a) => a.organizationId === organizationId,
  );
  const executiveActions = listExecutiveActionsForSession(sessionId, organizationId);

  return {
    sessionId,
    briefingPackIds: briefingPacks.map((p) => p.id),
    boardPacketIds: boardPackets.map((p) => p.id),
    governanceActionIds: governanceActions.map((a) => a.id),
    executiveActionIds: executiveActions.map((a) => a.id),
    briefingActionIds: briefingActions.map((a) => a.id),
    readOnly: true,
  };
}

export function retrieveAuditTrail(
  organizationId: string,
  sessionId: string,
  projectName?: string,
): AuditTrail {
  const linkedIds = buildLinkedIds(organizationId, sessionId);
  const executiveActionHistory = listExecutiveActionsForSession(sessionId, organizationId);
  const briefingPackHistory = listBriefingPacks(organizationId)
    .filter((pack) => linkedIds.briefingPackIds.includes(pack.id))
    .map((pack) => ({
      packId: pack.id,
      title: pack.title,
      generatedAt: pack.generatedAt,
      status: pack.status,
    }));
  const briefingActionHistory = listBriefingActions(organizationId).filter(
    (a) => a.sessionId === sessionId,
  );
  const decisionTrail = listGovernanceActions(sessionId).filter(
    (a) => a.organizationId === organizationId,
  );
  const closureTrail = executiveActionHistory.filter((a) => CLOSURE_ACTIONS.has(a.action));

  return {
    sessionId,
    projectName,
    executiveActionHistory,
    briefingPackHistory,
    briefingActionHistory,
    decisionTrail,
    closureTrail,
    linkedIds,
    readOnly: true,
  };
}

export function searchAuditHistory(input: {
  organizationId: string;
  query: string;
  items: Array<{ sessionId: string; projectName?: string }>;
}): AuditTrail[] {
  const q = input.query.trim().toLowerCase();
  if (!q) return [];

  return input.items
    .filter((item) => {
      const label = (item.projectName ?? item.sessionId).toLowerCase();
      return label.includes(q) || item.sessionId.toLowerCase().includes(q);
    })
    .slice(0, 20)
    .map((item) => retrieveAuditTrail(input.organizationId, item.sessionId, item.projectName));
}

export function wasOverdueResolved(organizationId: string, sessionId: string): boolean {
  const record = getExecutiveActionRecord(sessionId, organizationId);
  if (!record) return false;

  const resolutionAt = record.actedAt ?? record.deferredAt ?? record.closedAt;
  if (!resolutionAt) return false;

  return new Date(record.dueDate).getTime() < new Date(resolutionAt).getTime();
}

export function listOrgExecutiveActionHistory(organizationId: string) {
  return listExecutiveActionsForOrg(organizationId);
}
