// app/result/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Mode = "client" | "engine";
type BudgetLevel = "brand" | "enterprise" | "government";
type UserPlan = "free" | "pro" | "tender";

type BudgetTier = "low" | "mid" | "high";
type CompanySize = "small" | "medium" | "large";

// 浣犲悗绔绠楀紩鎿庣洰鍓嶆敮鎸佺殑 sections锛堜粠浣犳埅鍥剧湅锛?// 杩欒竟 UI 瀵瑰鐢ㄤ腑鏂囧睍绀猴紝瀵瑰唴淇濈暀宸ョ▼鎺у埗
const SECTION_META = [
  { id: "header", cn: "澶撮儴", desc: "灏侀潰涓庡熀鏈俊鎭? },
  { id: "overall", cn: "鎬昏", desc: "鎵ц鎽樿 / 绌洪棿鎷嗚В / 閲岀▼纰? },
  { id: "budgetCompare", cn: "棰勭畻瀵规瘮", desc: "浣?涓?楂?妗ｅ缓璁笌鍙栬垗" },
  { id: "table", cn: "鏄庣粏琛?, desc: "鍣ㄦ潗娓呭崟涓庡垎椤? },
  { id: "brands", cn: "鍝佺墝寤鸿", desc: "鍒嗗搧绫诲搧鐗屼笌閫夊瀷鏂瑰悜" },
  { id: "supplement", cn: "琛ュ厖璇存槑", desc: "鍙ｅ緞銆佺淮鎶や笌杩愯惀寤鸿" },
  { id: "remarks", cn: "鍏朵粬澶囨敞", desc: "鍏嶈矗澹版槑涓庡鏍告竻鍗? },
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

// 鎶婂澶栤€滀娇鐢ㄥ己搴︹€濇槧灏勪负鍙備笌鐜囷紙0~1锛?function intensityToParticipation(intensity: "conservative" | "standard" | "active") {
  if (intensity === "conservative") return 0.2;
  if (intensity === "active") return 0.4;
  return 0.3; // standard
}

// 鎶婅緭鍏?headcount 鏄犲皠涓哄尯闂达紙瀵瑰鍙睍绀哄尯闂达紝涓嶈瀹㈡埛濉妧鏈灇涓撅級
function headcountToSizeTier(headcount: number): CompanySize {
  if (!Number.isFinite(headcount)) return "medium";
  if (headcount <= 120) return "small";
  if (headcount >= 400) return "large";
  return "medium";
}

function cnSizeLabel(size: CompanySize) {
  if (size === "small") return "灏忓瀷锛堚墹120浜猴級";
  if (size === "large") return "澶у瀷锛堚墺400浜猴級";
  return "涓瀷锛?21鈥?99浜猴級";
}

function cnBudgetTierLabel(t: BudgetTier) {
  if (t === "low") return "浣?;
  if (t === "high") return "楂?;
  return "涓?;
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
          <span className="text-white/60">{open ? "鈻? : "鈻?}</span>
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

  // 鍩虹淇℃伅锛堝澶栵級
  const [planId, setPlanId] = useState("attaguy-plan");
  const [companyName, setCompanyName] = useState("绀轰緥浼佷笟");
  const [headcount, setHeadcount] = useState<number>(200);
  const [spaceSqm, setSpaceSqm] = useState<number>(120);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("mid");
  const [buildType, setBuildType] = useState<"new_build" | "renovation">("new_build");
  const [usageIntensity, setUsageIntensity] = useState<"conservative" | "standard" | "active">("standard");
  const [preferSmart, setPreferSmart] = useState(false);
  const [preferQuiet, setPreferQuiet] = useState(false);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("brand");

  // 宸ョ▼鎺у埗锛堝鍐咃級
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
  // Engine 楠屾敹闈㈡澘锛堜粎 engine 妯″紡锛夛細HEAD 璇诲彇娓叉煋淇℃伅
  // ==============
  const [budgetHeadLoading, setBudgetHeadLoading] = useState(false);
  const [budgetHeadErr, setBudgetHeadErr] = useState<string>("");
  const [budgetHead, setBudgetHead] = useState<Record<string, string>>({});

  const [tenderPackHeadLoading, setTenderPackHeadLoading] = useState(false);
  const [tenderPackHeadErr, setTenderPackHeadErr] = useState<string>("");
  const [tenderPackHead, setTenderPackHead] = useState<Record<string, string>>({});

  const companySizeTier = useMemo(() => headcountToSizeTier(headcount), [headcount]);

  // 瀵瑰灞曠ず锛氭妸鎶€鏈瓧娈佃绠楀嚭鏉ワ紙浣嗕笉鏆撮湶 0-1 杈撳叆锛?  const participationRate = useMemo(() => intensityToParticipation(usageIntensity), [usageIntensity]);

  const peakUsers = useMemo(() => {
    // 闈炰弗鏍肩瀛︼紝鍙仛鎶曟爣鏂囨绾т及绠楋細宄板€煎悓鏃朵娇鐢ㄤ汉鏁?鈮?headcount * participationRate
    // 鍙悗缁浛鎹负浣犳洿涓ヨ皑鐨勬ā鍨?    const v = Math.round((headcount || 0) * participationRate);
    return Math.max(0, v);
  }, [headcount, participationRate]);

  const mode: Mode = modeFromUrl;

  // =========================
  // SaaS 濂楅鏉冮檺锛堟渶浼橈細Client 鍙楅檺锛孍ngine 涓嶅彈闄愶級
  // 鍏堝啓姝伙紝鍚庣画鎺ヤ綘鐪熷疄鐢ㄦ埛/License
  // =========================
  const userPlan: UserPlan = "pro" as UserPlan; // TODO: replace with real license

  const canUseEnterprise = mode === "engine" ? true : userPlan === "pro" || userPlan === "tender";
  const canUseGovernment = mode === "engine" ? true : userPlan === "tender";

  // 涓嬭浇 URL锛堝敖閲忓吋瀹逛綘鐜版湁 /api/pdf锛?  const planPdfUrl = useMemo(() => {
    // 鏂规 PDF锛氫綘椤圭洰閲屽鍗婃槸 mode=full
    // 杩欓噷闄勫甫涓€浜涢€氱敤瀛楁锛屽悗绔鏋滀笉鍚冧篃涓嶅奖鍝?    return buildUrl("/api/pdf", {
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
    // 棰勭畻 PDF锛氫綘椤圭洰閲屽鍗婃槸 mode=budget
    // sections 鐢ㄩ€楀彿涓诧紙浣犲悗绔嫢鏀寔 sections=xxx,yyy锛?    const params: Record<string, any> = {
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
    
    // government 闇€瑕?docSeq
    if (budgetLevel === "government") {
      params.docSeq = "01";
    }
    
    return buildUrl("/api/pdf", params);
  }, [planId, companyName, headcount, participationRate, spaceSqm, budgetTier, buildType, preferSmart, preferQuiet, sections, budgetLevel]);

  const tenderPackUrl = useMemo(() => {
    // 鉁?鏈€浼橈細鎷涙爣鍖?level 璺熼殢 budgetLevel锛屼絾 brand 鏄犲皠涓?enterprise
    // - brand 閫変腑鏃讹細浼佷笟绾ф嫑鏍囧寘鏇村悎鐞?    // - enterprise/government锛氬師鏍蜂紶閫?    const packLevel = budgetLevel === "brand" ? "enterprise" : budgetLevel;

    return buildUrl("/api/tender-pack", {
      planId,
      format: "merged",
      level: packLevel,
      // 鎺ㄨ崘锛歟nterprise 鐢?tender 涓婚锛屽叾瀹冪敤 brand锛堜綘鍙寜瀹為檯寰皟锛?      theme: packLevel === "enterprise" ? "tender" : "brand",
      watermark: 0,
      includeCover: 1,
      includeDeclaration: 1,
      packFooter: 1,
      // 鍙€夛細浼犲叕鍙镐俊鎭紙鍚庣鍚冧笉鍚冮兘娌″叧绯伙級
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

        // 鈿狅笍 娉ㄦ剰锛歜udgetPdfUrl 宸茬粡甯?download=1锛汬EAD 涓嶄細涓嬭浇姝ｆ枃锛堝彧鎷?headers锛?        const res = await fetch(budgetPdfUrl, { method: "HEAD" });

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
    // Client 妯″紡涓嬩笉鍏佽闈炴硶鐗堟湰鍋滅暀锛氳嚜鍔ㄩ檷绾?    if (mode !== "client") return;

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
    // 棰勭畻锛堜紭鍏堜粠 budget HEAD 鎷?reqsig锛?    const reqsig = getH(budgetHead, "x-reqsig") || getH(tenderPackHead, "x-reqsig");
    const reqsigShort = reqsig ? reqsig.slice(0, 8).toUpperCase() : "";

    // 鎷涙爣鍖呬俊鎭紙鏉ヨ嚜 tender-pack HEAD锛?    const tenderNo = getH(tenderPackHead, "x-tender-no");
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
      "銆怉I Fitness Solution 路 Engine 楠屾敹鎽樿銆?,
      "",
      `PlanID: ${planId}`,
      `浼佷笟: ${companyName}锝滀汉鏁? ${headcount}锝滈潰绉? ${spaceSqm}銕★綔妗ｄ綅: ${String(budgetTier).toUpperCase()}锝滃缓璁? ${buildType}`,
      "",
      "鈥?棰勭畻 PDF锛?api/pdf?mode=budget锛夆€?,
      `level: ${bLevel || "(绌?"}锝渢enderLevel: ${bTenderLevel || "(绌?"}锝渢heme: ${bTheme || "(绌?"}`,
      `pdfVersion: ${bVer || "(绌?"}锝渆ngineFP: ${bEngineFp || "(绌?"}`,
      `REQSIG: ${reqsig || "(绌?"}${reqsigShort ? `锛堢煭鐮? ${reqsigShort}锛塦 : ""}`,
      "",
      "鈥?鎷涙爣鍖咃紙/api/tender-pack?format=merged锛夆€?,
      `tenderLevel: ${tenderLevel || "(绌?"}锝渢enderNo: ${tenderNo || "(绌?"}`,
      `tenderPackFP: ${tenderPackFp || "(绌?"}`,
      `planVersion: ${planVer}锝渂udgetVersion: ${budgetVer}`,
      `includeCover: ${includeCover}锝渋ncludeDeclaration: ${includeDecl}`,
      `packPagination: ${packPagination}锝減ackFooter: ${packFooter}锝渟kipFirst: ${packSkip || "(绌?"}`,
      `budgetSections: ${packSections || "(绌?"}`,
      "",
      "鈥?URLs 鈥?,
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
      alert("宸插鍒堕獙鏀舵憳瑕佸埌鍓创鏉?);
    } catch (e) {
      // 鍏煎灏戞暟鐜
      try {
        const ta = document.createElement("textarea");
        ta.value = auditSummaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("宸插鍒堕獙鏀舵憳瑕佸埌鍓创鏉?);
      } catch {
        alert("澶嶅埗澶辫触锛氳鍦ㄦ祻瑙堝櫒鍏佽鍓创鏉挎潈闄?);
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
        // 杩藉姞鍒版湯灏撅紝淇濇寔鐢ㄦ埛鍙帶
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
            Plan ID锛?span className="text-white/90">{planId}</span>
            <span className="ml-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              褰撳墠妯″紡锛歿mode === "client" ? "瀵瑰锛圕lient锛? : "鍐呴儴锛圗ngine锛?}
            </span>
            <span className="ml-3 text-xs text-white/50">
              锛堝垏鎹細URL 鍔?<code className="text-white/70">?mode=engine</code>锛?            </span>
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
                澶嶅埗楠屾敹鎽樿
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 宸︼細瀵瑰鍙傛暟锛圕lient Mode锛?*/}
          <div className={cardCls}>
            <div className="text-xl font-semibold">浼佷笟淇℃伅</div>
            <div className="mt-1 text-sm text-white/60">
              鐢ㄤ簬鐢熸垚鎶曟爣绾?PDF 鐨勫叧閿緭鍏ワ紙宸查殣钘忓伐绋嬪瓧娈碉級
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <div className={labelCls}>Plan ID锛堝唴閮級</div>
                <input className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)} />
              </div>

              <div>
                <div className={labelCls}>浼佷笟鍚嶇О</div>
                <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={labelCls}>鍛樺伐浜烘暟</div>
                  <input
                    className={inputCls}
                    type="number"
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value || 0))}
                  />
                  <div className="mt-2 text-xs text-white/50">
                    绯荤粺鑷姩褰掔被锛歿cnSizeLabel(companySizeTier)}
                  </div>
                </div>

                <div>
                  <div className={labelCls}>鍦哄湴闈㈢Н锛堛帯锛?/div>
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
                  <div className={labelCls}>棰勭畻绛夌骇</div>
                  <select
                    className={inputCls}
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
                  >
                    <option value="low">浣?/option>
                    <option value="mid">涓?/option>
                    <option value="high">楂?/option>
                  </select>
                </div>

                <div>
                  <div className={labelCls}>寤鸿绫诲瀷</div>
                  <select
                    className={inputCls}
                    value={buildType}
                    onChange={(e) => setBuildType(e.target.value as any)}
                  >
                    <option value="new_build">鏂板缓</option>
                    <option value="renovation">鏀归€?/option>
                  </select>
                </div>
              </div>

              <div>
                <div className={labelCls}>浣跨敤寮哄害锛堢郴缁熷皢鑷姩鎺ㄥ浣跨敤姣斾緥锛?/div>
                <select
                  className={inputCls}
                  value={usageIntensity}
                  onChange={(e) => setUsageIntensity(e.target.value as any)}
                >
                  <option value="conservative">淇濆畧锛堜綆棰戜娇鐢級</option>
                  <option value="standard">鏍囧噯锛堝父瑙勪紒涓氾級</option>
                  <option value="active">楂樻椿璺冿紙鍋ュ悍鏂囧寲寮猴級</option>
                </select>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  <div>绯荤粺棰勬祴浣跨敤姣斾緥锛歿Math.round(participationRate * 100)}%</div>
                  <div>宄板€煎悓鏃朵娇鐢ㄤ汉鏁帮紙浼扮畻锛夛細{peakUsers} 浜?/div>
                  <div className="mt-1 text-xs text-white/50">
                    璇存槑锛氫娇鐢ㄦ瘮渚?= 棰勮缁忓父浣跨敤鍋ヨ韩鎴跨殑鍛樺伐鍗犳瘮锛堢敤浜庡櫒鏉愯妯′笌瀹归噺鎺ㄥ锛?                  </div>
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
                  鍋忓ソ鏅鸿兘
                </button>
                <button
                  type="button"
                  onClick={() => setPreferQuiet((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    preferQuiet ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  鍋忓ソ浣庡櫔
                </button>
              </div>

              {/* 棰勭畻鏂囨。鐗堟湰閫夋嫨 */}
              <div style={{ marginTop: 16, marginBottom: 12 }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  棰勭畻鏂囨。鐗堟湰
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
                  鏍囧噯鎶ヤ环鐗堬紙2椤碉級
                  <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    榛樿鍙敤
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
                  浼佷笟璇勫鐗堬紙7椤碉級
                  {!canUseEnterprise && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      闇€鍗囩骇 Pro
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
                  鏀垮簻璇勫鐗堬紙5椤碉紝鍚紪鍙风鍚嶏級
                  {!canUseGovernment && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      闇€鍗囩骇 Tender
                    </span>
                  )}
                </label>

                {/* 濂楅鎻愮ず锛堜粎 Client 灞曠ず锛孍ngine 涓嶉渶瑕侊級 */}
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
                    褰撳墠濂楅锛?b style={{ color: "rgba(255,255,255,0.85)" }}>{userPlan.toUpperCase()}</b>
                    <span style={{ marginLeft: 10 }}>
                      {userPlan === "free" && "锛圥ro 瑙ｉ攣浼佷笟璇勫鐗堬紱Tender 瑙ｉ攣鏀垮簻璇勫鐗堬級"}
                      {userPlan === "pro" && "锛圱ender 瑙ｉ攣鏀垮簻璇勫鐗堬級"}
                      {userPlan === "tender" && "锛堝凡瑙ｉ攣鍏ㄩ儴鐗堟湰锛?}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-4">
                <a
                  href={planPdfUrl}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
                >
                  涓嬭浇鏂规 PDF
                </a>

                <a
                  href={budgetPdfUrl}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                >
                  涓嬭浇棰勭畻 PDF
                </a>

                {mode === "engine" && (
                  <a
                    href={tenderPackUrl}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    title="Engine 妯″紡涓撶敤锛氬悎骞剁増鎷涙爣鍖咃紙灏侀潰/鐩綍/澹版槑/鏂规/棰勭畻锛?
                  >
                    涓嬭浇鎷涙爣鍖咃紙鍚堝苟鐗堬級
                  </a>
                )}
              </div>

              {mode === "engine" && (
                <CollapsiblePanel
                  title="棰勭畻 PDF 楠屾敹淇℃伅锛圚EAD锛?
                  defaultOpen={false}
                  right={
                    <button
                      type="button"
                      onClick={copyAuditSummary}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                    >
                      澶嶅埗鎽樿
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
                    url锛歿budgetPdfUrl}
                  </div>

                  {budgetHeadLoading ? (
                    <div className="text-xs text-white/60">璇诲彇涓€?/div>
                  ) : budgetHeadErr ? (
                    <div className="text-xs text-red-300/90">
                      璇诲彇澶辫触锛歿budgetHeadErr}
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
                            {v || <span className="text-white/35">锛堢┖锛?/span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsiblePanel>
              )}

              {mode === "engine" && (
                <CollapsiblePanel
                  title="鎷涙爣鍖?楠屾敹淇℃伅锛圚EAD锛?
                  defaultOpen={false}
                  right={
                    <button
                      type="button"
                      onClick={copyAuditSummary}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                    >
                      澶嶅埗鎽樿
                    </button>
                  }
                >
                  <div className="text-xs text-white/50 mb-2">
                    packLevel=<span className="text-white/80">{budgetLevel === "brand" ? "enterprise" : budgetLevel}</span>
                  </div>

                  <div className="text-xs text-white/60 break-all mb-3">
                    url锛歿tenderPackUrl}
                  </div>

                  {tenderPackHeadLoading ? (
                    <div className="text-xs text-white/60">璇诲彇涓€?/div>
                  ) : tenderPackHeadErr ? (
                    <div className="text-xs text-red-300/90">
                      璇诲彇澶辫触锛歿tenderPackHeadErr}
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
                            {v || <span className="text-white/35">锛堢┖锛?/span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsiblePanel>
              )}

              {mode === "engine" ? (
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-200/80">
                  褰撳墠涓?Engine 妯″紡锛氬乏渚т粛浠モ€滃澶栧瓧娈碘€濅负涓伙紝浣嗗彸渚т細鏄剧ず妯″潡椤哄簭鎺у埗鍙般€?                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  褰撳墠涓?Client 妯″紡锛氬凡闅愯棌鈥滄ā鍧楅『搴忋€?-1 鍙備笌鐜囥€佽嫳鏂囨ā鍧楀悕鈥濈瓑宸ョ▼瀛楁锛屾洿閫傚悎闈㈠悜瀹㈡埛/璇勫灞曠ず銆?                </div>
              )}
            </div>
          </div>

          {/* 鍙筹細妯″潡椤哄簭锛堜粎 Engine Mode 灞曠ず锛汣lient Mode 灞曠ず鈥滄柟妗堢粨鏋勬瑙堚€濓級 */}
          <div className={cardCls}>
            {mode === "engine" ? (
              <>
                <div className="text-xl font-semibold">妯″潡椤哄簭锛圗ngine锛?/div>
                <div className="mt-1 text-sm text-white/60">
                  鍐呴儴璋冭瘯鐢細閫夋嫨妯″潡骞惰皟鏁撮『搴忥紙瀵瑰涓嶅睍绀猴級
                </div>

                <div className="mt-4 text-xs text-white/50">
                  褰撳墠椤哄簭锛歿sections.join(" / ")}
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
                            涓婄Щ
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(m.id as SectionId, 1)}
                            disabled={!checked}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs disabled:opacity-40"
                          >
                            涓嬬Щ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  璇存槑锛欵ngine 妯″紡鍙敤浜庝綘鍐呴儴楠岃瘉 PDF 缁撴瀯涓庢覆鏌撶ǔ瀹氭€э紱瀵瑰浜や粯璇蜂娇鐢?Client 妯″紡榛樿椤甸潰銆?                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">鏂规缁撴瀯姒傝锛圕lient锛?/div>
                <div className="mt-1 text-sm text-white/60">
                  闈㈠悜瀹㈡埛/璇勫鐨勫睍绀猴細涓嶆毚闇插伐绋嬫ā鍧楀悕涓庨『搴忔帶鍒?                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { t: "椤圭洰鑳屾櫙涓庣洰鏍?, d: "浼佷笟鍋ュ悍鏀寔鐩爣銆佸缓璁惧師鍒欎笌鏀剁泭" },
                    { t: "闇€姹傚垎鏋愪笌瀹归噺鎺ㄥ", d: "瑙勬ā銆佷娇鐢ㄥ己搴︿笌宄板€煎閲忕殑鎺ㄥ璇存槑" },
                    { t: "鏂规瀵规瘮涓庢帹鑽?, d: "Lite / Standard / Pro 涓夋。瀵规瘮涓庢帹鑽愮悊鐢? },
                    { t: "鎺ㄨ崘鏂规璇︾粏閰嶇疆", d: "鍔熻兘鍖恒€佸櫒鏉愰厤缃緷鎹笌浜や粯鑼冨洿" },
                    { t: "瀹炴柦璁″垝涓庨獙鏀?, d: "鏂藉伐銆佸畨瑁呫€佽皟璇曘€侀獙鏀惰妭鐐逛笌鏍囧噯" },
                    { t: "杩愮淮涓庡敭鍚庝繚闅?, d: "璐ㄤ繚銆佸搷搴旀満鍒躲€佸贰妫€涓庡煿璁? },
                    { t: "椋庨櫓鎺у埗涓庤竟鐣?, d: "瀹夊叏銆侀绠椼€佷娇鐢ㄤ笌杩愯惀椋庨櫓鎺у埗" },
                    { t: "闄勫綍涓庡０鏄?, d: "鍙傛暟琛ㄣ€佸搧鐗屽缓璁€佸０鏄庡嚱绛? },
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
                  闇€瑕佽繘鍏ュ唴閮ㄨ皟璇曪紵鍦ㄥ湴鍧€鍚庡姞 <code className="text-white/70">?mode=engine</code>銆?                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 text-xs text-white/35">
          UI 鍒嗗眰鐩爣锛欳lient 妯″紡鐢ㄤ簬瀵瑰灞曠ず涓庝氦浠橈紱Engine 妯″紡鐢ㄤ簬鍐呴儴璋冭瘯 PDF 寮曟搸锛屼笉鍚戝鎴锋毚闇层€?        </div>
      </div>
    </div>
  );
}
