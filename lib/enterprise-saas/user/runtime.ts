import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildUserMemberships, buildUserProfiles } from "./builders";
import type { UserRuntimePayload } from "./types";
import { USER_RUNTIME_VERSION } from "./types";

export function validateUserRuntime(input?: { deploymentId?: string }): {
  profilesValid: boolean;
  membershipsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "user-default";
  const profiles = buildUserProfiles({ deploymentId });
  const memberships = buildUserMemberships({ deploymentId, profiles });

  return {
    profilesValid:
      profiles.length >= 3 &&
      profiles.some((p) => p.status === "active") &&
      profiles.some((p) => p.status === "invited"),
    membershipsValid:
      memberships.length === profiles.length &&
      memberships.every((m) => m.workspaceId.length > 0),
  };
}

export function runUserRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<UserRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "user-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const profiles = runStage(
    "user-profiles",
    "User Profiles",
    () => buildUserProfiles({ deploymentId }),
    stages,
  );
  const memberships = runStage(
    "user-memberships",
    "User Memberships",
    () => buildUserMemberships({ deploymentId, profiles }),
    stages,
  );

  const validation = runStage(
    "user-validate",
    "User Validation",
    () => validateUserRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("User runtime validation failed");
  }

  const payload: UserRuntimePayload = {
    version: USER_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    profiles,
    memberships,
    summary: `user-runtime profiles=${profiles.length} memberships=${memberships.length} active=${profiles.filter((p) => p.status === "active").length}`,
  };

  return finalizeRuntime({
    domain: "user",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
