/**
 * E03-P3 — Tool Contract
 */

import type { AgentRole } from "../core/agent.types";
import type {
  ToolInput,
  ToolKind,
  ToolOutput,
  ToolPermissionLevel,
} from "./tool.types";

export type ToolHandler = (input: ToolInput) => ToolOutput;

export type ToolContract = {
  id: string;
  name: string;
  kind: ToolKind;
  description: string;
  permissionLevel: ToolPermissionLevel;
  allowedRoles: AgentRole[];
  requiredInputKeys: string[];
  handler: ToolHandler;
  readOnly: true;
};

export function assertToolContract(contract: ToolContract): void {
  if (!contract.id.trim()) throw new Error("tool.id is required");
  if (!contract.name.trim()) throw new Error("tool.name is required");
  if (!Array.isArray(contract.allowedRoles) || contract.allowedRoles.length < 1) {
    throw new Error("tool.allowedRoles must be non-empty");
  }
  if (!Array.isArray(contract.requiredInputKeys)) {
    throw new Error("tool.requiredInputKeys must be an array");
  }
  if (typeof contract.handler !== "function") {
    throw new Error("tool.handler must be a function");
  }
  if (contract.readOnly !== true) {
    throw new Error("tool.readOnly must be true");
  }
}

export function validateToolInput(
  contract: ToolContract,
  input: ToolInput,
): { ok: true } | { ok: false; missing: string[] } {
  const missing = contract.requiredInputKeys.filter((key) => {
    const value = input[key];
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim().length === 0) return true;
    return false;
  });
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}
