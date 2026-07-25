/**
 * Product P1 — Customer Onboarding Manager
 */

import {
  clearActivations,
  getActivation,
  listActivations,
  setActivationState,
} from "./activation/activation.state";
import {
  clearOnboardingChecklists,
  createOnboardingChecklist,
  getOnboardingChecklist,
  listOnboardingChecklists,
  markChecklistItem,
} from "./checklist/checklist.tracker";
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
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
} from "./onboarding/onboarding.constants";
import {
  assertP1CustomerOnboardingReadinessReady,
  evaluateP1CustomerOnboardingReadiness,
} from "./onboarding/onboarding.readiness";
import {
  clearOnboardingPlans,
  getOnboardingPlan,
  listOnboardingPlans,
  registerOnboardingPlan,
} from "./onboarding/onboarding.registry";
import type {
  ActivationRecord,
  AdvanceOnboardingInput,
  CreateChecklistInput,
  CreateCustomerProfileInput,
  CustomerIntake,
  CustomerProfile,
  MarkChecklistItemInput,
  OnboardingChecklist,
  OnboardingPlan,
  OnboardingWorkflowEvent,
  P1ManagerStatus,
  P1ReadinessResult,
  P1RegistryManifest,
  RecordCustomerIntakeInput,
  RegisterOnboardingPlanInput,
  SetActivationStateInput,
  SetupWorkspaceInput,
  WorkspaceSetup,
  WorkspaceStatus,
} from "./onboarding/onboarding.types";
import {
  advanceOnboardingWorkflow,
  clearOnboardingWorkflowEvents,
  getOnboardingWorkflowEvent,
  listOnboardingWorkflowEvents,
} from "./onboarding/onboarding.workflow";
import {
  clearWorkspaces,
  getWorkspace,
  listWorkspaces,
  setupWorkspace,
  updateWorkspaceStatus,
} from "./workspace/workspace.setup";

export type P1CustomerOnboardingManagerSnapshot = {
  managerId: string;
  status: P1ManagerStatus;
  layerId: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_ID;
  version: typeof PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION;
  profileCount: number;
  planCount: number;
  workspaceCount: number;
  activationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P1CustomerOnboardingManager = {
  initialize: () => P1CustomerOnboardingManagerSnapshot;
  start: () => P1CustomerOnboardingManagerSnapshot;
  stop: () => P1CustomerOnboardingManagerSnapshot;
  status: () => P1CustomerOnboardingManagerSnapshot;
  createProfile: (input: CreateCustomerProfileInput) => CustomerProfile;
  recordIntake: (input: RecordCustomerIntakeInput) => CustomerIntake;
  registerPlan: (input: RegisterOnboardingPlanInput) => OnboardingPlan;
  advanceWorkflow: (input: AdvanceOnboardingInput) => OnboardingWorkflowEvent;
  setupWorkspace: (input: SetupWorkspaceInput) => WorkspaceSetup;
  updateWorkspaceStatus: (
    workspaceId: string,
    status: WorkspaceStatus,
  ) => WorkspaceSetup;
  createChecklist: (input: CreateChecklistInput) => OnboardingChecklist;
  markChecklistItem: (input: MarkChecklistItemInput) => OnboardingChecklist;
  setActivationState: (input: SetActivationStateInput) => ActivationRecord;
  evaluateReadiness: () => P1ReadinessResult;
  manifest: () => P1RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP1RegistryManifest(): P1RegistryManifest {
  return {
    foundationId: PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
    version: PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
    freezeVersion: PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
    base: PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
    profileCount: listCustomerProfiles().length,
    intakeCount: listCustomerIntakes().length,
    planCount: listOnboardingPlans().length,
    workflowCount: listOnboardingWorkflowEvents().length,
    workspaceCount: listWorkspaces().length,
    checklistCount: listOnboardingChecklists().length,
    activationCount: listActivations().length,
  };
}

export function clearP1CustomerOnboardingLayer(): void {
  clearActivations();
  clearOnboardingChecklists();
  clearWorkspaces();
  clearOnboardingWorkflowEvents();
  clearOnboardingPlans();
  clearCustomerIntakes();
  clearCustomerProfiles();
}

export function createP1CustomerOnboardingManager(options?: {
  managerId?: string;
}): P1CustomerOnboardingManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p1-onb-mgr");
  let state: P1ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P1CustomerOnboardingManagerSnapshot {
    const reg = getP1RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
      version: PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
      profileCount: reg.profileCount,
      planCount: reg.planCount,
      workspaceCount: reg.workspaceCount,
      activationCount: reg.activationCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P1CustomerOnboardingManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP1CustomerOnboardingLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P1CustomerOnboardingManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P1CustomerOnboardingManagerSnapshot {
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
      return createCustomerProfile(input);
    },
    recordIntake: (input) => {
      assertRunning("recordIntake");
      return recordCustomerIntake(input);
    },
    registerPlan: (input) => {
      assertRunning("registerPlan");
      return registerOnboardingPlan(input);
    },
    advanceWorkflow: (input) => {
      assertRunning("advanceWorkflow");
      return advanceOnboardingWorkflow(input);
    },
    setupWorkspace: (input) => {
      assertRunning("setupWorkspace");
      return setupWorkspace(input);
    },
    updateWorkspaceStatus: (workspaceId, status) => {
      assertRunning("updateWorkspaceStatus");
      return updateWorkspaceStatus(workspaceId, status);
    },
    createChecklist: (input) => {
      assertRunning("createChecklist");
      return createOnboardingChecklist(input);
    },
    markChecklistItem: (input) => {
      assertRunning("markChecklistItem");
      return markChecklistItem(input);
    },
    setActivationState: (input) => {
      assertRunning("setActivationState");
      return setActivationState(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP1CustomerOnboardingReadiness();
    },
    manifest: getP1RegistryManifest,
  };
}

export {
  assertP1CustomerOnboardingReadinessReady,
  getActivation,
  getCustomerIntake,
  getCustomerProfile,
  getOnboardingChecklist,
  getOnboardingPlan,
  getOnboardingWorkflowEvent,
  getWorkspace,
  listActivations,
  listCustomerIntakes,
  listCustomerProfiles,
  listOnboardingChecklists,
  listOnboardingPlans,
  listOnboardingWorkflowEvents,
  listWorkspaces,
};
