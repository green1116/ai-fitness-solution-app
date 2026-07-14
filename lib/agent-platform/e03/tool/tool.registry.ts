/**
 * E03-P3 — Tool Registry (static enterprise catalog)
 */

import { AGENT_ROLES } from "../core/agent.constants";
import type { AgentRole } from "../core/agent.types";
import { assertToolContract, type ToolContract } from "./tool.contract";
import type { ToolInput, ToolOutput } from "./tool.types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function djb2(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function echoHandler(input: ToolInput): ToolOutput {
  return Object.freeze({
    kind: "echo",
    message: asString(input.message),
    echoedAt: "runtime",
  });
}

function inspectHandler(input: ToolInput): ToolOutput {
  const keys = Object.keys(input);
  return Object.freeze({
    kind: "inspect",
    keyCount: keys.length,
    keys,
  });
}

function transformHandler(input: ToolInput): ToolOutput {
  const text = asString(input.text).trim();
  const mode = asString(input.mode, "upper");
  const transformed =
    mode === "lower"
      ? text.toLowerCase()
      : mode === "title"
        ? text.replace(/\b\w/g, (c) => c.toUpperCase())
        : text.toUpperCase();
  return Object.freeze({
    kind: "transform",
    mode,
    text: transformed,
    length: transformed.length,
  });
}

function hashHandler(input: ToolInput): ToolOutput {
  const text = asString(input.text);
  return Object.freeze({
    kind: "hash",
    algorithm: "djb2",
    digest: djb2(text),
    length: text.length,
  });
}

function validateHandler(input: ToolInput): ToolOutput {
  const value = asString(input.value);
  const minLength =
    typeof input.minLength === "number" ? input.minLength : 1;
  const ok = value.trim().length >= minLength;
  return Object.freeze({
    kind: "validate",
    ok,
    minLength,
    actualLength: value.trim().length,
  });
}

const ALL_ROLES: AgentRole[] = [...AGENT_ROLES];

export const TOOL_CATALOG: ToolContract[] = [
  {
    id: "e03.tool.echo",
    name: "Echo Tool",
    kind: "utility",
    description: "Echoes a message payload for runtime probes",
    permissionLevel: "public",
    allowedRoles: ALL_ROLES,
    requiredInputKeys: ["message"],
    handler: echoHandler,
    readOnly: true,
  },
  {
    id: "e03.tool.inspect",
    name: "Inspect Tool",
    kind: "inspect",
    description: "Inspects input keys without side effects",
    permissionLevel: "agent",
    allowedRoles: ALL_ROLES,
    requiredInputKeys: [],
    handler: inspectHandler,
    readOnly: true,
  },
  {
    id: "e03.tool.transform",
    name: "Transform Tool",
    kind: "transform",
    description: "Transforms text case modes",
    permissionLevel: "agent",
    allowedRoles: ["planner", "worker", "tool", "coordinator"],
    requiredInputKeys: ["text"],
    handler: transformHandler,
    readOnly: true,
  },
  {
    id: "e03.tool.hash",
    name: "Hash Tool",
    kind: "transform",
    description: "Produces a deterministic djb2 digest",
    permissionLevel: "agent",
    allowedRoles: ["worker", "tool", "coordinator", "memory"],
    requiredInputKeys: ["text"],
    handler: hashHandler,
    readOnly: true,
  },
  {
    id: "e03.tool.validate",
    name: "Validate Tool",
    kind: "validate",
    description: "Validates string length constraints",
    permissionLevel: "agent",
    allowedRoles: ["critic", "worker", "coordinator", "tool"],
    requiredInputKeys: ["value"],
    handler: validateHandler,
    readOnly: true,
  },
  {
    id: "e03.tool.coordinator.ping",
    name: "Coordinator Ping",
    kind: "utility",
    description: "Coordinator-only health ping",
    permissionLevel: "coordinator",
    allowedRoles: ["coordinator"],
    requiredInputKeys: [],
    handler: () =>
      Object.freeze({
        kind: "ping",
        ok: true,
        scope: "coordinator",
      }),
    readOnly: true,
  },
];

export type ToolRegistryManifest = {
  toolCount: number;
  tools: ToolContract[];
  catalogComplete: boolean;
  readOnly: true;
};

export function buildToolRegistryManifest(
  tools: ToolContract[] = TOOL_CATALOG,
): ToolRegistryManifest {
  for (const tool of tools) {
    assertToolContract(tool);
  }
  const ids = new Set(tools.map((t) => t.id));
  if (ids.size !== tools.length) {
    throw new Error("Duplicate tool ids in catalog");
  }
  return {
    toolCount: tools.length,
    tools,
    catalogComplete: tools.length >= 5,
    readOnly: true,
  };
}

export function getToolById(id: string): ToolContract | undefined {
  return TOOL_CATALOG.find((t) => t.id === id);
}

export function listToolsByKind(
  kind: ToolContract["kind"],
): ToolContract[] {
  return TOOL_CATALOG.filter((t) => t.kind === kind);
}
