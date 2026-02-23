"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type DailyRow = {
  date: string; // YYYY-MM-DD
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

type TopPlanRow = { planId: string; count: number };

function sum(rows: DailyRow[], key: keyof DailyRow) {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function fmtPct(x: number) {
  if (!isFinite(x)) return "0%";
  return `${Math.round(x * 100)}%`;
}

function safeDiv(a: number, b: number) {
  return b > 0 ? a / b : 0;
}

export default function Charts(props: { daily: DailyRow[]; topPlans: TopPlanRow[] }) {
  const { daily, topPlans } = props;

  const total = sum(daily, "total");
  const full = sum(daily, "token") + sum(daily, "paid") + sum(daily, "license");
  const preview = sum(daily, "preview");

  const fail = sum(daily, "revoked") + sum(daily, "expired") + sum(daily, "exhausted") + sum(daily, "invalid");
  const failRate = safeDiv(fail, total);

  // 异常告警：最�?天失败率 vs �?天平均失败率
  const last = daily[daily.length - 1];
  const prev7 = daily.slice(Math.max(0, daily.length - 8), Math.max(0, daily.length - 1)); // �?天（不含最�?天）
  const lastFail = (last?.revoked || 0) + (last?.expired || 0) + (last?.exhausted || 0) + (last?.invalid || 0);
  const lastFailRate = safeDiv(lastFail, last?.total || 0);

  const prev7Total = sum(prev7, "total");
  const prev7Fail =
    sum(prev7, "revoked") + sum(prev7, "expired") + sum(prev7, "exhausted") + sum(prev7, "invalid");
  const prev7FailRate = safeDiv(prev7Fail, prev7Total);

  const spike =
    (last?.total || 0) >= 10 && // 样本太小不报
    lastFailRate >= 0.2 && // 至少 20%
    prev7FailRate > 0 &&
    lastFailRate / prev7FailRate >= 2; // 至少 2 �?

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14 }}>
          <div style={{ color: "#666", fontSize: 12 }}>总下�?/div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{total}</div>
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14 }}>
          <div style={{ color: "#666", fontSize: 12 }}>Full（token/paid/license�?/div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{full}</div>
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14 }}>
          <div style={{ color: "#666", fontSize: 12 }}>Preview</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{preview}</div>
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14 }}>
          <div style={{ color: "#666", fontSize: 12 }}>失败占比（revoked/expired/exhausted/invalid�?/div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{fmtPct(failRate)}</div>
        </div>
      </div>

      {/* 异常告警 */}
      {spike && (
        <div style={{ border: "1px solid #f0c36d", background: "#fff7e6", borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 800 }}>⚠️ 异常告警：失败率飙升</div>
          <div style={{ marginTop: 6, color: "#444" }}>
            最近一天失败率：{fmtPct(lastFailRate)}；前 7 天平均：{fmtPct(prev7FailRate)}�?
            建议排查：token 是否被大量吊销/过期、maxUses 是否过小、前端是否复用了旧链接、管理员是否批量 revoke�?
          </div>
        </div>
      )}

      {/* 1) 每日下载趋势 */}
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>每日下载趋势</div>
          <div style={{ color: "#666", fontSize: 12 }}>Total / Preview / Full(Token/Paid/License)</div>
        </div>

        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickMargin={8} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="总下�? dot={false} />
              <Line type="monotone" dataKey="preview" name="Preview" dot={false} />
              <Line type="monotone" dataKey="token" name="Token" dot={false} />
              <Line type="monotone" dataKey="paid" name="Paid" dot={false} />
              <Line type="monotone" dataKey="license" name="License" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2) reason 分布 */}
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>�?Reason 分布（每日堆叠）</div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickMargin={8} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar stackId="a" dataKey="preview" name="preview" />
              <Bar stackId="a" dataKey="token" name="token" />
              <Bar stackId="a" dataKey="paid" name="paid" />
              <Bar stackId="a" dataKey="license" name="license" />
              <Bar stackId="a" dataKey="bypass" name="bypass" />
              <Bar stackId="a" dataKey="revoked" name="revoked" />
              <Bar stackId="a" dataKey="expired" name="expired" />
              <Bar stackId="a" dataKey="exhausted" name="exhausted" />
              <Bar stackId="a" dataKey="invalid" name="invalid" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3) Top planId */}
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Top PlanId（最�?10�?/div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPlans} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="planId" width={180} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="下载次数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

