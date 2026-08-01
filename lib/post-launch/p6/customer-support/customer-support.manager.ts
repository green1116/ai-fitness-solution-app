/**
 * PL-6 — Customer Support Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  CUSTOMER_SUPPORT_ID,
  DEFAULT_SUPPORT_POLICY,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  type AssignSupportInput,
  type CloseSupportInput,
  type CreateSupportRequestInput,
  type ReopenSupportInput,
  type ResolveSupportInput,
  type SetSupportPriorityInput,
  type StartSupportInput,
  type SupportManagerSnapshot,
  type SupportManagerStatus,
  type SupportPolicy,
  type SupportPriority,
  type SupportRequest,
  type SupportSnapshot,
  type SupportStatus,
  type WaitSupportInput,
} from "./customer-support.types";

function isPriority(value: string): value is SupportPriority {
  return (SUPPORT_PRIORITIES as readonly string[]).includes(value);
}

function isStatus(value: string): value is SupportStatus {
  return (SUPPORT_STATUSES as readonly string[]).includes(value);
}

function cloneRequest(record: SupportRequest): SupportRequest {
  return { ...record };
}

function clonePolicy(policy: SupportPolicy): SupportPolicy {
  return {
    ...policy,
    autoAssignPriorities: [...policy.autoAssignPriorities],
  };
}

function isOpenLike(status: SupportStatus): boolean {
  return (
    status === "open" ||
    status === "assigned" ||
    status === "in_progress" ||
    status === "waiting"
  );
}

export type CustomerSupportManager = {
  readonly layerId: typeof CUSTOMER_SUPPORT_ID;
  start: () => SupportManagerSnapshot;
  stop: () => SupportManagerSnapshot;
  status: () => SupportManagerSnapshot;
  getPolicy: () => SupportPolicy;
  setPolicy: (policy: SupportPolicy) => SupportPolicy;
  createRequest: (input: CreateSupportRequestInput) => SupportRequest;
  getRequest: (requestId: string) => SupportRequest | undefined;
  listRequests: (filter?: {
    priority?: SupportPriority;
    status?: SupportStatus;
    customerId?: string;
    agentId?: string;
    openOnly?: boolean;
  }) => SupportRequest[];
  assign: (input: AssignSupportInput) => SupportRequest;
  startWork: (input: StartSupportInput) => SupportRequest;
  wait: (input: WaitSupportInput) => SupportRequest;
  resolve: (input: ResolveSupportInput) => SupportRequest;
  close: (input: CloseSupportInput) => SupportRequest;
  reopen: (input: ReopenSupportInput) => SupportRequest;
  setPriority: (input: SetSupportPriorityInput) => SupportRequest;
  snapshot: () => SupportSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory customer support manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createCustomerSupportManager(
  managerId = "sup-mgr-1",
): CustomerSupportManager {
  let statusState: SupportManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: SupportPolicy = clonePolicy(DEFAULT_SUPPORT_POLICY);

  const requests = new Map<string, SupportRequest>();

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function openCount(): number {
    let count = 0;
    for (const request of requests.values()) {
      if (isOpenLike(request.status)) count += 1;
    }
    return count;
  }

  function assignedForAgent(agentId: string): number {
    let count = 0;
    for (const request of requests.values()) {
      if (
        request.agentId === agentId &&
        (request.status === "assigned" || request.status === "in_progress")
      ) {
        count += 1;
      }
    }
    return count;
  }

  function snapshotStatus(): SupportManagerSnapshot {
    return {
      managerId,
      layerId: CUSTOMER_SUPPORT_ID,
      status: statusState,
      clock,
      requestCount: requests.size,
      openCount: openCount(),
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(
        `customer support manager is not running: ${statusState}`,
      );
    }
  }

  function requireRequest(requestId: string): SupportRequest {
    const id = requestId.trim();
    const record = requests.get(id);
    if (!record) throw new Error(`support request not found: ${id}`);
    return record;
  }

  function enforceOpenCap(): void {
    const open = [...requests.values()]
      .filter((r) => isOpenLike(r.status))
      .sort(
        (a, b) =>
          a.openedAt - b.openedAt || a.requestId.localeCompare(b.requestId),
      );
    while (open.length > policy.maxOpenRequests) {
      const oldest = open.shift();
      if (!oldest) break;
      const at = clock;
      requests.set(oldest.requestId, {
        ...oldest,
        status: "closed",
        updatedAt: at,
        closedAt: at,
        resolvedAt: oldest.resolvedAt ?? at,
      });
    }
  }

  return {
    layerId: CUSTOMER_SUPPORT_ID,

    start(): SupportManagerSnapshot {
      if (statusState === "running") {
        throw new Error("customer support manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): SupportManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(
          `customer support manager cannot stop from: ${statusState}`,
        );
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): SupportManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): SupportPolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: SupportPolicy): SupportPolicy {
      requireRunning();
      if (
        !Number.isInteger(next.maxOpenRequests) ||
        next.maxOpenRequests < 1
      ) {
        throw new Error("maxOpenRequests must be an integer >= 1");
      }
      if (
        !Number.isInteger(next.maxAssignedPerAgent) ||
        next.maxAssignedPerAgent < 0
      ) {
        throw new Error("maxAssignedPerAgent must be an integer >= 0");
      }
      const defaultAgentId = next.defaultAgentId.trim();
      if (!defaultAgentId) {
        throw new Error("defaultAgentId is required");
      }
      for (const priority of next.autoAssignPriorities) {
        if (!isPriority(priority)) {
          throw new Error(`invalid autoAssign priority: ${priority}`);
        }
      }
      policy = clonePolicy({
        ...next,
        defaultAgentId,
        autoAssignPriorities: [...next.autoAssignPriorities],
      });
      tick();
      enforceOpenCap();
      return clonePolicy(policy);
    },

    createRequest(input: CreateSupportRequestInput): SupportRequest {
      requireRunning();
      const subject = input.subject.trim();
      if (!subject) throw new Error("subject is required");
      if (!isPriority(input.priority)) {
        throw new Error(`invalid priority: ${input.priority}`);
      }
      const requestId =
        (input.requestId ?? "").trim() || nextId("req");
      if (requests.has(requestId)) {
        throw new Error(`support request already exists: ${requestId}`);
      }
      const customerId = input.customerId?.trim() || undefined;
      const at = tick();
      const autoAssign = policy.autoAssignPriorities.includes(input.priority);
      if (
        autoAssign &&
        policy.maxAssignedPerAgent > 0 &&
        assignedForAgent(policy.defaultAgentId) >= policy.maxAssignedPerAgent
      ) {
        throw new Error(
          `max assigned per agent reached: ${policy.maxAssignedPerAgent}`,
        );
      }
      const record: SupportRequest = {
        requestId,
        subject,
        priority: input.priority,
        status: autoAssign ? "assigned" : "open",
        customerId,
        agentId: autoAssign ? policy.defaultAgentId : undefined,
        openedAt: at,
        updatedAt: at,
        assignedAt: autoAssign ? at : undefined,
      };
      requests.set(requestId, record);
      enforceOpenCap();
      return cloneRequest(requests.get(requestId)!);
    },

    getRequest(requestId: string): SupportRequest | undefined {
      const record = requests.get(requestId.trim());
      return record ? cloneRequest(record) : undefined;
    },

    listRequests(filter?: {
      priority?: SupportPriority;
      status?: SupportStatus;
      customerId?: string;
      agentId?: string;
      openOnly?: boolean;
    }): SupportRequest[] {
      let result = [...requests.values()];
      if (filter?.priority) {
        if (!isPriority(filter.priority)) {
          throw new Error(`invalid priority filter: ${filter.priority}`);
        }
        result = result.filter((r) => r.priority === filter.priority);
      }
      if (filter?.status) {
        if (!isStatus(filter.status)) {
          throw new Error(`invalid status filter: ${filter.status}`);
        }
        result = result.filter((r) => r.status === filter.status);
      }
      if (filter?.customerId) {
        const cid = filter.customerId.trim();
        result = result.filter((r) => r.customerId === cid);
      }
      if (filter?.agentId) {
        const aid = filter.agentId.trim();
        result = result.filter((r) => r.agentId === aid);
      }
      if (filter?.openOnly) {
        result = result.filter((r) => isOpenLike(r.status));
      }
      return result
        .sort(
          (a, b) =>
            a.openedAt - b.openedAt ||
            a.requestId.localeCompare(b.requestId),
        )
        .map(cloneRequest);
    },

    assign(input: AssignSupportInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (current.status !== "open" && current.status !== "waiting") {
        throw new Error(
          `cannot assign support request in status: ${current.status}`,
        );
      }
      const agentId = input.agentId.trim();
      if (!agentId) throw new Error("agentId is required");
      if (
        policy.maxAssignedPerAgent > 0 &&
        assignedForAgent(agentId) >= policy.maxAssignedPerAgent
      ) {
        throw new Error(
          `max assigned per agent reached: ${policy.maxAssignedPerAgent}`,
        );
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "assigned",
        agentId,
        updatedAt: at,
        assignedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    startWork(input: StartSupportInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (current.status !== "assigned" && current.status !== "waiting") {
        throw new Error(
          `cannot start work in status: ${current.status}`,
        );
      }
      if (!current.agentId) {
        throw new Error("agentId required before startWork");
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "in_progress",
        updatedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    wait(input: WaitSupportInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (
        current.status !== "assigned" &&
        current.status !== "in_progress"
      ) {
        throw new Error(`cannot wait in status: ${current.status}`);
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "waiting",
        updatedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    resolve(input: ResolveSupportInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (!isOpenLike(current.status)) {
        throw new Error(`cannot resolve in status: ${current.status}`);
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "resolved",
        updatedAt: at,
        resolvedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    close(input: CloseSupportInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (current.status === "closed") {
        throw new Error(`support request already closed: ${current.requestId}`);
      }
      if (current.status !== "resolved" && !isOpenLike(current.status)) {
        throw new Error(`cannot close in status: ${current.status}`);
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "closed",
        updatedAt: at,
        resolvedAt: current.resolvedAt ?? at,
        closedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    reopen(input: ReopenSupportInput): SupportRequest {
      requireRunning();
      if (!policy.allowReopen) {
        throw new Error("reopen is disabled by policy");
      }
      const current = requireRequest(input.requestId);
      if (current.status !== "resolved" && current.status !== "closed") {
        throw new Error(`cannot reopen in status: ${current.status}`);
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        status: "open",
        agentId: undefined,
        updatedAt: at,
        assignedAt: undefined,
        resolvedAt: undefined,
        closedAt: undefined,
      };
      requests.set(current.requestId, next);
      enforceOpenCap();
      return cloneRequest(requests.get(current.requestId)!);
    },

    setPriority(input: SetSupportPriorityInput): SupportRequest {
      requireRunning();
      const current = requireRequest(input.requestId);
      if (!isPriority(input.priority)) {
        throw new Error(`invalid priority: ${input.priority}`);
      }
      if (current.status === "closed") {
        throw new Error("cannot set priority on closed request");
      }
      const at = tick();
      const next: SupportRequest = {
        ...current,
        priority: input.priority,
        updatedAt: at,
      };
      requests.set(current.requestId, next);
      return cloneRequest(next);
    },

    snapshot(): SupportSnapshot {
      const list = this.listRequests();
      let openCount = 0;
      let assignedCount = 0;
      let inProgressCount = 0;
      let waitingCount = 0;
      let resolvedCount = 0;
      let closedCount = 0;
      for (const request of list) {
        if (request.status === "open") openCount += 1;
        else if (request.status === "assigned") assignedCount += 1;
        else if (request.status === "in_progress") inProgressCount += 1;
        else if (request.status === "waiting") waitingCount += 1;
        else if (request.status === "resolved") resolvedCount += 1;
        else if (request.status === "closed") closedCount += 1;
      }
      return {
        at: clock,
        requestCount: list.length,
        openCount,
        assignedCount,
        inProgressCount,
        waitingCount,
        resolvedCount,
        closedCount,
        policy: clonePolicy(policy),
        requests: list,
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_SUPPORT_POLICY);
      requests.clear();
    },
  };
}

/** Public enum surfaces for stable consumer imports. */
export const CUSTOMER_SUPPORT_PUBLIC_ENUMS = {
  priority: SUPPORT_PRIORITIES,
  status: SUPPORT_STATUSES,
} as const;
