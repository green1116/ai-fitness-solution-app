"use client";

import React, { useMemo, useState } from "react";

type Goal = "general" | "fatloss" | "strength" | "rehab";

type Props = {
  planId: string;

  // 你现在项目里是先 GET /api/download-token?planId=...&mode=budget 拿 downloadToken
  getDownloadToken: (planId: string, mode: "budget") => Promise<string>;

  // 可选：默认值（从页面已有 state 传进来更好）
  defaultCompanyName?: string;
  defaultCompanySize?: number; // 50/100/200
  defaultBudgetTier?: "low" | "mid" | "high";
};

export default function DownloadBudgetPdfButton(props: Props) {
  const {
    planId,
    getDownloadToken,
    defaultCompanyName = "未命名企业",
    defaultCompanySize = 100,
    defaultBudgetTier = "mid",
  } = props;

  const [loading, setLoading] = useState(false);

  // —— 这些是“增强自动生成”的输入（对应你后端 B）
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [companySize, setCompanySize] = useState<number>(defaultCompanySize);
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">(defaultBudgetTier);

  const [spaceSqm, setSpaceSqm] = useState<string>(""); // 允许空
  const [rate, setRate] = useState<string>("");         // 0~1，允许空
  const [goal, setGoal] = useState<Goal>("general");
  const [smart, setSmart] = useState(false);
  const [quiet, setQuiet] = useState(false);

  // —— C：模块系统 sections（允许你开关/排序）
  const [sections, setSections] = useState<string>(
    "header,overall,table,supplement,remarks"
  );

  const url = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("planId", planId);
    sp.set("companyName", companyName || "未命名企业");
    sp.set("companySize", String(companySize || 100));
    sp.set("budgetTier", budgetTier || "mid");

    if (spaceSqm.trim()) sp.set("spaceSqm", spaceSqm.trim());
    if (rate.trim()) sp.set("rate", rate.trim());
    if (goal && goal !== "general") sp.set("goal", goal);

    if (smart) sp.set("smart", "1");
    if (quiet) sp.set("quiet", "1");

    if (sections.trim()) sp.set("sections", sections.trim());

    // downloadToken 运行时再加
    return sp;
  }, [planId, companyName, companySize, budgetTier, spaceSqm, rate, goal, smart, quiet, sections]);

  async function handleDownload() {
    try {
      setLoading(true);

      // 1) 拿预算 downloadToken
      const token = await getDownloadToken(planId, "budget");

      // 2) 组装下载 URL
      const sp = new URLSearchParams(url);
      sp.set("downloadToken", token);

      const downloadUrl = `/api/budget-pdf?${sp.toString()}`;

      // 3) 下载
      const res = await fetch(downloadUrl, { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `PDF 下载失败 ${res.status}`);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `gym_budget_${planId}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      console.error("[budget-download] error:", e);
      alert(e?.message || "下载失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>企业名称</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={inputStyle}
              placeholder="例如：XX 科技"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>企业规模</span>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(Number(e.target.value))}
              style={inputStyle}
            >
              <option value={50}>50 人</option>
              <option value={100}>100 人</option>
              <option value={200}>200 人</option>
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>预算等级</span>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as any)}
              style={inputStyle}
            >
              <option value="low">低</option>
              <option value="mid">中</option>
              <option value="high">高</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>训练目标</span>
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} style={inputStyle}>
              <option value="general">综合</option>
              <option value="fatloss">减脂/心肺</option>
              <option value="strength">力量/增肌</option>
              <option value="rehab">康复/拉伸</option>
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>场地面积（㎡，可选）</span>
            <input
              value={spaceSqm}
              onChange={(e) => setSpaceSqm(e.target.value)}
              style={inputStyle}
              placeholder="例如：120"
              inputMode="numeric"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>参与率（0~1，可选）</span>
            <input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              style={inputStyle}
              placeholder="例如：0.4"
              inputMode="decimal"
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={checkStyle}>
            <input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} />
            <span>偏好智能</span>
          </label>
          <label style={checkStyle}>
            <input type="checkbox" checked={quiet} onChange={(e) => setQuiet(e.target.checked)} />
            <span>偏好低噪</span>
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            sections（模块顺序，可选）
          </span>
          <input
            value={sections}
            onChange={(e) => setSections(e.target.value)}
            style={inputStyle}
            placeholder="header,overall,table,supplement,remarks"
          />
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            可用：header / overall / table / brands / supplement / remarks（用逗号分隔）
          </div>
        </label>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "下载中..." : "下载预算 PDF（带输入参数）"}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "white",
  color: "black",
  fontWeight: 700,
};

const checkStyle: React.CSSProperties = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  opacity: 0.9,
};
