/** V80 CODE P2 — API handlers (route → service) */
import { buildCodeRelease } from "@/lib/code/v80/release.entry";
import { runV80IntegrityCheck } from "../ops/governance";

import {
  calculateBudgetSchema,
  enqueueWorkflowSchema,
  entitlementsQuerySchema,
  integrityQuerySchema,
  pdfGatewayQuerySchema,
  proposalPdfSchema,
  provisionTenantSchema,
  tenderIntakeSchema,
} from "./schemas";
import { jsonOk, parseJsonBody, parseQuery } from "./handler.util";
import { calculateBudgetScaffold } from "../services/budget.service";
import { resolveEntitlements } from "../services/entitlement.service";
import { provisionTenant } from "../services/tenant.service";
import { createTenderFromIntake } from "../services/tender-intake.service";
import { getPdfArtifact, savePdfArtifact } from "../pdf/artifact.service";
import { renderBudgetPdfScaffold } from "../pdf/budget.render";
import { renderPlanPdfScaffold } from "../pdf/plan.render";
import { renderProposalPdfScaffold } from "../pdf/proposal.render";
import { enqueueWorkflowJob } from "../workflow/runner.service";
import { V80RuntimeError } from "../runtime/errors";

export async function handleTenantRun(ctx: { traceId: string; req: Request }) {
  const body = await parseJsonBody(ctx.req, provisionTenantSchema);
  const result = await provisionTenant(body);
  return jsonOk(result, { status: 201, traceId: ctx.traceId });
}

export async function handleEntitlements(ctx: { traceId: string; req: Request }) {
  const query = parseQuery(new URL(ctx.req.url), entitlementsQuerySchema);
  const result = await resolveEntitlements(query.organizationId);
  return jsonOk(result, { traceId: ctx.traceId });
}

export async function handleBudgetCalculate(ctx: { traceId: string; req: Request }) {
  const body = await parseJsonBody(ctx.req, calculateBudgetSchema);
  const result = await calculateBudgetScaffold(body);
  return jsonOk(result, { traceId: ctx.traceId });
}

export async function handleAutopilotJob(ctx: { traceId: string; req: Request }) {
  const body = await parseJsonBody(ctx.req, enqueueWorkflowSchema);
  const result = await enqueueWorkflowJob(body);
  return jsonOk(result, { status: 202, traceId: ctx.traceId });
}

export async function handleTenderIntake(ctx: { traceId: string; req: Request }) {
  const body = await parseJsonBody(ctx.req, tenderIntakeSchema);
  const result = await createTenderFromIntake(body);
  return jsonOk(result, { status: 201, traceId: ctx.traceId });
}

export async function handleIntegrity(ctx: { traceId: string; req: Request }) {
  const query = parseQuery(new URL(ctx.req.url), integrityQuerySchema);
  const deploymentId = query.deploymentId ?? "v80-release";
  const integrity = await runV80IntegrityCheck(deploymentId);
  const release = buildCodeRelease({ deploymentId });
  return jsonOk({ ...integrity, releaseReady: release.releaseReady }, { traceId: ctx.traceId });
}

export async function handleProposalPdf(ctx: { traceId: string; req: Request }) {
  const body = await parseJsonBody(ctx.req, proposalPdfSchema);
  const buffer = await renderProposalPdfScaffold(body);
  const artifactId = await savePdfArtifact({ projectId: body.projectId, type: "proposal", buffer });
  return jsonOk(
    { artifactId, downloadUrl: `/api/v80/pdf?artifactId=${artifactId}` },
    { traceId: ctx.traceId },
  );
}

export async function handlePdfGateway(ctx: { traceId: string; req: Request }) {
  const url = new URL(ctx.req.url);
  const artifactId = url.searchParams.get("artifactId");
  if (artifactId) {
    const artifact = await getPdfArtifact(artifactId);
    if (!artifact) throw new V80RuntimeError("Artifact not found", "NOT_FOUND", 404);
    return new Response(Buffer.from(artifact.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${artifact.type}-${artifactId}.pdf"`,
        "x-trace-id": ctx.traceId,
      },
    });
  }

  const query = parseQuery(url, pdfGatewayQuerySchema);
  const buffer =
    query.type === "plan"
      ? await renderPlanPdfScaffold(query.projectId)
      : await renderBudgetPdfScaffold({
          budgetId: query.budgetId ?? "draft",
          level: query.level,
        });

  return new Response(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "x-trace-id": ctx.traceId,
    },
  });
}
