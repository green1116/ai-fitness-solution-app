// app/result/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Mode = "client" | "engine";
type BudgetLevel = "brand" | "enterprise" | "government";
type UserPlan = "free" | "pro" | "tender";

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

const DEV_DOWNLOAD_TOKEN =
  typeof process !== "undefined" && process.env?.NODE_ENV !== "production"
    ? "DEV_MODE_TOKEN"
    : "";

function buildUrl(base: string, params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const s = String(v);
    if (s.trim() === "") continue;
    sp.set(k, s);
  }
  if (DEV_DOWNLOAD_TOKEN) sp.set("downloadToken", DEV_DOWNLOAD_TOKEN);
  return `${base}?${sp.toString()}`;
}

function CollapsiblePanel(props: {
  title: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { title, right, defaultOpen = false, children } = props;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-white/60">{open ? "▾" : "▸"}</span>
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>{right}</div>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
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
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("brand");

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

  // ==============
  // Engine 验收面板（仅 engine 模式）：HEAD 读取渲染信息
  // ==============
  const [budgetHeadLoading, setBudgetHeadLoading] = useState(false);
  const [budgetHeadErr, setBudgetHeadErr] = useState<string>("");
  const [budgetHead, setBudgetHead] = useState<Record<string, string>>({});

  const [tenderPackHeadLoading, setTenderPackHeadLoading] = useState(false);
  const [tenderPackHeadErr, setTenderPackHeadErr] = useState<string>("");
  const [tenderPackHead, setTenderPackHead] = useState<Record<string, string>>({});

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

  // =========================
  // SaaS 套餐权限（最优：Client 受限，Engine 不受限）
  // 先写死，后续接你真实用户/License
  // =========================
  const userPlan: UserPlan = "pro" as UserPlan; // TODO: replace with real license

  const canUseEnterprise = mode === "engine" ? true : userPlan === "pro" || userPlan === "tender";
  const canUseGovernment = mode === "engine" ? true : userPlan === "tender";

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
      tz: "Asia/Shanghai",
    });
  }, [planId, companyName, headcount, participationRate, spaceSqm, budgetTier, buildType, preferSmart, preferQuiet]);

  const budgetPdfUrl = useMemo(() => {
    // 预算 PDF：你项目里多半是 mode=budget
    // sections 用逗号串（你后端若支持 sections=xxx,yyy）
    const params: Record<string, any> = {
      planId,
      mode: "budget",
      download: 1,
      level: budgetLevel,
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
    };
    
    // government 需要 docSeq
    if (budgetLevel === "government") {
      params.docSeq = "01";
    }
    
    return buildUrl("/api/pdf", params);
  }, [planId, companyName, headcount, participationRate, spaceSqm, budgetTier, buildType, preferSmart, preferQuiet, sections, budgetLevel]);

  const tenderPackUrl = useMemo(() => {
    // ✅ 最优：招标包 level 跟随 budgetLevel，但 brand 映射为 enterprise
    // - brand 选中时：企业级招标包更合理
    // - enterprise/government：原样传递
    const packLevel = budgetLevel === "brand" ? "enterprise" : budgetLevel;

    return buildUrl("/api/tender-pack", {
      planId,
      format: "merged",
      level: packLevel,
      // 推荐：enterprise 用 tender 主题，其它用 brand（你可按实际微调）
      theme: packLevel === "enterprise" ? "tender" : "brand",
      watermark: 0,
      includeCover: 1,
      includeDeclaration: 1,
      packFooter: 1,
      // 可选：传公司信息（后端吃不吃都没关系）
      companyName,
      companySize: headcount,
      tz: "Asia/Shanghai",
    });
  }, [planId, budgetLevel, companyName, headcount]);

  useEffect(() => {
    if (mode !== "engine") return;

    let cancelled = false;

    async function run() {
      try {
        setBudgetHeadLoading(true);
        setBudgetHeadErr("");

        // ⚠️ 注意：budgetPdfUrl 已经带 download=1；HEAD 不会下载正文（只拿 headers）
        const res = await fetch(budgetPdfUrl, { method: "HEAD" });

        if (!res.ok) {
          throw new Error(`HEAD ${res.status} ${res.statusText}`);
        }

        const pickKeys = [
          "x-engine-fp",
          "x-pdf-version",
          "x-reqsig",
          "x-budget-level",
          "x-budget-docseq",
          "x-budget-debug-rows",
          "x-tender-level",
          "x-theme",
          "x-pdf-mode",
          "content-type",
          "content-disposition",
          "cache-control",
        ];

        const obj: Record<string, string> = {};
        for (const k of pickKeys) {
          const v = res.headers.get(k);
          if (v) obj[k] = v;
        }

        if (!cancelled) setBudgetHead(obj);
      } catch (e: any) {
        if (!cancelled) {
          setBudgetHead({});
          setBudgetHeadErr(e?.message || String(e));
        }
      } finally {
        if (!cancelled) setBudgetHeadLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [mode, budgetPdfUrl]);

  useEffect(() => {
    if (mode !== "engine") return;

    let cancelled = false;

    async function run() {
      try {
        setTenderPackHeadLoading(true);
        setTenderPackHeadErr("");

        const res = await fetch(tenderPackUrl, { method: "HEAD" });

        if (!res.ok) {
          throw new Error(`HEAD ${res.status} ${res.statusText}`);
        }

        const pickKeys = [
          "x-tender-pack",
          "x-tender-level",
          "x-tender-no",
          "x-plan-version",
          "x-budget-version",
          "x-plan-pages",
          "x-budget-pages",
          "x-include-cover",
          "x-include-declaration",
          "x-pack-budget-sections",
          "x-pack-pagination",
          "x-pack-skip-first",
          "x-pack-footer",
          "x-pack-theme",
          "x-pack-watermark",
          "x-pack-tz",
          "content-type",
          "content-disposition",
          "cache-control",
        ];

        const obj: Record<string, string> = {};
        for (const k of pickKeys) {
          const v = res.headers.get(k);
          if (v) obj[k] = v;
        }

        if (!cancelled) setTenderPackHead(obj);
      } catch (e: any) {
        if (!cancelled) {
          setTenderPackHead({});
          setTenderPackHeadErr(e?.message || String(e));
        }
      } finally {
        if (!cancelled) setTenderPackHeadLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [mode, tenderPackUrl]);

  useEffect(() => {
    // Client 模式下不允许非法版本停留：自动降级
    if (mode !== "client") return;

    if (budgetLevel === "government" && !canUseGovernment) {
      setBudgetLevel("enterprise");
      return;
    }
    if (budgetLevel === "enterprise" && !canUseEnterprise) {
      setBudgetLevel("brand");
      return;
    }
  }, [mode, budgetLevel, canUseEnterprise, canUseGovernment]);

  const budgetOk = mode === "engine" && !budgetHeadErr && Object.keys(budgetHead || {}).length > 0;
  const packOk = mode === "engine" && !tenderPackHeadErr && Object.keys(tenderPackHead || {}).length > 0;

  function getH(h: Record<string, string>, k: string) {
    return (h?.[k] || "").trim();
  }

  const auditSummaryText = useMemo(() => {
    // 预算（优先从 budget HEAD 拿 reqsig）
    const reqsig = getH(budgetHead, "x-reqsig") || getH(tenderPackHead, "x-reqsig");
    const reqsigShort = reqsig ? reqsig.slice(0, 8).toUpperCase() : "";

    // 招标包信息（来自 tender-pack HEAD）
    const tenderNo = getH(tenderPackHead, "x-tender-no");
    const tenderLevel = getH(tenderPackHead, "x-tender-level");
    const tenderPackFp = getH(tenderPackHead, "x-tender-pack");

    const planVer = getH(tenderPackHead, "x-plan-version") || "PLAN_V1";
    const budgetVer = getH(tenderPackHead, "x-budget-version") || "BUDGET_V1";

    const includeCover = getH(tenderPackHead, "x-include-cover") || "0";
    const includeDecl = getH(tenderPackHead, "x-include-declaration") || "0";
    const packPagination = getH(tenderPackHead, "x-pack-pagination") || "0";
    const packFooter = getH(tenderPackHead, "x-pack-footer") || "0";
    const packSkip = getH(tenderPackHead, "x-pack-skip-first");
    const packSections = getH(tenderPackHead, "x-pack-budget-sections");

    const bLevel = getH(budgetHead, "x-budget-level");
    const bTenderLevel = getH(budgetHead, "x-tender-level");
    const bTheme = getH(budgetHead, "x-theme");
    const bVer = getH(budgetHead, "x-pdf-version");
    const bEngineFp = getH(budgetHead, "x-engine-fp");

    return [
      "【AI Fitness Solution · Engine 验收摘要】",
      "",
      `PlanID: ${planId}`,
      `企业: ${companyName}｜人数: ${headcount}｜面积: ${spaceSqm}㎡｜档位: ${String(budgetTier).toUpperCase()}｜建设: ${buildType}`,
      "",
      "— 预算 PDF（/api/pdf?mode=budget）—",
      `level: ${bLevel || "(空)"}｜tenderLevel: ${bTenderLevel || "(空)"}｜theme: ${bTheme || "(空)"}`,
      `pdfVersion: ${bVer || "(空)"}｜engineFP: ${bEngineFp || "(空)"}`,
      `REQSIG: ${reqsig || "(空)"}${reqsigShort ? `（短码: ${reqsigShort}）` : ""}`,
      "",
      "— 招标包（/api/tender-pack?format=merged）—",
      `tenderLevel: ${tenderLevel || "(空)"}｜tenderNo: ${tenderNo || "(空)"}`,
      `tenderPackFP: ${tenderPackFp || "(空)"}`,
      `planVersion: ${planVer}｜budgetVersion: ${budgetVer}`,
      `includeCover: ${includeCover}｜includeDeclaration: ${includeDecl}`,
      `packPagination: ${packPagination}｜packFooter: ${packFooter}｜skipFirst: ${packSkip || "(空)"}`,
      `budgetSections: ${packSections || "(空)"}`,
      "",
      "— URLs —",
      `Budget: ${budgetPdfUrl}`,
      `TenderPack: ${tenderPackUrl}`,
      "",
    ].join("\n");
  }, [
    planId,
    companyName,
    headcount,
    spaceSqm,
    budgetTier,
    buildType,
    budgetPdfUrl,
    tenderPackUrl,
    budgetHead,
    tenderPackHead,
  ]);

  async function copyAuditSummary() {
    try {
      await navigator.clipboard.writeText(auditSummaryText);
      alert("已复制验收摘要到剪贴板");
    } catch (e) {
      // 兼容少数环境
      try {
        const ta = document.createElement("textarea");
        ta.value = auditSummaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("已复制验收摘要到剪贴板");
      } catch {
        alert("复制失败：请在浏览器允许剪贴板权限");
      }
    }
  }

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

          {mode === "engine" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
              <span className="font-semibold text-white/80">ENGINE STATUS</span>

              <span className={`rounded-full px-3 py-1 ${budgetOk ? "bg-white/10 text-white/80" : "bg-red-500/10 text-red-200/90"}`}>
                Budget HEAD: {budgetOk ? "OK" : "FAIL"}
              </span>

              <span className={`rounded-full px-3 py-1 ${packOk ? "bg-white/10 text-white/80" : "bg-red-500/10 text-red-200/90"}`}>
                TenderPack HEAD: {packOk ? "OK" : "FAIL"}
              </span>

              <button
                type="button"
                onClick={copyAuditSummary}
                className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                复制验收摘要
              </button>
            </div>
          )}
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

              {/* 预算文档版本选择 */}
              <div style={{ marginTop: 16, marginBottom: 12 }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  预算文档版本
                </div>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    checked={budgetLevel === "brand"}
                    onChange={() => setBudgetLevel("brand")}
                    style={{ marginRight: 6 }}
                  />
                  标准报价版（2页）
                  <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    默认可用
                  </span>
                </label>

                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: canUseEnterprise ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                    cursor: canUseEnterprise ? "pointer" : "not-allowed",
                  }}
                >
                  <input
                    type="radio"
                    disabled={!canUseEnterprise}
                    checked={budgetLevel === "enterprise"}
                    onChange={() => setBudgetLevel("enterprise")}
                    style={{ marginRight: 6 }}
                  />
                  企业评审版（7页）
                  {!canUseEnterprise && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      需升级 Pro
                    </span>
                  )}
                </label>

                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: canUseGovernment ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                    cursor: canUseGovernment ? "pointer" : "not-allowed",
                  }}
                >
                  <input
                    type="radio"
                    disabled={!canUseGovernment}
                    checked={budgetLevel === "government"}
                    onChange={() => setBudgetLevel("government")}
                    style={{ marginRight: 6 }}
                  />
                  政府评审版（5页，含编号签名）
                  {!canUseGovernment && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      需升级 Tender
                    </span>
                  )}
                </label>

                {/* 套餐提示（仅 Client 展示，Engine 不需要） */}
                {mode === "client" && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    当前套餐：<b style={{ color: "rgba(255,255,255,0.85)" }}>{userPlan.toUpperCase()}</b>
                    <span style={{ marginLeft: 10 }}>
                      {userPlan === "free" && "（Pro 解锁企业评审版；Tender 解锁政府评审版）"}
                      {userPlan === "pro" && "（Tender 解锁政府评审版）"}
                      {userPlan === "tender" && "（已解锁全部版本）"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-4">
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

                {mode === "engine" && (
                  <a
                    href={tenderPackUrl}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    title="Engine 模式专用：合并版招标包（封面/目录/声明/方案/预算）"
                  >
                    下载招标包（合并版）
                  </a>
                )}
              </div>

              {mode === "engine" && (
                <CollapsiblePanel
                  title="预算 PDF 验收信息（HEAD）"
                  defaultOpen={false}
                  right={
                    <button
                      type="button"
                      onClick={copyAuditSummary}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                    >
                      复制摘要
                    </button>
                  }
                >
                  <div className="text-xs text-white/50 mb-2">
                    level=<span className="text-white/80">{budgetLevel}</span>
                    {budgetLevel === "government" ? (
                      <span className="ml-2 text-white/50">docSeq=01</span>
                    ) : null}
                  </div>

                  <div className="text-xs text-white/60 break-all mb-3">
                    url：{budgetPdfUrl}
                  </div>

                  {budgetHeadLoading ? (
                    <div className="text-xs text-white/60">读取中…</div>
                  ) : budgetHeadErr ? (
                    <div className="text-xs text-red-300/90">
                      读取失败：{budgetHeadErr}
                    </div>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        ["X-ENGINE-FP", budgetHead["x-engine-fp"]],
                        ["X-PDF-VERSION", budgetHead["x-pdf-version"]],
                        ["X-REQSIG", budgetHead["x-reqsig"]],
                        ["X-BUDGET-LEVEL", budgetHead["x-budget-level"]],
                        ["X-BUDGET-DOCSEQ", budgetHead["x-budget-docseq"]],
                        ["X-BUDGET-DEBUG-ROWS", budgetHead["x-budget-debug-rows"]],
                        ["X-TENDER-LEVEL", budgetHead["x-tender-level"]],
                        ["X-THEME", budgetHead["x-theme"]],
                        ["X-PDF-MODE", budgetHead["x-pdf-mode"]],
                        ["Content-Type", budgetHead["content-type"]],
                        ["Content-Disposition", budgetHead["content-disposition"]],
                        ["Cache-Control", budgetHead["cache-control"]],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="text-[11px] text-white/50">{k}</div>
                          <div className="mt-1 text-xs text-white/80 break-all">
                            {v || <span className="text-white/35">（空）</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsiblePanel>
              )}

              {mode === "engine" && (
                <CollapsiblePanel
                  title="招标包 验收信息（HEAD）"
                  defaultOpen={false}
                  right={
                    <button
                      type="button"
                      onClick={copyAuditSummary}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                    >
                      复制摘要
                    </button>
                  }
                >
                  <div className="text-xs text-white/50 mb-2">
                    packLevel=<span className="text-white/80">{budgetLevel === "brand" ? "enterprise" : budgetLevel}</span>
                  </div>

                  <div className="text-xs text-white/60 break-all mb-3">
                    url：{tenderPackUrl}
                  </div>

                  {tenderPackHeadLoading ? (
                    <div className="text-xs text-white/60">读取中…</div>
                  ) : tenderPackHeadErr ? (
                    <div className="text-xs text-red-300/90">
                      读取失败：{tenderPackHeadErr}
                    </div>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        ["X-TENDER-PACK", tenderPackHead["x-tender-pack"]],
                        ["X-TENDER-LEVEL", tenderPackHead["x-tender-level"]],
                        ["X-TENDER-NO", tenderPackHead["x-tender-no"]],
                        ["X-PLAN-VERSION", tenderPackHead["x-plan-version"]],
                        ["X-BUDGET-VERSION", tenderPackHead["x-budget-version"]],
                        ["X-PLAN-PAGES", tenderPackHead["x-plan-pages"]],
                        ["X-BUDGET-PAGES", tenderPackHead["x-budget-pages"]],
                        ["X-INCLUDE-COVER", tenderPackHead["x-include-cover"]],
                        ["X-INCLUDE-DECLARATION", tenderPackHead["x-include-declaration"]],
                        ["X-PACK-BUDGET-SECTIONS", tenderPackHead["x-pack-budget-sections"]],
                        ["X-PACK-PAGINATION", tenderPackHead["x-pack-pagination"]],
                        ["X-PACK-SKIP-FIRST", tenderPackHead["x-pack-skip-first"]],
                        ["X-PACK-FOOTER", tenderPackHead["x-pack-footer"]],
                        ["X-PACK-THEME", tenderPackHead["x-pack-theme"]],
                        ["X-PACK-WATERMARK", tenderPackHead["x-pack-watermark"]],
                        ["X-PACK-TZ", tenderPackHead["x-pack-tz"]],
                        ["Content-Type", tenderPackHead["content-type"]],
                        ["Content-Disposition", tenderPackHead["content-disposition"]],
                        ["Cache-Control", tenderPackHead["cache-control"]],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="text-[11px] text-white/50">{k}</div>
                          <div className="mt-1 text-xs text-white/80 break-all">
                            {v || <span className="text-white/35">（空）</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsiblePanel>
              )}

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