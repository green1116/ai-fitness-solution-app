/**
 * V80 CODE P2 — Minimal Runtime Verification (in-process e2e)
 */
import { PDFDocument } from "pdf-lib";

import { provisionTenant } from "../lib/scaffold/v80/services/tenant.service";
import { resolveEntitlements } from "../lib/scaffold/v80/services/entitlement.service";
import { createTenderFromIntake } from "../lib/scaffold/v80/services/tender-intake.service";
import { calculateBudgetScaffold } from "../lib/scaffold/v80/services/budget.service";
import { enqueueWorkflowJob } from "../lib/scaffold/v80/workflow/runner.service";
import { renderProposalPdfScaffold } from "../lib/scaffold/v80/pdf/proposal.render";
import { v80Persist } from "../lib/scaffold/v80/runtime/store";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("V80 CODE P2 Minimal Runtime Verification\n");

  const tenant = await provisionTenant({
    organizationName: "V80 Test Gym",
    plan: "PRO",
    adminEmail: "admin@v80.test",
  });
  check(Boolean(tenant.organizationId), "tenant provisioned");
  console.log("✓ tenant service");

  const ent = await resolveEntitlements(tenant.organizationId);
  check(ent.features.budgetGeneration === true, "PRO budget enabled");
  console.log("✓ entitlement service");

  const intake = await createTenderFromIntake({
    projectId: tenant.workspaceId,
    tenderType: "enterprise-gym",
    documentUrls: ["https://example.com/rfp.pdf"],
  });
  check(Boolean(intake.tenderId), "tender created");
  console.log("✓ tender intake");

  const budget = await calculateBudgetScaffold({
    quoteId: intake.quoteId,
    companySize: 40,
    budgetTier: "mid",
    organizationId: tenant.organizationId,
  });
  check(budget.totals.equipment > 0, "budget totals");
  console.log("✓ budget service");

  const job = await enqueueWorkflowJob({
    projectId: tenant.workspaceId,
    workflowKey: "tender-pack-complete",
  });
  check(job.status === "completed", "workflow completed");
  check(job.steps.every((s) => s.status === "completed"), "all steps done");
  console.log("✓ workflow executor");

  const pdf = await renderProposalPdfScaffold({
    projectId: tenant.workspaceId,
    sections: ["Intro", "Scope"],
  });
  const doc = await PDFDocument.load(pdf);
  check(doc.getPageCount() >= 1, "pdf pages");
  console.log("✓ pdf pipeline");

  const artifacts = await v80Persist.listArtifactsByProject(tenant.workspaceId);
  check(artifacts.length >= 3, "workflow artifacts saved");
  console.log("✓ artifact store");

  console.log("\n✅ V80 CODE P2 Minimal Runtime — verify PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
