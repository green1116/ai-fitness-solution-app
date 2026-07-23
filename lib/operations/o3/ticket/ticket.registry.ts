/**
 * Operations O3 — Ticket registry
 */

import { TICKET_PRIORITIES, TICKET_STATUSES } from "./ticket.constants";
import type {
  RegisterTicketInput,
  SupportTicket,
  TicketStatus,
  UpdateTicketStatusInput,
} from "./ticket.types";

const tickets = new Map<string, SupportTicket>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTicket(ticket: SupportTicket): SupportTicket {
  return { ...ticket, metadata: { ...ticket.metadata } };
}

export function registerTicket(input: RegisterTicketInput): SupportTicket {
  const accountRef = input.accountRef.trim();
  const subject = input.subject.trim();
  const requester = input.requester.trim();
  if (!accountRef) throw new Error("ticket.accountRef is required");
  if (!subject) throw new Error("ticket.subject is required");
  if (!requester) throw new Error("ticket.requester is required");
  if (!(TICKET_PRIORITIES as readonly string[]).includes(input.priority)) {
    throw new Error(`invalid ticket priority: ${input.priority}`);
  }

  const id = input.id?.trim() || createId("o3tkt");
  if (tickets.has(id)) {
    throw new Error(`ticket already exists: ${id}`);
  }

  const now = nowIso();
  const status = TICKET_STATUSES[0];
  const ticket: SupportTicket = {
    id,
    accountRef,
    subject,
    priority: input.priority,
    status,
    requester,
    detail: `priority=${input.priority} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  tickets.set(id, ticket);
  return cloneTicket(ticket);
}

export function getTicket(id: string): SupportTicket | undefined {
  const ticket = tickets.get(id.trim());
  return ticket ? cloneTicket(ticket) : undefined;
}

export function listTickets(filter?: {
  accountRef?: string;
  status?: TicketStatus;
}): SupportTicket[] {
  let result = [...tickets.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((t) => t.accountRef === aref);
  }
  if (filter?.status) result = result.filter((t) => t.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTicket);
}

export function updateTicketInRegistry(
  input: UpdateTicketStatusInput,
): SupportTicket {
  const ticketId = input.ticketId.trim();
  if (!ticketId) throw new Error("ticketStatus.ticketId is required");
  if (!(TICKET_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid ticket status: ${input.status}`);
  }

  const existing = tickets.get(ticketId);
  if (!existing) {
    throw new Error(`ticket not found: ${ticketId}`);
  }

  const updated: SupportTicket = {
    ...existing,
    status: input.status,
    detail: `priority=${existing.priority} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  tickets.set(ticketId, updated);
  return cloneTicket(updated);
}

export function clearTickets(): void {
  tickets.clear();
}
