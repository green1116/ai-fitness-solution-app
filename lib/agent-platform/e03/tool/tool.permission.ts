/**
 * E03-P3 — Tool Permission Gate
 */

import type { ToolContract } from "./tool.contract";
import type { ToolCaller, ToolPermissionLevel } from "./tool.types";

export type ToolPermissionDecision = {
  allowed: boolean;
  level: ToolPermissionLevel;
  reason: string;
  readOnly: true;
};

export function evaluateToolPermission(
  contract: ToolContract,
  caller: ToolCaller,
): ToolPermissionDecision {
  if (contract.permissionLevel === "denied") {
    return {
      allowed: false,
      level: "denied",
      reason: `tool ${contract.id} is permanently denied`,
      readOnly: true,
    };
  }

  if (!contract.allowedRoles.includes(caller.role)) {
    return {
      allowed: false,
      level: contract.permissionLevel,
      reason: `role ${caller.role} is not in allowedRoles for ${contract.id}`,
      readOnly: true,
    };
  }

  if (
    contract.permissionLevel === "coordinator" &&
    caller.role !== "coordinator"
  ) {
    return {
      allowed: false,
      level: "coordinator",
      reason: `tool ${contract.id} requires coordinator role`,
      readOnly: true,
    };
  }

  if (!caller.agentId.trim()) {
    return {
      allowed: false,
      level: contract.permissionLevel,
      reason: "caller.agentId is required",
      readOnly: true,
    };
  }

  return {
    allowed: true,
    level: contract.permissionLevel,
    reason: `authorized ${caller.role} → ${contract.id}`,
    readOnly: true,
  };
}

export function assertToolPermission(
  contract: ToolContract,
  caller: ToolCaller,
): void {
  const decision = evaluateToolPermission(contract, caller);
  if (!decision.allowed) {
    throw new Error(`Tool permission denied: ${decision.reason}`);
  }
}
