/**
 * Product P7 — Collaboration & Approval readiness
 */

import { PRODUCT_P6_BUDGET_ROI_ID } from "../../p6/budget/budget.constants";
import { listActivities } from "../activity/activity.registry";
import { listApprovals } from "../approval/approval.registry";
import { listComments } from "../comment/comment.registry";
import { listDecisions } from "../decision/decision.registry";
import { listNotifications } from "../notification/notification.registry";
import { listReviews } from "../review/review.registry";
import { listWorkflowSteps } from "../workflow/workflow.registry";
import { PRODUCT_P7_COLLABORATION_APPROVAL_BASE } from "./collaboration.constants";
import { listCollaborations } from "./collaboration.registry";
import type {
  P7ReadinessCheck,
  P7ReadinessResult,
} from "./collaboration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P7ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP7CollaborationApprovalReadiness(): P7ReadinessResult {
  const checks: P7ReadinessCheck[] = [];

  checks.push(
    check(
      "P7-BASE",
      "foundation",
      "P6 budget & ROI baseline aligned",
      PRODUCT_P7_COLLABORATION_APPROVAL_BASE === PRODUCT_P6_BUDGET_ROI_ID,
      `base=${PRODUCT_P7_COLLABORATION_APPROVAL_BASE}`,
    ),
  );

  const collaborations = listCollaborations();
  checks.push(
    check(
      "P7-COL",
      "collaboration",
      "Collaborations present",
      collaborations.length >= 1,
      `collaborations=${collaborations.length}`,
    ),
  );

  const comments = listComments();
  checks.push(
    check(
      "P7-CMT",
      "comment",
      "Comments present",
      comments.length >= 1,
      `comments=${comments.length}`,
    ),
  );

  const reviews = listReviews();
  checks.push(
    check(
      "P7-REV",
      "review",
      "Reviews complete",
      reviews.some((r) => r.status === "COMPLETE"),
      `reviews=${reviews.length}`,
    ),
  );

  const approvals = listApprovals();
  checks.push(
    check(
      "P7-APR",
      "approval",
      "Approvals decided",
      approvals.some((a) => a.status === "APPROVED" || a.status === "REJECTED"),
      `approvals=${approvals.length}`,
    ),
  );

  const workflows = listWorkflowSteps();
  checks.push(
    check(
      "P7-WFL",
      "workflow",
      "Workflow steps present",
      workflows.length >= 1,
      `workflows=${workflows.length}`,
    ),
  );

  const notifications = listNotifications();
  checks.push(
    check(
      "P7-NTF",
      "notification",
      "Notifications present",
      notifications.length >= 1,
      `notifications=${notifications.length}`,
    ),
  );

  const activities = listActivities();
  checks.push(
    check(
      "P7-ACT",
      "activity",
      "Activities recorded",
      activities.length >= 1,
      `activities=${activities.length}`,
    ),
  );

  const decisions = listDecisions();
  checks.push(
    check(
      "P7-DEC",
      "decision",
      "Decisions present",
      decisions.length >= 1,
      `decisions=${decisions.length}`,
    ),
  );

  const advanced = collaborations.some(
    (c) =>
      c.status === "APPROVED" ||
      c.status === "REJECTED" ||
      c.status === "CLOSED",
  );
  checks.push(
    check(
      "P7-LIFE",
      "collaboration",
      "Collaboration lifecycle advanced",
      advanced,
      `advanced=${advanced}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `p7-collaboration-approval readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP7CollaborationApprovalReadinessReady(
  result: P7ReadinessResult,
): asserts result is P7ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p7 collaboration approval not ready: ${result.summary}`,
    );
  }
}
