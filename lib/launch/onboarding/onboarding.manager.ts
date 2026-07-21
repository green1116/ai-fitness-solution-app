/**
 * Launch P2 — Customer Onboarding Manager
 */

import { getLaunchRegistryManifest } from "../launch.manager";
import {
  getCustomerActivation,
  getOrCreateCustomerActivation,
  listCustomerActivations,
  setActivationState,
  clearCustomerActivations,
} from "./onboarding.activation";
import {
  createOnboardingChecklist,
  getOnboardingChecklist,
  listOnboardingChecklists,
  markRequiredOnboardingChecklistPassed,
  setOnboardingChecklistItem,
  clearOnboardingChecklists,
} from "./onboarding.checklist";
import {
  getCustomerConfiguration,
  listCustomerConfigurations,
  setCustomerConfiguration,
  clearCustomerConfigurations,
} from "./onboarding.config";
import {
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
} from "./onboarding.constants";
import {
  createOnboardingProfile,
  getOnboardingProfile,
  listOnboardingProfiles,
  clearOnboardingProfiles,
} from "./onboarding.profile";
import {
  getTenantProvisioningWorkflow,
  listTenantProvisioningWorkflows,
  startTenantProvisioning,
  clearTenantProvisioningWorkflows,
} from "./onboarding.provisioning";
import {
  assertCustomerReadinessReady,
  evaluateCustomerReadiness,
} from "./onboarding.readiness";
import type {
  CreateOnboardingProfileInput,
  CustomerActivation,
  CustomerConfiguration,
  CustomerReadinessResult,
  OnboardingChecklist,
  OnboardingManagerStatus,
  OnboardingProfile,
  OnboardingRegistryManifest,
  SetActivationStateInput,
  SetCustomerConfigurationInput,
  SetOnboardingChecklistItemInput,
  StartProvisioningInput,
  TenantProvisioningWorkflow,
} from "./onboarding.types";

export type OnboardingManagerSnapshot = {
  managerId: string;
  status: OnboardingManagerStatus;
  layerId: typeof LAUNCH_CUSTOMER_ONBOARDING_ID;
  version: typeof LAUNCH_CUSTOMER_ONBOARDING_VERSION;
  profileCount: number;
  workflowCount: number;
  checklistCount: number;
  activationCount: number;
  launchProfileCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerOnboardingManager = {
  initialize: () => OnboardingManagerSnapshot;
  start: () => OnboardingManagerSnapshot;
  stop: () => OnboardingManagerSnapshot;
  status: () => OnboardingManagerSnapshot;
  createProfile: (input: CreateOnboardingProfileInput) => OnboardingProfile;
  getProfile: typeof getOnboardingProfile;
  listProfiles: typeof listOnboardingProfiles;
  startProvisioning: (input: StartProvisioningInput) => TenantProvisioningWorkflow;
  getWorkflow: typeof getTenantProvisioningWorkflow;
  listWorkflows: typeof listTenantProvisioningWorkflows;
  setConfig: (input: SetCustomerConfigurationInput) => CustomerConfiguration;
  getConfig: typeof getCustomerConfiguration;
  listConfigs: typeof listCustomerConfigurations;
  createChecklist: (input: {
    id?: string;
    onboardingProfileId: string;
  }) => OnboardingChecklist;
  setChecklistItem: (
    input: SetOnboardingChecklistItemInput,
  ) => OnboardingChecklist;
  markChecklistPassed: typeof markRequiredOnboardingChecklistPassed;
  getChecklist: typeof getOnboardingChecklist;
  listChecklists: typeof listOnboardingChecklists;
  prepareActivation: (onboardingProfileId: string) => CustomerActivation;
  setActivation: (input: SetActivationStateInput) => CustomerActivation;
  getActivation: typeof getCustomerActivation;
  listActivations: typeof listCustomerActivations;
  evaluateReadiness: (onboardingProfileId: string) => CustomerReadinessResult;
  manifest: () => OnboardingRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getOnboardingRegistryManifest(): OnboardingRegistryManifest {
  return {
    onboardingId: LAUNCH_CUSTOMER_ONBOARDING_ID,
    version: LAUNCH_CUSTOMER_ONBOARDING_VERSION,
    freezeVersion: LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
    base: LAUNCH_CUSTOMER_ONBOARDING_BASE,
    profileCount: listOnboardingProfiles().length,
    workflowCount: listTenantProvisioningWorkflows().length,
    checklistCount: listOnboardingChecklists().length,
    activationCount: listCustomerActivations().length,
  };
}

export function clearOnboardingLayer(): void {
  clearCustomerActivations();
  clearOnboardingChecklists();
  clearCustomerConfigurations();
  clearTenantProvisioningWorkflows();
  clearOnboardingProfiles();
}

export function createCustomerOnboardingManager(options?: {
  managerId?: string;
}): CustomerOnboardingManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p2-mgr");
  let state: OnboardingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OnboardingManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const reg = getOnboardingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_CUSTOMER_ONBOARDING_ID,
      version: LAUNCH_CUSTOMER_ONBOARDING_VERSION,
      profileCount: reg.profileCount,
      workflowCount: reg.workflowCount,
      checklistCount: reg.checklistCount,
      activationCount: reg.activationCount,
      launchProfileCount: launchReg.profileCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OnboardingManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearOnboardingLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OnboardingManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OnboardingManagerSnapshot {
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
    createProfile: (input) => {
      assertRunning("createProfile");
      return createOnboardingProfile(input);
    },
    getProfile: getOnboardingProfile,
    listProfiles: listOnboardingProfiles,
    startProvisioning: (input) => {
      assertRunning("startProvisioning");
      return startTenantProvisioning(input);
    },
    getWorkflow: getTenantProvisioningWorkflow,
    listWorkflows: listTenantProvisioningWorkflows,
    setConfig: (input) => {
      assertRunning("setConfig");
      return setCustomerConfiguration(input);
    },
    getConfig: getCustomerConfiguration,
    listConfigs: listCustomerConfigurations,
    createChecklist: (input) => {
      assertRunning("createChecklist");
      return createOnboardingChecklist(input);
    },
    setChecklistItem: (input) => {
      assertRunning("setChecklistItem");
      return setOnboardingChecklistItem(input);
    },
    markChecklistPassed: (checklistId) => {
      assertRunning("markChecklistPassed");
      return markRequiredOnboardingChecklistPassed(checklistId);
    },
    getChecklist: getOnboardingChecklist,
    listChecklists: listOnboardingChecklists,
    prepareActivation: (onboardingProfileId) => {
      assertRunning("prepareActivation");
      getOrCreateCustomerActivation(onboardingProfileId);
      return setActivationState({
        onboardingProfileId,
        state: "PENDING_ACTIVATION",
        detail: "prepared for go-live",
      });
    },
    setActivation: (input) => {
      assertRunning("setActivation");
      return setActivationState(input);
    },
    getActivation: getCustomerActivation,
    listActivations: listCustomerActivations,
    evaluateReadiness: (onboardingProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerReadiness(onboardingProfileId);
    },
    manifest: getOnboardingRegistryManifest,
  };
}

export { assertCustomerReadinessReady };
