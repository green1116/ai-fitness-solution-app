import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import { syncWorkspaceFromQuote } from "@/lib/commercial-products/workspace/workspace-service";
import {
  approveDelivery,
  createApproval,
  markDelivered,
  submitForReview,
} from "@/lib/commercial-products/approval/approval-runtime";
import { ApprovalService } from "@/lib/commercial-products/approval/approval-service";
import { validateAuditPolicyMatrix } from "./audit-policy";
import { AuditService } from "./audit-service";
import type { AuditValidation } from "./audit-types";
import { CP_AUDIT_API_PATH, CP_AUDIT_PAGE_PATH } from "./audit-types";
import {
  buildAuditContext,
  recordAuditEvent,
  resolveAuditEventsByApproval,
  resolveAuditEventsByQuote,
  resolveAuditEventsByWorkspace,
} from "./audit-runtime";

export function validateCommercialAudit(): AuditValidation {
  let runtimeOk = false;
  let serviceOk = false;
  let policyOk = false;
  let historyOk = false;
  let complianceOk = false;

  try {
    AuditService.clearAll();
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

    const workspaceId = "audit-workspace";
    syncWorkspaceFromQuote({
      customerId: workspaceId,
      customerName: "Audit Customer",
      quoteId: quote.snapshot.quoteId,
      projectName: quote.snapshot.inputs.projectName,
      sku: quote.snapshot.sku,
      suggestedPriceCny: quote.snapshot.price,
      sla: quote.snapshot.sla,
    });

    const projectId = `ws-project-${quote.snapshot.quoteId}`;
    const context = buildAuditContext({
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      projectId,
    });

    recordAuditEvent({
      eventType: "workspace_created",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      actorType: "system",
      title: "Workspace created",
    });
    recordAuditEvent({
      eventType: "quote_created",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      projectId,
      actorType: "customer",
      actorName: "Audit Customer",
      title: "Quote created",
    });

    const approval = createApproval({ quoteId: quote.snapshot.quoteId, projectId });
    submitForReview({ approvalId: approval.approval.approvalId });
    const approved = approveDelivery({ approvalId: approval.approval.approvalId });
    markDelivered({ approvalId: approved.approval.approvalId });

    const approvedAudit = recordAuditEvent({
      eventType: "approval_approved",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      approvalId: approval.approval.approvalId,
      actorType: "admin",
      actorName: "Compliance Admin",
      title: "Approval approved",
    });
    const deliveredAudit = recordAuditEvent({
      eventType: "approval_delivered",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      approvalId: approval.approval.approvalId,
      actorType: "operator",
      title: "Approval delivered",
    });
    recordAuditEvent({
      eventType: "package_built",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      packageId: `pkg-${quote.snapshot.quoteId}`,
      actorType: "system",
      title: "Package built",
    });
    recordAuditEvent({
      eventType: "download_completed",
      workspaceId,
      quoteId: quote.snapshot.quoteId,
      actorType: "customer",
      title: "Download completed",
    });

    runtimeOk =
      resolveAuditEventsByWorkspace(workspaceId).events.length >= 3 &&
      resolveAuditEventsByQuote(quote.snapshot.quoteId).events.length >= 3 &&
      resolveAuditEventsByApproval(approval.approval.approvalId).events.length >= 2;

    serviceOk = AuditService.listEvents().events.length >= 6;
    policyOk = validateAuditPolicyMatrix();
    historyOk = deliveredAudit.event.auditId.length > 0;
    complianceOk =
      Boolean(approvedAudit.compliance?.status) &&
      approvedAudit.compliance?.rules.every((rule) => rule.passed) === true;
  } catch {
    // flags remain false
  }

  const apiPathRegistered = CP_AUDIT_API_PATH === "/api/commercial-products/audit";
  const pagePathRegistered = CP_AUDIT_PAGE_PATH === "/commercial/v47/audit";
  const valid =
    runtimeOk &&
    serviceOk &&
    policyOk &&
    historyOk &&
    complianceOk &&
    apiPathRegistered &&
    pagePathRegistered;

  return {
    valid,
    runtimeOk,
    serviceOk,
    policyOk,
    historyOk,
    complianceOk,
    apiPathRegistered,
    pagePathRegistered,
    summary: [
      `runtimeOk=${runtimeOk}`,
      `serviceOk=${serviceOk}`,
      `policyOk=${policyOk}`,
      `historyOk=${historyOk}`,
      `complianceOk=${complianceOk}`,
      `apiPathRegistered=${apiPathRegistered}`,
      `pagePathRegistered=${pagePathRegistered}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
