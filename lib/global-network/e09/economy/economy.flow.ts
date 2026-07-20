/**
 * E09-P5 — Value Flow Engine
 * Create, link, route, and settle value flows between economic nodes
 */

import {
  VALUE_FLOW_KINDS,
  VALUE_FLOW_STATUSES,
} from "./economy.constants";
import {
  getEconomicNode,
  setEconomicNodeBalance,
} from "./economy.registry";
import type {
  CreateValueFlowInput,
  FlowLink,
  FlowPath,
  ValueFlow,
  ValueFlowKind,
  ValueFlowStatus,
} from "./economy.types";

const flows = new Map<string, ValueFlow>();
/** Directed capacity links between economic nodes (may bind to a flowId) */
const links = new Map<string, FlowLink>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function linkKey(source: string, target: string): string {
  return `${source}->${target}`;
}

function cloneFlow(flow: ValueFlow): ValueFlow {
  return {
    ...flow,
    hops: [...flow.hops],
    metadata: { ...flow.metadata },
  };
}

function cloneLink(link: FlowLink): FlowLink {
  return { ...link };
}

function assertFlowKind(kind: string): asserts kind is ValueFlowKind {
  if (!(VALUE_FLOW_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid value flow kind: ${kind}`);
  }
}

function assertFlowStatus(
  status: string,
): asserts status is ValueFlowStatus {
  if (!(VALUE_FLOW_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid value flow status: ${status}`);
  }
}

function assertAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("flow.amount must be a finite number > 0");
  }
}

function assertCapacity(capacity: number): void {
  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new Error("link.capacity must be a finite number >= 0");
  }
}

/** Create an OPEN value flow between two registered economic nodes. */
export function createValueFlow(input: CreateValueFlowInput): ValueFlow {
  const sourceId = input.sourceId.trim();
  const targetId = input.targetId.trim();
  if (!sourceId) throw new Error("flow.sourceId is required");
  if (!targetId) throw new Error("flow.targetId is required");
  if (sourceId === targetId) {
    throw new Error("flow source and target must differ");
  }
  assertFlowKind(input.kind);
  assertAmount(input.amount);

  if (!getEconomicNode(sourceId)) {
    throw new Error(`source economic node not found: ${sourceId}`);
  }
  if (!getEconomicNode(targetId)) {
    throw new Error(`target economic node not found: ${targetId}`);
  }

  const id = input.id?.trim() || createId("val-flow");
  if (flows.has(id)) {
    throw new Error(`value flow already exists: ${id}`);
  }

  const flow: ValueFlow = {
    id,
    kind: input.kind,
    sourceId,
    targetId,
    amount: input.amount,
    status: "OPEN",
    hops: [],
    metadata: { ...(input.metadata ?? {}) },
  };

  flows.set(id, flow);
  return cloneFlow(flow);
}

/**
 * Link a flow hop (or direct edge) and promote OPEN → LINKED.
 * Creates/updates a directed capacity link between nodes.
 */
export function linkFlow(input: {
  flowId: string;
  fromId: string;
  toId: string;
  capacity?: number;
}): FlowLink {
  const flowId = input.flowId.trim();
  const fromId = input.fromId.trim();
  const toId = input.toId.trim();
  if (!flowId) throw new Error("link.flowId is required");
  if (!fromId) throw new Error("link.fromId is required");
  if (!toId) throw new Error("link.toId is required");
  if (fromId === toId) throw new Error("link refuses self-loop");

  const flow = flows.get(flowId);
  if (!flow) throw new Error(`value flow not found: ${flowId}`);
  if (flow.status === "SETTLED") {
    throw new Error(`cannot link settled flow: ${flowId}`);
  }
  if (flow.status === "FAILED") {
    throw new Error(`cannot link failed flow: ${flowId}`);
  }

  if (!getEconomicNode(fromId)) {
    throw new Error(`from economic node not found: ${fromId}`);
  }
  if (!getEconomicNode(toId)) {
    throw new Error(`to economic node not found: ${toId}`);
  }

  const capacity = input.capacity ?? flow.amount;
  assertCapacity(capacity);

  const key = linkKey(fromId, toId);
  const link: FlowLink = {
    source: fromId,
    target: toId,
    flowId,
    capacity,
  };
  links.set(key, link);

  // Track hop when intermediate (not the terminal target-only hop from source)
  if (fromId !== flow.sourceId || toId !== flow.targetId) {
    if (fromId !== flow.sourceId && !flow.hops.includes(fromId)) {
      flow.hops = [...flow.hops, fromId];
    }
    if (
      toId !== flow.targetId &&
      toId !== flow.sourceId &&
      !flow.hops.includes(toId)
    ) {
      flow.hops = [...flow.hops, toId];
    }
  }

  flow.status = "LINKED";
  assertFlowStatus(flow.status);
  flows.set(flow.id, flow);

  return cloneLink(link);
}

/** Find directed flow paths from source to target via capacity links (BFS). */
export function getFlowPaths(
  sourceId: string,
  targetId: string,
  options?: { maxDepth?: number; flowId?: string },
): FlowPath[] {
  const source = sourceId.trim();
  const target = targetId.trim();
  if (!source) throw new Error("sourceId is required");
  if (!target) throw new Error("targetId is required");
  if (!getEconomicNode(source)) {
    throw new Error(`economic node not found: ${source}`);
  }
  if (!getEconomicNode(target)) {
    throw new Error(`economic node not found: ${target}`);
  }

  if (source === target) {
    return [
      {
        nodes: [source],
        links: [],
        minCapacity: Number.POSITIVE_INFINITY,
        flowId: options?.flowId,
      },
    ];
  }

  const maxDepth = options?.maxDepth ?? 8;
  const adjacency = new Map<string, FlowLink[]>();
  for (const link of links.values()) {
    if (options?.flowId && link.flowId !== options.flowId) continue;
    const list = adjacency.get(link.source) ?? [];
    list.push(link);
    adjacency.set(link.source, list);
  }

  type Frame = {
    node: string;
    path: string[];
    pathLinks: FlowLink[];
    minCapacity: number;
  };

  const paths: FlowPath[] = [];
  const queue: Frame[] = [
    {
      node: source,
      path: [source],
      pathLinks: [],
      minCapacity: Number.POSITIVE_INFINITY,
    },
  ];

  while (queue.length > 0) {
    const frame = queue.shift()!;
    if (frame.path.length - 1 > maxDepth) continue;

    for (const link of adjacency.get(frame.node) ?? []) {
      if (frame.path.includes(link.target)) continue;

      const nextPath = [...frame.path, link.target];
      const nextLinks = [...frame.pathLinks, cloneLink(link)];
      const minCapacity = Math.min(frame.minCapacity, link.capacity);

      if (link.target === target) {
        paths.push({
          nodes: nextPath,
          links: nextLinks,
          minCapacity:
            minCapacity === Number.POSITIVE_INFINITY ? 0 : minCapacity,
          flowId: options?.flowId ?? nextLinks[0]?.flowId,
        });
        continue;
      }

      if (nextPath.length - 1 < maxDepth) {
        queue.push({
          node: link.target,
          path: nextPath,
          pathLinks: nextLinks,
          minCapacity,
        });
      }
    }
  }

  return paths.sort(
    (a, b) =>
      b.minCapacity - a.minCapacity || a.nodes.length - b.nodes.length,
  );
}

/**
 * Settle a LINKED (or OPEN with a direct path) flow:
 * debit source, credit target, mark SETTLED.
 */
export function settleFlow(flowId: string): ValueFlow {
  const id = flowId.trim();
  const flow = flows.get(id);
  if (!flow) throw new Error(`value flow not found: ${id}`);
  if (flow.status === "SETTLED") {
    throw new Error(`flow already settled: ${id}`);
  }
  if (flow.status === "FAILED") {
    throw new Error(`cannot settle failed flow: ${id}`);
  }

  const source = getEconomicNode(flow.sourceId);
  const target = getEconomicNode(flow.targetId);
  if (!source) throw new Error(`source economic node not found: ${flow.sourceId}`);
  if (!target) throw new Error(`target economic node not found: ${flow.targetId}`);

  if (source.status === "SUSPENDED" || target.status === "SUSPENDED") {
    flow.status = "FAILED";
    flows.set(flow.id, flow);
    throw new Error(`cannot settle flow with SUSPENDED node: ${id}`);
  }

  // Prefer an explicit path for this flow; fall back to any path
  let paths = getFlowPaths(flow.sourceId, flow.targetId, {
    flowId: flow.id,
  });
  if (paths.length === 0) {
    paths = getFlowPaths(flow.sourceId, flow.targetId);
  }

  // Direct settlement allowed for OPEN/LINKED when no graph path yet
  // (atomic peer transfer) — still require balance
  if (paths.length === 0 && flow.status === "OPEN") {
    // auto-link direct edge
    linkFlow({
      flowId: flow.id,
      fromId: flow.sourceId,
      toId: flow.targetId,
      capacity: flow.amount,
    });
    paths = getFlowPaths(flow.sourceId, flow.targetId, { flowId: flow.id });
  }

  const best = paths[0];
  if (!best || best.minCapacity < flow.amount) {
    flow.status = "FAILED";
    flows.set(flow.id, flow);
    throw new Error(
      `insufficient flow capacity to settle ${id} (need ${flow.amount})`,
    );
  }

  if (source.balance < flow.amount) {
    flow.status = "FAILED";
    flows.set(flow.id, flow);
    throw new Error(
      `insufficient source balance: ${source.balance} < ${flow.amount}`,
    );
  }

  setEconomicNodeBalance(source.id, source.balance - flow.amount);
  setEconomicNodeBalance(target.id, target.balance + flow.amount);

  flow.status = "SETTLED";
  flow.settledAt = nowIso();
  flows.set(flow.id, flow);
  return cloneFlow(flow);
}

export function getValueFlow(id: string): ValueFlow | undefined {
  const flow = flows.get(id.trim());
  return flow ? cloneFlow(flow) : undefined;
}

export function listValueFlows(filter?: {
  status?: ValueFlowStatus;
  kind?: ValueFlowKind;
  nodeId?: string;
}): ValueFlow[] {
  let result = [...flows.values()];
  if (filter?.status) {
    result = result.filter((f) => f.status === filter.status);
  }
  if (filter?.kind) {
    result = result.filter((f) => f.kind === filter.kind);
  }
  if (filter?.nodeId) {
    const nodeId = filter.nodeId.trim();
    result = result.filter(
      (f) =>
        f.sourceId === nodeId ||
        f.targetId === nodeId ||
        f.hops.includes(nodeId),
    );
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFlow);
}

export function listFlowLinks(): FlowLink[] {
  return [...links.values()].map(cloneLink);
}

export function clearValueFlows(): void {
  flows.clear();
  links.clear();
}
