/**
 * V8.4 Trial Workspace Platform — verification
 */
import {
  TRIAL_WORKSPACE_VERSION,
  buildTrialWorkspace,
  buildTrialEntitlements,
  buildTrialUsage,
  buildTrialSummary,
  buildTrialWorkspaceResponse,
  validateTrialWorkspace,
} from "../lib/productization/trial";

const DEPLOYMENT_ID = "v84-trial-workspace-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testWorkspace() {
  const workspace = buildTrialWorkspace({ deploymentId: DEPLOYMENT_ID });
  assert(workspace.workspaceId.length > 0, "workspace id");
  assert(workspace.organization.length > 0, "organization");
  assert(workspace.owner.length > 0, "owner");
  assert(workspace.createdAt.length > 0, "createdAt");
  assert(workspace.expiresAt.length > 0, "expiresAt");
  assert(["active", "expired", "suspended"].includes(workspace.status), "status");
  console.log("✓ workspace valid");
}

function testEntitlements() {
  const entitlements = buildTrialEntitlements({ deploymentId: DEPLOYMENT_ID });
  assert(entitlements.planGenerationLimit > 0, "plan generation limit");
  assert(entitlements.budgetGenerationLimit > 0, "budget generation limit");
  assert(entitlements.proposalPdfLimit > 0, "proposal PDF limit");
  assert(entitlements.tenderPackageLimit > 0, "tender package limit");
  assert(entitlements.workspaceLimit > 0, "workspace limit");
  assert(entitlements.userLimit > 0, "user limit");
  console.log("✓ entitlement valid");
}

function testUsage() {
  const usage = buildTrialUsage({ deploymentId: DEPLOYMENT_ID });
  assert(usage.plansGenerated >= 0, "plans generated");
  assert(usage.budgetsGenerated >= 0, "budgets generated");
  assert(usage.pdfExports >= 0, "pdf exports");
  assert(usage.tenderExports >= 0, "tender exports");
  assert(usage.activeUsers >= 0, "active users");
  assert(usage.remainingQuota.plans >= 0, "remaining plans");
  assert(usage.remainingQuota.budgets >= 0, "remaining budgets");
  assert(usage.remainingQuota.pdf >= 0, "remaining pdf");
  assert(usage.remainingQuota.tenders >= 0, "remaining tenders");
  assert(usage.remainingQuota.users >= 0, "remaining users");
  console.log("✓ usage valid");
}

function testSummary() {
  const summary = buildTrialSummary({ deploymentId: DEPLOYMENT_ID });
  const response = buildTrialWorkspaceResponse({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === TRIAL_WORKSPACE_VERSION, "summary version");
  assert(summary.workspaceId === response.workspace.workspaceId, "summary workspace");
  assert(summary.utilizationRate >= 0, "utilization rate");
  assert(summary.remainingCoreQuota >= 0, "remaining core quota");
  assert(summary.summary.length > 0, "summary text");

  const validation = validateTrialWorkspace({ deploymentId: DEPLOYMENT_ID });
  assert(validation.workspaceValid, "workspace valid");
  assert(validation.entitlementValid, "entitlement valid");
  assert(validation.usageValid, "usage valid");
  assert(validation.summaryValid, "summary valid");

  console.log("✓ summary valid");
  console.log(" ", summary.summary);
  console.log("");
  console.log("TRIAL WORKSPACE VERIFY PASS");
}

function main() {
  testWorkspace();
  testEntitlements();
  testUsage();
  testSummary();
}

main();
