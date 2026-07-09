/**
 * V84 — Customer success follow-up & retention
 */

export {
  V84_CUSTOMER_SUCCESS_VERSION,
  type CrmCustomerRow,
  type CrmDashboard,
  type FollowUpQueueItem,
  type FollowUpRecord,
  type FollowUpStatus,
  type ResolutionStatus,
  type ResponseStatus,
  type RetentionActionEntry,
  type RetentionActionType,
  type SessionFollowUpDetail,
} from "./customer-success/follow-up.types";

export {
  clearCustomerSuccessStoreForTests,
  getFollowUpRecord,
  getOrCreateFollowUpRecord,
  listFollowUpRecordsForOrg,
  listRetentionActions,
} from "./customer-success/follow-up.store";

export {
  assignFollowUpOwner,
  getFollowUpState,
  listFollowUpActionHistory,
  recordContactAttempt,
  updateFollowUpResponseStatus,
} from "./customer-success/follow-up.service";

export {
  escalateHotAccount,
  markFollowUpResolved,
  scheduleCallback,
  sendReminder,
} from "./customer-success/retention.service";

export {
  buildCrmDashboard,
  buildFollowUpQueue,
  buildSessionFollowUpDetail,
} from "./customer-success/crm.service";
