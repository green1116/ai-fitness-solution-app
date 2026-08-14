/**
 * EWEB — Action execution request public exports
 */

export {
  EWEB_1_ID,
  ACTION_EXECUTION_CAPABILITY,
  ACTION_EXECUTION_VERSION,
  ACTION_EXECUTION_REQUEST_STATES,
  ACTION_EXECUTION_PRIORITIES,
  buildActionExecutionRequests,
  getActionExecutionRequests,
  clearActionExecutionRequests,
  type ActionExecutionRequestState,
  type ActionExecutionPriority,
  type ActionExecutionRequest,
  type ActionExecutionRequests,
  type BuildActionExecutionRequestInput,
} from "./action-execution";

export {
  EWEB_FREEZE_ID,
  EWEB_FREEZE_VERSION,
  EWEB_FREEZE_DATE,
  ENTERPRISE_SAAS_ACTION_EXECUTION_BOUNDARY_V1,
  EWEB_COMPONENTS,
  buildEwebFreeze,
  getEwebFreeze,
  clearEwebFreeze,
  type EwebFreeze,
} from "./eweb-freeze-manifest";

export {
  EWER_1_ID,
  CONTROLLED_ACTION_CAPABILITY,
  CONTROLLED_ACTION_VERSION,
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  CONTROLLED_ACTION_API,
  CONTROLLED_ACTION_RESULTS,
  executeControlledAction,
  type ControlledActionResultKind,
  type ControlledActionResult,
} from "./controlled-action";

export {
  EWER_FREEZE_ID,
  EWER_FREEZE_VERSION,
  EWER_FREEZE_DATE,
  ENTERPRISE_SAAS_CONTROLLED_ACTION_V1,
  EWER_COMPONENTS,
  buildEwerFreeze,
  getEwerFreeze,
  clearEwerFreeze,
  type EwerFreeze,
} from "./ewer-freeze-manifest";
