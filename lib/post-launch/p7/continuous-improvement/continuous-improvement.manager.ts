/**
 * PL-7 — Continuous Improvement Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  CONTINUOUS_IMPROVEMENT_ID,
  DEFAULT_IMPROVEMENT_POLICY,
  IMPROVEMENT_PRIORITIES,
  IMPROVEMENT_STATUSES,
  type AcceptProposalInput,
  type CompleteProposalInput,
  type CreateProposalInput,
  type DeferProposalInput,
  type ImprovementManagerSnapshot,
  type ImprovementManagerStatus,
  type ImprovementPolicy,
  type ImprovementPriority,
  type ImprovementProposal,
  type ImprovementSnapshot,
  type ImprovementStatus,
  type RejectProposalInput,
  type ReopenProposalInput,
  type SetProposalPriorityInput,
  type StartProposalInput,
} from "./continuous-improvement.types";

function isPriority(value: string): value is ImprovementPriority {
  return (IMPROVEMENT_PRIORITIES as readonly string[]).includes(value);
}

function isStatus(value: string): value is ImprovementStatus {
  return (IMPROVEMENT_STATUSES as readonly string[]).includes(value);
}

function cloneProposal(record: ImprovementProposal): ImprovementProposal {
  return { ...record };
}

function clonePolicy(policy: ImprovementPolicy): ImprovementPolicy {
  return {
    ...policy,
    autoAcceptPriorities: [...policy.autoAcceptPriorities],
  };
}

function isActiveLike(status: ImprovementStatus): boolean {
  return (
    status === "proposed" ||
    status === "accepted" ||
    status === "in_progress" ||
    status === "deferred"
  );
}

export type ContinuousImprovementManager = {
  readonly layerId: typeof CONTINUOUS_IMPROVEMENT_ID;
  start: () => ImprovementManagerSnapshot;
  stop: () => ImprovementManagerSnapshot;
  status: () => ImprovementManagerSnapshot;
  getPolicy: () => ImprovementPolicy;
  setPolicy: (policy: ImprovementPolicy) => ImprovementPolicy;
  createProposal: (input: CreateProposalInput) => ImprovementProposal;
  getProposal: (proposalId: string) => ImprovementProposal | undefined;
  listProposals: (filter?: {
    priority?: ImprovementPriority;
    status?: ImprovementStatus;
    ownerId?: string;
    areaId?: string;
    activeOnly?: boolean;
  }) => ImprovementProposal[];
  accept: (input: AcceptProposalInput) => ImprovementProposal;
  startWork: (input: StartProposalInput) => ImprovementProposal;
  defer: (input: DeferProposalInput) => ImprovementProposal;
  complete: (input: CompleteProposalInput) => ImprovementProposal;
  reject: (input: RejectProposalInput) => ImprovementProposal;
  reopen: (input: ReopenProposalInput) => ImprovementProposal;
  setPriority: (input: SetProposalPriorityInput) => ImprovementProposal;
  snapshot: () => ImprovementSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory continuous improvement manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createContinuousImprovementManager(
  managerId = "ci-mgr-1",
): ContinuousImprovementManager {
  let statusState: ImprovementManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: ImprovementPolicy = clonePolicy(DEFAULT_IMPROVEMENT_POLICY);

  const proposals = new Map<string, ImprovementProposal>();

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function activeCount(): number {
    let count = 0;
    for (const proposal of proposals.values()) {
      if (isActiveLike(proposal.status)) count += 1;
    }
    return count;
  }

  function snapshotStatus(): ImprovementManagerSnapshot {
    return {
      managerId,
      layerId: CONTINUOUS_IMPROVEMENT_ID,
      status: statusState,
      clock,
      proposalCount: proposals.size,
      activeCount: activeCount(),
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(
        `continuous improvement manager is not running: ${statusState}`,
      );
    }
  }

  function requireProposal(proposalId: string): ImprovementProposal {
    const id = proposalId.trim();
    const record = proposals.get(id);
    if (!record) throw new Error(`improvement proposal not found: ${id}`);
    return record;
  }

  function enforceActiveCap(): void {
    const active = [...proposals.values()]
      .filter((p) => isActiveLike(p.status))
      .sort(
        (a, b) =>
          a.createdAt - b.createdAt ||
          a.proposalId.localeCompare(b.proposalId),
      );
    while (active.length > policy.maxActiveProposals) {
      const oldest = active.shift();
      if (!oldest) break;
      const at = clock;
      proposals.set(oldest.proposalId, {
        ...oldest,
        status: "rejected",
        updatedAt: at,
        rejectedAt: at,
      });
    }
  }

  return {
    layerId: CONTINUOUS_IMPROVEMENT_ID,

    start(): ImprovementManagerSnapshot {
      if (statusState === "running") {
        throw new Error("continuous improvement manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): ImprovementManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(
          `continuous improvement manager cannot stop from: ${statusState}`,
        );
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): ImprovementManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): ImprovementPolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: ImprovementPolicy): ImprovementPolicy {
      requireRunning();
      if (
        !Number.isInteger(next.maxActiveProposals) ||
        next.maxActiveProposals < 1
      ) {
        throw new Error("maxActiveProposals must be an integer >= 1");
      }
      for (const priority of next.autoAcceptPriorities) {
        if (!isPriority(priority)) {
          throw new Error(`invalid autoAccept priority: ${priority}`);
        }
      }
      policy = clonePolicy({
        ...next,
        autoAcceptPriorities: [...next.autoAcceptPriorities],
      });
      tick();
      enforceActiveCap();
      return clonePolicy(policy);
    },

    createProposal(input: CreateProposalInput): ImprovementProposal {
      requireRunning();
      const title = input.title.trim();
      if (!title) throw new Error("title is required");
      if (!isPriority(input.priority)) {
        throw new Error(`invalid priority: ${input.priority}`);
      }
      const proposalId =
        (input.proposalId ?? "").trim() || nextId("imp");
      if (proposals.has(proposalId)) {
        throw new Error(`improvement proposal already exists: ${proposalId}`);
      }
      const ownerId = input.ownerId?.trim() || undefined;
      const areaId = input.areaId?.trim() || undefined;
      const at = tick();
      const autoAccept = policy.autoAcceptPriorities.includes(input.priority);
      const record: ImprovementProposal = {
        proposalId,
        title,
        priority: input.priority,
        status: autoAccept ? "accepted" : "proposed",
        ownerId,
        areaId,
        createdAt: at,
        updatedAt: at,
        acceptedAt: autoAccept ? at : undefined,
      };
      proposals.set(proposalId, record);
      enforceActiveCap();
      return cloneProposal(proposals.get(proposalId)!);
    },

    getProposal(proposalId: string): ImprovementProposal | undefined {
      const record = proposals.get(proposalId.trim());
      return record ? cloneProposal(record) : undefined;
    },

    listProposals(filter?: {
      priority?: ImprovementPriority;
      status?: ImprovementStatus;
      ownerId?: string;
      areaId?: string;
      activeOnly?: boolean;
    }): ImprovementProposal[] {
      let result = [...proposals.values()];
      if (filter?.priority) {
        if (!isPriority(filter.priority)) {
          throw new Error(`invalid priority filter: ${filter.priority}`);
        }
        result = result.filter((p) => p.priority === filter.priority);
      }
      if (filter?.status) {
        if (!isStatus(filter.status)) {
          throw new Error(`invalid status filter: ${filter.status}`);
        }
        result = result.filter((p) => p.status === filter.status);
      }
      if (filter?.ownerId) {
        const oid = filter.ownerId.trim();
        result = result.filter((p) => p.ownerId === oid);
      }
      if (filter?.areaId) {
        const aid = filter.areaId.trim();
        result = result.filter((p) => p.areaId === aid);
      }
      if (filter?.activeOnly) {
        result = result.filter((p) => isActiveLike(p.status));
      }
      return result
        .sort(
          (a, b) =>
            a.createdAt - b.createdAt ||
            a.proposalId.localeCompare(b.proposalId),
        )
        .map(cloneProposal);
    },

    accept(input: AcceptProposalInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      if (current.status !== "proposed" && current.status !== "deferred") {
        throw new Error(
          `cannot accept proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "accepted",
        updatedAt: at,
        acceptedAt: at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    startWork(input: StartProposalInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      const allowed = policy.requireAcceptance
        ? current.status === "accepted" || current.status === "deferred"
        : current.status === "proposed" ||
          current.status === "accepted" ||
          current.status === "deferred";
      if (!allowed) {
        throw new Error(
          `cannot start proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "in_progress",
        updatedAt: at,
        startedAt: at,
        acceptedAt: current.acceptedAt ?? at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    defer(input: DeferProposalInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      if (
        current.status !== "proposed" &&
        current.status !== "accepted" &&
        current.status !== "in_progress"
      ) {
        throw new Error(`cannot defer proposal in status: ${current.status}`);
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "deferred",
        updatedAt: at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    complete(input: CompleteProposalInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      if (current.status !== "in_progress" && current.status !== "accepted") {
        throw new Error(
          `cannot complete proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "completed",
        updatedAt: at,
        completedAt: at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    reject(input: RejectProposalInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      if (
        current.status === "completed" ||
        current.status === "rejected"
      ) {
        throw new Error(
          `cannot reject proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "rejected",
        updatedAt: at,
        rejectedAt: at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    reopen(input: ReopenProposalInput): ImprovementProposal {
      requireRunning();
      if (!policy.allowReopen) {
        throw new Error("reopen is disabled by policy");
      }
      const current = requireProposal(input.proposalId);
      if (current.status !== "completed" && current.status !== "rejected") {
        throw new Error(
          `cannot reopen proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        status: "proposed",
        updatedAt: at,
        acceptedAt: undefined,
        startedAt: undefined,
        completedAt: undefined,
        rejectedAt: undefined,
      };
      proposals.set(current.proposalId, next);
      enforceActiveCap();
      return cloneProposal(proposals.get(current.proposalId)!);
    },

    setPriority(input: SetProposalPriorityInput): ImprovementProposal {
      requireRunning();
      const current = requireProposal(input.proposalId);
      if (!isPriority(input.priority)) {
        throw new Error(`invalid priority: ${input.priority}`);
      }
      if (current.status === "completed" || current.status === "rejected") {
        throw new Error(
          `cannot set priority on proposal in status: ${current.status}`,
        );
      }
      const at = tick();
      const next: ImprovementProposal = {
        ...current,
        priority: input.priority,
        updatedAt: at,
      };
      proposals.set(current.proposalId, next);
      return cloneProposal(next);
    },

    snapshot(): ImprovementSnapshot {
      const list = this.listProposals();
      let proposedCount = 0;
      let acceptedCount = 0;
      let inProgressCount = 0;
      let deferredCount = 0;
      let completedCount = 0;
      let rejectedCount = 0;
      for (const proposal of list) {
        if (proposal.status === "proposed") proposedCount += 1;
        else if (proposal.status === "accepted") acceptedCount += 1;
        else if (proposal.status === "in_progress") inProgressCount += 1;
        else if (proposal.status === "deferred") deferredCount += 1;
        else if (proposal.status === "completed") completedCount += 1;
        else if (proposal.status === "rejected") rejectedCount += 1;
      }
      return {
        at: clock,
        proposalCount: list.length,
        proposedCount,
        acceptedCount,
        inProgressCount,
        deferredCount,
        completedCount,
        rejectedCount,
        policy: clonePolicy(policy),
        proposals: list,
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_IMPROVEMENT_POLICY);
      proposals.clear();
    },
  };
}

/** Public enum surfaces for stable consumer imports. */
export const CONTINUOUS_IMPROVEMENT_PUBLIC_ENUMS = {
  priority: IMPROVEMENT_PRIORITIES,
  status: IMPROVEMENT_STATUSES,
} as const;
