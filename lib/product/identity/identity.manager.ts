/**
 * Product Identity — Identity Foundation Manager
 */

import {
  clearAccess,
  evaluateAccess,
  getAccess,
  listAccess,
} from "./access/access.registry";
import type {
  AccessEvaluation,
  EvaluateAccessInput,
} from "./access/access.types";
import {
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
} from "./authentication/authentication.constants";
import {
  assertIdentityFoundationReadinessReady,
  evaluateIdentityFoundationReadiness,
} from "./authentication/authentication.readiness";
import {
  authenticate,
  clearAuthentications,
  getAuthentication,
  listAuthentications,
  updateAuthStatus,
} from "./authentication/authentication.registry";
import type {
  AuthenticateInput,
  AuthenticationRecord,
  IdentityManagerStatus,
  IdentityReadinessResult,
  IdentityRegistryManifest,
  UpdateAuthStatusInput,
} from "./authentication/authentication.types";
import {
  clearCredentials,
  getCredential,
  issueCredential,
  listCredentials,
} from "./credential/credential.registry";
import type {
  IdentityCredential,
  IssueCredentialInput,
} from "./credential/credential.types";
import {
  clearPrincipals,
  getPrincipal,
  listPrincipals,
  registerPrincipal,
} from "./principal/principal.registry";
import type {
  IdentityPrincipal,
  RegisterPrincipalInput,
} from "./principal/principal.types";
import {
  clearSessions,
  closeSession,
  getSession,
  listSessions,
  openSession,
} from "./session/session.registry";
import type {
  CloseSessionInput,
  IdentitySession,
  OpenSessionInput,
} from "./session/session.types";
import {
  clearTokens,
  getToken,
  issueToken,
  listTokens,
} from "./token/token.registry";
import type { IdentityToken, IssueTokenInput } from "./token/token.types";

export type IdentityManagerSnapshot = {
  managerId: string;
  status: IdentityManagerStatus;
  layerId: typeof PRODUCT_IDENTITY_FOUNDATION_ID;
  version: typeof PRODUCT_IDENTITY_FOUNDATION_VERSION;
  principalCount: number;
  authCount: number;
  sessionCount: number;
  tokenCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type IdentityManager = {
  initialize: () => IdentityManagerSnapshot;
  start: () => IdentityManagerSnapshot;
  stop: () => IdentityManagerSnapshot;
  status: () => IdentityManagerSnapshot;
  registerPrincipal: (input: RegisterPrincipalInput) => IdentityPrincipal;
  issueCredential: (input: IssueCredentialInput) => IdentityCredential;
  authenticate: (input: AuthenticateInput) => AuthenticationRecord;
  updateAuthStatus: (input: UpdateAuthStatusInput) => AuthenticationRecord;
  openSession: (input: OpenSessionInput) => IdentitySession;
  closeSession: (input: CloseSessionInput) => IdentitySession;
  issueToken: (input: IssueTokenInput) => IdentityToken;
  evaluateAccess: (input: EvaluateAccessInput) => AccessEvaluation;
  evaluateReadiness: () => IdentityReadinessResult;
  manifest: () => IdentityRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getIdentityRegistryManifest(): IdentityRegistryManifest {
  return {
    foundationId: PRODUCT_IDENTITY_FOUNDATION_ID,
    version: PRODUCT_IDENTITY_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_IDENTITY_FOUNDATION_BASE,
    authCount: listAuthentications().length,
    principalCount: listPrincipals().length,
    credentialCount: listCredentials().length,
    sessionCount: listSessions().length,
    tokenCount: listTokens().length,
    accessCount: listAccess().length,
  };
}

export function clearIdentityFoundationLayer(): void {
  clearAccess();
  clearTokens();
  clearSessions();
  clearAuthentications();
  clearCredentials();
  clearPrincipals();
}

export function createIdentityManager(options?: {
  managerId?: string;
}): IdentityManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-id-mgr");
  let state: IdentityManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): IdentityManagerSnapshot {
    const reg = getIdentityRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_IDENTITY_FOUNDATION_ID,
      version: PRODUCT_IDENTITY_FOUNDATION_VERSION,
      principalCount: reg.principalCount,
      authCount: reg.authCount,
      sessionCount: reg.sessionCount,
      tokenCount: reg.tokenCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): IdentityManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearIdentityFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): IdentityManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): IdentityManagerSnapshot {
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
    registerPrincipal: (input) => {
      assertRunning("registerPrincipal");
      return registerPrincipal(input);
    },
    issueCredential: (input) => {
      assertRunning("issueCredential");
      return issueCredential(input);
    },
    authenticate: (input) => {
      assertRunning("authenticate");
      if (!getPrincipal(input.principalId)) {
        throw new Error(`principal not found: ${input.principalId}`);
      }
      return authenticate(input);
    },
    updateAuthStatus: (input) => {
      assertRunning("updateAuthStatus");
      return updateAuthStatus(input);
    },
    openSession: (input) => {
      assertRunning("openSession");
      return openSession(input);
    },
    closeSession: (input) => {
      assertRunning("closeSession");
      return closeSession(input);
    },
    issueToken: (input) => {
      assertRunning("issueToken");
      return issueToken(input);
    },
    evaluateAccess: (input) => {
      assertRunning("evaluateAccess");
      return evaluateAccess(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateIdentityFoundationReadiness();
    },
    manifest: getIdentityRegistryManifest,
  };
}

export {
  assertIdentityFoundationReadinessReady,
  getAccess,
  getAuthentication,
  getCredential,
  getPrincipal,
  getSession,
  getToken,
  listAccess,
  listAuthentications,
  listCredentials,
  listPrincipals,
  listSessions,
  listTokens,
};
