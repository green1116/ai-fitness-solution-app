/**
 * Product SSO — Enterprise SSO Federation Manager
 */

import {
  clearAssertions,
  federateAssertion,
  getAssertion,
  listAssertions,
} from "./assertion/assertion.registry";
import type {
  FederateAssertionInput,
  SsoAssertion,
} from "./assertion/assertion.types";
import {
  clearConnections,
  getConnection,
  linkConnection,
  listConnections,
  updateConnectionStatus,
} from "./connection/connection.registry";
import type {
  LinkConnectionInput,
  SsoConnection,
  UpdateConnectionStatusInput,
} from "./connection/connection.types";
import {
  clearExchanges,
  exchangeSession,
  getExchange,
  listExchanges,
} from "./exchange/exchange.registry";
import type {
  ExchangeSessionInput,
  SsoExchange,
} from "./exchange/exchange.types";
import {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
} from "./federation/federation.constants";
import {
  assertSsoFederationReadinessReady,
  evaluateSsoFederationReadiness,
} from "./federation/federation.readiness";
import type {
  SsoManagerStatus,
  SsoReadinessResult,
  SsoRegistryManifest,
} from "./federation/federation.types";
import {
  activateProvider,
  clearProviders,
  disableProvider,
  getProvider,
  listProviders,
  registerProvider,
} from "./provider/provider.registry";
import type {
  ActivateProviderInput,
  DisableProviderInput,
  RegisterProviderInput,
  SsoProvider,
} from "./provider/provider.types";

export type SsoManagerSnapshot = {
  managerId: string;
  status: SsoManagerStatus;
  layerId: typeof PRODUCT_SSO_FEDERATION_ID;
  version: typeof PRODUCT_SSO_FEDERATION_VERSION;
  providerCount: number;
  connectionCount: number;
  assertionCount: number;
  exchangeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type SsoManager = {
  initialize: () => SsoManagerSnapshot;
  start: () => SsoManagerSnapshot;
  stop: () => SsoManagerSnapshot;
  status: () => SsoManagerSnapshot;
  registerProvider: (input: RegisterProviderInput) => SsoProvider;
  activateProvider: (input: ActivateProviderInput) => SsoProvider;
  disableProvider: (input: DisableProviderInput) => SsoProvider;
  linkConnection: (input: LinkConnectionInput) => SsoConnection;
  updateConnectionStatus: (
    input: UpdateConnectionStatusInput,
  ) => SsoConnection;
  federateAssertion: (input: FederateAssertionInput) => SsoAssertion;
  exchangeSession: (input: ExchangeSessionInput) => SsoExchange;
  evaluateReadiness: () => SsoReadinessResult;
  manifest: () => SsoRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSsoRegistryManifest(): SsoRegistryManifest {
  return {
    foundationId: PRODUCT_SSO_FEDERATION_ID,
    version: PRODUCT_SSO_FEDERATION_VERSION,
    freezeVersion: PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
    base: PRODUCT_SSO_FEDERATION_BASE,
    providerCount: listProviders().length,
    connectionCount: listConnections().length,
    assertionCount: listAssertions().length,
    exchangeCount: listExchanges().length,
  };
}

export function clearSsoFederationLayer(): void {
  clearExchanges();
  clearAssertions();
  clearConnections();
  clearProviders();
}

export function createSsoManager(options?: {
  managerId?: string;
}): SsoManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-sso-mgr");
  let state: SsoManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SsoManagerSnapshot {
    const reg = getSsoRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_SSO_FEDERATION_ID,
      version: PRODUCT_SSO_FEDERATION_VERSION,
      providerCount: reg.providerCount,
      connectionCount: reg.connectionCount,
      assertionCount: reg.assertionCount,
      exchangeCount: reg.exchangeCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): SsoManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearSsoFederationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SsoManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SsoManagerSnapshot {
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
    registerProvider: (input) => {
      assertRunning("registerProvider");
      return registerProvider(input);
    },
    activateProvider: (input) => {
      assertRunning("activateProvider");
      return activateProvider(input);
    },
    disableProvider: (input) => {
      assertRunning("disableProvider");
      return disableProvider(input);
    },
    linkConnection: (input) => {
      assertRunning("linkConnection");
      return linkConnection(input);
    },
    updateConnectionStatus: (input) => {
      assertRunning("updateConnectionStatus");
      return updateConnectionStatus(input);
    },
    federateAssertion: (input) => {
      assertRunning("federateAssertion");
      return federateAssertion(input);
    },
    exchangeSession: (input) => {
      assertRunning("exchangeSession");
      return exchangeSession(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateSsoFederationReadiness();
    },
    manifest: getSsoRegistryManifest,
  };
}

export {
  assertSsoFederationReadinessReady,
  getAssertion,
  getConnection,
  getExchange,
  getProvider,
  listAssertions,
  listConnections,
  listExchanges,
  listProviders,
};
