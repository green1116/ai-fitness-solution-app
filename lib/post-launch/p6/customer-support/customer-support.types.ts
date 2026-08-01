/**
 * PL-6 — Customer Support types.
 * In-memory support core only — no IO / persistence / providers.
 */

export const CUSTOMER_SUPPORT_ID = "pl-6-customer-support-v1" as const;

export const SUPPORT_PRIORITIES = ["p1", "p2", "p3", "p4"] as const;

export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export const SUPPORT_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

/** Deterministic support policy. */
export type SupportPolicy = Readonly<{
  /** Maximum open-like requests retained (oldest closed when exceeded). */
  maxOpenRequests: number;
  /** Priorities that auto-assign to a default agent on create. */
  autoAssignPriorities: readonly SupportPriority[];
  /** Default agent id used for auto-assign (opaque string). */
  defaultAgentId: string;
  /** Whether resolved/closed requests may reopen. */
  allowReopen: boolean;
  /** Maximum assigned+in_progress requests per agent (0 = unlimited). */
  maxAssignedPerAgent: number;
}>;

export const DEFAULT_SUPPORT_POLICY: SupportPolicy = {
  maxOpenRequests: 100,
  autoAssignPriorities: ["p1"],
  defaultAgentId: "agent-default",
  allowReopen: true,
  maxAssignedPerAgent: 0,
};

export type SupportRequest = Readonly<{
  requestId: string;
  subject: string;
  priority: SupportPriority;
  status: SupportStatus;
  /** Optional opaque customer ref. */
  customerId?: string;
  /** Optional opaque agent ref. */
  agentId?: string;
  openedAt: number;
  updatedAt: number;
  assignedAt?: number;
  resolvedAt?: number;
  closedAt?: number;
}>;

export type CreateSupportRequestInput = Readonly<{
  subject: string;
  priority: SupportPriority;
  customerId?: string;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  requestId?: string;
}>;

export type AssignSupportInput = Readonly<{
  requestId: string;
  agentId: string;
}>;

export type StartSupportInput = Readonly<{
  requestId: string;
}>;

export type WaitSupportInput = Readonly<{
  requestId: string;
}>;

export type ResolveSupportInput = Readonly<{
  requestId: string;
}>;

export type CloseSupportInput = Readonly<{
  requestId: string;
}>;

export type ReopenSupportInput = Readonly<{
  requestId: string;
}>;

export type SetSupportPriorityInput = Readonly<{
  requestId: string;
  priority: SupportPriority;
}>;

export type SupportSnapshot = Readonly<{
  at: number;
  requestCount: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  waitingCount: number;
  resolvedCount: number;
  closedCount: number;
  policy: SupportPolicy;
  requests: readonly SupportRequest[];
}>;

export type SupportManagerStatus = "idle" | "running" | "stopped";

export type SupportManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof CUSTOMER_SUPPORT_ID;
  status: SupportManagerStatus;
  clock: number;
  requestCount: number;
  openCount: number;
}>;
