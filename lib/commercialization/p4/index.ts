/**
 * Commercialization P4 — Customer Onboarding Foundation public exports
 * Isolated namespace: lib/commercialization/p4
 */

export {
  ACCOUNT_STATUSES,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
  HANDOFF_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_READINESS_VERDICTS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  REQUIREMENT_PRIORITIES,
  WORKSPACE_STATUSES,
} from "./onboarding/onboarding.constants";

export type {
  AccountLifecycleRecord,
  AccountStatus,
  CustomerAccount,
  RegisterAccountInput,
  TransitionAccountInput,
} from "./account/account.types";

export {
  clearCustomerAccounts,
  getCustomerAccount,
  listCustomerAccounts,
  registerAccount,
  setAccountStatus,
} from "./account/account.registry";

export {
  clearAccountLifecycleRecords,
  getAccountLifecycleRecord,
  listAccountLifecycleRecords,
  transitionAccount,
} from "./account/account.lifecycle";

export type {
  AdvanceOnboardingInput,
  OnboardingPlan,
  OnboardingStatus,
  OnboardingStep,
  OnboardingWorkflowEvent,
  RegisterOnboardingInput,
} from "./onboarding/onboarding.types";

export {
  clearOnboardingPlans,
  getOnboardingPlan,
  listOnboardingPlans,
  registerOnboarding,
  updateOnboardingStep,
} from "./onboarding/onboarding.registry";

export {
  advanceOnboardingWorkflow,
  clearOnboardingWorkflowEvents,
  getOnboardingWorkflowEvent,
  listOnboardingWorkflowEvents,
} from "./onboarding/onboarding.workflow";

export type {
  CustomerWorkspace,
  RegisterWorkspaceInput,
  SetupWorkspaceInput,
  WorkspaceSetupRecord,
  WorkspaceStatus,
} from "./workspace/workspace.types";

export {
  clearCustomerWorkspaces,
  getCustomerWorkspace,
  goLiveWorkspace,
  listCustomerWorkspaces,
  markWorkspaceReady,
  registerWorkspace,
} from "./workspace/workspace.registry";

export {
  clearWorkspaceSetups,
  getWorkspaceSetup,
  listWorkspaceSetups,
  setupWorkspace,
} from "./workspace/workspace.setup";

export type {
  CaptureRequirementInput,
  CreateCustomerProfileInput,
  CustomerIntake,
  CustomerProfile,
  CustomerRequirement,
  IntakeChannel,
  RecordIntakeInput,
  RequirementPriority,
} from "./customer/customer.types";

export {
  clearCustomerProfiles,
  createCustomerProfile,
  getCustomerProfile,
  listCustomerProfiles,
} from "./customer/customer.profile";

export {
  captureRequirement,
  clearCustomerRequirements,
  getCustomerRequirement,
  listCustomerRequirements,
  satisfyRequirement,
} from "./customer/customer.requirements";

export {
  clearCustomerIntakes,
  getCustomerIntake,
  listCustomerIntakes,
  recordCustomerIntake,
} from "./customer/customer.intake";

export type {
  CreateHandoffInput,
  DeliveryHandoff,
  HandoffStatus,
  OnboardingManagerStatus,
  OnboardingReadinessCheck,
  OnboardingReadinessResult,
  OnboardingReadinessVerdict,
  OnboardingRegistryManifest,
} from "./delivery/delivery.types";

export {
  acceptDeliveryHandoff,
  clearDeliveryHandoffs,
  completeDeliveryHandoff,
  createDeliveryHandoff,
  getDeliveryHandoff,
  listDeliveryHandoffs,
} from "./delivery/delivery.handoff";

export {
  assertOnboardingFoundationReadinessReady,
  evaluateOnboardingFoundationReadiness,
} from "./delivery/delivery.readiness";

export {
  clearOnboardingFoundationLayer,
  createOnboardingFoundationManager,
  getOnboardingRegistryManifest,
  type OnboardingFoundationManager,
  type OnboardingFoundationManagerSnapshot,
} from "./onboarding.manager";

export {
  assertCommercializationP4ReleaseGatePass,
  checkCommercializationP4ReleaseGate,
  COMMERCIALIZATION_P4_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/commercialization.release.gate";
