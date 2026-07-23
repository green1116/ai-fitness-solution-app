/**
 * Operations O3 — Ticket types
 */

import type {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "./ticket.constants";

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketMetadata = Record<string, unknown>;

export type SupportTicket = {
  id: string;
  accountRef: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  requester: string;
  detail: string;
  metadata: TicketMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterTicketInput = {
  id?: string;
  accountRef: string;
  subject: string;
  priority: TicketPriority;
  requester: string;
  metadata?: TicketMetadata;
};

export type UpdateTicketStatusInput = {
  ticketId: string;
  status: TicketStatus;
};
