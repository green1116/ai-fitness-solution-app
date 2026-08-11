/**
 * ESCL — Customer lifecycle public exports
 */

export {
  ESCL_1_ID,
  CUSTOMER_LIFECYCLE_STATE_CAPABILITY,
  CUSTOMER_LIFECYCLE_STATE_VERSION,
  ESCE_V1_BASELINE,
  CUSTOMER_LIFECYCLE_STATES,
  buildCustomerLifecycleState,
  getCustomerLifecycleState,
  customerLifecycleStateFingerprint,
  clearCustomerLifecycleState,
  type CustomerLifecycleStateLevel,
  type CustomerLifecycleStateRecord,
  type CustomerLifecycleState,
} from "./customer-lifecycle-state";

export {
  ESCL_2_ID,
  LIFECYCLE_TRANSITION_CAPABILITY,
  LIFECYCLE_TRANSITION_VERSION,
  ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
  LIFECYCLE_TRANSITIONS,
  lifecycleTransitionFromState,
  buildLifecycleTransition,
  getLifecycleTransition,
  lifecycleTransitionFingerprint,
  clearLifecycleTransition,
  ensureStateThenBuildLifecycleTransition,
  type LifecycleTransitionKind,
  type LifecycleTransitionRecord,
  type LifecycleTransition,
} from "./lifecycle-transition";

export {
  ESCL_3_ID,
  LIFECYCLE_ACTION_CAPABILITY,
  LIFECYCLE_ACTION_VERSION,
  ESCL2_LIFECYCLE_TRANSITION_BASELINE,
  LIFECYCLE_ACTIONS,
  lifecycleActionFromTransition,
  buildLifecycleAction,
  getLifecycleAction,
  lifecycleActionFingerprint,
  clearLifecycleAction,
  ensureTransitionThenBuildLifecycleAction,
  type LifecycleActionKind,
  type LifecycleActionRecord,
  type LifecycleAction,
} from "./lifecycle-action";

export {
  ESCL_4_ID,
  LIFECYCLE_REVIEW_CAPABILITY,
  LIFECYCLE_REVIEW_VERSION,
  ESCL3_LIFECYCLE_ACTION_BASELINE,
  LIFECYCLE_REVIEW_STATUSES,
  lifecycleReviewStatusFromAction,
  buildLifecycleReview,
  getLifecycleReview,
  lifecycleReviewFingerprint,
  clearLifecycleReview,
  ensureActionThenBuildLifecycleReview,
  type LifecycleReviewStatus,
  type LifecycleReviewRecord,
  type LifecycleReview,
} from "./lifecycle-review";

export {
  ESCL_FREEZE_ID,
  ESCL_FREEZE_CAPABILITY,
  ESCL_FREEZE_VERSION,
  ESCL_FREEZE_CODENAME,
  ESCL_FREEZE_DATE,
  ENTERPRISE_SAAS_CUSTOMER_LIFECYCLE_V1,
  ESCL_COMPONENTS,
  buildEsclFreeze,
  getEsclFreeze,
  esclFreezeFingerprint,
  clearEsclFreeze,
  ensureReviewThenBuildEsclFreeze,
  type EsclComponentStatus,
  type EsclComponentEntry,
  type EsclFreezeManifest,
  type EsclFreeze,
} from "./escl-freeze";
