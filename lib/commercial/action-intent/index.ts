/**
 * EWI — Action intent public exports
 */

export {
  EWI_1_ID,
  ACTION_INTENT_CAPABILITY,
  ACTION_INTENT_VERSION,
  ENTERPRISE_SAAS_WORKSPACE_ACTION_UI_V1,
  ACTION_INTENTS,
  buildActionIntents,
  getActionIntents,
  clearActionIntents,
  type ActionIntentKind,
  type ActionIntent,
  type ActionIntents,
  type BuildActionIntentInput,
} from "./action-intent";

export {
  EWI_FREEZE_ID,
  EWI_FREEZE_VERSION,
  EWI_FREEZE_DATE,
  ENTERPRISE_SAAS_WORKSPACE_ACTION_INTENT_V1,
  EWI_COMPONENTS,
  buildEwiFreeze,
  getEwiFreeze,
  clearEwiFreeze,
  type EwiFreeze,
} from "./ewi-freeze-manifest";
