/**
 * EWA — Workspace action public exports
 */

export {
  EWA_1_ID,
  WORKSPACE_ACTION_CAPABILITY,
  WORKSPACE_ACTION_VERSION,
  WORKSPACE_ACTION_TYPES,
  WORKSPACE_ACTION_STATUSES,
  buildWorkspaceActions,
  getWorkspaceActions,
  clearWorkspaceActions,
  type WorkspaceActionType,
  type WorkspaceActionStatus,
  type WorkspaceAction,
  type WorkspaceActions,
} from "./workspace-action";

export {
  EWA_2_ID,
  WORKSPACE_ACTION_CONTEXT_CAPABILITY,
  WORKSPACE_ACTION_CONTEXT_VERSION,
  EWA1_WORKSPACE_ACTION_BASELINE,
  WORKSPACE_BUSINESS_CONTEXTS,
  WORKSPACE_CONTEXT_PRIORITIES,
  buildWorkspaceActionContexts,
  getWorkspaceActionContexts,
  ensureActionsThenBuildWorkspaceActionContexts,
  clearWorkspaceActionContexts,
  type WorkspaceBusinessContext,
  type WorkspaceContextPriority,
  type WorkspaceActionContext,
  type WorkspaceActionContexts,
} from "./action-context";

export {
  EWA_3_ID,
  WORKSPACE_ACTION_OUTCOME_CAPABILITY,
  WORKSPACE_ACTION_OUTCOME_VERSION,
  EWA2_ACTION_CONTEXT_BASELINE,
  WORKSPACE_ACTION_OUTCOMES,
  buildWorkspaceActionOutcomes,
  getWorkspaceActionOutcomes,
  ensureContextsThenBuildWorkspaceActionOutcomes,
  clearWorkspaceActionOutcomes,
  type WorkspaceActionOutcomeKind,
  type WorkspaceActionOutcome,
  type WorkspaceActionOutcomes,
} from "./action-outcome";

export {
  EWA_FREEZE_ID,
  EWA_FREEZE_VERSION,
  EWA_FREEZE_DATE,
  ENTERPRISE_SAAS_WORKSPACE_ACTION_V1,
  EWA_COMPONENTS,
  buildEwaFreeze,
  getEwaFreeze,
  clearEwaFreeze,
  type EwaFreeze,
} from "./ewa-freeze-manifest";
