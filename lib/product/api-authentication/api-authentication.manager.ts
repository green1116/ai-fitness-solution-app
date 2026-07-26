/**
 * Product API Authentication — Manager
 */

import {
  buildApiAuthenticationContext,
  clearApiAuthenticationContexts,
  getApiAuthenticationContext,
  listApiAuthenticationContexts,
} from "./context/context.registry";
import type {
  ApiAuthenticationContext,
  BuildApiAuthenticationContextInput,
} from "./context/context.types";
import {
  clearApiCredentials,
  getApiCredential,
  listApiCredentials,
  registerApiCredential,
  updateApiCredentialStatus,
} from "./credential/credential.registry";
import type {
  ApiCredential,
  RegisterApiCredentialInput,
  UpdateApiCredentialStatusInput,
} from "./credential/credential.types";
import {
  clearApiIdentityMappings,
  getApiIdentityMapping,
  listApiIdentityMappings,
  mapApiIdentity,
} from "./identity/identity.registry";
import type {
  ApiIdentityMapping,
  MapApiIdentityInput,
} from "./identity/identity.types";
import {
  clearApiAuthKeys,
  getApiAuthKey,
  issueApiAuthKey,
  listApiAuthKeys,
} from "./key/key.registry";
import type { ApiAuthKey, IssueApiAuthKeyInput } from "./key/key.types";
import {
  clearApiAuthenticationReleaseManifests,
  createApiAuthenticationReleaseManifest,
  getApiAuthenticationReleaseManifest,
  listApiAuthenticationReleaseManifests,
  type ApiAuthenticationReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "./management/management.constants";
import {
  assertApiAuthenticationReadinessReady,
  evaluateApiAuthenticationReadiness,
} from "./management/management.readiness";
import type {
  ApiAuthManagerStatus,
  ApiAuthReadinessResult,
  ApiAuthRegistryManifest,
} from "./management/management.types";
import {
  clearApiTokenValidations,
  getApiTokenValidation,
  listApiTokenValidations,
  validateApiToken,
} from "./token/token.registry";
import type {
  ApiTokenValidation,
  ValidateApiTokenInput,
} from "./token/token.types";

export type ApiAuthManagerSnapshot = {
  managerId: string;
  status: ApiAuthManagerStatus;
  layerId: typeof PRODUCT_API_AUTHENTICATION_ID;
  version: typeof PRODUCT_API_AUTHENTICATION_VERSION;
  credentialCount: number;
  keyCount: number;
  tokenValidationCount: number;
  identityCount: number;
  contextCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiAuthManager = {
  initialize: () => ApiAuthManagerSnapshot;
  start: () => ApiAuthManagerSnapshot;
  stop: () => ApiAuthManagerSnapshot;
  status: () => ApiAuthManagerSnapshot;
  registerCredential: (input: RegisterApiCredentialInput) => ApiCredential;
  updateCredentialStatus: (
    input: UpdateApiCredentialStatusInput,
  ) => ApiCredential;
  issueKey: (input: IssueApiAuthKeyInput) => ApiAuthKey;
  validateToken: (input: ValidateApiTokenInput) => ApiTokenValidation;
  mapIdentity: (input: MapApiIdentityInput) => ApiIdentityMapping;
  buildContext: (
    input: BuildApiAuthenticationContextInput,
  ) => ApiAuthenticationContext;
  createReleaseManifest: (input: {
    id?: string;
    credentialId: string;
  }) => ApiAuthenticationReleaseManifest;
  evaluateReadiness: () => ApiAuthReadinessResult;
  manifest: () => ApiAuthRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiAuthRegistryManifest(): ApiAuthRegistryManifest {
  return {
    authenticationId: PRODUCT_API_AUTHENTICATION_ID,
    version: PRODUCT_API_AUTHENTICATION_VERSION,
    freezeVersion: PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
    base: PRODUCT_API_AUTHENTICATION_BASE,
    credentialCount: listApiCredentials().length,
    keyCount: listApiAuthKeys().length,
    tokenValidationCount: listApiTokenValidations().length,
    identityCount: listApiIdentityMappings().length,
    contextCount: listApiAuthenticationContexts().length,
    releaseCount: listApiAuthenticationReleaseManifests().length,
  };
}

export function clearApiAuthenticationLayer(): void {
  clearApiAuthenticationReleaseManifests();
  clearApiAuthenticationContexts();
  clearApiIdentityMappings();
  clearApiTokenValidations();
  clearApiAuthKeys();
  clearApiCredentials();
}

export function createApiAuthManager(options?: {
  managerId?: string;
}): ApiAuthManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-apiauth-mgr");
  let state: ApiAuthManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ApiAuthManagerSnapshot {
    const reg = getApiAuthRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_AUTHENTICATION_ID,
      version: PRODUCT_API_AUTHENTICATION_VERSION,
      credentialCount: reg.credentialCount,
      keyCount: reg.keyCount,
      tokenValidationCount: reg.tokenValidationCount,
      identityCount: reg.identityCount,
      contextCount: reg.contextCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ApiAuthManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiAuthenticationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ApiAuthManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ApiAuthManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerCredential: (input) => {
      assertRunning("registerCredential");
      return registerApiCredential(input);
    },
    updateCredentialStatus: (input) => {
      assertRunning("updateCredentialStatus");
      return updateApiCredentialStatus(input);
    },
    issueKey: (input) => {
      assertRunning("issueKey");
      return issueApiAuthKey(input);
    },
    validateToken: (input) => {
      assertRunning("validateToken");
      return validateApiToken(input);
    },
    mapIdentity: (input) => {
      assertRunning("mapIdentity");
      return mapApiIdentity(input);
    },
    buildContext: (input) => {
      assertRunning("buildContext");
      return buildApiAuthenticationContext(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiAuthenticationReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiAuthenticationReadiness();
    },
    manifest: getApiAuthRegistryManifest,
  };
}

export {
  assertApiAuthenticationReadinessReady,
  getApiAuthKey,
  getApiAuthenticationContext,
  getApiAuthenticationReleaseManifest,
  getApiCredential,
  getApiIdentityMapping,
  getApiTokenValidation,
  listApiAuthKeys,
  listApiAuthenticationContexts,
  listApiAuthenticationReleaseManifests,
  listApiCredentials,
  listApiIdentityMappings,
  listApiTokenValidations,
};
