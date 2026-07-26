/**
 * Product API SDK — Manager
 */

import {
  clearSdkClients,
  getSdkClient,
  listSdkClients,
  registerSdkClient,
  updateSdkClientStatus,
} from "./client/client.registry";
import type {
  RegisterSdkClientInput,
  SdkClient,
  UpdateSdkClientStatusInput,
} from "./client/client.types";
import {
  clearApiSdkReleaseManifests,
  createApiSdkReleaseManifest,
  getApiSdkReleaseManifest,
  listApiSdkReleaseManifests,
  type ApiSdkReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
} from "./management/management.constants";
import {
  assertApiSdkReadinessReady,
  evaluateApiSdkReadiness,
} from "./management/management.readiness";
import type {
  SdkManagerStatus,
  SdkReadinessResult,
  SdkRegistryManifest,
} from "./management/management.types";
import {
  clearSdkOperations,
  getSdkOperation,
  listSdkOperations,
  registerSdkOperation,
} from "./operation/operation.registry";
import type {
  RegisterSdkOperationInput,
  SdkOperation,
} from "./operation/operation.types";
import {
  clearSdkPackages,
  getSdkPackage,
  listSdkPackages,
  publishSdkPackage,
  updateSdkPackageStatus,
} from "./package/package.registry";
import type {
  PublishSdkPackageInput,
  SdkPackage,
  UpdateSdkPackageStatusInput,
} from "./package/package.types";
import {
  clearSdkSchemas,
  getSdkSchema,
  listSdkSchemas,
  registerSdkSchema,
} from "./schema/schema.registry";
import type { RegisterSdkSchemaInput, SdkSchema } from "./schema/schema.types";

export type SdkManagerSnapshot = {
  managerId: string;
  status: SdkManagerStatus;
  layerId: typeof PRODUCT_API_SDK_ID;
  version: typeof PRODUCT_API_SDK_VERSION;
  clientCount: number;
  operationCount: number;
  schemaCount: number;
  packageCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiSdkManager = {
  initialize: () => SdkManagerSnapshot;
  start: () => SdkManagerSnapshot;
  stop: () => SdkManagerSnapshot;
  status: () => SdkManagerSnapshot;
  registerClient: (input: RegisterSdkClientInput) => SdkClient;
  updateClientStatus: (input: UpdateSdkClientStatusInput) => SdkClient;
  registerOperation: (input: RegisterSdkOperationInput) => SdkOperation;
  registerSchema: (input: RegisterSdkSchemaInput) => SdkSchema;
  publishPackage: (input: PublishSdkPackageInput) => SdkPackage;
  updatePackageStatus: (input: UpdateSdkPackageStatusInput) => SdkPackage;
  createReleaseManifest: (input: {
    id?: string;
    clientId: string;
  }) => ApiSdkReleaseManifest;
  evaluateReadiness: () => SdkReadinessResult;
  manifest: () => SdkRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiSdkRegistryManifest(): SdkRegistryManifest {
  return {
    sdkId: PRODUCT_API_SDK_ID,
    version: PRODUCT_API_SDK_VERSION,
    freezeVersion: PRODUCT_API_SDK_FREEZE_VERSION,
    base: PRODUCT_API_SDK_BASE,
    clientCount: listSdkClients().length,
    operationCount: listSdkOperations().length,
    schemaCount: listSdkSchemas().length,
    packageCount: listSdkPackages().length,
    releaseCount: listApiSdkReleaseManifests().length,
  };
}

export function clearApiSdkLayer(): void {
  clearApiSdkReleaseManifests();
  clearSdkPackages();
  clearSdkSchemas();
  clearSdkOperations();
  clearSdkClients();
}

export function createApiSdkManager(options?: {
  managerId?: string;
}): ApiSdkManager {
  const managerId = options?.managerId?.trim() || createId("prod-apisdk-mgr");
  let state: SdkManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): SdkManagerSnapshot {
    const reg = getApiSdkRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_SDK_ID,
      version: PRODUCT_API_SDK_VERSION,
      clientCount: reg.clientCount,
      operationCount: reg.operationCount,
      schemaCount: reg.schemaCount,
      packageCount: reg.packageCount,
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

  function initialize(): SdkManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiSdkLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): SdkManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): SdkManagerSnapshot {
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
    registerClient: (input) => {
      assertRunning("registerClient");
      return registerSdkClient(input);
    },
    updateClientStatus: (input) => {
      assertRunning("updateClientStatus");
      return updateSdkClientStatus(input);
    },
    registerOperation: (input) => {
      assertRunning("registerOperation");
      return registerSdkOperation(input);
    },
    registerSchema: (input) => {
      assertRunning("registerSchema");
      return registerSdkSchema(input);
    },
    publishPackage: (input) => {
      assertRunning("publishPackage");
      return publishSdkPackage(input);
    },
    updatePackageStatus: (input) => {
      assertRunning("updatePackageStatus");
      return updateSdkPackageStatus(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiSdkReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiSdkReadiness();
    },
    manifest: getApiSdkRegistryManifest,
  };
}

export {
  assertApiSdkReadinessReady,
  getApiSdkReleaseManifest,
  getSdkClient,
  getSdkOperation,
  getSdkPackage,
  getSdkSchema,
  listApiSdkReleaseManifests,
  listSdkClients,
  listSdkOperations,
  listSdkPackages,
  listSdkSchemas,
};
