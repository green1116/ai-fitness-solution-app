/**
 * V47 Commercial Products — Audit & Compliance verification
 */
import {
  AuditService,
  buildAuditContext,
  recordAuditEvent,
  resolveAuditEventsByQuote,
  validateCommercialAudit,
} from "../lib/commercial-products/audit";
import { CP_AUDIT_API_PATH, CP_AUDIT_PAGE_PATH } from "../lib/commercial-products/audit/audit-types";
import { validateAuditPolicyMatrix } from "../lib/commercial-products/audit/audit-policy";
import { createQuote } from "../lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "../lib/commercial-products/access-layer/pdf/quote-snapshot-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

AuditService.clearAll();

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

const workspaceId = "verify-audit-workspace";
const projectId = `ws-project-${quote.snapshot.quoteId}`;
const approvalId = `ap-${quote.snapshot.quoteId}`;

buildAuditContext({ workspaceId, quoteId: quote.snapshot.quoteId, projectId, approvalId });

recordAuditEvent({
  eventType: "quote_created",
  workspaceId,
  quoteId: quote.snapshot.quoteId,
  projectId,
  actorType: "customer",
  title: "Quote created",
});

const approved = recordAuditEvent({
  eventType: "approval_approved",
  workspaceId,
  quoteId: quote.snapshot.quoteId,
  approvalId,
  actorType: "admin",
  title: "Approval approved",
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

console.log("✓ audit runtime ok");
console.log(`  events=${resolveAuditEventsByQuote(quote.snapshot.quoteId).events.length}`);

console.log("✓ audit service ok");
console.log(`  total=${AuditService.listEvents().events.length}`);

assert(validateAuditPolicyMatrix(), "audit policy");
console.log("✓ audit policy ok");

assert(approved.compliance?.status === "pass", "compliance snapshot");
console.log("✓ compliance snapshot ok");
console.log(`  status=${approved.compliance?.status}`);

assert(CP_AUDIT_API_PATH === "/api/commercial-products/audit", "api route");
console.log("✓ api route ok");
console.log(`  path=${CP_AUDIT_API_PATH}`);

assert(CP_AUDIT_PAGE_PATH === "/commercial/v47/audit", "page route");
console.log("✓ page route ok");
console.log(`  path=${CP_AUDIT_PAGE_PATH}`);

const validation = validateCommercialAudit();
assert(validation.valid, "audit validation");

console.log("✓ audit validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("COMMERCIAL AUDIT PASS");
