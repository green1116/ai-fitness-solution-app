/**
 * PL-7 — Continuous Improvement types.
 * In-memory improvement core only — no IO / persistence / providers.
 */

export const CONTINUOUS_IMPROVEMENT_ID =
  "pl-7-continuous-improvement-v1" as const;

export const IMPROVEMENT_PRIORITIES = ["p1", "p2", "p3", "p4"] as const;

export type ImprovementPriority = (typeof IMPROVEMENT_PRIORITIES)[number];

export const IMPROVEMENT_STATUSES = [
  "proposed",
  "accepted",
  "in_progress",
  "deferred",
  "completed",
  "rejected",
] as const;

export type ImprovementStatus = (typeof IMPROVEMENT_STATUSES)[number];

/** Deterministic improvement policy. */
export type ImprovementPolicy = Readonly<{
  /** Maximum active-like proposals (proposed/accepted/in_progress/deferred). */
  maxActiveProposals: number;
  /** Priorities that auto-accept on create. */
  autoAcceptPriorities: readonly ImprovementPriority[];
  /** Whether completed/rejected proposals may reopen as proposed. */
  allowReopen: boolean;
  /** Whether start requires accepted first. */
  requireAcceptance: boolean;
}>;

export const DEFAULT_IMPROVEMENT_POLICY: ImprovementPolicy = {
  maxActiveProposals: 100,
  autoAcceptPriorities: ["p1"],
  allowReopen: true,
  requireAcceptance: true,
};

export type ImprovementProposal = Readonly<{
  proposalId: string;
  title: string;
  priority: ImprovementPriority;
  status: ImprovementStatus;
  /** Optional opaque owner ref. */
  ownerId?: string;
  /** Optional opaque area ref. */
  areaId?: string;
  createdAt: number;
  updatedAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
  rejectedAt?: number;
}>;

export type CreateProposalInput = Readonly<{
  title: string;
  priority: ImprovementPriority;
  ownerId?: string;
  areaId?: string;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  proposalId?: string;
}>;

export type AcceptProposalInput = Readonly<{
  proposalId: string;
}>;

export type StartProposalInput = Readonly<{
  proposalId: string;
}>;

export type DeferProposalInput = Readonly<{
  proposalId: string;
}>;

export type CompleteProposalInput = Readonly<{
  proposalId: string;
}>;

export type RejectProposalInput = Readonly<{
  proposalId: string;
}>;

export type ReopenProposalInput = Readonly<{
  proposalId: string;
}>;

export type SetProposalPriorityInput = Readonly<{
  proposalId: string;
  priority: ImprovementPriority;
}>;

export type ImprovementSnapshot = Readonly<{
  at: number;
  proposalCount: number;
  proposedCount: number;
  acceptedCount: number;
  inProgressCount: number;
  deferredCount: number;
  completedCount: number;
  rejectedCount: number;
  policy: ImprovementPolicy;
  proposals: readonly ImprovementProposal[];
}>;

export type ImprovementManagerStatus = "idle" | "running" | "stopped";

export type ImprovementManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof CONTINUOUS_IMPROVEMENT_ID;
  status: ImprovementManagerStatus;
  clock: number;
  proposalCount: number;
  activeCount: number;
}>;
