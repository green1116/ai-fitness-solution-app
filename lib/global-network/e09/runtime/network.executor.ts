/**
 * E09-P1 — Global Network Runtime Executor
 * Executes graph actions (connect / disconnect / node ops) with tracing
 */

import type { GlobalEdgeRelation, NetworkEdge } from "../core/global.types";
import type { ConnectInput, NetworkGraph } from "../network/network.graph";
import type { GlobalNetworkNode } from "../network/network.node";
import type { GlobalNode } from "../core/global.types";
import type { NetworkTraceStore } from "./network.trace";

export type NetworkActionKind =
  | "add_node"
  | "remove_node"
  | "connect"
  | "disconnect";

export type NetworkAction =
  | {
      kind: "add_node";
      node: GlobalNetworkNode | GlobalNode;
    }
  | {
      kind: "remove_node";
      nodeId: string;
    }
  | {
      kind: "connect";
      source: string;
      target: string;
      relation: GlobalEdgeRelation;
      weight?: number;
    }
  | {
      kind: "disconnect";
      source: string;
      target: string;
      relation?: GlobalEdgeRelation;
    };

export type NetworkExecutionResult = {
  success: boolean;
  action: NetworkActionKind;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
};

export type NetworkExecutor = {
  execute: (action: NetworkAction) => NetworkExecutionResult;
  connectNodes: (input: ConnectInput) => NetworkExecutionResult;
  disconnectNodes: (
    source: string,
    target: string,
    relation?: GlobalEdgeRelation,
  ) => NetworkExecutionResult;
};

export function createNetworkExecutor(input: {
  graph: NetworkGraph;
  traces: NetworkTraceStore;
  /** When false, executor refuses actions (runtime not running). */
  isRunning: () => boolean;
}): NetworkExecutor {
  const { graph, traces, isRunning } = input;

  function fail(
    action: NetworkActionKind,
    startedAt: number,
    message: string,
  ): NetworkExecutionResult {
    traces.record("error", message, { action });
    return {
      success: false,
      action,
      output: {},
      duration: Date.now() - startedAt,
      status: "failed",
      errorMessage: message,
    };
  }

  function execute(action: NetworkAction): NetworkExecutionResult {
    const startedAt = Date.now();

    if (!isRunning()) {
      return fail(action.kind, startedAt, "runtime is not running");
    }

    traces.record("action", `execute ${action.kind}`, { kind: action.kind });

    try {
      switch (action.kind) {
        case "add_node": {
          const node = graph.addNode(action.node);
          traces.record("result", `node added ${node.id}`, {
            nodeId: node.id,
            type: node.type,
          });
          return {
            success: true,
            action: action.kind,
            output: Object.freeze({ nodeId: node.id, type: node.type }),
            duration: Date.now() - startedAt,
            status: "result",
          };
        }
        case "remove_node": {
          const removed = graph.removeNode(action.nodeId);
          if (!removed) {
            return fail(
              action.kind,
              startedAt,
              `node not found: ${action.nodeId}`,
            );
          }
          traces.record("result", `node removed ${action.nodeId}`, {
            nodeId: action.nodeId,
          });
          return {
            success: true,
            action: action.kind,
            output: Object.freeze({ nodeId: action.nodeId, removed: true }),
            duration: Date.now() - startedAt,
            status: "result",
          };
        }
        case "connect": {
          const edge = graph.connect({
            source: action.source,
            target: action.target,
            relation: action.relation,
            weight: action.weight,
          });
          traces.record(
            "connect",
            `connected ${edge.source} → ${edge.target} (${edge.relation})`,
            {
              source: edge.source,
              target: edge.target,
              relation: edge.relation,
              weight: String(edge.weight),
            },
          );
          traces.record("result", "connect ok", {
            source: edge.source,
            target: edge.target,
          });
          return {
            success: true,
            action: action.kind,
            output: Object.freeze({ edge }),
            duration: Date.now() - startedAt,
            status: "result",
          };
        }
        case "disconnect": {
          const count = graph.disconnect(
            action.source,
            action.target,
            action.relation,
          );
          traces.record(
            "disconnect",
            `disconnected ${action.source} → ${action.target} count=${count}`,
            {
              source: action.source,
              target: action.target,
              relation: action.relation ?? "*",
              removed: String(count),
            },
          );
          traces.record("result", "disconnect ok", {
            removed: String(count),
          });
          return {
            success: true,
            action: action.kind,
            output: Object.freeze({
              source: action.source,
              target: action.target,
              removed: count,
            }),
            duration: Date.now() - startedAt,
            status: "result",
          };
        }
        default: {
          const _exhaustive: never = action;
          return fail(
            "connect",
            startedAt,
            `unknown action: ${JSON.stringify(_exhaustive)}`,
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "network action failed";
      return fail(action.kind, startedAt, message);
    }
  }

  return {
    execute,
    connectNodes: (connectInput) =>
      execute({
        kind: "connect",
        source: connectInput.source,
        target: connectInput.target,
        relation: connectInput.relation,
        weight: connectInput.weight,
      }),
    disconnectNodes: (source, target, relation) =>
      execute({
        kind: "disconnect",
        source,
        target,
        relation,
      }),
  };
}

export type { NetworkEdge };
