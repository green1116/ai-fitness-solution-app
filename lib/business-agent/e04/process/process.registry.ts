/**
 * E04-P3 — Business Process Registry
 * Processes compose E04 workflows into orchestrated graphs
 */

import { getWorkflowById } from "../workflow/workflow.registry";
import {
  E04_PROCESS_BASE,
  E04_PROCESS_FREEZE_VERSION,
  E04_PROCESS_ORCHESTRATION_ID,
  E04_PROCESS_VERSION,
} from "./process.constants";
import { buildProcessGraph, isProcessGraphAcyclic } from "./process.graph";
import type {
  ProcessDefinition,
  ProcessNodeDefinition,
  ProcessRegistryManifest,
} from "./process.types";

export const PROCESS_CATALOG: ProcessDefinition[] = [
  {
    id: "e04.process.enterprise-response",
    name: "Enterprise Response Process",
    description: "Quick intake then full tender response workflow",
    optional: false,
    readOnly: true,
    nodes: [
      {
        id: "node.intake",
        name: "Quick Intake",
        description: "Run quick intake workflow",
        workflowId: "e04.workflow.quick-intake",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "node.response",
        name: "Tender Response",
        description: "Run full tender response workflow",
        workflowId: "e04.workflow.tender-response",
        dependsOn: ["node.intake"],
        optional: false,
        readOnly: true,
      },
    ],
  },
  {
    id: "e04.process.intake-only",
    name: "Intake Only Process",
    description: "Single-node intake orchestration",
    optional: true,
    readOnly: true,
    nodes: [
      {
        id: "node.intake",
        name: "Quick Intake",
        description: "Run quick intake workflow alone",
        workflowId: "e04.workflow.quick-intake",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
    ],
  },
];

function assertNode(node: ProcessNodeDefinition): void {
  if (!node.id.trim()) throw new Error("process node.id is required");
  if (!node.name.trim()) throw new Error("process node.name is required");
  if (node.readOnly !== true) throw new Error("node.readOnly must be true");

  const workflow = getWorkflowById(node.workflowId);
  if (!workflow) {
    throw new Error(`unknown workflow: ${node.workflowId}`);
  }
}

export function assertProcessDefinition(process: ProcessDefinition): void {
  if (!process.id.trim()) throw new Error("process.id is required");
  if (!process.name.trim()) throw new Error("process.name is required");
  if (process.readOnly !== true) throw new Error("readOnly must be true");
  if (process.nodes.length === 0) {
    throw new Error(`process ${process.id} has no nodes`);
  }

  const ids = new Set(process.nodes.map((n) => n.id));
  if (ids.size !== process.nodes.length) {
    throw new Error(`duplicate node ids in ${process.id}`);
  }

  for (const node of process.nodes) {
    assertNode(node);
    for (const dep of node.dependsOn) {
      if (!ids.has(dep)) {
        throw new Error(`missing dependency ${dep} in ${process.id}`);
      }
    }
  }

  if (!isProcessGraphAcyclic(process.nodes)) {
    throw new Error(`cyclic process graph: ${process.id}`);
  }
}

export function buildProcessRegistryManifest(
  processes: ProcessDefinition[] = PROCESS_CATALOG,
): ProcessRegistryManifest {
  for (const process of processes) {
    assertProcessDefinition(process);
    const graph = buildProcessGraph(process);
    if (!graph.acyclic || graph.order.length !== process.nodes.length) {
      throw new Error(`invalid graph for ${process.id}`);
    }
  }

  const required = processes.some((p) => !p.optional);
  if (!required) {
    throw new Error("process catalog missing required process");
  }

  return {
    orchestrationId: E04_PROCESS_ORCHESTRATION_ID,
    version: E04_PROCESS_VERSION,
    freezeVersion: E04_PROCESS_FREEZE_VERSION,
    base: E04_PROCESS_BASE,
    processCount: processes.length,
    processes,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getProcessById(id: string): ProcessDefinition | undefined {
  return PROCESS_CATALOG.find((p) => p.id === id);
}

export function listRequiredProcesses(): ProcessDefinition[] {
  return PROCESS_CATALOG.filter((p) => !p.optional);
}
