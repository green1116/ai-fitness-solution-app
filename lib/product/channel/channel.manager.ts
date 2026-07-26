/**
 * Product Channel — Channel Management Manager
 */

import {
  clearChannelCapabilities,
  declareChannelCapability,
  getChannelCapability,
  listChannelCapabilities,
} from "./capability/capability.registry";
import type {
  ChannelCapability,
  DeclareChannelCapabilityInput,
} from "./capability/capability.types";
import {
  clearChannelReleaseManifests,
  createChannelReleaseManifest,
  getChannelReleaseManifest,
  listChannelReleaseManifests,
  type ChannelReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertChannelManagementReadinessReady,
  evaluateChannelManagementReadiness,
} from "./management/management.readiness";
import type {
  ChannelManagerStatus,
  ChannelReadinessResult,
  ChannelRegistryManifest,
} from "./management/management.types";
import {
  attachChannelPolicy,
  clearChannelPolicies,
  getChannelPolicy,
  listChannelPolicies,
} from "./policy/policy.registry";
import type {
  AttachChannelPolicyInput,
  ChannelPolicy,
} from "./policy/policy.types";
import {
  clearChannels,
  getChannel,
  getChannelByKey,
  listChannels,
  registerChannel,
  updateChannelStatus,
} from "./registry/channel.registry";
import type {
  NotificationChannel,
  RegisterChannelInput,
  UpdateChannelStatusInput,
} from "./registry/channel.types";
import {
  clearChannelValidations,
  getChannelValidation,
  listChannelValidations,
  validateChannel,
} from "./validation/validation.registry";
import type {
  ChannelValidation,
  ValidateChannelInput,
} from "./validation/validation.types";

export type ChannelManagerSnapshot = {
  managerId: string;
  status: ChannelManagerStatus;
  layerId: typeof PRODUCT_CHANNEL_MANAGEMENT_ID;
  version: typeof PRODUCT_CHANNEL_MANAGEMENT_VERSION;
  channelCount: number;
  capabilityCount: number;
  policyCount: number;
  validationCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ChannelManager = {
  initialize: () => ChannelManagerSnapshot;
  start: () => ChannelManagerSnapshot;
  stop: () => ChannelManagerSnapshot;
  status: () => ChannelManagerSnapshot;
  registerChannel: (input: RegisterChannelInput) => NotificationChannel;
  updateChannelStatus: (
    input: UpdateChannelStatusInput,
  ) => NotificationChannel;
  declareCapability: (
    input: DeclareChannelCapabilityInput,
  ) => ChannelCapability;
  attachPolicy: (input: AttachChannelPolicyInput) => ChannelPolicy;
  validateChannel: (input: ValidateChannelInput) => ChannelValidation;
  createReleaseManifest: (input: {
    id?: string;
    channelId: string;
  }) => ChannelReleaseManifest;
  evaluateReadiness: () => ChannelReadinessResult;
  manifest: () => ChannelRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getChannelRegistryManifest(): ChannelRegistryManifest {
  return {
    managementId: PRODUCT_CHANNEL_MANAGEMENT_ID,
    version: PRODUCT_CHANNEL_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_CHANNEL_MANAGEMENT_BASE,
    channelCount: listChannels().length,
    capabilityCount: listChannelCapabilities().length,
    policyCount: listChannelPolicies().length,
    validationCount: listChannelValidations().length,
    releaseCount: listChannelReleaseManifests().length,
  };
}

export function clearChannelManagementLayer(): void {
  clearChannelReleaseManifests();
  clearChannelValidations();
  clearChannelPolicies();
  clearChannelCapabilities();
  clearChannels();
}

export function createChannelManager(options?: {
  managerId?: string;
}): ChannelManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-chn-mgr");
  let state: ChannelManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ChannelManagerSnapshot {
    const reg = getChannelRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CHANNEL_MANAGEMENT_ID,
      version: PRODUCT_CHANNEL_MANAGEMENT_VERSION,
      channelCount: reg.channelCount,
      capabilityCount: reg.capabilityCount,
      policyCount: reg.policyCount,
      validationCount: reg.validationCount,
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

  function initialize(): ChannelManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearChannelManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ChannelManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ChannelManagerSnapshot {
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
    registerChannel: (input) => {
      assertRunning("registerChannel");
      return registerChannel(input);
    },
    updateChannelStatus: (input) => {
      assertRunning("updateChannelStatus");
      return updateChannelStatus(input);
    },
    declareCapability: (input) => {
      assertRunning("declareCapability");
      return declareChannelCapability(input);
    },
    attachPolicy: (input) => {
      assertRunning("attachPolicy");
      return attachChannelPolicy(input);
    },
    validateChannel: (input) => {
      assertRunning("validateChannel");
      return validateChannel(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createChannelReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateChannelManagementReadiness();
    },
    manifest: getChannelRegistryManifest,
  };
}

export {
  assertChannelManagementReadinessReady,
  getChannel,
  getChannelByKey,
  getChannelCapability,
  getChannelPolicy,
  getChannelReleaseManifest,
  getChannelValidation,
  listChannelCapabilities,
  listChannelPolicies,
  listChannelReleaseManifests,
  listChannelValidations,
  listChannels,
};
