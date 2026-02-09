"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DownloadPdfButton from "@/components/DownloadPdfButton";


type ModuleKey =
  | "header"
  | "overall"
  | "budgetCompare"
  | "table"
  | "brands"
  | "supplement"
  | "remarks";

type BudgetTier = "low" | "mid" | "high";

type PdfCfg = {
  companyName?: string;
  budgetTier?: BudgetTier;
  area?: number;
  headcount?: number;
  participation?: number; // 0-1
  preferSmart?: boolean;
  preferQuiet?: boolean;
  modules?: Partial<Record<ModuleKey, boolean>>;
  order?: ModuleKey[];
};

const MODULES: Array<{ key: ModuleKey; label: string; desc?: string }> = [
  { key: "header", label: "头部", desc: "封面与基本信息" },
  { key: "overall", label: "总览", desc: "执行摘要 / 空间拆解 / 里程碑" },
  { key: "budgetCompare", label: "预算对比", desc: "低/中/高 档建议与取舍" },
  { key: "table", label: "明细表", desc: "器材清单与分页" },
  { key: "brands", label: "品牌建议", desc: "分品类品牌与选型方向" },
  { key: "supplement", label: "补充说明", desc: "口径、维护与运营建议" },
  { key: "remarks", label: "其他备注", desc: "免责声明与复核清单" },
];

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function encodeCfgBase64Url(cfg: any) {
  const json = JSON.stringify(cfg);
  const utf8 = new TextEncoder().encode(json);
  let s = "";
  for (const b of utf8) s += String.fromCharCode(b);
  const b64 = btoa(s);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function moveItem<T,>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
}

export default function ResultPage() {
  const sp = useSearchParams();
  const planId = (sp.get("planId") || "attaguy-plan").trim();

  const [companyName, setCompanyName] = useState("示例企业");
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("mid");
  const [area, setArea] = useState<number>(120);
  const [headcount, setHeadcount] = useState<number>(200);
  const [participation, setParticipation] = useState<number>(0.3);
  const [preferSmart, setPreferSmart] = useState(true);
  const [preferQuiet, setPreferQuiet] = useState(false);

  const [enabled, setEnabled] = useState<Record<ModuleKey, boolean>>(() => {
    const init: any = {};
    for (const m of MODULES) init[m.key] = true;
    return init;
  });

  const [order, setOrder] = useState<ModuleKey[]>(() => MODULES.map((m) => m.key));

  const cfg: PdfCfg = useMemo(
    () => ({
      companyName,
      budgetTier,
      area,
      headcount,
      participation: clamp01(participation),
      preferSmart,
      preferQuiet,
      modules: enabled,
      order,
    }),
    [companyName, budgetTier, area, headcount, participation, preferSmart, preferQuiet, enabled, order]
  );

  const cfgEncoded = useMemo(() => encodeCfgBase64Url(cfg), [cfg]);

  const planPdfUrl = useMemo(() => {
    return `/api/pdf?planId=${encodeURIComponent(planId)}&mode=full&cfg=${encodeURIComponent(cfgEncoded)}`;
  }, [planId, cfgEncoded]);

  const budgetPdfUrl = useMemo(() => {
    return `/api/budget-pdf?planId=${encodeURIComponent(planId)}&mode=budget&cfg=${encodeURIComponent(cfgEncoded)}`;
  }, [planId, cfgEncoded]);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      {/* Header：只显示标题，不放任何下载按钮 */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#070A0F]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">Result</div>
              <div className="mt-1 text-sm text-white/60">
                Plan ID：<span className="text-white/80">{planId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 左侧：参数输入 */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="text-lg font-semibold">参数输入</div>
              <div className="mt-1 text-sm text-white/60">用于生成 PDF 与模块内容的基础参数</div>

              <div className="mt-6 space-y-4">
                <Field label="企业名称">
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="预算等级">
                    <select
                      value={budgetTier}
                      onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
                    >
                      <option value="low">低</option>
                      <option value="mid">中</option>
                      <option value="high">高</option>
                    </select>
                  </Field>

                  <Field label="场地面积（㎡）">
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value || 0))}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="企业人数（headcount）">
                    <input
                      type="number"
                      value={headcount}
                      onChange={(e) => setHeadcount(Number(e.target.value || 0))}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  </Field>

                  <Field label="参与率（0-1）">
                    <input
                      type="number"
                      step="0.01"
                      value={participation}
                      onChange={(e) => setParticipation(Number(e.target.value || 0))}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                    <div className="mt-2 text-xs text-white/55">
                      备注：参与率 = 在企业总人数里，预计经常使用健身房的员工比例
                    </div>
                  </Field>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Toggle checked={preferSmart} onChange={setPreferSmart} label="偏好智能" />
                  <Toggle checked={preferQuiet} onChange={setPreferQuiet} label="偏好低噪" />
                </div>

                {/* ✅ 唯一一处下载按钮：放在左侧卡片底部 */}
                <div className="mt-6">
  <DownloadPdfButton
    planId={planId}
    companyName={companyName}
    // 你的 DownloadPdfButton 只接受 50/100/200，这里把 headcount 映射成三档
    companySize={(headcount <= 80 ? 50 : headcount <= 150 ? 100 : 200) as 50 | 100 | 200}
    budgetTier={budgetTier}
  />
</div>

              </div>
            </div>
          </div>

          {/* 右侧：模块顺序 */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">模块顺序</div>
                  <div className="mt-1 text-sm text-white/60">可选择模块并调整顺序（支持中文）</div>
                </div>
                <div className="text-xs text-white/50">当前顺序：{order.join(" / ")}</div>
              </div>

              <div className="mt-5 space-y-3">
                {order.map((k, idx) => {
                  const meta = MODULES.find((m) => m.key === k)!;
                  return (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!enabled[k]}
                          onChange={(e) => setEnabled((s) => ({ ...s, [k]: e.target.checked }))}
                          className="h-4 w-4 accent-white"
                        />
                        <div>
                          <div className="text-sm font-semibold">{meta.label}</div>
                          {meta.desc ? <div className="text-xs text-white/55">{meta.desc}</div> : null}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/5 disabled:opacity-40"
                          disabled={idx === 0}
                          onClick={() => setOrder((o) => moveItem(o, idx, idx - 1))}
                        >
                          上移
                        </button>
                        <button
                          className="rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/5 disabled:opacity-40"
                          disabled={idx === order.length - 1}
                          onClick={() => setOrder((o) => moveItem(o, idx, idx + 1))}
                        >
                          下移
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 页脚不再渲染任何调试提示文案 */}
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-white/70">{props.label}</div>
      {props.children}
    </div>
  );
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => props.onChange(!props.checked)}
      className={`rounded-xl border px-3 py-2 text-sm ${
        props.checked ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20 hover:bg-white/5"
      }`}
    >
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white/80 align-middle" />
      {props.label}
    </button>
  );
}
