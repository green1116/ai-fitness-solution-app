/**
 * Operations O3 — Support assignment
 */

import { getTicket } from "../ticket/ticket.registry";
import type {
  AssignSupportInput,
  SupportAssignment,
} from "./support.types";

const assignments = new Map<string, SupportAssignment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAssignment(
  assignment: SupportAssignment,
): SupportAssignment {
  return { ...assignment };
}

export function assignSupport(
  input: AssignSupportInput,
): SupportAssignment {
  const ticketId = input.ticketId.trim();
  const assignee = input.assignee.trim();
  const team = input.team.trim();
  if (!ticketId) throw new Error("assignment.ticketId is required");
  if (!assignee) throw new Error("assignment.assignee is required");
  if (!team) throw new Error("assignment.team is required");
  if (!getTicket(ticketId)) {
    throw new Error(`ticket not found: ${ticketId}`);
  }

  const id = input.id?.trim() || createId("o3asn");
  if (assignments.has(id)) {
    throw new Error(`support assignment already exists: ${id}`);
  }

  const assignment: SupportAssignment = {
    id,
    ticketId,
    assignee,
    team,
    detail: `assignee=${assignee} team=${team}`,
    assignedAt: nowIso(),
  };
  assignments.set(id, assignment);
  return cloneAssignment(assignment);
}

export function getSupportAssignment(
  id: string,
): SupportAssignment | undefined {
  const assignment = assignments.get(id.trim());
  return assignment ? cloneAssignment(assignment) : undefined;
}

export function listSupportAssignments(filter?: {
  ticketId?: string;
}): SupportAssignment[] {
  let result = [...assignments.values()];
  if (filter?.ticketId) {
    const tid = filter.ticketId.trim();
    result = result.filter((a) => a.ticketId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssignment);
}

export function clearSupportAssignments(): void {
  assignments.clear();
}
