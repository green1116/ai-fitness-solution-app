/**
 * Product P1 — Customer Onboarding public exports
 * Isolated namespace: lib/product/p1
 */

export {
  ACTIVATION_STATES,
  CHECKLIST_ITEM_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  P1_MANAGER_STATUSES,
  P1_READINESS_VERDICTS,
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
  PRODUCT_P1_ONBOARDING_FREEZE_VERSION,
  WORKSPACE_STATUSES,
} from "./onboarding/onboarding.constants";

export type {
  ActivationRecord,
  ActivationState,
  AdvanceOnboardingInput,
  ChecklistItem,
  ChecklistItemStatus,
  CreateChecklistInput,
  CreateCustomerProfileInput,
  CustomerIntake,
  CustomerProfile,
  IntakeChannel,
  MarkChecklistItemInput,
  OnboardingChecklist,
  OnboardingMetadata,
  OnboardingPlan,
  OnboardingStatus,
  OnboardingStep,
  OnboardingWorkflowEvent,
  P1ManagerStatus,
  P1ReadinessCheck,
  P1ReadinessResult,
  P1ReadinessVerdict,
  P1RegistryManifest,
  RecordCustomerIntakeInput,
  RegisterOnboardingPlanInput,
  SetActivationStateInput,
  SetupWorkspaceInput,
  WorkspaceSetup,
  WorkspaceStatus,
} from "./onboarding/onboarding.types";

export {
  clearCustomerProfiles,
  createCustomerProfile,
  getCustomerProfile,
  listCustomerProfiles,
} from "./customer/customer.profile";

export {
  clearCustomerIntakes,
  getCustomerIntake,
  listCustomerIntakes,
  recordCustomerIntake,
} from "./customer/customer.intake";

export {
  clearOnboardingPlans,
  getOnboardingPlan,
  listOnboardingPlans,
  registerOnboardingPlan,
} from "./onboarding/onboarding.registry";

export {
  advanceOnboardingWorkflow,
  clearOnboardingWorkflowEvents,
  getOnboardingWorkflowEvent,
  listOnboardingWorkflowEvents,
} from "./onboarding/onboarding.workflow";

export {
  clearWorkspaces,
  getWorkspace,
  listWorkspaces,
  setupWorkspace,
  updateWorkspaceStatus,
} from "./workspace/workspace.setup";

export {
  clearOnboardingChecklists,
  createOnboardingChecklist,
  getOnboardingChecklist,
  listOnboardingChecklists,
  markChecklistItem,
} from "./checklist/checklist.tracker";

export {
  clearActivations,
  getActivation,
  listActivations,
  setActivationState,
} from "./activation/activation.state";

export {
  assertP1CustomerOnboardingReadinessReady,
  evaluateP1CustomerOnboardingReadiness,
} from "./onboarding/onboarding.readiness";

export {
  clearP1CustomerOnboardingLayer,
  createP1CustomerOnboardingManager,
  getP1RegistryManifest,
  type P1CustomerOnboardingManager,
  type P1CustomerOnboardingManagerSnapshot,
} from "./onboarding.manager";

export {
  assertProductP1ReleaseGatePass,
  checkProductP1ReleaseGate,
  PRODUCT_P1_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
