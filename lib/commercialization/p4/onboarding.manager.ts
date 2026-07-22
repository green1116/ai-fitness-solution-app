/**
 * Commercialization P4 — Customer Onboarding Foundation Manager
 */

import {
  clearAccountLifecycleRecords,
  getAccountLifecycleRecord,
  listAccountLifecycleRecords,
  transitionAccount,
} from "./account/account.lifecycle";
import {
  clearCustomerAccounts,
  getCustomerAccount,
  listCustomerAccounts,
  registerAccount,
} from "./account/account.registry";
import type {
  AccountLifecycleRecord,
  CustomerAccount,
  RegisterAccountInput,
  TransitionAccountInput,
} from "./account/account.types";
import {
  clearCustomerIntakes,
  getCustomerIntake,
  listCustomerIntakes,
  recordCustomerIntake,
} from "./customer/customer.intake";
import {
  clearCustomerProfiles,
  createCustomerProfile,
  getCustomerProfile,
  listCustomerProfiles,
} from "./customer/customer.profile";
import {
  captureRequirement,
  clearCustomerRequirements,
  getCustomerRequirement,
  listCustomerRequirements,
  satisfyRequirement,
} from "./customer/customer.requirements";
import type {
  CaptureRequirementInput,
  CreateCustomerProfileInput,
  CustomerIntake,
  CustomerProfile,
  CustomerRequirement,
  RecordIntakeInput,
} from "./customer/customer.types";
import {
  acceptDeliveryHandoff,
  clearDeliveryHandoffs,
  completeDeliveryHandoff,
  createDeliveryHandoff,
  getDeliveryHandoff,
  listDeliveryHandoffs,
} from "./delivery/delivery.handoff";
import {
  assertOnboardingFoundationReadinessReady,
  evaluateOnboardingFoundationReadiness,
} from "./delivery/delivery.readiness";
import type {
  CreateHandoffInput,
  DeliveryHandoff,
  OnboardingManagerStatus,
  OnboardingReadinessResult,
  OnboardingRegistryManifest,
} from "./delivery/delivery.types";
import {
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
} from "./onboarding/onboarding.constants";
import {
  clearOnboardingPlans,
  getOnboardingPlan,
  listOnboardingPlans,
  registerOnboarding,
} from "./onboarding/onboarding.registry";
import type {
  AdvanceOnboardingInput,
  OnboardingPlan,
  OnboardingWorkflowEvent,
  RegisterOnboardingInput,
} from "./onboarding/onboarding.types";
import {
  advanceOnboardingWorkflow,
  clearOnboardingWorkflowEvents,
  getOnboardingWorkflowEvent,
  listOnboardingWorkflowEvents,
} from "./onboarding/onboarding.workflow";
import {
  clearCustomerWorkspaces,
  getCustomerWorkspace,
  goLiveWorkspace,
  listCustomerWorkspaces,
  registerWorkspace,
} from "./workspace/workspace.registry";
import {
  clearWorkspaceSetups,
  getWorkspaceSetup,
  listWorkspaceSetups,
  setupWorkspace,
} from "./workspace/workspace.setup";
import type {
  CustomerWorkspace,
  RegisterWorkspaceInput,
  SetupWorkspaceInput,
  WorkspaceSetupRecord,
} from "./workspace/workspace.types";

export type OnboardingFoundationManagerSnapshot = {
  managerId: string;
  status: OnboardingManagerStatus;
  layerId: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID;
  version: typeof COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION;
  accountCount: number;
  onboardingCount: number;
  workflowCount: number;
  workspaceCount: number;
  setupCount: number;
  profileCount: number;
  requirementCount: number;
  intakeCount: number;
  handoffCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type OnboardingFoundationManager = {
  initialize: () => OnboardingFoundationManagerSnapshot;
  start: () => OnboardingFoundationManagerSnapshot;
  stop: () => OnboardingFoundationManagerSnapshot;
  status: () => OnboardingFoundationManagerSnapshot;
  registerAccount: (input: RegisterAccountInput) => CustomerAccount;
  transitionAccount: (
    input: TransitionAccountInput,
  ) => AccountLifecycleRecord;
  getAccount: typeof getCustomerAccount;
  listAccounts: typeof listCustomerAccounts;
  recordIntake: (input: RecordIntakeInput) => CustomerIntake;
  createProfile: (input: CreateCustomerProfileInput) => CustomerProfile;
  captureRequirement: (input: CaptureRequirementInput) => CustomerRequirement;
  satisfyRequirement: (id: string) => CustomerRequirement;
  registerOnboarding: (input: RegisterOnboardingInput) => OnboardingPlan;
  advanceWorkflow: (input: AdvanceOnboardingInput) => OnboardingWorkflowEvent;
  registerWorkspace: (input: RegisterWorkspaceInput) => CustomerWorkspace;
  setupWorkspace: (input: SetupWorkspaceInput) => WorkspaceSetupRecord;
  goLiveWorkspace: (id: string) => CustomerWorkspace;
  createHandoff: (input: CreateHandoffInput) => DeliveryHandoff;
  acceptHandoff: (id: string) => DeliveryHandoff;
  completeHandoff: (id: string) => DeliveryHandoff;
  evaluateReadiness: () => OnboardingReadinessResult;
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
    foundationId: COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
    version: COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
    freezeVersion: COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
    base: COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
    accountCount: listCustomerAccounts().length,
    onboardingCount: listOnboardingPlans().length,
    workflowCount: listOnboardingWorkflowEvents().length,
    workspaceCount: listCustomerWorkspaces().length,
    setupCount: listWorkspaceSetups().length,
    profileCount: listCustomerProfiles().length,
    requirementCount: listCustomerRequirements().length,
    intakeCount: listCustomerIntakes().length,
    handoffCount: listDeliveryHandoffs().length,
  };
}

export function clearOnboardingFoundationLayer(): void {
  clearDeliveryHandoffs();
  clearWorkspaceSetups();
  clearCustomerWorkspaces();
  clearOnboardingWorkflowEvents();
  clearOnboardingPlans();
  clearCustomerRequirements();
  clearCustomerProfiles();
  clearCustomerIntakes();
  clearAccountLifecycleRecords();
  clearCustomerAccounts();
}

export function createOnboardingFoundationManager(options?: {
  managerId?: string;
}): OnboardingFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p4-onb-mgr");
  let state: OnboardingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OnboardingFoundationManagerSnapshot {
    const reg = getOnboardingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
      version: COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
      accountCount: reg.accountCount,
      onboardingCount: reg.onboardingCount,
      workflowCount: reg.workflowCount,
      workspaceCount: reg.workspaceCount,
      setupCount: reg.setupCount,
      profileCount: reg.profileCount,
      requirementCount: reg.requirementCount,
      intakeCount: reg.intakeCount,
      handoffCount: reg.handoffCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OnboardingFoundationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearOnboardingFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OnboardingFoundationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OnboardingFoundationManagerSnapshot {
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
    registerAccount: (input) => {
      assertRunning("registerAccount");
      return registerAccount(input);
    },
    transitionAccount: (input) => {
      assertRunning("transitionAccount");
      return transitionAccount(input);
    },
    getAccount: getCustomerAccount,
    listAccounts: listCustomerAccounts,
    recordIntake: (input) => {
      assertRunning("recordIntake");
      return recordCustomerIntake(input);
    },
    createProfile: (input) => {
      assertRunning("createProfile");
      return createCustomerProfile(input);
    },
    captureRequirement: (input) => {
      assertRunning("captureRequirement");
      return captureRequirement(input);
    },
    satisfyRequirement: (id) => {
      assertRunning("satisfyRequirement");
      return satisfyRequirement(id);
    },
    registerOnboarding: (input) => {
      assertRunning("registerOnboarding");
      return registerOnboarding(input);
    },
    advanceWorkflow: (input) => {
      assertRunning("advanceWorkflow");
      return advanceOnboardingWorkflow(input);
    },
    registerWorkspace: (input) => {
      assertRunning("registerWorkspace");
      return registerWorkspace(input);
    },
    setupWorkspace: (input) => {
      assertRunning("setupWorkspace");
      return setupWorkspace(input);
    },
    goLiveWorkspace: (id) => {
      assertRunning("goLiveWorkspace");
      return goLiveWorkspace(id);
    },
    createHandoff: (input) => {
      assertRunning("createHandoff");
      return createDeliveryHandoff(input);
    },
    acceptHandoff: (id) => {
      assertRunning("acceptHandoff");
      return acceptDeliveryHandoff(id);
    },
    completeHandoff: (id) => {
      assertRunning("completeHandoff");
      return completeDeliveryHandoff(id);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateOnboardingFoundationReadiness();
    },
    manifest: getOnboardingRegistryManifest,
  };
}

export {
  assertOnboardingFoundationReadinessReady,
  getAccountLifecycleRecord,
  getCustomerIntake,
  getCustomerProfile,
  getCustomerRequirement,
  getCustomerWorkspace,
  getDeliveryHandoff,
  getOnboardingPlan,
  getOnboardingWorkflowEvent,
  getWorkspaceSetup,
  listAccountLifecycleRecords,
  listCustomerIntakes,
  listCustomerProfiles,
  listCustomerRequirements,
  listCustomerWorkspaces,
  listDeliveryHandoffs,
  listOnboardingPlans,
  listOnboardingWorkflowEvents,
  listWorkspaceSetups,
};
