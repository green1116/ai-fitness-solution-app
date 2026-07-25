/**
 * Product Session — Session Control Manager
 */

import {
  PRODUCT_SESSION_CONTROL_BASE,
  PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
  PRODUCT_SESSION_CONTROL_ID,
  PRODUCT_SESSION_CONTROL_VERSION,
} from "./control/control.constants";
import {
  assertSessionControlReadinessReady,
  evaluateSessionControlReadiness,
} from "./control/control.readiness";
import type {
  SessionManagerStatus,
  SessionReadinessResult,
  SessionRegistryManifest,
} from "./control/control.types";
import {
  clearSessions,
  closeSession,
  getSession,
  listSessions,
  openSession,
  refreshSession,
} from "./lifecycle/lifecycle.registry";
import type {
  CloseControlledSessionInput,
  ControlledSession,
  OpenControlledSessionInput,
  RefreshSessionInput,
} from "./lifecycle/lifecycle.types";
import {
  clearRefreshes,
  getRefresh,
  listRefreshes,
  recordRefresh,
} from "./refresh/refresh.registry";
import type {
  RecordRefreshInput,
  SessionRefreshRecord,
} from "./refresh/refresh.types";
import {
  clearTokens,
  getToken,
  issueToken,
  listTokens,
  revokeToken,
  rotateToken,
} from "./token/token.registry";
import type {
  FlowToken,
  IssueFlowTokenInput,
  RevokeTokenInput,
  RotateTokenInput,
} from "./token/token.types";
import {
  clearValidations,
  getValidation,
  listValidations,
  validateSession,
} from "./validation/validation.registry";
import type {
  SessionValidation,
  ValidateSessionInput,
} from "./validation/validation.types";

export type SessionManagerSnapshot = {
  managerId: string;
  status: SessionManagerStatus;
  layerId: typeof PRODUCT_SESSION_CONTROL_ID;
  version: typeof PRODUCT_SESSION_CONTROL_VERSION;
  sessionCount: number;
  tokenCount: number;
  refreshCount: number;
  validationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SessionManager = {
  initialize: () => SessionManagerSnapshot;
  start: () => SessionManagerSnapshot;
  stop: () => SessionManagerSnapshot;
  status: () => SessionManagerSnapshot;
  openSession: (input: OpenControlledSessionInput) => ControlledSession;
  refreshSession: (input: RefreshSessionInput) => ControlledSession;
  closeSession: (input: CloseControlledSessionInput) => ControlledSession;
  issueToken: (input: IssueFlowTokenInput) => FlowToken;
  rotateToken: (input: RotateTokenInput) => FlowToken;
  revokeToken: (input: RevokeTokenInput) => FlowToken;
  recordRefresh: (input: RecordRefreshInput) => SessionRefreshRecord;
  validateSession: (input: ValidateSessionInput) => SessionValidation;
  evaluateReadiness: () => SessionReadinessResult;
  manifest: () => SessionRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSessionRegistryManifest(): SessionRegistryManifest {
  return {
    foundationId: PRODUCT_SESSION_CONTROL_ID,
    version: PRODUCT_SESSION_CONTROL_VERSION,
    freezeVersion: PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
    base: PRODUCT_SESSION_CONTROL_BASE,
    sessionCount: listSessions().length,
    tokenCount: listTokens().length,
    refreshCount: listRefreshes().length,
    validationCount: listValidations().length,
  };
}

export function clearSessionControlLayer(): void {
  clearValidations();
  clearRefreshes();
  clearTokens();
  clearSessions();
}

export function createSessionManager(options?: {
  managerId?: string;
}): SessionManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-sc-mgr");
  let state: SessionManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SessionManagerSnapshot {
    const reg = getSessionRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_SESSION_CONTROL_ID,
      version: PRODUCT_SESSION_CONTROL_VERSION,
      sessionCount: reg.sessionCount,
      tokenCount: reg.tokenCount,
      refreshCount: reg.refreshCount,
      validationCount: reg.validationCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SessionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSessionControlLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SessionManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SessionManagerSnapshot {
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
    openSession: (input) => {
      assertRunning("openSession");
      return openSession(input);
    },
    refreshSession: (input) => {
      assertRunning("refreshSession");
      return refreshSession(input);
    },
    closeSession: (input) => {
      assertRunning("closeSession");
      return closeSession(input);
    },
    issueToken: (input) => {
      assertRunning("issueToken");
      return issueToken(input);
    },
    rotateToken: (input) => {
      assertRunning("rotateToken");
      return rotateToken(input);
    },
    revokeToken: (input) => {
      assertRunning("revokeToken");
      return revokeToken(input);
    },
    recordRefresh: (input) => {
      assertRunning("recordRefresh");
      return recordRefresh(input);
    },
    validateSession: (input) => {
      assertRunning("validateSession");
      return validateSession(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateSessionControlReadiness();
    },
    manifest: getSessionRegistryManifest,
  };
}

export {
  assertSessionControlReadinessReady,
  getRefresh,
  getSession,
  getToken,
  getValidation,
  listRefreshes,
  listSessions,
  listTokens,
  listValidations,
};
