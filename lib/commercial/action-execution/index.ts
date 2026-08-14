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
