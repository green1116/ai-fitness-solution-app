/**
 * Operations O3 — Ticket status
 */

import {
  getTicket,
  listTickets,
  updateTicketInRegistry,
} from "./ticket.registry";
import type {
  SupportTicket,
  TicketStatus,
  UpdateTicketStatusInput,
} from "./ticket.types";

export function updateTicketStatus(
  input: UpdateTicketStatusInput,
): SupportTicket {
  return updateTicketInRegistry(input);
}

export function getTicketStatus(ticketId: string): TicketStatus | undefined {
  return getTicket(ticketId)?.status;
}

export function listTicketStatuses(filter?: {
  accountRef?: string;
  status?: TicketStatus;
}): SupportTicket[] {
  return listTickets(filter);
}

export function clearTicketStatuses(): void {
  // Status lives in ticket registry; cleared via clearTickets.
}
