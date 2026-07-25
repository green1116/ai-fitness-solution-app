/**
 * Product P7 — Collaboration & Approval public exports
 * Isolated namespace: lib/product/p7
 */

export {
  ACTIVITY_KINDS,
  APPROVAL_STATUSES,
  COLLABORATION_STATUSES,
  COMMENT_KINDS,
  DECISION_VERDICTS,
  NOTIFICATION_CHANNELS,
  P7_MANAGER_STATUSES,
  P7_READINESS_VERDICTS,
  PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
  PRODUCT_P7_COLLABORATION_APPROVAL_ID,
  PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
  PRODUCT_P7_COLLABORATION_FREEZE_VERSION,
  REVIEW_STATUSES,
  WORKFLOW_STEP_KINDS,
} from "./collaboration/collaboration.constants";

export type {
  CollaborationMetadata,
  CollaborationStatus,
  CollaborationThread,
  CreateCollaborationInput,
  P7ManagerStatus,
  P7ReadinessCheck,
  P7ReadinessResult,
  P7ReadinessVerdict,
  P7RegistryManifest,
  UpdateCollaborationStatusInput,
} from "./collaboration/collaboration.types";

export {
  clearCollaborations,
  createCollaboration,
  getCollaboration,
  listCollaborations,
  updateCollaborationStatus,
} from "./collaboration/collaboration.registry";

export type {
  CollaborationComment,
  CommentKind,
  CommentMetadata,
  CreateCommentInput,
} from "./comment/comment.types";

export {
  clearComments,
  createComment,
  getComment,
  listComments,
} from "./comment/comment.registry";

export type {
  CollaborationReview,
  CompleteReviewInput,
  ReviewMetadata,
  ReviewStatus,
  StartReviewInput,
} from "./review/review.types";

export {
  clearReviews,
  completeReview,
  getReview,
  listReviews,
  startReview,
} from "./review/review.registry";

export type {
  ApprovalMetadata,
  ApprovalRequest,
  ApprovalStatus,
  DecideApprovalInput,
  RequestApprovalInput,
} from "./approval/approval.types";

export {
  clearApprovals,
  decideApproval,
  getApproval,
  listApprovals,
  requestApproval,
} from "./approval/approval.registry";

export type {
  CompleteWorkflowStepInput,
  CreateWorkflowStepInput,
  WorkflowMetadata,
  WorkflowStep,
  WorkflowStepKind,
} from "./workflow/workflow.types";

export {
  clearWorkflowSteps,
  completeWorkflowStep,
  createWorkflowStep,
  getWorkflowStep,
  listWorkflowSteps,
} from "./workflow/workflow.registry";

export type {
  CollaborationNotification,
  CreateNotificationInput,
  NotificationChannel,
  NotificationMetadata,
} from "./notification/notification.types";

export {
  clearNotifications,
  createNotification,
  getNotification,
  listNotifications,
} from "./notification/notification.registry";

export type {
  ActivityKind,
  ActivityMetadata,
  CollaborationActivity,
  RecordActivityInput,
} from "./activity/activity.types";

export {
  clearActivities,
  getActivity,
  listActivities,
  recordActivity,
} from "./activity/activity.registry";

export type {
  CollaborationDecision,
  CreateDecisionInput,
  DecisionMetadata,
  DecisionVerdict,
} from "./decision/decision.types";

export {
  clearDecisions,
  createDecision,
  getDecision,
  listDecisions,
} from "./decision/decision.registry";

export {
  assertP7CollaborationApprovalReadinessReady,
  evaluateP7CollaborationApprovalReadiness,
} from "./collaboration/collaboration.readiness";

export {
  clearP7CollaborationApprovalLayer,
  createP7ApprovalManager,
  getP7RegistryManifest,
  type P7ApprovalManager,
  type P7ApprovalManagerSnapshot,
} from "./approval.manager";

export {
  assertProductP7ReleaseGatePass,
  checkProductP7ReleaseGate,
  PRODUCT_P7_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
