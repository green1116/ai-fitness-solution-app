import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { submitOnboarding } from "@/lib/portal/v57/onboarding.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V57 P2 — Onboarding submit: profile + project bootstrap
 */
export async function POST(req: NextRequest) {
  const ctx = await getPortalUserContext();
  if (!ctx) {
    return NextResponse.json(
      { ok: false, code: "AUTH_REQUIRED", message: "请先注册或登录" },
      { status: 401 },
    );
  }

  if (!ctx.organizationId) {
    return NextResponse.json(
      { ok: false, code: "ORGANIZATION_REQUIRED", message: "缺少组织上下文，请重新注册" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));

  try {
    const result = await submitOnboarding(ctx, {
      company: String(body?.company ?? ctx.name ?? ""),
      industry: body?.industry ? String(body.industry) : undefined,
      teamSize: body?.teamSize ? String(body.teamSize) : undefined,
      budgetRange: body?.budgetRange ? String(body.budgetRange) : undefined,
      location: body?.location ? String(body.location) : undefined,
    });

    return NextResponse.json({
      ok: true,
      projectId: result.projectId,
      organizationId: result.organizationId,
      nextPath: result.nextPath,
      profile: {
        company: result.profile.company,
        industry: result.profile.industry,
        teamSize: result.profile.teamSize,
        budgetRange: result.profile.budgetRange,
        location: result.profile.location,
      },
    });
  } catch (err) {
    console.error("[onboarding/submit]", err);
    return NextResponse.json(
      {
        ok: false,
        code: "ONBOARDING_SUBMIT_FAILED",
        message: err instanceof Error ? err.message : "Onboarding 提交失败",
      },
      { status: 500 },
    );
  }
}
