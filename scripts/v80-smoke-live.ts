#!/usr/bin/env tsx
/**
 * V80 DEPLOY P2 — Live smoke execution (first-tenant flow in-process)
 * Run before/after production cutover: npm run v80:smoke-live
 */
import { PDFDocument } from "pdf-lib";

import { getCriticalSmokeTests } from "../lib/deploy/v80/deploy.smoke.spec";
import { enforceV80CommercialGate } from "../lib/scaffold/v80/ops/commercial";
import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { resolveEntitlements } from "../lib/scaffold/v80/services/entitlement.service";
import { createTenderFromIntake } from "../lib/scaffold/v80/services/tender-intake.service";
import { calculateBudgetScaffold } from "../lib/scaffold/v80/services/budget.service";
import { enqueueWorkflowJob } from "../lib/scaffold/v80/workflow/runner.service";
import { renderProposalPdfScaffold } from "../lib/scaffold/v80/pdf/proposal.render";
import { v80Persist } from "../lib/scaffold/v80/runtime/store";
import { V80RuntimeError } from "../lib/scaffold/v80/runtime/errors";
import { runV80IntegrityCheck } from "../lib/scaffold/v80/ops/governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`SMOKE FAIL: ${msg}`);
}

async function main() {
  console.log("V80 DEPLOY P2 Live Smoke Suite\n");
  console.log(`Critical tests: ${getCriticalSmokeTests().length}\n`);

  const integrity = await runV80IntegrityCheck(process.env.V80_DEPLOYMENT_ID ?? "v80-production");
  check(integrity.ok, "integrity check");
  console.log("✓ ops health / integrity");

  const tenant = await provisionTenant({
    organizationName: `Live Tenant ${Date.now()}`,
    plan: "PRO",
    adminEmail: "live@production.local",
  });
  check(Boolean(tenant.organizationId), "tenant");
  console.log("✓ tenant provision");

  const ent = await resolveEntitlements(tenant.organizationId);
  check(ent.features.budgetGeneration === true, "PRO entitlements");
  console.log("✓ entitlements");

  await enforceV80CommercialGate({
    endpoint: "/api/v80/budget/calculate",
    organizationId: tenant.organizationId,
    traceId: "smoke-budget",
    correlationId: "smoke-corr",
  });
  console.log("✓ commercial gate PRO allowed");

  const intake = await createTenderFromIntake({
    projectId: tenant.workspaceId,
    tenderType: "enterprise-gym",
  });
  check(Boolean(intake.quoteId), "intake");
  console.log("✓ tender intake");

  const budget = await calculateBudgetScaffold({
    quoteId: intake.quoteId,
    companySize: 60,
    budgetTier: "mid",
    organizationId: tenant.organizationId,
  });
  check(budget.totals.equipment > 0, "budget");
  console.log("✓ budget + billing path");

  const job = await enqueueWorkflowJob({
    projectId: tenant.workspaceId,
    workflowKey: "tender-pack-complete",
  });
  check(job.status === "completed", "workflow");
  console.log("✓ workflow complete");

  const pdf = await renderProposalPdfScaffold({
    projectId: tenant.workspaceId,
    sections: ["Executive Summary", "Scope"],
  });
  check((await PDFDocument.load(pdf)).getPageCount() >= 1, "pdf");
  console.log("✓ pdf render");

  const artifacts = await v80Persist.listArtifactsByProject(tenant.workspaceId);
  check(artifacts.length >= 3, "artifacts");
  console.log("✓ artifacts persisted");

  let basicBlocked = false;
  const basic = await provisionTenant({
    organizationName: `Basic Smoke ${Date.now()}`,
    plan: "BASIC",
    adminEmail: "basic@production.local",
  });
  try {
    await enforceV80CommercialGate({
      endpoint: "/api/v80/budget/calculate",
      organizationId: basic.organizationId,
      traceId: "smoke-basic",
      correlationId: "smoke-basic-corr",
    });
  } catch (e) {
    basicBlocked = e instanceof V80RuntimeError && e.code === "FEATURE_GATE";
  }
  check(basicBlocked, "BASIC budget gated");
  console.log("✓ billing gate enforcement");

  console.log("\n✅ V80 DEPLOY P2 Live Smoke — PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
