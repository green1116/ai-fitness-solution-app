/**
 * E08-P2 — Multi Organization Network Executor
 * Runs network graphs via the E08 ecosystem partner executor
 */

import { getPartnerById } from "../core/ecosystem.registry";
import { createEcosystemExecutionContext } from "../runtime/ecosystem.context";
import { executeEcosystemPartner } from "../runtime/ecosystem.executor";
import { buildNetworkGraph } from "./network.graph";
import {
  appendNetworkTraceEvent,
  createNetworkRuntimeTrace,
  type NetworkRuntimeTrace,
} from "./network.trace";
import type {
  NetworkDefinition,
  NetworkExecutionResult,
  OrganizationNodeResult,
} from "./network.types";

export type NetworkExecuteBundle = {
  result: NetworkExecutionResult;
  trace: NetworkRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeNetwork(
  network: NetworkDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): NetworkExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("net-inst");
  const taskId = options?.taskId?.trim() || createId("net-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createNetworkRuntimeTrace({
    instanceId,
    networkId: network.id,
    taskId,
  });

  trace = appendNetworkTraceEvent(
    trace,
    "ready",
    `network ${network.id} ready`,
    { kind: network.kind },
  );

  const nodeResults: OrganizationNodeResult[] = [];

  const fail = (
    graph: NetworkExecutionResult["graph"],
    status: "blocked" | "failed",
    message: string,
  ): NetworkExecuteBundle => {
    trace = appendNetworkTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        networkId: network.id,
        kind: network.kind,
        instanceId,
        taskId,
        traceId: trace.traceId,
        graph,
        nodeResults: [...nodeResults],
        completedNodes: nodeResults.filter((n) => n.success).length,
        output: {},
        duration: Date.now() - startedAt,
        status,
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const graph = buildNetworkGraph(network);
    if (!graph.acyclic) {
      return fail(graph, "failed", `network graph is cyclic: ${network.id}`);
    }

    trace = appendNetworkTraceEvent(
      trace,
      "graph",
      `graph ready nodes=${graph.nodes.length} edges=${graph.edges.length} order=${graph.order.join("→")}`,
      {
        nodeCount: String(graph.nodes.length),
        edgeCount: String(graph.edges.length),
      },
    );

    const nodeById = new Map(network.nodes.map((n) => [n.id, n]));
    let orderIndex = 0;

    for (const nodeId of graph.order) {
      orderIndex += 1;
      const node = nodeById.get(nodeId);
      if (!node) {
        return fail(graph, "failed", `unknown organization node: ${nodeId}`);
      }

      const partner = getPartnerById(node.partnerId);
      if (!partner) {
        return fail(graph, "failed", `unknown partner: ${node.partnerId}`);
      }

      trace = appendNetworkTraceEvent(
        trace,
        "node",
        `node ${orderIndex}/${graph.order.length}: ${node.name}`,
        {
          nodeId: node.id,
          partnerId: node.partnerId,
          relationshipId: node.relationshipId,
        },
      );

      const context = createEcosystemExecutionContext({
        partnerId: partner.id,
        workerId: partner.workerId,
        relationshipId: node.relationshipId,
        taskId: `${taskId}:node-${orderIndex}`,
        input: {
          ...input,
          networkId: network.id,
          networkKind: network.kind,
          organizationNodeId: node.id,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `network:${network.kind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e08-network",
          networkId: network.id,
          organizationNodeId: node.id,
        },
      });

      const run = executeEcosystemPartner(partner, context);

      const nodeResult: OrganizationNodeResult = {
        nodeId: node.id,
        order: orderIndex,
        partnerId: node.partnerId,
        relationshipId: node.relationshipId,
        success: run.result.success,
        status: run.result.status,
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      };
      nodeResults.push(nodeResult);

      trace = appendNetworkTraceEvent(
        trace,
        "partner",
        `partner ${node.partnerId} status=${run.result.status}`,
        { success: String(run.result.success) },
      );

      if (!run.result.success) {
        const status = run.result.status === "blocked" ? "blocked" : "failed";
        return fail(
          graph,
          status,
          `node ${orderIndex} ${status}: ${run.result.errorMessage ?? "unknown"}`,
        );
      }
    }

    const duration = Date.now() - startedAt;
    const result: NetworkExecutionResult = {
      success: true,
      networkId: network.id,
      kind: network.kind,
      instanceId,
      taskId,
      traceId: trace.traceId,
      graph,
      nodeResults: [...nodeResults],
      completedNodes: nodeResults.length,
      output: Object.freeze({
        networkId: network.id,
        kind: network.kind,
        nodeCount: graph.nodes.length,
        completedNodes: nodeResults.length,
        order: graph.order,
        partners: nodeResults.map((n) => n.partnerId),
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendNetworkTraceEvent(
      trace,
      "result",
      `result ready nodes=${nodeResults.length}/${graph.order.length} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "network failed";
    return fail(
      {
        networkId: network.id,
        kind: network.kind,
        nodes: [],
        edges: [],
        order: [],
        acyclic: false,
        readOnly: true,
      },
      "failed",
      message,
    );
  }
}

export function executeNetworkOrThrow(
  network: NetworkDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): NetworkExecuteBundle & {
  result: NetworkExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeNetwork(network, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 network execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as NetworkExecuteBundle & {
    result: NetworkExecutionResult & { success: true; status: "result" };
  };
}
