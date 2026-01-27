// app/dashboard/downloads/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth-server";
import RevokeToken from "./RevokeToken";
import RevokeByPlan from "./RevokeByPlan";
import Charts from "./Charts";

export default async function DownloadsPage({ searchParams }: any) {
  const email = await getSessionEmail();
  if (!email) redirect("/login");

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length > 0 && !allow.includes(email.toLowerCase())) {
    redirect("/dashboard");
  }

  const planId = String(searchParams?.planId ?? "").trim().slice(0, 120);
  const emailFilter = String(searchParams?.email ?? "").trim().slice(0, 200);
  const reason = String(searchParams?.reason ?? "").trim().slice(0, 200);
  const view = (searchParams?.view || "overview") as "overview" | "logs";
  
  // days 边界检查：防止 NaN 和超出范围
  const rawDays = Number(searchParams?.days ?? 14);
  const days = Number.isFinite(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 14; // 1~90天

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 构建 where 条件（重点：where 里不要塞 NaN）
  const where: any = {
    createdAt: { gte: since },
  };

  if (planId) where.planId = planId;
  if (reason) where.reason = { contains: reason, mode: "insensitive" };
  if (emailFilter) where.userAgent = { contains: emailFilter, mode: "insensitive" }; // 如果日志里没 email，就先用 UA/IP 过滤占位

  const rows = await prisma.pdfDownloadLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // 简单聚合：按 reason 统计
  const byReason = await prisma.pdfDownloadLog.groupBy({
    by: ["reason"],
    _count: { _all: true },
    where,
  });

  // 取最近 N 天日志（用于图表聚合）
  const chartRows = await prisma.pdfDownloadLog.findMany({
    where,
    select: { createdAt: true, reason: true, planId: true },
    orderBy: { createdAt: "asc" },
    take: 20000, // 足够支撑 14 天/小规模
  });

  // 1) 聚合：按天、按 reason
  const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  const reasons = ["preview", "token", "paid", "license", "bypass", "revoked", "expired", "exhausted", "invalid"] as const;

  type Daily = {
    date: string;
    total: number;
    preview: number;
    token: number;
    paid: number;
    license: number;
    bypass: number;
    revoked: number;
    expired: number;
    exhausted: number;
    invalid: number;
  };

  const map = new Map<string, Daily>();

  function ensure(date: string) {
    if (!map.has(date)) {
      map.set(date, {
        date,
        total: 0,
        preview: 0,
        token: 0,
        paid: 0,
        license: 0,
        bypass: 0,
        revoked: 0,
        expired: 0,
        exhausted: 0,
        invalid: 0,
      });
    }
    return map.get(date)!;
  }

  for (const r of chartRows) {
    const date = dayKey(r.createdAt);
    const row = ensure(date);
    row.total += 1;

    const reason = (r.reason || "").toLowerCase();

    // 把一些失败原因归一到 invalid（你也可以按自己的 reason 字段再扩）
    if (reasons.includes(reason as any)) {
      (row as any)[reason] += 1;
    } else if (reason.includes("revoke")) {
      row.revoked += 1;
    } else if (reason.includes("expire")) {
      row.expired += 1;
    } else if (reason.includes("exhaust")) {
      row.exhausted += 1;
    } else if (reason && reason !== "paid" && reason !== "license" && reason !== "token") {
      row.invalid += 1;
    }
  }

  // 补齐缺失的日期（让图表连续）
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    ensure(dayKey(d));
  }

  const daily = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 2) Top planId（在筛选条件下）
  const planCount = new Map<string, number>();
  for (const r of chartRows) {
    planCount.set(r.planId, (planCount.get(r.planId) || 0) + 1);
  }
  const topPlans = Array.from(planCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([planId, count]) => ({ planId, count }));

  // 构建 URLSearchParams
  const q = new URLSearchParams();
  if (planId) q.set("planId", planId);
  if (emailFilter) q.set("email", emailFilter);
  if (reason) q.set("reason", reason);
  q.set("days", String(days));

  const overviewHref = `/dashboard/downloads?${new URLSearchParams({ ...Object.fromEntries(q), view: "overview" })}`;
  const logsHref = `/dashboard/downloads?${new URLSearchParams({ ...Object.fromEntries(q), view: "logs" })}`;
  const exportHref = `/api/dashboard/downloads/export?${q.toString()}`;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>PDF 下载审计</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginTop: 10, marginBottom: 10 }}>
        <a
          href={overviewHref}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            textDecoration: "none",
            background: view === "overview" ? "#f5f5f5" : "white",
          }}
        >
          概览
        </a>
        <a
          href={logsHref}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            textDecoration: "none",
            background: view === "logs" ? "#f5f5f5" : "white",
          }}
        >
          明细
        </a>
      </div>

      {/* 天数快速切换 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[7, 14, 30].map((d) => {
          const qp = new URLSearchParams(q);
          qp.set("days", String(d));
          qp.set("view", view);
          return (
            <a
              key={d}
              href={`/dashboard/downloads?${qp.toString()}`}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #e5e5e5",
                textDecoration: "none",
                background: days === d ? "#f5f5f5" : "white",
              }}
            >
              近 {d} 天
            </a>
          );
        })}
      </div>

      <form style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
        <input name="planId" defaultValue={planId} placeholder="planId" />
        <input name="email" defaultValue={emailFilter} placeholder="email" />
        <input name="reason" defaultValue={reason} placeholder="reason (preview/bypass/token/paid/license)" />
        <input name="view" type="hidden" value={view} />
        <input name="days" type="hidden" value={String(days)} />
        <button type="submit">筛选</button>
        <a href={exportHref} target="_blank" rel="noreferrer" style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none", color: "#333", display: "inline-block" }}>
          导出 CSV
        </a>
      </form>

      {view === "overview" ? (
        <>
          <Charts daily={daily} topPlans={topPlans} />
          <RevokeByPlan />
          <RevokeToken />
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong>按 reason 统计：</strong>{" "}
            {byReason.map((x) => (
              <span key={x.reason ?? "null"} style={{ marginRight: 12 }}>
                {(x.reason ?? "(null)")}={x._count._all}
              </span>
            ))}
          </div>

          <table cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>时间</th>
            <th>planId</th>
            <th>mode</th>
            <th>reason</th>
            <th>ok</th>
            <th>email</th>
            <th>ip</th>
            <th>ua</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td>{r.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
              <td>{r.planId}</td>
              <td>{r.mode}</td>
              <td>{r.reason ?? ""}</td>
              <td>{String(r.ok)}</td>
              <td>{r.email ?? ""}</td>
              <td>{r.ip ?? ""}</td>
              <td style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.ua ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
    </div>
  );
}

