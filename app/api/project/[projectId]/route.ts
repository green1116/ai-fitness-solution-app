import { NextRequest, NextResponse } from "next/server";

import { getEntitlement } from "@/lib/entitlement";
import {
  budgetLabelToTier,
  planInputToResultForm,
} from "@/lib/plan/planFormBridge";
import { prisma } from "@/lib/prisma";
import {
  ensureProjectFromPlanJobId,
  provisionProjectFromPlan,
} from "@/lib/services/tender/provisionProjectFromPlan";
import type { Plan } from "@/lib/types/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ projectId: string }> };

type ProjectLoadState = "ready" | "missing" | "error";

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { projectId: rawId } = await context.params;
    const projectId = String(rawId || "").trim();

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "PROJECT_ID_REQUIRED", message: "缺少 projectId" },
        { status: 400 },
      );
    }

    let planJob = await prisma.planJob.findUnique({
      where: { id: projectId },
    });

    let project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        solution: { select: { id: true } },
        budgets: { select: { id: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (!project && planJob?.plan) {
      const plan = planJob.plan as unknown as Plan;
      await provisionProjectFromPlan(
        projectId,
        plan,
        (planJob.input as Record<string, unknown>) ?? null,
      );
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          solution: { select: { id: true } },
          budgets: { select: { id: true }, take: 1, orderBy: { createdAt: "desc" } },
        },
      });
    }

    if (!project && !planJob) {
      const provisioned = await ensureProjectFromPlanJobId(projectId);
      if (provisioned) {
        planJob = await prisma.planJob.findUnique({ where: { id: projectId } });
        project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            solution: { select: { id: true } },
            budgets: { select: { id: true }, take: 1, orderBy: { createdAt: "desc" } },
          },
        });
      }
    }

    const input = (planJob?.input as Record<string, unknown>) ?? null;
    const planJson = planJob?.plan as unknown as Plan | null;
    const form = planInputToResultForm(projectId, {
      ...(input ?? {}),
      clientName: project?.clientName ?? undefined,
    });
    const budgetTier =
      form.budgetTier ?? budgetLabelToTier(form.budgetLabel ?? "5-10万");

    if (project) {
      if (project.targetUsers) form.headcount = project.targetUsers;
      if (project.areaM2) form.spaceSqm = project.areaM2;
    }

    const ready =
      Boolean(project) &&
      Boolean(project?.solution) &&
      Boolean(project?.budgets[0]);

    let projectLoadState: ProjectLoadState = "missing";
    if (ready) {
      projectLoadState = "ready";
    } else if (project || planJob) {
      projectLoadState = "error";
    }

    const licenseKey = req.headers.get("x-license-key")?.trim() || undefined;
    const entitlementResult = await getEntitlement(projectId, {
      headerLicenseKey: licenseKey,
    });
    const ent = entitlementResult.entitlement;

    return NextResponse.json({
      ok: true,
      projectId,
      projectLoadState,
      ready,
      project: project
        ? {
            exists: true,
            hasSolution: Boolean(project.solution),
            hasBudget: Boolean(project.budgets[0]),
            name: project.name,
            clientName: project.clientName,
            industry: project.industry,
            city: project.city,
            areaM2: project.areaM2,
            targetUsers: project.targetUsers,
            siteType: project.siteType,
            budgetLevel: project.budgetLevel,
            notes: project.notes,
          }
        : { exists: false },
      planJob: planJob
        ? {
            exists: true,
            status: planJob.status,
            input,
            planMeta: planJson?.meta ?? null,
          }
        : { exists: false },
      form: {
        ...form,
        budgetTier,
      },
      entitlement: {
        effectiveLevel: ent.effectiveLevel,
        planEnabled: ent.planEnabled,
        budgetEnabled: ent.budgetEnabled,
        zipEnabled: ent.zipEnabled,
        proEnabled: ent.proEnabled,
        enterpriseEnabled: ent.enterpriseEnabled,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "加载项目失败";
    console.error("[api/project]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "PROJECT_LOAD_FAILED",
        message,
        projectLoadState: "error" as const,
      },
      { status: 500 },
    );
  }
}
