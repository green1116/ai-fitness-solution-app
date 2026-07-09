/** V80 CODE P2 — workflow step executors */
import { calculateBudgetScaffold } from "../services/budget.service";
import { createTenderFromIntake } from "../services/tender-intake.service";
import { savePdfArtifact } from "../pdf/artifact.service";
import { renderBudgetPdfScaffold } from "../pdf/budget.render";
import { mergePdfBundleScaffold } from "../pdf/bundle.merge";
import { renderPlanPdfScaffold } from "../pdf/plan.render";
import { renderProposalPdfScaffold } from "../pdf/proposal.render";
import { v80Persist } from "../runtime/store";
import type { TenderPackStep } from "./dag.registry";

export type StepContext = {
  projectId: string;
  quoteId?: string;
  budgetId?: string;
};

export async function executeWorkflowStep(
  step: TenderPackStep,
  ctx: StepContext,
): Promise<StepContext> {
  switch (step) {
    case "tender-upload": {
      const existing = await v80Persist.findTenderByProject(ctx.projectId);
      if (!existing) {
        const intake = await createTenderFromIntake({
          projectId: ctx.projectId,
          tenderType: "enterprise-gym",
        });
        return { ...ctx, quoteId: intake.quoteId };
      }
      const quote = await v80Persist.findQuoteByProject(ctx.projectId);
      return { ...ctx, quoteId: quote?.id };
    }
    case "tender-intelligence":
      return ctx;
    case "proposal-generation":
      return ctx;
    case "budget-calculate": {
      const project = await v80Persist.getProject(ctx.projectId);
      const quote =
        (ctx.quoteId ? await v80Persist.getQuote(ctx.quoteId) : null) ??
        (await v80Persist.findQuoteByProject(ctx.projectId));
      if (!project || !quote) return ctx;
      const result = await calculateBudgetScaffold({
        quoteId: quote.id,
        companySize: 50,
        budgetTier: "mid",
        organizationId: project.organizationId,
      });
      return { ...ctx, quoteId: quote.id, budgetId: result.budgetId };
    }
    case "plan-pdf": {
      const buf = await renderPlanPdfScaffold(ctx.projectId);
      await savePdfArtifact({ projectId: ctx.projectId, type: "plan", buffer: buf });
      return ctx;
    }
    case "budget-pdf": {
      const budget =
        (ctx.budgetId ? await v80Persist.getBudget(ctx.budgetId) : null) ??
        (await v80Persist.findBudgetForProject(ctx.projectId));
      const buf = await renderBudgetPdfScaffold({
        budgetId: budget?.id ?? "draft",
        level: "brand",
      });
      await savePdfArtifact({ projectId: ctx.projectId, type: "budget", buffer: buf });
      return ctx;
    }
    case "proposal-pdf": {
      const buf = await renderProposalPdfScaffold({
        projectId: ctx.projectId,
        sections: ["Company Overview", "Equipment Proposal", "Delivery Timeline"],
      });
      await savePdfArtifact({ projectId: ctx.projectId, type: "proposal", buffer: buf });
      return ctx;
    }
    case "enterprise-zip": {
      const buf = await mergePdfBundleScaffold(ctx.projectId);
      await savePdfArtifact({ projectId: ctx.projectId, type: "bundle", buffer: buf });
      return ctx;
    }
    default:
      return ctx;
  }
}
