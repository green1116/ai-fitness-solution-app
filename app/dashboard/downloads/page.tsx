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
  
  // days 鏉堝湱鏅Λ鈧弻銉窗闂冨弶顒?NaN 閸滃矁绉撮崙楦垮瘱閸?
  const rawDays = Number(searchParams?.days ?? 14);
  const days = Number.isFinite(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 14; // 1~90婢?

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 閺嬪嫬缂?where 閺夆€叉閿涘牓鍣搁悙鐧哥窗where 闁插奔绗夌憰浣割敚 NaN閿?
  const where: any = {
    createdAt: { gte: since },
  };

  if (planId) where.planId = planId;
  if (reason) where.reason = { contains: reason, mode: "insensitive" };
  if (emailFilter) where.userAgent = { contains: emailFilter, mode: "insensitive" }; // 婵″倹鐏夐弮銉ョ箶闁插本鐥?email閿涘苯姘ㄩ崗鍫㈡暏 UA/IP 鏉╁洦鎶ら崡鐘辩秴

  const rows = await prisma.pdfDownloadLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // 缁犫偓閸楁洝浠涢崥鍫窗閹?reason 缂佺喕顓?  const byReason = await prisma.pdfDownloadLog.groupBy({
    by: ["reason"],
    _count: { _all: true },
    where,
  });

  // 閸欐牗娓舵潻?N 婢垛晜妫╄箛妤嬬礄閻劋绨崶鎹愩€冮懕姘値閿?
  const chartRows = await prisma.pdfDownloadLog.findMany({
    where,
    select: { createdAt: true, reason: true, planId: true },
    orderBy: { createdAt: "asc" },
    take: 20000, // 鐡掑啿顧勯弨顖涙嫼 14 婢?鐏忓繗顫夊Ο?
  });

  // 1) 閼辨艾鎮庨敍姘瘻婢垛斂鈧焦瀵?reason
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

    // 閹跺﹣绔存禍娑樸亼鐠愩儱甯崶鐘茬秺娑撯偓閸?invalid閿涘牅缍樻稊鐔峰讲娴犮儲瀵滈懛顏勭箒閻?reason 鐎涙顔岄崘宥嗗⒖閿?
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

  // 鐞涖儵缍堢紓鍝勩亼閻ㄥ嫭妫╅張鐕傜礄鐠佲晛娴樼悰銊ㄧ箾缂侇叏绱?  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    ensure(dayKey(d));
  }

  const daily = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 2) Top planId閿涘牆婀粵娑⑩偓澶嬫蒋娴犳湹绗呴敍?
  const planCount = new Map<string, number>();
  for (const r of chartRows) {
    planCount.set(r.planId, (planCount.get(r.planId) || 0) + 1);
  }
  const topPlans = Array.from(planCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([planId, count]) => ({ planId, count }));

  // 閺嬪嫬缂?URLSearchParams
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
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>PDF 娑撳娴囩€孤ゎ吀</h1>

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
          濮掑倽顫?        </a>
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
          閺勫海绮?        </a>
      </div>

      {/* 婢垛晜鏆熻箛顐︹偓鐔峰瀼閹?*/}
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
              鏉?{d} 婢?
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
        <button type="submit">缁涙盯鈧?/button>
        <a href={exportHref} target="_blank" rel="noreferrer" style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none", color: "#333", display: "inline-block" }}>
          鐎电厧鍤?CSV
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
            <strong>閹?reason 缂佺喕顓搁敍?/strong>{" "}
            {byReason.map((x) => (
              <span key={x.reason ?? "null"} style={{ marginRight: 12 }}>
                {(x.reason ?? "(null)")}={x._count._all}
              </span>
            ))}
          </div>

          <table cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>閺冨爼妫?/th>
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


