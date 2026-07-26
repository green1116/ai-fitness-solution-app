/**
 * Product Connector — Framework Manager
 */

import {
  bindConnector,
  clearConnectorBindings,
  getConnectorBinding,
  listConnectorBindings,
  updateConnectorBindingStatus,
} from "./binding/binding.registry";
import type {
  BindConnectorInput,
  ConnectorBinding,
  UpdateConnectorBindingStatusInput,
} from "./binding/binding.types";
import {
  clearConnectorContracts,
  getConnectorContract,
  listConnectorContracts,
  registerConnectorContract,
} from "./contract/contract.registry";
import type {
  ConnectorContract,
  RegisterConnectorContractInput,
} from "./contract/contract.types";
import {
  clearConnectorDefinitions,
  defineConnectorDefinition,
  getConnectorDefinition,
  listConnectorDefinitions,
} from "./definition/definition.registry";
import type {
  ConnectorDefinition,
  DefineConnectorDefinitionInput,
} from "./definition/definition.types";
import {
  clearConnectorReleaseManifests,
  createConnectorReleaseManifest,
  getConnectorReleaseManifest,
  listConnectorReleaseManifests,
  type ConnectorReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
} from "./management/management.constants";
import {
  assertConnectorFrameworkReadinessReady,
  evaluateConnectorFrameworkReadiness,
} from "./management/management.readiness";
import type {
  ConnectorManagerStatus,
  ConnectorReadinessResult,
  ConnectorRegistryManifest,
} from "./management/management.types";
import {
  clearConnectors,
  getConnector,
  listConnectors,
  registerConnector,
  updateConnectorStatus,
} from "./registry/connector.registry";
import type {
  ProductConnector,
  RegisterConnectorInput,
  UpdateConnectorStatusInput,
} from "./registry/connector.types";

export type ConnectorManagerSnapshot = {
  managerId: string;
  status: ConnectorManagerStatus;
  layerId: typeof PRODUCT_CONNECTOR_FRAMEWORK_ID;
  version: typeof PRODUCT_CONNECTOR_FRAMEWORK_VERSION;
  connectorCount: number;
  definitionCount: number;
  contractCount: number;
  bindingCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ConnectorManager = {
  initialize: () => ConnectorManagerSnapshot;
  start: () => ConnectorManagerSnapshot;
  stop: () => ConnectorManagerSnapshot;
  status: () => ConnectorManagerSnapshot;
  registerConnector: (input: RegisterConnectorInput) => ProductConnector;
  updateConnectorStatus: (
    input: UpdateConnectorStatusInput,
  ) => ProductConnector;
  defineDefinition: (
    input: DefineConnectorDefinitionInput,
  ) => ConnectorDefinition;
  registerContract: (
    input: RegisterConnectorContractInput,
  ) => ConnectorContract;
  bindConnector: (input: BindConnectorInput) => ConnectorBinding;
  updateBindingStatus: (
    input: UpdateConnectorBindingStatusInput,
  ) => ConnectorBinding;
  createReleaseManifest: (input: {
    id?: string;
    connectorId: string;
  }) => ConnectorReleaseManifest;
  evaluateReadiness: () => ConnectorReadinessResult;
  manifest: () => ConnectorRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getConnectorRegistryManifest(): ConnectorRegistryManifest {
  return {
    frameworkId: PRODUCT_CONNECTOR_FRAMEWORK_ID,
    version: PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
    freezeVersion: PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
    base: PRODUCT_CONNECTOR_FRAMEWORK_BASE,
    connectorCount: listConnectors().length,
    definitionCount: listConnectorDefinitions().length,
    contractCount: listConnectorContracts().length,
    bindingCount: listConnectorBindings().length,
    releaseCount: listConnectorReleaseManifests().length,
  };
}

export function clearConnectorFrameworkLayer(): void {
  clearConnectorReleaseManifests();
  clearConnectorBindings();
  clearConnectorContracts();
  clearConnectorDefinitions();
  clearConnectors();
}

export function createConnectorManager(options?: {
  managerId?: string;
}): ConnectorManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-conn-mgr");
  let state: ConnectorManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ConnectorManagerSnapshot {
    const reg = getConnectorRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CONNECTOR_FRAMEWORK_ID,
      version: PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
      connectorCount: reg.connectorCount,
      definitionCount: reg.definitionCount,
      contractCount: reg.contractCount,
      bindingCount: reg.bindingCount,
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

  function initialize(): ConnectorManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearConnectorFrameworkLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ConnectorManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ConnectorManagerSnapshot {
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
    registerConnector: (input) => {
      assertRunning("registerConnector");
      return registerConnector(input);
    },
    updateConnectorStatus: (input) => {
      assertRunning("updateConnectorStatus");
      return updateConnectorStatus(input);
    },
    defineDefinition: (input) => {
      assertRunning("defineDefinition");
      return defineConnectorDefinition(input);
    },
    registerContract: (input) => {
      assertRunning("registerContract");
      return registerConnectorContract(input);
    },
    bindConnector: (input) => {
      assertRunning("bindConnector");
      return bindConnector(input);
    },
    updateBindingStatus: (input) => {
      assertRunning("updateBindingStatus");
      return updateConnectorBindingStatus(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createConnectorReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateConnectorFrameworkReadiness();
    },
    manifest: getConnectorRegistryManifest,
  };
}

export {
  assertConnectorFrameworkReadinessReady,
  getConnector,
  getConnectorBinding,
  getConnectorContract,
  getConnectorDefinition,
  getConnectorReleaseManifest,
  listConnectorBindings,
  listConnectorContracts,
  listConnectorDefinitions,
  listConnectorReleaseManifests,
  listConnectors,
};
