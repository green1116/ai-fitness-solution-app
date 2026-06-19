/**
 * V47 Commercial Products — Approval Workflow verification
 */
import {
  approveDelivery,
  createApproval,
  getApprovalRecord,
  markDelivered,
  rejectDelivery,
  submitForReview,
  validateApprovalPolicyMatrix,
  validateCommercialApproval,
} from "../lib/commercial-products/approval";
import { CP_APPROVAL_API_PATH } from "../lib/commercial-products/approval/approval-types";
import { createQuote } from "../lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "../lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import { syncWorkspaceFromQuote } from "../lib/commercial-products/workspace/workspace-service";
import { ApprovalService } from "../lib/commercial-products/approval/approval-service";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

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
  customerId: "verify-approval-customer",
  customerName: "Verify Approval Customer",
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
assert(created.approval.status === "draft", "draft created");

const submitted = submitForReview({ approvalId: created.approval.approvalId });
assert(submitted.approval.status === "review", "review status");

const approved = approveDelivery({ approvalId: submitted.approval.approvalId });
assert(approved.approval.status === "approved", "approved status");

const delivered = markDelivered({ approvalId: approved.approval.approvalId });
assert(delivered.approval.status === "delivered", "delivered status");

console.log("✓ approval runtime ok");
console.log(`  approvalId=${delivered.approval.approvalId}`);

assert(validateApprovalPolicyMatrix(), "approval policy");
console.log("✓ approval policy ok");

assert(delivered.history.length >= 3, "approval history");
console.log("✓ approval history ok");
console.log(`  items=${delivered.history.length}`);

assert(CP_APPROVAL_API_PATH === "/api/commercial-products/approval", "api route");
console.log("✓ api route ok");
console.log(`  path=${CP_APPROVAL_API_PATH}`);

const lookup = getApprovalRecord({ quoteId: quote.snapshot.quoteId });
assert(lookup.approval.status === "delivered", "workspace integration lookup");
console.log("✓ workspace integration ok");
console.log(`  projectId=${lookup.approval.projectId}`);

try {
  rejectDelivery({ approvalId: created.approval.approvalId });
  throw new Error("reject should fail after delivered");
} catch {
  // expected
}

const validation = validateCommercialApproval();
assert(validation.valid, "approval validation");

console.log("✓ approval validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("COMMERCIAL APPROVAL PASS");
