// app/api/debug/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readFilePlan(planId: string) {
  const file = path.resolve(process.cwd(), "plans", planId, "plan.json");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const planId = (url.searchParams.get("planId") || "").trim();

  if (!planId) {
    return NextResponse.json({ ok: false, code: "MISSING_PLAN_ID", message: "planId 不能为空" }, { status: 400 });
  }

  // 1) 先尝试 DB（但不要让它把路由炸掉）
  try {
    const row = await prisma.planJob.findUnique({
      where: { id: planId },
      select: { id: true, status: true, createdAt: true, updatedAt: true, plan: true, input: true },
    });

    if (row) {
      return NextResponse.json({ ok: true, source: "db", row }, { status: 200 });
    }

    // DB 没数据就 fallback 文件
    const filePlan = readFilePlan(planId);
    if (filePlan) return NextResponse.json({ ok: true, source: "file", plan: filePlan }, { status: 200 });

    return NextResponse.json(
      { ok: false, code: "NOT_FOUND", message: `DB/文件都找不到 plan：${planId}` },
      { status: 404 }
    );
  } catch (e: any) {
    // 2) DB 连不上：fallback 文件，不再 500
    const filePlan = (() => {
      try {
        return readFilePlan(planId);
      } catch {
        return null;
      }
    })();

    if (filePlan) {
      return NextResponse.json(
        {
          ok: true,
          source: "file",
          dbError: String(e?.message || e),
          plan: filePlan,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        code: "DB_UNAVAILABLE",
        message: "数据库不可用，且本地 plan.json 也不存在",
        dbError: String(e?.message || e),
      },
      { status: 200 } // ✅ debug 接口别再 500，方便你在前端看响应
    );
  }
}
