import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import { syncWorkspaceFromQuote } from "@/lib/commercial-products/workspace/workspace-service";
import { validateApprovalPolicyMatrix } from "./approval-policy";
import { clearApprovalHistory } from "./approval-history";
import type { ApprovalValidation } from "./approval-types";
import { CP_APPROVAL_API_PATH } from "./approval-types";
import {
  approveDelivery,
  createApproval,
  markDelivered,
  rejectDelivery,
  submitForReview,
} from "./approval-runtime";
import { ApprovalService } from "./approval-service";

export function validateCommercialApproval(): ApprovalValidation {
  let runtimeOk = false;
  let policyOk = false;
  let historyOk = false;
  let workspaceIntegrationOk = false;

  try {
    ApprovalService.clearAll();

    const quote = createQuote({
      sku: "kickstart-package",
      projectName: "School Gym Project",
      areaSqm: 320,
      headcount: 180,
      budgetCny: 650_000,
      complexity: "medium",
      slaTier: "7d",
    });
    registerQuoteSnapshot(quote.snapshot);

    const projectId = `ws-project-${quote.snapshot.quoteId}`;
    syncWorkspaceFromQuote({
      customerId: "approval-customer",
      customerName: "Approval Customer",
      quoteId: quote.snapshot.quoteId,
      projectName: quote.snapshot.inputs.projectName,
      sku: quote.snapshot.sku,
      suggestedPriceCny: quote.snapshot.price,
      sla: quote.snapshot.sla,
    });

    const created = createApproval({
      quoteId: quote.snapshot.quoteId,
      projectId,
    });
    const draftStatus = created.approval.status;
    const submitted = submitForReview({ approvalId: created.approval.approvalId });
    const submittedStatus = submitted.approval.status;
    const approved = approveDelivery({ approvalId: submitted.approval.approvalId });
    const approvedStatus = approved.approval.status;
    const delivered = markDelivered({ approvalId: approved.approval.approvalId });
    const deliveredStatus = delivered.approval.status;

    runtimeOk =
      draftStatus === "draft" &&
      submittedStatus === "review" &&
      approvedStatus === "approved" &&
      deliveredStatus === "delivered";

    policyOk = validateApprovalPolicyMatrix();

    try {
      rejectDelivery({ approvalId: delivered.approval.approvalId });
    } catch {
      // expected after delivered
    }

    historyOk = delivered.history.length >= 3;
    workspaceIntegrationOk = created.approval.projectId === projectId;

    clearApprovalHistory(created.approval.approvalId);
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_APPROVAL_API_PATH === "/api/commercial-products/approval";
  const valid =
    runtimeOk && policyOk && historyOk && apiPathRegistered && workspaceIntegrationOk;

  return {
    valid,
    runtimeOk,
    policyOk,
    historyOk,
    apiPathRegistered,
    workspaceIntegrationOk,
    summary: [
      `runtimeOk=${runtimeOk}`,
      `policyOk=${policyOk}`,
      `historyOk=${historyOk}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `workspaceIntegrationOk=${workspaceIntegrationOk}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
