/**
 * E09-P1 — Global Network Node wrapper
 * Thin wrapper over e09/core GlobalNode for the graph engine
 */

import {
  GLOBAL_NODE_STATUSES,
  GLOBAL_NODE_TYPES,
} from "../core/global.constants";
import type {
  CreateGlobalNodeInput,
  GlobalNode,
  GlobalNodeMetadata,
  GlobalNodeStatus,
  GlobalNodeType,
} from "../core/global.types";

/** Graph-facing node view over the core GlobalNode model */
export type GlobalNetworkNode = GlobalNode & {
  /** Layer marker for graph engine consumers */
  layer: "e09-network";
};

export type GlobalNetworkNodeInput = CreateGlobalNodeInput & {
  status?: GlobalNodeStatus;
};

function assertNodeType(type: string): asserts type is GlobalNodeType {
  if (!(GLOBAL_NODE_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid node type: ${type}`);
  }
}

function assertNodeStatus(status: string): asserts status is GlobalNodeStatus {
  if (!(GLOBAL_NODE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid node status: ${status}`);
  }
}

/** Wrap a core GlobalNode as a GlobalNetworkNode. */
export function wrapGlobalNetworkNode(node: GlobalNode): GlobalNetworkNode {
  if (!node.id.trim()) throw new Error("node.id is required");
  assertNodeType(node.type);
  assertNodeStatus(node.status);

  return {
    id: node.id.trim(),
    type: node.type,
    status: node.status,
    metadata: { ...(node.metadata ?? {}) },
    layer: "e09-network",
  };
}

/** Create a graph node from input (defaults status to CONNECTED). */
export function createGlobalNetworkNode(
  input: GlobalNetworkNodeInput,
): GlobalNetworkNode {
  if (!input.id.trim()) throw new Error("node.id is required");
  assertNodeType(input.type);
  const status = input.status ?? "CONNECTED";
  assertNodeStatus(status);

  return wrapGlobalNetworkNode({
    id: input.id.trim(),
    type: input.type,
    status,
    metadata: { ...(input.metadata ?? {}) },
  });
}

/** Strip graph wrapper fields back to a core GlobalNode. */
export function toGlobalNode(node: GlobalNetworkNode): GlobalNode {
  return {
    id: node.id,
    type: node.type,
    status: node.status,
    metadata: { ...(node.metadata ?? {}) },
  };
}

export function cloneGlobalNetworkNode(
  node: GlobalNetworkNode,
  patch?: Partial<{
    status: GlobalNodeStatus;
    metadata: GlobalNodeMetadata;
  }>,
): GlobalNetworkNode {
  return wrapGlobalNetworkNode({
    id: node.id,
    type: node.type,
    status: patch?.status ?? node.status,
    metadata: { ...(patch?.metadata ?? node.metadata) },
  });
}
