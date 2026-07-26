/**
 * Product API — API Foundation Manager
 */

import {
  clearApiDefinitions,
  defineApiDefinition,
  getApiDefinition,
  listApiDefinitions,
} from "./definition/definition.registry";
import type {
  ApiDefinition,
  DefineApiDefinitionInput,
} from "./definition/definition.types";
import {
  clearApiLifecycles,
  getApiLifecycle,
  listApiLifecycles,
  openApiLifecycle,
  transitionApiLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  ApiLifecycle,
  OpenApiLifecycleInput,
  TransitionApiLifecycleInput,
} from "./lifecycle/lifecycle.types";
import {
  clearApiReleaseManifests,
  createApiReleaseManifest,
  getApiReleaseManifest,
  listApiReleaseManifests,
  type ApiReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
} from "./management/management.constants";
import {
  assertApiFoundationReadinessReady,
  evaluateApiFoundationReadiness,
} from "./management/management.readiness";
import type {
  ApiManagerStatus,
  ApiReadinessResult,
  ApiRegistryManifest,
} from "./management/management.types";
import {
  attachApiPolicy,
  clearApiPolicies,
  getApiPolicy,
  listApiPolicies,
} from "./policy/policy.registry";
import type { ApiPolicy, AttachApiPolicyInput } from "./policy/policy.types";
import {
  clearApis,
  getApi,
  getApiByKey,
  listApis,
  registerApi,
} from "./registry/api.registry";
import type { ProductApi, RegisterApiInput } from "./registry/api.types";
import {
  clearApiVersions,
  getApiVersion,
  listApiVersions,
  registerApiVersion,
} from "./version/version.registry";
import type {
  ApiVersion,
  RegisterApiVersionInput,
} from "./version/version.types";

export type ApiManagerSnapshot = {
  managerId: string;
  status: ApiManagerStatus;
  layerId: typeof PRODUCT_API_FOUNDATION_ID;
  version: typeof PRODUCT_API_FOUNDATION_VERSION;
  apiCount: number;
  definitionCount: number;
  versionCount: number;
  lifecycleCount: number;
  policyCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiManager = {
  initialize: () => ApiManagerSnapshot;
  start: () => ApiManagerSnapshot;
  stop: () => ApiManagerSnapshot;
  status: () => ApiManagerSnapshot;
  registerApi: (input: RegisterApiInput) => ProductApi;
  defineDefinition: (input: DefineApiDefinitionInput) => ApiDefinition;
  registerVersion: (input: RegisterApiVersionInput) => ApiVersion;
  openLifecycle: (input: OpenApiLifecycleInput) => ApiLifecycle;
  transitionLifecycle: (input: TransitionApiLifecycleInput) => ApiLifecycle;
  attachPolicy: (input: AttachApiPolicyInput) => ApiPolicy;
  createReleaseManifest: (input: {
    id?: string;
    apiId: string;
  }) => ApiReleaseManifest;
  evaluateReadiness: () => ApiReadinessResult;
  manifest: () => ApiRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiRegistryManifest(): ApiRegistryManifest {
  return {
    foundationId: PRODUCT_API_FOUNDATION_ID,
    version: PRODUCT_API_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_API_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_API_FOUNDATION_BASE,
    apiCount: listApis().length,
    definitionCount: listApiDefinitions().length,
    versionCount: listApiVersions().length,
    lifecycleCount: listApiLifecycles().length,
    policyCount: listApiPolicies().length,
    releaseCount: listApiReleaseManifests().length,
  };
}

export function clearApiFoundationLayer(): void {
  clearApiReleaseManifests();
  clearApiPolicies();
  clearApiLifecycles();
  clearApiVersions();
  clearApiDefinitions();
  clearApis();
}

export function createApiManager(options?: {
  managerId?: string;
}): ApiManager {
  const managerId = options?.managerId?.trim() || createId("prod-api-mgr");
  let state: ApiManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ApiManagerSnapshot {
    const reg = getApiRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_FOUNDATION_ID,
      version: PRODUCT_API_FOUNDATION_VERSION,
      apiCount: reg.apiCount,
      definitionCount: reg.definitionCount,
      versionCount: reg.versionCount,
      lifecycleCount: reg.lifecycleCount,
      policyCount: reg.policyCount,
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

  function initialize(): ApiManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ApiManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ApiManagerSnapshot {
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
    registerApi: (input) => {
      assertRunning("registerApi");
      return registerApi(input);
    },
    defineDefinition: (input) => {
      assertRunning("defineDefinition");
      return defineApiDefinition(input);
    },
    registerVersion: (input) => {
      assertRunning("registerVersion");
      return registerApiVersion(input);
    },
    openLifecycle: (input) => {
      assertRunning("openLifecycle");
      return openApiLifecycle(input);
    },
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionApiLifecycle(input);
    },
    attachPolicy: (input) => {
      assertRunning("attachPolicy");
      return attachApiPolicy(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiFoundationReadiness();
    },
    manifest: getApiRegistryManifest,
  };
}

export {
  assertApiFoundationReadinessReady,
  getApi,
  getApiByKey,
  getApiDefinition,
  getApiLifecycle,
  getApiPolicy,
  getApiReleaseManifest,
  getApiVersion,
  listApiDefinitions,
  listApiLifecycles,
  listApiPolicies,
  listApiReleaseManifests,
  listApiVersions,
  listApis,
};
