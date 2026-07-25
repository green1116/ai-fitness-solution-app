/**
 * Product P7 — Collaboration & Approval Release Gate
 * BASE: enterprise-product-p6-budget-roi-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P6_BUDGET_ROI_ID } from "../../p6/budget/budget.constants";
import {
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
} from "../collaboration/collaboration.constants";
import {
  assertP7CollaborationApprovalReadinessReady,
  clearP7CollaborationApprovalLayer,
  createP7ApprovalManager,
  getP7RegistryManifest,
} from "../approval.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_P7_SIGNOFF_VERSION = "product-p7-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearP7CollaborationApprovalLayer();
}

export function checkProductP7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P7-CONSTANTS",
      "collaboration",
      "Product P7 collaboration & approval version constants",
      PRODUCT_P7_COLLABORATION_APPROVAL_ID ===
        "enterprise-product-p7-collaboration-approval-v1" &&
        PRODUCT_P7_COLLABORATION_APPROVAL_VERSION === "product-p7-1" &&
        PRODUCT_P7_COLLABORATION_APPROVAL_BASE === PRODUCT_P6_BUDGET_ROI_ID &&
        PRODUCT_P7_COLLABORATION_APPROVAL_FREEZE_VERSION ===
          "product-p7-collaboration-approval-freeze-1" &&
        PRODUCT_P7_COLLABORATION_FREEZE_VERSION ===
          "product-p7-collaboration-approval-freeze-1" &&
        COLLABORATION_STATUSES.length === 5 &&
        COMMENT_KINDS.length === 5 &&
        REVIEW_STATUSES.length === 4 &&
        APPROVAL_STATUSES.length === 4 &&
        WORKFLOW_STEP_KINDS.length === 5 &&
        NOTIFICATION_CHANNELS.length === 4 &&
        ACTIVITY_KINDS.length === 6 &&
        DECISION_VERDICTS.length === 4 &&
        P7_READINESS_VERDICTS.length === 3 &&
        P7_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P7_COLLABORATION_APPROVAL_ID} base=${PRODUCT_P7_COLLABORATION_APPROVAL_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P7-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P7-P6-BASE",
      "product-p6",
      "P6 budget & ROI BASE preserved",
      PRODUCT_P7_COLLABORATION_APPROVAL_BASE ===
        "enterprise-product-p6-budget-roi-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P7_COLLABORATION_APPROVAL_BASE}`,
    ),
  );

  checks.push(
    check(
      "P7-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createP7ApprovalManager({ managerId: "prod-p7-gate" });
    mgr.initialize();
    mgr.start();

    const collab = mgr.createCollaboration({
      id: "p7.gate.col",
      budgetRef: "p6.gate.bdg",
      title: "Acme budget approval thread",
      owner: "pm.alex",
    });
    mgr.recordActivity({
      id: "p7.gate.act1",
      collaborationId: collab.id,
      kind: "CREATED",
      actor: "pm.alex",
      summary: "Collaboration opened",
    });
    mgr.createComment({
      id: "p7.gate.cmt",
      collaborationId: collab.id,
      kind: "QUESTION",
      author: "cfo.lee",
      body: "Confirm payback assumptions before approval.",
    });
    mgr.recordActivity({
      id: "p7.gate.act2",
      collaborationId: collab.id,
      kind: "COMMENTED",
      actor: "cfo.lee",
      summary: "CFO asked clarifying question",
    });
    mgr.updateCollaborationStatus({
      collaborationId: collab.id,
      status: "IN_REVIEW",
    });
    const review = mgr.startReview({
      id: "p7.gate.rev",
      collaborationId: collab.id,
      reviewer: "ae.sam",
      notes: "Checking commercial alignment",
    });
    mgr.completeReview({
      reviewId: review.id,
      notes: "Aligned with proposal",
    });
    mgr.recordActivity({
      id: "p7.gate.act3",
      collaborationId: collab.id,
      kind: "REVIEWED",
      actor: "ae.sam",
      summary: "Review completed",
    });
    const step1 = mgr.createWorkflowStep({
      id: "p7.gate.wfl1",
      collaborationId: collab.id,
      kind: "REVIEW",
      name: "Peer review",
      sequence: 1,
    });
    mgr.completeWorkflowStep({ stepId: step1.id });
    const step2 = mgr.createWorkflowStep({
      id: "p7.gate.wfl2",
      collaborationId: collab.id,
      kind: "APPROVE",
      name: "Executive approval",
      sequence: 2,
    });
    const approval = mgr.requestApproval({
      id: "p7.gate.apr",
      collaborationId: collab.id,
      approver: "vp.finance",
      rationale: "Ready for executive decision",
    });
    mgr.decideApproval({
      approvalId: approval.id,
      status: "APPROVED",
      rationale: "ROI meets threshold",
    });
    mgr.completeWorkflowStep({ stepId: step2.id });
    mgr.createNotification({
      id: "p7.gate.ntf",
      collaborationId: collab.id,
      channel: "IN_APP",
      recipient: "pm.alex",
      subject: "Budget approved",
      body: "Executive approval granted for Acme budget.",
    });
    mgr.createDecision({
      id: "p7.gate.dec",
      collaborationId: collab.id,
      verdict: "GO",
      decidedBy: "vp.finance",
      rationale: "Proceed to commercial packaging",
      conditions: ["Lock pricing seats at 50"],
    });
    mgr.recordActivity({
      id: "p7.gate.act4",
      collaborationId: collab.id,
      kind: "APPROVED",
      actor: "vp.finance",
      summary: "Approval granted",
    });
    mgr.recordActivity({
      id: "p7.gate.act5",
      collaborationId: collab.id,
      kind: "DECIDED",
      actor: "vp.finance",
      summary: "GO decision recorded",
    });
    mgr.updateCollaborationStatus({
      collaborationId: collab.id,
      status: "APPROVED",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP7RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P7_COLLABORATION_APPROVAL_ID &&
      registry.base === PRODUCT_P7_COLLABORATION_APPROVAL_BASE &&
      registry.collaborationCount >= 1 &&
      registry.commentCount >= 1 &&
      registry.reviewCount >= 1 &&
      registry.approvalCount >= 1 &&
      registry.workflowCount >= 2 &&
      registry.notificationCount >= 1 &&
      registry.activityCount >= 1 &&
      registry.decisionCount >= 1;

    try {
      assertP7CollaborationApprovalReadinessReady(readiness);
      checks.push(
        check(
          "P7-STACK",
          "collaboration",
          "Collaboration / comment / review / approval / workflow / notification / activity / decision",
          ok,
          `readiness=${readiness.verdict} approvals=${registry.approvalCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P7-STACK",
          "collaboration",
          "Collaboration / comment / review / approval / workflow / notification / activity / decision",
          false,
          error instanceof Error
            ? error.message
            : "p7 collaboration approval not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P7-STACK",
        "collaboration",
        "Collaboration / comment / review / approval / workflow / notification / activity / decision",
        false,
        error instanceof Error
          ? error.message
          : "p7 collaboration approval probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP7ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P7 release gate failed: ${gate.summary}`);
  }
}
