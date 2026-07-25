/**
 * Product P7 — Collaboration & Approval Manager
 */

import {
  clearActivities,
  getActivity,
  listActivities,
  recordActivity,
} from "./activity/activity.registry";
import type {
  CollaborationActivity,
  RecordActivityInput,
} from "./activity/activity.types";
import {
  clearApprovals,
  decideApproval,
  getApproval,
  listApprovals,
  requestApproval,
} from "./approval/approval.registry";
import type {
  ApprovalRequest,
  DecideApprovalInput,
  RequestApprovalInput,
} from "./approval/approval.types";
import {
  PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
  PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
  PRODUCT_P7_COLLABORATION_APPROVAL_ID,
  PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
} from "./collaboration/collaboration.constants";
import {
  assertP7CollaborationApprovalReadinessReady,
  evaluateP7CollaborationApprovalReadiness,
} from "./collaboration/collaboration.readiness";
import {
  clearCollaborations,
  createCollaboration,
  getCollaboration,
  listCollaborations,
  updateCollaborationStatus,
} from "./collaboration/collaboration.registry";
import type {
  CollaborationThread,
  CreateCollaborationInput,
  P7ManagerStatus,
  P7ReadinessResult,
  P7RegistryManifest,
  UpdateCollaborationStatusInput,
} from "./collaboration/collaboration.types";
import {
  clearComments,
  createComment,
  getComment,
  listComments,
} from "./comment/comment.registry";
import type {
  CollaborationComment,
  CreateCommentInput,
} from "./comment/comment.types";
import {
  clearDecisions,
  createDecision,
  getDecision,
  listDecisions,
} from "./decision/decision.registry";
import type {
  CollaborationDecision,
  CreateDecisionInput,
} from "./decision/decision.types";
import {
  clearNotifications,
  createNotification,
  getNotification,
  listNotifications,
} from "./notification/notification.registry";
import type {
  CollaborationNotification,
  CreateNotificationInput,
} from "./notification/notification.types";
import {
  clearReviews,
  completeReview,
  getReview,
  listReviews,
  startReview,
} from "./review/review.registry";
import type {
  CollaborationReview,
  CompleteReviewInput,
  StartReviewInput,
} from "./review/review.types";
import {
  clearWorkflowSteps,
  completeWorkflowStep,
  createWorkflowStep,
  getWorkflowStep,
  listWorkflowSteps,
} from "./workflow/workflow.registry";
import type {
  CompleteWorkflowStepInput,
  CreateWorkflowStepInput,
  WorkflowStep,
} from "./workflow/workflow.types";

export type P7ApprovalManagerSnapshot = {
  managerId: string;
  status: P7ManagerStatus;
  layerId: typeof PRODUCT_P7_COLLABORATION_APPROVAL_ID;
  version: typeof PRODUCT_P7_COLLABORATION_APPROVAL_VERSION;
  collaborationCount: number;
  commentCount: number;
  reviewCount: number;
  approvalCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P7ApprovalManager = {
  initialize: () => P7ApprovalManagerSnapshot;
  start: () => P7ApprovalManagerSnapshot;
  stop: () => P7ApprovalManagerSnapshot;
  status: () => P7ApprovalManagerSnapshot;
  createCollaboration: (
    input: CreateCollaborationInput,
  ) => CollaborationThread;
  updateCollaborationStatus: (
    input: UpdateCollaborationStatusInput,
  ) => CollaborationThread;
  createComment: (input: CreateCommentInput) => CollaborationComment;
  startReview: (input: StartReviewInput) => CollaborationReview;
  completeReview: (input: CompleteReviewInput) => CollaborationReview;
  requestApproval: (input: RequestApprovalInput) => ApprovalRequest;
  decideApproval: (input: DecideApprovalInput) => ApprovalRequest;
  createWorkflowStep: (input: CreateWorkflowStepInput) => WorkflowStep;
  completeWorkflowStep: (input: CompleteWorkflowStepInput) => WorkflowStep;
  createNotification: (
    input: CreateNotificationInput,
  ) => CollaborationNotification;
  recordActivity: (input: RecordActivityInput) => CollaborationActivity;
  createDecision: (input: CreateDecisionInput) => CollaborationDecision;
  evaluateReadiness: () => P7ReadinessResult;
  manifest: () => P7RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP7RegistryManifest(): P7RegistryManifest {
  return {
    foundationId: PRODUCT_P7_COLLABORATION_APPROVAL_ID,
    version: PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
    freezeVersion: PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION,
    base: PRODUCT_P7_COLLABORATION_APPROVAL_BASE,
    collaborationCount: listCollaborations().length,
    commentCount: listComments().length,
    reviewCount: listReviews().length,
    approvalCount: listApprovals().length,
    workflowCount: listWorkflowSteps().length,
    notificationCount: listNotifications().length,
    activityCount: listActivities().length,
    decisionCount: listDecisions().length,
  };
}

export function clearP7CollaborationApprovalLayer(): void {
  clearDecisions();
  clearActivities();
  clearNotifications();
  clearWorkflowSteps();
  clearApprovals();
  clearReviews();
  clearComments();
  clearCollaborations();
}

export function createP7ApprovalManager(options?: {
  managerId?: string;
}): P7ApprovalManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p7-apr-mgr");
  let state: P7ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P7ApprovalManagerSnapshot {
    const reg = getP7RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P7_COLLABORATION_APPROVAL_ID,
      version: PRODUCT_P7_COLLABORATION_APPROVAL_VERSION,
      collaborationCount: reg.collaborationCount,
      commentCount: reg.commentCount,
      reviewCount: reg.reviewCount,
      approvalCount: reg.approvalCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P7ApprovalManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP7CollaborationApprovalLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P7ApprovalManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P7ApprovalManagerSnapshot {
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
    createCollaboration: (input) => {
      assertRunning("createCollaboration");
      return createCollaboration(input);
    },
    updateCollaborationStatus: (input) => {
      assertRunning("updateCollaborationStatus");
      return updateCollaborationStatus(input);
    },
    createComment: (input) => {
      assertRunning("createComment");
      return createComment(input);
    },
    startReview: (input) => {
      assertRunning("startReview");
      return startReview(input);
    },
    completeReview: (input) => {
      assertRunning("completeReview");
      return completeReview(input);
    },
    requestApproval: (input) => {
      assertRunning("requestApproval");
      return requestApproval(input);
    },
    decideApproval: (input) => {
      assertRunning("decideApproval");
      return decideApproval(input);
    },
    createWorkflowStep: (input) => {
      assertRunning("createWorkflowStep");
      return createWorkflowStep(input);
    },
    completeWorkflowStep: (input) => {
      assertRunning("completeWorkflowStep");
      return completeWorkflowStep(input);
    },
    createNotification: (input) => {
      assertRunning("createNotification");
      return createNotification(input);
    },
    recordActivity: (input) => {
      assertRunning("recordActivity");
      return recordActivity(input);
    },
    createDecision: (input) => {
      assertRunning("createDecision");
      return createDecision(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP7CollaborationApprovalReadiness();
    },
    manifest: getP7RegistryManifest,
  };
}

export {
  assertP7CollaborationApprovalReadinessReady,
  getActivity,
  getApproval,
  getCollaboration,
  getComment,
  getDecision,
  getNotification,
  getReview,
  getWorkflowStep,
  listActivities,
  listApprovals,
  listCollaborations,
  listComments,
  listDecisions,
  listNotifications,
  listReviews,
  listWorkflowSteps,
};
