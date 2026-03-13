// components/DownloadBudgetPdfButton.tsx
"use client";

import React, { useMemo, useState } from "react";

type Props = {
  planId: string;
  companyName: string;
  companySize: number;
  level?: string; // brand/enterprise/government/saas...
  theme?: string; // brand/tender
  defaultBudgetTier?: "low" | "mid" | "high";
  defaultSpaceSqm?: number;
  // ✅ 生产环境可传真实 token；不传则 dev 自动用 DEV_MODE_TOKEN
  downloadToken?: string;
};

export default function DownloadBudgetPdfButton(props: Props) {
  const {
    planId,
    companyName,
    companySize,
    level = "brand",
    theme,
    defaultBudgetTier = "mid",
    defaultSpaceSqm = 120,
    downloadToken,
  } = props;

  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">(
    defaultBudgetTier
  );
  const [spaceSqm, setSpaceSqm] = useState<string>(String(defaultSpaceSqm)); // 允许空

  const [rate, setRate] = useState<string>("0.3");
  const [goal, setGoal] = useState<string>("");
  const [smart, setSmart] = useState<boolean>(false);
  const [quiet, setQuiet] = useState<boolean>(false);
  const [sections, setSections] = useState<string>(
    "header,overall,compare,table_lines,table_items,remarks"
  );

  // ✅ 开发环境兜底 token：保证你现在马上能下载
  const effectiveToken =
    downloadToken?.trim() ||
    (process.env.NODE_ENV !== "production" ? "DEV_MODE_TOKEN" : "");

  const url = useMemo(() => {
    const sp = new URLSearchParams();

    sp.set("planId", planId);
    sp.set("mode", "budget");
    sp.set("download", "1");

    sp.set("companyName", companyName || "示例企业");
    sp.set("companySize", String(companySize || 200));
    sp.set("budgetTier", (budgetTier || "mid").toLowerCase());

    if (String(level || "").trim()) sp.set("level", String(level).trim());
    if (String(theme || "").trim()) sp.set("theme", String(theme).trim());

    if (spaceSqm.trim()) sp.set("spaceSqm", spaceSqm.trim());
    if (rate.trim()) sp.set("participationRate", rate.trim());
    if (goal.trim()) sp.set("goal", goal.trim());
    sp.set("preferSmart", smart ? "1" : "0");
    sp.set("preferQuiet", quiet ? "1" : "0");

    // 你的 /api/pdf route 当前不吃 sections（它走 preset），但保留不影响
    if (sections.trim()) sp.set("sections", sections.trim());

    // ✅ 最关键：加 token
    if (effectiveToken) sp.set("downloadToken", effectiveToken);

    return `/api/pdf?${sp.toString()}`;
  }, [
    planId,
    companyName,
    companySize,
    budgetTier,
    spaceSqm,
    rate,
    goal,
    smart,
    quiet,
    sections,
    level,
    theme,
    effectiveToken,
  ]);

  const onDownload = () => {
    // 用浏览器默认下载（header 里 content-disposition 会触发附件）
    window.location.href = url;
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="font-semibold">下载预算方案（PDF）</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm space-y-1">
          <div>预算档位</div>
          <select
            className="w-full border rounded px-2 py-1"
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value as any)}
          >
            <option value="low">LOW</option>
            <option value="mid">MID</option>
            <option value="high">HIGH</option>
          </select>
        </label>

        <label className="text-sm space-y-1">
          <div>面积（㎡）</div>
          <input
            className="w-full border rounded px-2 py-1"
            value={spaceSqm}
            onChange={(e) => setSpaceSqm(e.target.value)}
            placeholder="120"
          />
        </label>

        <label className="text-sm space-y-1">
          <div>参与率（0~1）</div>
          <input
            className="w-full border rounded px-2 py-1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="0.3"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm space-y-1">
          <div>目标（可空）</div>
          <input
            className="w-full border rounded px-2 py-1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="如：减脂/体能/康复..."
          />
        </label>

        <label className="text-sm space-y-1">
          <div>偏好</div>
          <div className="flex gap-3 items-center">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={smart}
                onChange={(e) => setSmart(e.target.checked)}
              />
              智能
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={quiet}
                onChange={(e) => setQuiet(e.target.checked)}
              />
              静音
            </label>
          </div>
        </label>

        <label className="text-sm space-y-1">
          <div>sections（逗号串，可空）</div>
          <input
            className="w-full border rounded px-2 py-1"
            value={sections}
            onChange={(e) => setSections(e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={onDownload}
        >
          下载预算 PDF
        </button>

        <a className="text-sm underline" href={url} target="_blank">
          直接打开链接（调试）
        </a>

        {!effectiveToken ? (
          <span className="text-sm text-red-600">
            ⚠️ 缺少 downloadToken（生产环境必须提供）
          </span>
        ) : (
          <span className="text-sm text-gray-600">
            token: {effectiveToken === "DEV_MODE_TOKEN" ? "DEV_MODE_TOKEN" : "provided"}
          </span>
        )}
      </div>
    </div>
  );
}