import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildRoleDefinitions, ROLE_KINDS } from "./builders";
import type { RoleRuntimePayload } from "./types";
import { ROLE_RUNTIME_VERSION } from "./types";

export function validateRoleRuntime(input?: { deploymentId?: string }): {
  rolesValid: boolean;
  hierarchyValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "role-default";
  const roles = buildRoleDefinitions({ deploymentId });
  const kinds = new Set(roles.map((role) => role.kind));
  const levels = roles.map((role) => role.hierarchyLevel);
  const sorted = [...levels].sort((a, b) => b - a);

  return {
    rolesValid:
      roles.length === ROLE_KINDS.length &&
      ROLE_KINDS.every((kind) => kinds.has(kind)),
    hierarchyValid:
      levels.length === sorted.length &&
      levels.every((level, index) => level === sorted[index]),
  };
}

export function runRoleRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<RoleRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "role-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const roles = runStage(
    "role-definitions",
    "Role Definitions",
    () => buildRoleDefinitions({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "role-validate",
    "Role Validation",
    () => validateRoleRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Role runtime validation failed");
  }

  const payload: RoleRuntimePayload = {
    version: ROLE_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    roles,
    summary: `role-runtime roles=${roles.length} kinds=${ROLE_KINDS.join(",")}`,
  };

  return finalizeRuntime({
    domain: "role",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
