// app/result/page.tsx
"use client";

import React, { useMemo, useState } from "react";

type Mode = "client" | "engine";

type BudgetTier = "low" | "mid" | "high";
type CompanySize = "small" | "medium" | "large";

// 你后端预算引擎目前支持的 sections（从你截图看）
// 这边 UI 对外用中文展示，对内保留工程控制
const SECTION_META = [
  { id: "header", cn: "头部", desc: "封面与基本信息" },
  { id: "overall", cn: "总览", desc: "执行摘要 / 空间拆解 / 里程碑" },
  { id: "budgetCompare", cn: "预算对比", desc: "低/中/高 档建议与取舍" },
  { id: "table", cn: "明细表", desc: "器材清单与分项" },
  { id: "brands", cn: "品牌建议", desc: "分品类品牌与选型方向" },
  { id: "supplement", cn: "补充说明", desc: "口径、维护与运营建议" },
  { id: "remarks", cn: "其他备注", desc: "免责声明与复核清单" },
] as const;

type SectionId = (typeof SECTION_META)[number]["id"];

function getQueryParam(search: string, key: string) {
  try {
    const sp = new URLSearchParams(search);
    return (sp.get(key) || "").trim();
  } catch {
    return "";
  }
}

// 把对外“使用强度”映射为参与率（0~1）
function intensityToParticipation(intensity: "conservative" | "standard" | "active") {
  if (intensity === "conservative") return 0.2;
  if (intensity === "active") return 0.4;
  return 0.3; // standard
}

// 把输入 headcount 映射为区间（对外只展示区间，不让客户填技术枚举）
function headcountToSizeTier(headcount: number): CompanySize {
  if (!Number.isFinite(headcount)) return "medium";
  if (headcount <= 120) return "small";
  if (headcount >= 400) return "large";
  return "medium";
}

function cnSizeLabel(size: CompanySize) {
  if (size === "small") return "小型（≤120人）";
  if (size === "large") return "大型（≥400人）";
  return "中型（121–399人）";
}

function cnBudgetTierLabel(t: BudgetTier) {
  if (t === "low") return "低";
  if (t === "high") return "高";
  return "中";
}

function buildUrl(base: string, params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const s = String(v);
    if (s.trim() === "") continue;
    sp.set(k, s);
  }
  return `${base}?${sp.toString()}`;
}

export default function ResultPage() {
  const modeFromUrl = useMemo<Mode>(() => {
    const m = getQueryParam(typeof window !== "undefined" ? window.location.search : "", "mode");
    return m === "engine" ? "engine" : "client";
  }, []);

  // 基础信息（对外）
  const [planId, setPlanId] = useState("attaguy-plan");
  const [companyName, setCompanyName] = useState("示例企业");
  const [headcount, setHeadcount] = useState<number>(200);
  const [spaceSqm, setSpaceSqm] = useState<number>(120);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("mid");
  const [buildType, setBuildType] = useState<"new_build" | "renovation">("new_build");
  const [usageIntensity, setUsageIntensity] = useState<"conservative" | "standard" | "active">("standard");
  const [preferSmart, setPreferSmart] = useState(false);
  const [preferQuiet, setPreferQuiet] = useState(false);

  // 工程控制（对内）
  const [sections, setSections] = useState<SectionId[]>([
    "header",
    "overall",
    "budgetCompare",
    "table",
    "brands",
    "supplement",
    "remarks",
  ]);

  const companySizeTier = useMemo(() => headcountToSizeTier(headcount), [headcount]);

  // 对外展示：把技术字段计算出来（但不暴露 0-1 输入）
  const participationRate = useMemo(() => intensityToParticipation(usageIntensity), [usageIntensity]);

  const peakUsers = useMemo(() => {
    // 非严格科学，只做投标文案级估算：峰值同时使用人数 ≈ headcount * participationRate
    // 可后续替换为你更严谨的模型
    const v = Math.round((headcount || 0) * participationRate);
    return Math.max(0, v);
  }, [headcount, participationRate]);

  const mode: Mode = modeFromUrl;

  // 下载 URL（尽量兼容你现有 /api/pdf）
  const planPdfUrl = useMemo(() => {
    // 方案 PDF：你项目里多半是 mode=full
    // 这里附带一些通用字段，后端如果不吃也不影响
    return buildUrl("/api/pdf", {
      planId,
      mode: "full",
      download: 1,
      companyName,
      companySize: headcount,
      participationRate,
      spaceSqm,
      budgetTier,
      buildType,
      preferSmart: preferSmart ? "1" : "0",
      preferQuiet: preferQuiet ? "1" : "0",
      // 若你有 token 校验，这里保持不传，走你现有逻辑即可
      // downloadToken: "DEV_MODE_TOKEN",
      tz: "Asia/Shanghai",
    });
  }, [planId, companyName, headcount, participationRate, spaceSqm, budgetTier, buildType, preferSmart, preferQuiet]);

  const budgetPdfUrl = useMemo(() => {
    // 预算 PDF：你项目里多半是 mode=budget
    // sections 用逗号串（你后端若支持 sections=xxx,yyy）
    return buildUrl("/api/pdf", {
      planId,
      mode: "budget",
      download: 1,
      companyName,
      companySize: headcount,
      participationRate,
      spaceSqm,
      budgetTier,
      buildType,
      preferSmart: preferSmart ? "1" : "0",
      preferQuiet: preferQuiet ? "1" : "0",
      sections: sections.join(","),
      tz: "Asia/Shanghai",
    });
  }, [planId, companyName, headcount, participationRate, spaceSqm, budgetTier, buildType, preferSmart, preferQuiet, sections]);

  function moveSection(id: SectionId, dir: -1 | 1) {
    setSections((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const arr = prev.slice();
      const tmp = arr[idx];
      arr[idx] = arr[nextIdx];
      arr[nextIdx] = tmp;
      return arr;
    });
  }

  function toggleSection(id: SectionId, checked: boolean) {
    setSections((prev) => {
      if (checked) {
        // 追加到末尾，保持用户可控
        if (prev.includes(id)) return prev;
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  }

  const cardCls =
    "rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur px-6 py-6";

  const labelCls = "text-sm text-white/70";
  const inputCls =
    "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/20";

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="text-3xl font-semibold">Result</div>
          <div className="mt-2 text-white/60">
            Plan ID：<span className="text-white/90">{planId}</span>
            <span className="ml-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              当前模式：{mode === "client" ? "对外（Client）" : "内部（Engine）"}
            </span>
            <span className="ml-3 text-xs text-white/50">
              （切换：URL 加 <code className="text-white/70">?mode=engine</code>）
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左：对外参数（Client Mode） */}
          <div className={cardCls}>
            <div className="text-xl font-semibold">企业信息</div>
            <div className="mt-1 text-sm text-white/60">
              用于生成投标级 PDF 的关键输入（已隐藏工程字段）
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <div className={labelCls}>Plan ID（内部）</div>
                <input className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)} />
              </div>

              <div>
                <div className={labelCls}>企业名称</div>
                <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={labelCls}>员工人数</div>
                  <input
                    className={inputCls}
                    type="number"
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value || 0))}
                  />
                  <div className="mt-2 text-xs text-white/50">
                    系统自动归类：{cnSizeLabel(companySizeTier)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>场地面积（㎡）</div>
                  <input
                    className={inputCls}
                    type="number"
                    value={spaceSqm}
                    onChange={(e) => setSpaceSqm(Number(e.target.value || 0))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={labelCls}>预算等级</div>
                  <select
                    className={inputCls}
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
                  >
                    <option value="low">低</option>
                    <option value="mid">中</option>
                    <option value="high">高</option>
                  </select>
                </div>

                <div>
                  <div className={labelCls}>建设类型</div>
                  <select
                    className={inputCls}
                    value={buildType}
                    onChange={(e) => setBuildType(e.target.value as any)}
                  >
                    <option value="new_build">新建</option>
                    <option value="renovation">改造</option>
                  </select>
                </div>
              </div>

              <div>
                <div className={labelCls}>使用强度（系统将自动推导使用比例）</div>
                <select
                  className={inputCls}
                  value={usageIntensity}
                  onChange={(e) => setUsageIntensity(e.target.value as any)}
                >
                  <option value="conservative">保守（低频使用）</option>
                  <option value="standard">标准（常规企业）</option>
                  <option value="active">高活跃（健康文化强）</option>
                </select>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  <div>系统预测使用比例：{Math.round(participationRate * 100)}%</div>
                  <div>峰值同时使用人数（估算）：{peakUsers} 人</div>
                  <div className="mt-1 text-xs text-white/50">
                    说明：使用比例 = 预计经常使用健身房的员工占比（用于器材规模与容量推导）
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPreferSmart((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    preferSmart ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  偏好智能
                </button>
                <button
                  type="button"
                  onClick={() => setPreferQuiet((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    preferQuiet ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  偏好低噪
                </button>
              </div>

              <div className="mt-2 flex gap-4">
                <a
                  href={planPdfUrl}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
                >
                  下载方案 PDF
                </a>
                <a
                  href={budgetPdfUrl}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                >
                  下载预算 PDF
                </a>
              </div>

              {mode === "engine" ? (
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-200/80">
                  当前为 Engine 模式：左侧仍以“对外字段”为主，但右侧会显示模块顺序控制台。
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  当前为 Client 模式：已隐藏“模块顺序、0-1 参与率、英文模块名”等工程字段，更适合面向客户/评审展示。
                </div>
              )}
            </div>
          </div>

          {/* 右：模块顺序（仅 Engine Mode 展示；Client Mode 展示“方案结构概览”） */}
          <div className={cardCls}>
            {mode === "engine" ? (
              <>
                <div className="text-xl font-semibold">模块顺序（Engine）</div>
                <div className="mt-1 text-sm text-white/60">
                  内部调试用：选择模块并调整顺序（对外不展示）
                </div>

                <div className="mt-4 text-xs text-white/50">
                  当前顺序：{sections.join(" / ")}
                </div>

                <div className="mt-4 space-y-3">
                  {SECTION_META.map((m) => {
                    const checked = sections.includes(m.id as SectionId);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleSection(m.id as SectionId, e.target.checked)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-semibold">{m.cn}</div>
                            <div className="text-xs text-white/55">{m.desc}</div>
                            <div className="text-[11px] text-white/35">id: {m.id}</div>
                          </div>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => moveSection(m.id as SectionId, -1)}
                            disabled={!checked}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs disabled:opacity-40"
                          >
                            上移
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(m.id as SectionId, 1)}
                            disabled={!checked}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs disabled:opacity-40"
                          >
                            下移
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  说明：Engine 模式只用于你内部验证 PDF 结构与渲染稳定性；对外交付请使用 Client 模式默认页面。
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">方案结构概览（Client）</div>
                <div className="mt-1 text-sm text-white/60">
                  面向客户/评审的展示：不暴露工程模块名与顺序控制
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { t: "项目背景与目标", d: "企业健康支持目标、建设原则与收益" },
                    { t: "需求分析与容量推导", d: "规模、使用强度与峰值容量的推导说明" },
                    { t: "方案对比与推荐", d: "Lite / Standard / Pro 三档对比与推荐理由" },
                    { t: "推荐方案详细配置", d: "功能区、器材配置依据与交付范围" },
                    { t: "实施计划与验收", d: "施工、安装、调试、验收节点与标准" },
                    { t: "运维与售后保障", d: "质保、响应机制、巡检与培训" },
                    { t: "风险控制与边界", d: "安全、预算、使用与运营风险控制" },
                    { t: "附录与声明", d: "参数表、品牌建议、声明函等" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="font-semibold">{x.t}</div>
                      <div className="mt-1 text-xs text-white/55">{x.d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  需要进入内部调试？在地址后加 <code className="text-white/70">?mode=engine</code>。
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 text-xs text-white/35">
          UI 分层目标：Client 模式用于对外展示与交付；Engine 模式用于内部调试 PDF 引擎，不向客户暴露。
        </div>
      </div>
    </div>
  );
}