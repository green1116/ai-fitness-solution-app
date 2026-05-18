import { NextResponse } from "next/server";
import { describeDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/resolveDatabaseUrl";
import { formatPrismaErrorForLog, isPrismaConnectionError } from "@/lib/db/prismaErrors";
import { pingPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 开发探测：不返回连接串，仅 host/port 与 ping 结果 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  let resolved: ReturnType<typeof describeDatabaseUrl> | null = null;
  let resolveError: string | null = null;
  try {
    resolved = describeDatabaseUrl(resolveDatabaseUrl());
  } catch (e) {
    resolveError = e instanceof Error ? e.message : String(e);
  }

  let pingOk = false;
  let pingError: Record<string, unknown> | null = null;
  if (resolved) {
    try {
      pingOk = await pingPrisma();
    } catch (e) {
      pingError = formatPrismaErrorForLog(e);
      pingOk = false;
    }
  }

  return NextResponse.json({
    ok: Boolean(resolved && pingOk),
    resolved,
    resolveError,
    pingOk,
    pingError,
    hints: [
      "若 pingOk=false 且 host 为 pooler:6543，尝试 .env.local 设置 PRISMA_USE_DIRECT_URL=1",
      "确认 Supabase 项目未暂停、密码未轮换",
      "DATABASE_URL 勿含换行；特殊字符需 URL 编码",
    ],
    isConnectionError: pingError
      ? isPrismaConnectionError(
          Object.assign(new Error(String(pingError.message ?? "")), pingError),
        )
      : false,
  });
}
