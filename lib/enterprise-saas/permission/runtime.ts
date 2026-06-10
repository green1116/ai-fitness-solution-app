import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildPermissionGrants, PERMISSION_DOMAINS } from "./builders";
import type { PermissionRuntimePayload } from "./types";
import { PERMISSION_RUNTIME_VERSION } from "./types";

export function validatePermissionRuntime(input?: { deploymentId?: string }): {
  grantsValid: boolean;
  domainsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "permission-default";
  const grants = buildPermissionGrants({ deploymentId });
  const domains = new Set(grants.map((grant) => grant.domain));

  return {
    grantsValid: grants.length === 5 * 5,
    domainsValid: PERMISSION_DOMAINS.every((domain) => domains.has(domain)),
  };
}

export function runPermissionRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<PermissionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "permission-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const grants = runStage(
    "permission-grants",
    "Permission Grants",
    () => buildPermissionGrants({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "permission-validate",
    "Permission Validation",
    () => validatePermissionRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Permission runtime validation failed");
  }

  const payload: PermissionRuntimePayload = {
    version: PERMISSION_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    grants,
    summary: `permission-runtime grants=${grants.length} domains=${PERMISSION_DOMAINS.length}`,
  };

  return finalizeRuntime({
    domain: "permission",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
