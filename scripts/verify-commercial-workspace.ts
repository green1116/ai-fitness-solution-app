/**
 * V47 Commercial Products — Customer Workspace verification
 */
import {
  buildCustomerWorkspace,
  syncWorkspaceFromQuote,
  validateCommercialWorkspace,
} from "../lib/commercial-products/workspace";
import { CP_WORKSPACE_API_PATH } from "../lib/commercial-products/workspace/workspace-types";
import { createQuote } from "../lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "../lib/commercial-products/access-layer/pdf/quote-snapshot-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const customerId = "verify-customer";

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

const workspace = syncWorkspaceFromQuote({
  customerId,
  customerName: "Verify Customer",
  quoteId: quote.snapshot.quoteId,
  projectName: quote.snapshot.inputs.projectName,
  sku: quote.snapshot.sku,
  suggestedPriceCny: quote.snapshot.price,
  sla: quote.snapshot.sla,
});

assert(workspace.workspaceId.length > 0, "workspace ready");
assert(workspace.projects.length >= 1, "projects ready");
assert(workspace.history.length >= 2, "history ready");
assert(workspace.projects[0]!.downloadLinks.length >= 5, "download center");

console.log("✓ customer workspace ok");
console.log(`  workspaceId=${workspace.workspaceId} projects=${workspace.projects.length}`);

console.log("✓ projects ok");
console.log(`  project=${workspace.projects[0]!.projectName}`);

console.log("✓ history ok");
console.log(`  items=${workspace.history.length}`);

console.log("✓ download center ok");
console.log(`  links=${workspace.projects[0]!.downloadLinks.length}`);

const refreshed = buildCustomerWorkspace({ customerId });
assert(refreshed.projects.length === workspace.projects.length, "workspace service");

console.log("✓ workspace service ok");

assert(CP_WORKSPACE_API_PATH === "/api/commercial-products/workspace", "api route");
console.log("✓ api route ok");
console.log(`  path=${CP_WORKSPACE_API_PATH}`);

const validation = validateCommercialWorkspace();
assert(validation.valid, "workspace validation");

console.log("✓ workspace validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("CUSTOMER WORKSPACE PASS");
