/**
 * E09-P1 — Global Network Lifecycle
 * create → register → activate | suspend → remove
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
  GLOBAL_LIFECYCLE_STAGES,
  GLOBAL_LIFECYCLE_TRANSITIONS,
  GLOBAL_NODE_TYPES,
} from "./global.constants";
import {
  buildGlobalRegistryManifest,
  getNode,
  registerNode as registryRegisterNode,
  removeNode as registryRemoveNode,
  updateNodeStatus,
} from "./global.registry";
import type {
  CreateGlobalNodeInput,
  GlobalFoundationResult,
  GlobalLifecycleStage,
  GlobalLifecycleTransition,
  GlobalNode,
  GlobalNodeLifecycle,
} from "./global.types";

const lifecycles = new Map<string, GlobalNodeLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceGlobalLifecycle(
  from: GlobalLifecycleStage,
  to: GlobalLifecycleStage,
): boolean {
  return GLOBAL_LIFECYCLE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

function appendTransition(
  lifecycle: GlobalNodeLifecycle,
  to: GlobalLifecycleStage,
  note?: string,
): GlobalNodeLifecycle {
  if (!canAdvanceGlobalLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid global lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: GlobalLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
  };

  return {
    nodeId: lifecycle.nodeId,
    current: to,
    stages: [...GLOBAL_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
  };
}

function requireLifecycle(nodeId: string): GlobalNodeLifecycle {
  const lifecycle = lifecycles.get(nodeId);
  if (!lifecycle) {
    throw new Error(`lifecycle missing for node: ${nodeId}`);
  }
  return lifecycle;
}

/** Create a node in CONNECTED status (not yet registered). */
export function createNode(input: CreateGlobalNodeInput): GlobalNode {
  if (!input.id.trim()) throw new Error("node.id is required");
  if (!(GLOBAL_NODE_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`invalid node type: ${input.type}`);
  }
  if (lifecycles.has(input.id.trim())) {
    throw new Error(`node lifecycle already exists: ${input.id}`);
  }
  if (getNode(input.id)) {
    throw new Error(`node already registered: ${input.id}`);
  }

  const node: GlobalNode = {
    id: input.id.trim(),
    type: input.type,
    status: "CONNECTED",
    metadata: { ...(input.metadata ?? {}) },
  };

  lifecycles.set(node.id, {
    nodeId: node.id,
    current: "created",
    stages: [...GLOBAL_LIFECYCLE_STAGES],
    transitions: [],
  });

  return { ...node, metadata: { ...node.metadata } };
}

/** Register a created node into the global registry. */
export function registerNode(node: GlobalNode): GlobalNode {
  const lifecycle = requireLifecycle(node.id);
  if (lifecycle.current !== "created") {
    throw new Error(
      `registerNode requires created stage (current=${lifecycle.current})`,
    );
  }

  const registered = registryRegisterNode({
    ...node,
    status: "CONNECTED",
  });

  lifecycles.set(
    node.id,
    appendTransition(lifecycle, "registered", "node registered"),
  );

  return registered;
}

/** Activate a registered or suspended node. */
export function activateNode(id: string): GlobalNode {
  const lifecycle = requireLifecycle(id);
  const next =
    lifecycle.current === "registered" || lifecycle.current === "suspended"
      ? "activated"
      : null;
  if (!next) {
    throw new Error(
      `activateNode invalid from stage: ${lifecycle.current}`,
    );
  }

  const updated = updateNodeStatus(id, "ACTIVE");
  lifecycles.set(id, appendTransition(lifecycle, next, "node activated"));
  return updated;
}

/** Suspend an active node. */
export function suspendNode(id: string): GlobalNode {
  const lifecycle = requireLifecycle(id);
  if (lifecycle.current !== "activated") {
    throw new Error(
      `suspendNode requires activated stage (current=${lifecycle.current})`,
    );
  }

  const updated = updateNodeStatus(id, "SUSPENDED");
  lifecycles.set(
    id,
    appendTransition(lifecycle, "suspended", "node suspended"),
  );
  return updated;
}

/** Remove a node from registry and close its lifecycle. */
export function removeNode(id: string): boolean {
  const lifecycle = requireLifecycle(id);
  if (
    lifecycle.current !== "registered" &&
    lifecycle.current !== "activated" &&
    lifecycle.current !== "suspended"
  ) {
    throw new Error(
      `removeNode invalid from stage: ${lifecycle.current}`,
    );
  }

  const removed = registryRemoveNode(id);
  if (!removed) {
    throw new Error(`node not found in registry: ${id}`);
  }

  lifecycles.set(
    id,
    appendTransition(lifecycle, "removed", "node removed"),
  );
  return true;
}

export function getNodeLifecycle(
  nodeId: string,
): GlobalNodeLifecycle | undefined {
  const lifecycle = lifecycles.get(nodeId.trim());
  if (!lifecycle) return undefined;
  return {
    ...lifecycle,
    stages: [...lifecycle.stages],
    transitions: [...lifecycle.transitions],
  };
}

export function clearLifecycles(): void {
  lifecycles.clear();
}

export function buildGlobalNetworkFoundation(): GlobalFoundationResult {
  const registry = buildGlobalRegistryManifest();
  const ready = true;

  return {
    platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
    version: E09_GLOBAL_NETWORK_VERSION,
    freezeVersion: E09_GLOBAL_NETWORK_FREEZE_VERSION,
    base: E09_GLOBAL_NETWORK_BASE,
    registry,
    ready,
    summary: [
      `e09-global-network-foundation ready=${ready}`,
      `platform=${E09_GLOBAL_NETWORK_PLATFORM_ID}`,
      `base=${E09_GLOBAL_NETWORK_BASE}`,
      `nodes=${registry.nodeCount}`,
      `edges=${registry.edgeCount}`,
      `freeze=${E09_GLOBAL_NETWORK_FREEZE_VERSION}`,
    ].join(" "),
  };
}
