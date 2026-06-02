// app/result/page.tsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import BidDecisionGatePanel from "@/components/BidDecisionGatePanel";
import TenderRiskCard, {
  type TenderRiskPayload,
} from "@/components/TenderRiskCard";
import TenderRiskTables from "@/components/TenderRiskTables";
import TenderScoreSimulationCard, {
  type TenderScoreSimulationPayload,
} from "@/components/TenderScoreSimulationCard";
import type {
  BidDecisionGateResult,
  BidRiskItem,
} from "@/lib/tender/gate/types";

import { jumpToRiskTarget } from "@/lib/tender/gate/jumpToRiskTarget";
import EnterpriseLeadForm, {
  type EnterpriseLeadFormValue,
} from "@/components/EnterpriseLeadForm";
import UpgradeModal from "@/components/UpgradeModal";
import {
  type CommercialPlanLevel,
  clearAllEnterpriseUnlockStorage,
  clearStoredEnterpriseUnlockToken,
  storeEnterpriseUnlockToken,
  UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY,
  UNLOCK_ENTERPRISE_KEY,
  UNLOCK_ENTERPRISE_PLAN_KEY,
  UNLOCK_PLAN_KEY,
  UNLOCK_STORAGE_KEY,
} from "@/lib/commercial/enterpriseUnlockStorage";
import { trackEvent } from "@/lib/analytics";
import { upgradeAmountForLevel } from "@/lib/upgradeUnlock";
import {
  clearPersistedLicenseForm,
  hasPersistedLicenseKey,
  LICENSE_PLAN_STORAGE_KEY,
  readPersistedLicenseForm,
} from "@/lib/commercial/resultLicenseStorage";
import {
  licenseRequiredFromApiMessage,
  paidDownloadBlockedHint,
} from "@/lib/commercial/resultAuthMessages";
import { CheckoutRedirectError } from "@/lib/commercial/checkoutRedirectError";
import { executePayPurchaseAndIssueLicense } from "@/lib/commercial/payOrderFulfillment";
import { logPurchaseEntryPrepared } from "@/lib/commercial/purchasePipeline";
import { useResultLicense } from "@/hooks/useResultLicense";
import { useEntitlement } from "@/hooks/useEntitlement";
import AccountAuthBar from "@/app/result/AccountAuthBar";
import TenderAnalysisPanel, {
  type TenderAnalyzePayload,
} from "@/components/TenderAnalysisPanel";
import TenderSemanticPanel, {
  type TenderSemanticPayload,
} from "@/components/TenderSemanticPanel";
import TenderResponsePanel, {
  type TenderComposePayload,
} from "@/components/TenderResponsePanel";
import TenderSkuPanel, {
  type TenderSkuPayload,
} from "@/components/TenderSkuPanel";
import TenderCompliancePanel, {
  type TenderCompliancePayload,
} from "@/components/TenderCompliancePanel";
import ExecutiveRuntimeVisualizationPanel from "@/components/ExecutiveRuntimeVisualizationPanel";
import type { RuntimeVisualizationDashboard } from "@/lib/evidence/types";

const RESULT_PROJECT_ID_STORAGE_KEY = "__result_project_id__";
/** 与支付回调、用户验收一致的 projectId 存储键 */
const PROJECT_ID_LS_KEY = "projectId";

function readProjectIdFromStoredPlan(): string {
  try {
    const raw = localStorage.getItem("attaguy_plan");
    if (!raw) return "";
    const p = JSON.parse(raw) as {
      planId?: string;
      plan_id?: string;
      meta?: { plan_id?: string };
    };
    return String(p?.planId || p?.plan_id || p?.meta?.plan_id || "").trim();
  } catch {
    return "";
  }
}

function readPersistedProjectIdKeys(): string {
  try {
    const primary = (localStorage.getItem(PROJECT_ID_LS_KEY) || "").trim();
    if (primary) return primary;
    return (localStorage.getItem(RESULT_PROJECT_ID_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function persistProjectIdKeys(id: string) {
  try {
    localStorage.setItem(PROJECT_ID_LS_KEY, id);
    localStorage.setItem(RESULT_PROJECT_ID_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

/** Plan API / planJob 使用的 ATG 格式 plan_id */
function isAtgPlanJobId(value: string): boolean {
  return /^ATG-\d{8}-\d{4}$/i.test(value.trim());
}

function isPlaceholderResultPlanId(planId: string): boolean {
  const p = planId.trim().toLowerCase();
  return p === "" || p === "attaguy-plan";
}

/** Pro/Enterprise 下载前：何时视为缺少有效 projectId */
function isBlockedPaidDownloadProjectId(
  realProjectId: string | null | undefined,
  planIdCurrent: string,
): boolean {
  if (!realProjectId || !String(realProjectId).trim()) return true;
  if (looksLikeSlug(realProjectId)) return true;
  if (
    realProjectId.trim() === planIdCurrent.trim() &&
    isPlaceholderResultPlanId(planIdCurrent)
  ) {
    return true;
  }
  return false;
}

/** 与 /api/tender-risk、/api/tender-optimize 行结构对齐 */
type TenderRiskRow = {
  requirement?: string;
  response?: string;
  status?: string;
  ref?: string;
};

function mapParsedToTechnicalRows(
  requirements: Array<{
    text?: string;
    priority?: "must" | "preferred" | "optional";
  }>
): TenderRiskRow[] {
  return requirements.map((r, i) => {
    let status = "响应";
    if (r.priority === "must") status = "待确认";
    else if (r.priority === "preferred") status = "部分满足";
    return {
      requirement: (r.text || "").slice(0, 120),
      response: "",
      status,
      ref: `T-${String(i + 1).padStart(2, "0")}`,
    };
  });
}

function mapParsedToBusinessRows(
  requirements: Array<{
    text?: string;
    priority?: "must" | "preferred" | "optional";
  }>
): TenderRiskRow[] {
  return requirements.map((r, i) => {
    let status = "响应";
    if (r.priority === "must") status = "待确认";
    else if (r.priority === "preferred") status = "部分满足";
    return {
      requirement: (r.text || "").slice(0, 120),
      response: "",
      status,
      ref: `B-${String(i + 1).padStart(2, "0")}`,
    };
  });
}

type Mode = "client" | "engine";
type BudgetLevel = "brand" | "enterprise" | "government";
type UserPlan = "free" | "pro" | "tender";

type BudgetTier = "low" | "mid" | "high";
type CompanySize = "small" | "medium" | "large";
type TenderProjectInput = {
  name: string;
  clientName?: string;
  industry?: string;
  siteType: "office" | "factory" | "park" | "school" | "hospital" | "mixed";
  areaM2?: number;
  targetUsers?: number;
  city?: string;
  budgetLevel: "low" | "mid" | "high" | "custom";
  deliveryMode: "standard" | "enterprise" | "tender";
  notes?: string;
};

const SECTION_META = [
  { id: "header", cn: "头部", desc: "封面与基础信息" },
  { id: "overall", cn: "总览", desc: "执行摘要 / 空间拆解 / 里程碑" },
  { id: "budgetCompare", cn: "预算对比", desc: "低 / 中 / 高档建议与取舍" },
  { id: "table", cn: "明细表", desc: "器材清单与分页明细" },
  { id: "brands", cn: "品牌建议", desc: "分类品牌与选型方向" },
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

function looksLikeSlug(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return true;
  if (isAtgPlanJobId(v)) return false;
  if (v.includes("attaguy-plan")) return true;
  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v,
    );
  const cuidLike = /^c[a-z0-9]{8,}$/i.test(v);
  if (uuidLike || cuidLike) return false;
  if (v.includes("-")) return true;
  return false;
}

function isLikelyProjectId(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isAtgPlanJobId(v)) return true;
  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v,
    );
  const cuidLike = /^c[a-z0-9]{8,}$/i.test(v);
  return uuidLike || cuidLike;
}

/** URL / 存储中的不透明 projectId（测试、自定义 slug，排除明显演示占位） */
function isOpaqueProjectIdToken(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > 256) return false;
  return /^[a-zA-Z0-9_.-]+$/.test(v);
}

function readProjectIdFromSearch(search: string): string {
  return (
    getQueryParam(search, "projectId") ||
    getQueryParam(search, "project_id") ||
    getQueryParam(search, "project") ||
    getQueryParam(search, "id") ||
    getQueryParam(search, "pid") ||
    ""
  ).trim();
}

/** URL 中 projectId：优先 ?projectId=，兼容旧 query 名 */
function projectIdFromUrlSources(searchParams: URLSearchParams): string {
  const direct = (searchParams.get("projectId") || "").trim();
  if (direct) return direct;
  if (typeof window !== "undefined") {
    return readProjectIdFromSearch(window.location.search);
  }
  return "";
}

/** 可用于付费下载的 projectId（排除 plan slug 等） */
function isValidResolvedProjectId(raw: string, planIdCurrent: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  if (looksLikeSlug(v)) return false;
  if (v === planIdCurrent && isPlaceholderResultPlanId(planIdCurrent)) return false;
  return isLikelyProjectId(v) || isOpaqueProjectIdToken(v);
}

/** 客户端首帧同步解析（仅浏览器；与 URL → localStorage → attaguy_plan 优先级一致） */
function readInitialResolvedProjectId(planIdCurrent: string): string {
  if (typeof window === "undefined") return "";
  try {
    const fromUrl = (
      new URLSearchParams(window.location.search).get("projectId") || ""
    ).trim();
    for (const raw of [
      fromUrl,
      readPersistedProjectIdKeys(),
      readProjectIdFromStoredPlan(),
    ]) {
      if (isValidResolvedProjectId(raw, planIdCurrent)) return raw.trim();
    }
  } catch {
    // ignore
  }
  return "";
}

function intensityToParticipation(intensity: "conservative" | "standard" | "active") {
  if (intensity === "conservative") return 0.2;
  if (intensity === "active") return 0.4;
  return 0.3;
}

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

/** 补强结果存 API 对象或错误文案，面板展示时归一成字符串 */
function riskFixResultToDisplay(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v !== "object") return String(v);
  const o = v as {
    patchedText?: string;
    checklist?: string[];
    confirmQuestion?: string;
    message?: string;
  };
  if (typeof o.patchedText === "string" && o.patchedText) return o.patchedText;
  if (Array.isArray(o.checklist) && o.checklist.length) {
    return `建议补充：${o.checklist.join("、")}`;
  }
  if (typeof o.confirmQuestion === "string" && o.confirmQuestion) {
    return `待人工确认：${o.confirmQuestion}`;
  }
  if (typeof o.message === "string" && o.message) return o.message;
  try {
    return JSON.stringify(o);
  } catch {
    return String(v);
  }
}

const PACK_RISK_BLOCK_CODE = "TENDER_PACK_BLOCKED_BY_RISK_GATE";

async function safeReadJsonOrText(
  res: Response
): Promise<{ rawText: string; json: any | null }> {
  const rawText = await res.text().catch(() => "");
  if (!rawText) return { rawText: "", json: null };

  try {
    return {
      rawText,
      json: JSON.parse(rawText),
    };
  } catch {
    return {
      rawText,
      json: null,
    };
  }
}

function triggerEnterpriseBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "enterprise-pack.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function enterpriseMergedFilename(planId: string) {
  return `AI_Fitness_Solution_Tender_Merged-enterprise-${planId}.pdf`;
}

function enterpriseZipFilename(planId: string) {
  return `AI_Fitness_Solution_Tender_Pack-enterprise-${planId}.zip`;
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
          <span className="text-white/60">{open ? "▼" : "▶"}</span>
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>{right}</div>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function commercialPlanFromUserPlan(userPlan: UserPlan): CommercialPlanLevel {
  if (userPlan === "tender") return "enterprise";
  if (userPlan === "pro") return "pro";
  return "free";
}

function commercialTierDisplay(level: CommercialPlanLevel): string {
  if (level === "pro") return "Pro";
  if (level === "enterprise") return "Enterprise";
  return "Free";
}

function maxCommercialPlan(
  a: CommercialPlanLevel,
  b: CommercialPlanLevel,
): CommercialPlanLevel {
  const rank: Record<CommercialPlanLevel, number> = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };
  return rank[a] >= rank[b] ? a : b;
}

/** URL 套餐 + 验证通过后写入的 unlock planLevel */
function getEffectiveCommercialPlanLevel(
  planId: string,
  userPlan: UserPlan
): CommercialPlanLevel {
  if (typeof window === "undefined") {
    return commercialPlanFromUserPlan(userPlan);
  }

  try {
    const enterprisePlan = localStorage.getItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    const enterpriseToken = localStorage.getItem(UNLOCK_ENTERPRISE_KEY);
    if (enterprisePlan === planId && enterpriseToken) {
      const raw = (
        localStorage.getItem(UNLOCK_COMMERCIAL_PLAN_LEVEL_KEY) || ""
      ).toLowerCase();
      if (raw === "free" || raw === "pro" || raw === "enterprise") {
        return raw;
      }
    }
    return commercialPlanFromUserPlan(userPlan);
  } catch {
    return commercialPlanFromUserPlan(userPlan);
  }
}
function getStoredEnterpriseUnlockToken(planId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const enterprisePlan = localStorage.getItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    const enterpriseToken = localStorage.getItem(UNLOCK_ENTERPRISE_KEY);

    if (enterprisePlan === planId && enterpriseToken) {
      return enterpriseToken;
    }

    const genericPlan = localStorage.getItem(UNLOCK_PLAN_KEY);
    const genericToken = localStorage.getItem(UNLOCK_STORAGE_KEY);

    if (genericPlan === planId && genericToken) {
      localStorage.setItem(UNLOCK_ENTERPRISE_KEY, genericToken);
      localStorage.setItem(UNLOCK_ENTERPRISE_PLAN_KEY, planId);
      return genericToken;
    }

    return null;
  } catch {
    return null;
  }
}

async function requestEnterpriseDownloadToken(params: {
  planId: string;
  mode: "full" | "budget" | "pack";
  unlockToken: string;
  variant?: "enterprise" | "tender" | "sales";
}): Promise<string> {
  const url = new URL("/api/download-token", window.location.origin);
  url.searchParams.set("planId", params.planId);
  url.searchParams.set("mode", params.mode);
  url.searchParams.set("variant", params.variant ?? "enterprise");
  url.searchParams.set("unlockToken", params.unlockToken);

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new Error(
      data?.message || data?.code || `download-token failed: ${res.status}`
    );
  }

  const downloadToken: string =
    data?.downloadToken || data?.token || "";

  if (!downloadToken) {
    throw new Error("download token missing");
  }

  return downloadToken;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function logDownloadSuccess(meta: Record<string, unknown>) {
  console.log("[download-success]", meta);
}

function logDownloadError(meta: Record<string, unknown>) {
  console.error("[download-error]", meta);
}

function ResultPageInner() {
  const searchParams = useSearchParams();
  /** 手动 License、模拟发证等：仅在非 production 构建显示（preview/staging 若走 production 构建则同样隐藏） */
  const showDevLicensePanel = process.env.NODE_ENV !== "production";
  const [enterpriseUnlockOpen, setEnterpriseUnlockOpen] = useState(false);
  const [enterpriseUnlockEmail, setEnterpriseUnlockEmail] = useState("");
  const [enterpriseUnlockSubmitting, setEnterpriseUnlockSubmitting] =
    useState(false);
  const [enterpriseUnlockMessage, setEnterpriseUnlockMessage] = useState("");
  const [pendingEnterpriseDownloadAction, setPendingEnterpriseDownloadAction] =
    useState<"pdf" | "zip" | null>(null);
  const [showEnterpriseLeadForm, setShowEnterpriseLeadForm] = useState(false);
  const [enterpriseLeadSubmitting, setEnterpriseLeadSubmitting] =
    useState(false);
  const [enterpriseLeadEmail, setEnterpriseLeadEmail] = useState("");
  const [showEnterpriseVerifyDialog, setShowEnterpriseVerifyDialog] =
    useState(false);
  const [enterpriseVerifySubmitting, setEnterpriseVerifySubmitting] =
    useState(false);
  const [enterpriseVerifyCode, setEnterpriseVerifyCode] = useState("");
  const [enterpriseLeadDraft, setEnterpriseLeadDraft] =
    useState<EnterpriseLeadFormValue | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalEntryMode, setUpgradeModalEntryMode] = useState<
    "upgrade" | "lead"
  >("upgrade");
  /** 开发环境：重置授权后强制视为 free，直至再次解锁 */
  const [devAuthTierOverride, setDevAuthTierOverride] =
    useState<CommercialPlanLevel | null>(null);
  /** 开发环境：强制视为 FREE（忽略 localStorage 解锁档位），用于测试转化；刷新后由 sessionStorage 恢复 */
  const [devForceFreeMode, setDevForceFreeMode] = useState(false);
  /** 强制 FREE 时，弹窗内/验证后的真实下载需跳过「仅打开升级弹窗」拦截 */
  const devForceFreeDownloadBypassRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    try {
      if (sessionStorage.getItem("__result_dev_force_free") === "1") {
        setDevForceFreeMode(true);
      }
    } catch {
      // ignore
    }
  }, []);
  const [analysisDetailBusy, setAnalysisDetailBusy] = useState(false);
  const [analysisDetailError, setAnalysisDetailError] = useState<string | null>(
    null
  );
  const [pdfDownloadBusy, setPdfDownloadBusy] = useState(false);
  const [zipDownloadBusy, setZipDownloadBusy] = useState(false);
  const [pdfDownloadFlash, setPdfDownloadFlash] = useState(false);
  const [zipDownloadFlash, setZipDownloadFlash] = useState(false);
  const [pageOpLabel, setPageOpLabel] = useState("—");
  const [pageOpOutcome, setPageOpOutcome] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [pageLastError, setPageLastError] = useState<string | null>(null);
  const [paySimBusy, setPaySimBusy] = useState(false);
  const [checkoutBusyTier, setCheckoutBusyTier] = useState<
    "pro" | "enterprise" | null
  >(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const packForceAllowOnceRef = useRef(false);
  /** 供下载相关埋点读取当前套餐（这些 handler 在 commercialPlan 声明之前定义，避免闭包/依赖顺序问题） */
  const commercialPlanForAnalyticsRef = useRef<CommercialPlanLevel>("free");
  const modeFromUrl = useMemo<Mode>(() => {
    const m = getQueryParam(
      typeof window !== "undefined" ? window.location.search : "",
      "mode"
    );
    return m === "engine" ? "engine" : "client";
  }, []);

  const userPlanFromUrl = useMemo<UserPlan>(() => {
    const p = getQueryParam(
      typeof window !== "undefined" ? window.location.search : "",
      "plan"
    );
    if (p === "tender") return "tender";
    if (p === "pro") return "pro";
    return "free";
  }, []);

  const withForceAllowOnce = useCallback((url: string) => {
    if (!packForceAllowOnceRef.current) return url;
    packForceAllowOnceRef.current = false;
  
    const u = new URL(url, window.location.origin);
    u.searchParams.set("forceAllow", "1");
    return u.toString();
  }, []);

  const [planId, setPlanId] = useState("attaguy-plan");
  const {
    licenseForm,
    setLicenseForm,
    licenseSaveMessage,
    setLicenseSaveMessage,
    persistLicenseFields,
    applyWebhookLicensePersist,
    getPaidDownloadLicenseSnapshot,
    handleSaveLicense,
  } = useResultLicense({ planId, setPageLastError });

  const {
    effectiveLevel: entitlementLevel,
    zipEnabled,
    entitlement,
    fallbackUsed,
    loading: entitlementLoading,
    refresh: refreshEntitlements,
    pollUntil: pollEntitlementsUntil,
  } = useEntitlement(planId);

  const handleEntitlementSessionChange = useCallback(() => {
    void refreshEntitlements({ force: true });
  }, [refreshEntitlements]);

  const hasClientPaidLicense = useMemo(() => {
    if (!mounted) return false;
    if (entitlementLevel === "pro" || entitlementLevel === "enterprise") {
      return true;
    }
    return typeof window !== "undefined" && hasPersistedLicenseKey();
  }, [mounted, entitlementLevel]);

  const canDownloadPaidTier = useCallback(
    (requestTier: "pro" | "enterprise") => {
      const ent = entitlement;
      /** 以后端 entitlement 快照为准，避免 `effectiveLevel` 字符串与其它布尔位短暂不一致 */
      if (requestTier === "enterprise") {
        if (ent?.zipEnabled === true) return true;
        if (ent?.enterpriseEnabled === true) return true;
        if (ent?.effectiveLevel === "enterprise") return true;
        return false;
      }
      if (ent?.proEnabled === true) return true;
      if (ent?.effectiveLevel === "enterprise" || ent?.effectiveLevel === "pro")
        return true;
      return Boolean(getPaidDownloadLicenseSnapshot("pro"));
    },
    [entitlement, getPaidDownloadLicenseSnapshot],
  );

  const ensurePaidEntitlementReady = useCallback(
    (requestTier: "pro" | "enterprise", docLabel: string) => {
      if (canDownloadPaidTier(requestTier)) return true;
      console.warn("[purchase-flow] entitlement-not-ready", {
        tier: requestTier,
        docLabel,
      });
      setPageLastError(
        "支付已完成，但授权状态尚未同步，请稍候再试（系统将仅在授权有效后允许下载）。",
      );
      setPageOpOutcome("error");
      setPageOpLabel(docLabel);
      return false;
    },
    [canDownloadPaidTier],
  );

  /** 权益已就绪时清掉「授权未同步」等过时错误，避免挡住下载按钮交互 */
  useEffect(() => {
    const ent = entitlement;
    if (!ent) return;
    const paidReady =
      ent.zipEnabled === true ||
      ent.effectiveLevel === "enterprise" ||
      ent.effectiveLevel === "pro" ||
      ent.proEnabled === true;
    if (!paidReady || !pageLastError) return;
    if (
      pageLastError.includes("授权") ||
      pageLastError.includes("同步") ||
      pageLastError.includes("尚未同步")
    ) {
      setPageLastError(null);
      setPageOpOutcome("idle");
      setPageOpLabel("—");
    }
  }, [entitlement, pageLastError]);

  const [projectId, setProjectId] = useState(() =>
    readInitialResolvedProjectId("attaguy-plan"),
  );
  const [companyName, setCompanyName] = useState("示例企业");
  const [headcount, setHeadcount] = useState<number>(200);
  const [spaceSqm, setSpaceSqm] = useState<number>(120);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>("mid");
  const [buildType, setBuildType] = useState<"new_build" | "renovation">("new_build");
  const [usageIntensity, setUsageIntensity] = useState<
    "conservative" | "standard" | "active"
  >("standard");
  const [preferSmart, setPreferSmart] = useState(false);
  const [preferQuiet, setPreferQuiet] = useState(false);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("brand");

  const [sections, setSections] = useState<SectionId[]>([
    "header",
    "overall",
    "budgetCompare",
    "table",
    "brands",
    "supplement",
    "remarks",
  ]);

  const resolveDownloadErrorMessage = useCallback(
    (
      requestTier: CommercialPlanLevel,
      status: number,
      json:
        | {
            error?: string;
            message?: string;
            code?: string;
            reason?: string;
            zipEnabled?: boolean;
          }
        | null,
      rawText: string,
      fallback: string,
    ): string => {
      if (
        requestTier !== "free" &&
        status === 403 &&
        json?.error === "LICENSE_REQUIRED"
      ) {
        return licenseRequiredFromApiMessage();
      }
      if (
        requestTier !== "free" &&
        status === 403 &&
        (json?.code === "NOT_ENTITLED" || json?.reason === "ZIP_NOT_ENTITLED")
      ) {
        return (
          json?.message ||
          "当前账号暂无完整投标包（ZIP）下载权限。请确认企业版订单已支付完成，并在页面刷新授权后再试。"
        );
      }
      if (status === 404 && json?.error === "PROJECT_OR_SOLUTION_NOT_FOUND") {
        return "项目或方案不存在，请先生成完整结果后再下载。";
      }
      if (status >= 500 && json?.error === "INTERNAL_ERROR") {
        return "下载服务暂时不可用，请稍后重试。";
      }
      return json?.error || json?.message || rawText || fallback;
    },
    [],
  );

  /** plan / budget / zip 共用：唯一一处 Pro/Enterprise 的 licenseKey 判定（无 window.alert） */
  const buildCommercialPdfFetchHeaders = useCallback(
    (params: {
      docMode: "plan" | "budget" | "zip";
      tier: CommercialPlanLevel;
      projectId: string;
      /** 刚创建 license 后的快照，避免 setState 异步导致请求头仍为空 */
      licenseSnapshot?: {
        licenseKey: string;
        fingerprint: string;
        planId: string;
      };
    }): Record<string, string> => {
      const { docMode, tier, projectId, licenseSnapshot } = params;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-mode": tier,
      };

      if (tier === "free") {
        return headers;
      }

      const persisted = readPersistedLicenseForm();
      const licenseKey = (
        licenseSnapshot?.licenseKey ||
        licenseForm.licenseKey ||
        persisted.licenseKey ||
        ""
      ).trim();
      const fingerprint = (
        licenseSnapshot?.fingerprint ||
        licenseForm.fingerprint ||
        persisted.fingerprint ||
        ""
      ).trim();
      const licensePlanId = (
        licenseSnapshot?.planId ||
        licenseForm.planId ||
        persisted.planId ||
        ""
      ).trim();

      console.log("[license-check]", {
        licenseForm,
        persisted,
        effective: { licenseKey, fingerprint, planId: licensePlanId },
      });

      const fp =
        fingerprint ||
        `${licensePlanId || planId}:browser`;
      const pid =
        (planId || "").trim() ||
        licensePlanId ||
        "attaguy-plan";

      if (!licenseKey) {
        headers["x-fingerprint"] = fp;
        headers["x-plan-id"] = pid;
        return headers;
      }

      headers["x-license-key"] = licenseKey;
      headers["x-fingerprint"] = fingerprint || fp;
      headers["x-plan-id"] = pid;

      return headers;
    },
    [licenseForm, planId],
  );

  const [budgetHeadLoading, setBudgetHeadLoading] = useState(false);
  const [budgetHeadErr, setBudgetHeadErr] = useState<string>("");
  const [budgetHead, setBudgetHead] = useState<Record<string, string>>({});

  const [tenderPackHeadLoading, setTenderPackHeadLoading] = useState(false);
  const [tenderPackHeadErr, setTenderPackHeadErr] = useState<string>("");
  const [tenderPackHead, setTenderPackHead] = useState<Record<string, string>>({});

  const [tenderRawText, setTenderRawText] = useState("");
  const [tenderFileName, setTenderFileName] = useState("");
  const [uploadingTenderFile, setUploadingTenderFile] = useState(false);
  const [tenderIntelligence, setTenderIntelligence] =
    useState<TenderAnalyzePayload | null>(null);
  const [tenderAnalyzeLoading, setTenderAnalyzeLoading] = useState(false);
  const [tenderAnalyzeError, setTenderAnalyzeError] = useState<string | null>(
    null,
  );
  const [tenderSemantic, setTenderSemantic] =
    useState<TenderSemanticPayload | null>(null);
  const [tenderSemanticLoading, setTenderSemanticLoading] = useState(false);
  const [tenderSemanticError, setTenderSemanticError] = useState<string | null>(
    null,
  );
  const [tenderCompose, setTenderCompose] =
    useState<TenderComposePayload | null>(null);
  const [tenderComposeLoading, setTenderComposeLoading] = useState(false);
  const [tenderComposeError, setTenderComposeError] = useState<string | null>(
    null,
  );
  const [tenderSku, setTenderSku] = useState<TenderSkuPayload | null>(null);
  const [tenderSkuLoading, setTenderSkuLoading] = useState(false);
  const [tenderSkuError, setTenderSkuError] = useState<string | null>(null);
  const [tenderCompliance, setTenderCompliance] =
    useState<TenderCompliancePayload | null>(null);
  const [tenderComplianceLoading, setTenderComplianceLoading] = useState(false);
  const [tenderComplianceError, setTenderComplianceError] = useState<
    string | null
  >(null);
  const [executiveVisualization, setExecutiveVisualization] =
    useState<RuntimeVisualizationDashboard | null>(null);
  const [executiveVisualizationLoading, setExecutiveVisualizationLoading] =
    useState(false);
  const [executiveVisualizationError, setExecutiveVisualizationError] = useState<
    string | null
  >(null);

const scoreDetailsSectionRef = useRef<HTMLDivElement | null>(null);

  const [tenderRisk, setTenderRisk] = useState<TenderRiskPayload | null>(null);
  const [tenderRiskLoading, setTenderRiskLoading] = useState(false);
  const [technicalRows, setTechnicalRows] = useState<TenderRiskRow[]>([]);
  const [businessRows, setBusinessRows] = useState<TenderRiskRow[]>([]);
  
  const latestTechnicalRowsRef = useRef<TenderRiskRow[]>([]);
const latestBusinessRowsRef = useRef<TenderRiskRow[]>([]);
const setTechnicalRowsWithTrace = (rows: TenderRiskRow[], source: string) => {
  latestTechnicalRowsRef.current = Array.isArray(rows) ? rows : [];
  setTechnicalRows(latestTechnicalRowsRef.current);
};


const setBusinessRowsWithTrace = (rows: TenderRiskRow[], source: string) => {
  latestBusinessRowsRef.current = Array.isArray(rows) ? rows : [];
  setBusinessRows(latestBusinessRowsRef.current);
};
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [downloadGate, setDownloadGate] = useState<BidDecisionGateResult | null>(null);
  const [showDownloadGate, setShowDownloadGate] = useState(false);
  const [downloadGateLoading, setDownloadGateLoading] = useState(false);
  const tenderPackGateResolverRef = useRef<((passed: boolean) => void) | null>(null);
  const [pendingDownloadKind, setPendingDownloadKind] = useState<
    null | "plan-pdf" | "budget-pdf" | "enterprise-zip"
  >(null);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<
    "full" | "pack" | null
  >(null);
  const pendingDownloadKindRef = useRef<
    null | "plan-pdf" | "budget-pdf" | "enterprise-zip"
  >(null);
  const riskDetailsSectionRef = useRef<HTMLDivElement | null>(null);

  const techResponseSectionRef = useRef<HTMLDivElement | null>(null);
  const bizResponseSectionRef = useRef<HTMLDivElement | null>(null);
  const attachmentSectionRef = useRef<HTMLDivElement | null>(null);
  const rowHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [fixingRiskId, setFixingRiskId] = useState<string | null>(null);
  const [riskFixResults, setRiskFixResults] = useState<Record<string, unknown>>(
    {}
  );
  const [highlightFixKey, setHighlightFixKey] = useState<string | null>(null);
  const [highlightRowKey, setHighlightRowKey] = useState<string | null>(null);

  const [tenderScoreResult, setTenderScoreResult] =
    useState<TenderScoreSimulationPayload | null>(null);
  const [tenderScoreSource, setTenderScoreSource] = useState<
    "tender-extracted" | "default" | undefined
  >(undefined);
  const [tenderScoreProfileName, setTenderScoreProfileName] = useState<
    string | undefined
  >(undefined);
  const [tenderScoreLoading, setTenderScoreLoading] = useState(false);
  const [showTenderRiskDetails, setShowTenderRiskDetails] = useState(true);
  const [showTenderScoreDetails, setShowTenderScoreDetails] = useState(false);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const projectIdFromUrl = (searchParams.get("projectId") || "").trim();

    let savedPrimary = "";
    let savedLegacy = "";
    try {
      savedPrimary = (localStorage.getItem(PROJECT_ID_LS_KEY) || "").trim();
      savedLegacy = (localStorage.getItem(RESULT_PROJECT_ID_STORAGE_KEY) || "").trim();
    } catch {
      // ignore
    }

    const fromStoredPlan = readProjectIdFromStoredPlan();

    let currentProjectId: string | null = null;
    for (const raw of [
      projectIdFromUrl,
      savedPrimary,
      fromStoredPlan,
      savedLegacy,
    ]) {
      if (isValidResolvedProjectId(raw, planId)) {
        currentProjectId = raw.trim();
        break;
      }
    }

    if (projectIdFromUrl) {
      persistProjectIdKeys(projectIdFromUrl);
    }

    if (currentProjectId) {
      setProjectId(currentProjectId);
      persistProjectIdKeys(currentProjectId);
      console.log("[projectId-ready]", { projectId: currentProjectId });
      return;
    }

    console.info("[projectId-missing-after-mount]", {
      note: "no valid projectId after URL / storage / plan recovery",
    });
  }, [mounted, planId, searchParams]);

  useEffect(() => {
    if (!projectId) return;
    persistProjectIdKeys(projectId);
  }, [projectId]);

  useEffect(() => {
    if (!mounted) return;
    const pid = readProjectIdFromStoredPlan();
    if (pid && isAtgPlanJobId(pid)) {
      setPlanId(pid);
    }
  }, [mounted]);


  const ensureProjectId = useCallback(
    async (options?: {
      /** 为 false 时绝不调用 /api/tender/generate（Pro 一键购买等） */
      allowTenderGenerate?: boolean;
    }): Promise<string | null> => {
      const allowTenderGenerate = options?.allowTenderGenerate !== false;

      const urlLive = projectIdFromUrlSources(searchParams);
      if (isValidResolvedProjectId(urlLive, planId)) {
        const v = urlLive.trim();
        setProjectId(v);
        persistProjectIdKeys(v);
        return v;
      }

      const current = (projectId || "").trim();
      if (isValidResolvedProjectId(current, planId)) {
        return current;
      }

      if (typeof window !== "undefined") {
        try {
          const fromPlan = readProjectIdFromStoredPlan();
          if (isValidResolvedProjectId(fromPlan, planId)) {
            const v = fromPlan.trim();
            setProjectId(v);
            persistProjectIdKeys(v);
            return v;
          }

          const fromResultStore = readPersistedProjectIdKeys();
          if (isValidResolvedProjectId(fromResultStore, planId)) {
            const v = fromResultStore.trim();
            setProjectId(v);
            persistProjectIdKeys(v);
            return v;
          }
        } catch {
          // ignore
        }
      }

      if (!allowTenderGenerate) {
        console.info("[projectId-missing]", {
          phase: "ensureProjectId",
          allowTenderGenerate: false,
        });
        return null;
      }

      const payload: TenderProjectInput = {
        name: `${companyName || "企业项目"}-${planId || "result"}`,
        clientName: companyName || undefined,
        industry: "enterprise",
        siteType: "office",
        areaM2: Number.isFinite(spaceSqm) ? spaceSqm : undefined,
        targetUsers: Number.isFinite(headcount) ? headcount : undefined,
        budgetLevel: budgetTier,
        deliveryMode: "tender",
        notes: tenderFileName ? `来源文件：${tenderFileName}` : undefined,
      };

      try {
        const res = await fetch("/api/tender/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        const createdId = String(data?.data?.project?.id || "").trim();
        if (!res.ok || !createdId || !isValidResolvedProjectId(createdId, planId)) {
          throw new Error(
            data?.error ||
              data?.message ||
              `无法生成有效 projectId（status=${res.status}）`,
          );
        }
        setProjectId(createdId);
        return createdId;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setPageLastError(msg);
        return null;
      }
    },
    [
      projectId,
      planId,
      companyName,
      spaceSqm,
      headcount,
      budgetTier,
      tenderFileName,
      searchParams,
    ],
  );

  const refreshEntitlementsBounded = useCallback(
    async (reason: string) => {
      const ms = 18_000;
      const t0 = Date.now();
      try {
        await Promise.race([
          refreshEntitlements({ force: true }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `[entitlements] refresh timeout after ${ms}ms (${reason})`,
                  ),
                ),
              ms,
            ),
          ),
        ]);
      } catch (e) {
        console.warn("[ENTITLEMENT] bounded-refresh-fail", {
          reason,
          elapsedMs: Date.now() - t0,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [refreshEntitlements],
  );

  const entitlementPollStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      entitlementPollStopRef.current?.();
      entitlementPollStopRef.current = null;
    };
  }, []);

  /** 仅下单支付链路：不触发任何下载；webhook 完成后轮询 entitlement 直至 paid-confirmed（最长 30s） */
  const runPayPurchaseOnly = useCallback(
    async (targetLevel: "pro" | "enterprise") => {
      console.info("[purchase-flow] enter", { targetLevel, planId });
      entitlementPollStopRef.current?.();
      entitlementPollStopRef.current = null;

      const realProjectId = await ensureProjectId({
        allowTenderGenerate: false,
      });
      if (isBlockedPaidDownloadProjectId(realProjectId, planId)) {
        throw new Error(
          "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。",
        );
      }
      const { licenseKey } = await executePayPurchaseAndIssueLicense({
        planId,
        targetLevel,
        amountCents: upgradeAmountForLevel(targetLevel),
        projectId: realProjectId as string,
      });
      console.info("[purchase-flow] license-issued-client", {
        targetLevel,
        planId,
        hasKey: Boolean(licenseKey?.trim()),
      });
      applyWebhookLicensePersist(licenseKey);
      setPageLastError(null);
      await refreshEntitlementsBounded("post-license");

      if (canDownloadPaidTier(targetLevel)) {
        console.info("[purchase-flow] paid-confirmed", {
          tier: targetLevel,
          via: "immediate",
        });
        setPageOpOutcome("idle");
        setPageOpLabel("—");
        return;
      }

      await new Promise<void>((resolve) => {
        entitlementPollStopRef.current = pollEntitlementsUntil({
          reason: `paid-tier-${targetLevel}`,
          maxMs: 30_000,
          intervalMs: 600,
          isSatisfied: () => canDownloadPaidTier(targetLevel),
          onComplete: () => {
            entitlementPollStopRef.current = null;
            resolve();
          },
        });
      });

      if (!canDownloadPaidTier(targetLevel)) {
        throw new Error(
          "支付已完成，但授权尚未同步；请稍后点击「下载」按钮重试。",
        );
      }
      console.info("[purchase-flow] paid-confirmed", { tier: targetLevel });
      setPageOpOutcome("idle");
      setPageOpLabel("—");
    },
    [
      planId,
      ensureProjectId,
      applyWebhookLicensePersist,
      refreshEntitlementsBounded,
      canDownloadPaidTier,
      pollEntitlementsUntil,
    ],
  );

  /** 支付 busy 兜底：权益已就绪时立即清掉「支付处理中…」，避免某次 pending fetch 卡死 finally */
  useEffect(() => {
    if (checkoutBusyTier === null) return;
    const maxBusyMs = 180_000;
    const id = window.setTimeout(() => {
      console.warn("[DEBUG][checkout] watchdog forced clear", {
        was: checkoutBusyTier,
        maxBusyMs,
      });
      setCheckoutBusyTier(null);
    }, maxBusyMs);
    return () => window.clearTimeout(id);
  }, [checkoutBusyTier]);

  useEffect(() => {
    if (checkoutBusyTier !== "enterprise") return;
    if (!canDownloadPaidTier("enterprise")) return;
    console.info("[DEBUG][checkout] enterprise unlocked — clear busy", {
      checkoutBusyTier,
    });
    setCheckoutBusyTier(null);
  }, [checkoutBusyTier, canDownloadPaidTier]);

  useEffect(() => {
    if (checkoutBusyTier !== "pro") return;
    if (!canDownloadPaidTier("pro")) return;
    console.info("[DEBUG][checkout] pro unlocked — clear busy", {
      checkoutBusyTier,
    });
    setCheckoutBusyTier(null);
  }, [checkoutBusyTier, canDownloadPaidTier]);

  useEffect(() => {
    console.info("[DEBUG][ui][enterprise-zip-btn]", {
      checkoutBusyTier,
      entitlementLoading,
      showPayPendingLabel: checkoutBusyTier === "enterprise",
      canDownloadEnterprise: canDownloadPaidTier("enterprise"),
    });
  }, [
    checkoutBusyTier,
    entitlementLoading,
    canDownloadPaidTier,
  ]);

  const hasReadyProjectIdForPaidDownload = useMemo(() => {
    // mount 完成前不拦截付费按钮 / 不误判缺失（避免 hydration 闪烁）
    if (!mounted) return true;
    if (typeof window === "undefined") return true;
    const urlId = projectIdFromUrlSources(searchParams);
    let storePrimary = "";
    let storeLegacy = "";
    try {
      storePrimary = (localStorage.getItem(PROJECT_ID_LS_KEY) || "").trim();
      storeLegacy = (localStorage.getItem(RESULT_PROJECT_ID_STORAGE_KEY) || "").trim();
    } catch {
      // ignore
    }
    const stateId = projectId.trim();
    const fromPlan = readProjectIdFromStoredPlan();
    for (const raw of [urlId, stateId, storePrimary, fromPlan, storeLegacy]) {
      if (isValidResolvedProjectId(raw, planId)) return true;
    }
    return false;
  }, [mounted, projectId, planId, searchParams]);

  useEffect(() => {
    logPurchaseEntryPrepared({ surface: "result-page" });
  }, []);

  useEffect(() => {
    if (!pdfDownloadFlash) return;
    const t = window.setTimeout(() => setPdfDownloadFlash(false), 2500);
    return () => clearTimeout(t);
  }, [pdfDownloadFlash]);

  useEffect(() => {
    if (!zipDownloadFlash) return;
    const t = window.setTimeout(() => setZipDownloadFlash(false), 2500);
    return () => clearTimeout(t);
  }, [zipDownloadFlash]);

  const normalizeTenderRowText = (value: unknown) =>
    String(value ?? "").replace(/\s+/g, " ").trim();
  
  const buildConservativeBaselineRows = (
    rows: TenderRiskRow[],
    kind: "technical" | "business"
  ): TenderRiskRow[] => {
    return (Array.isArray(rows) ? rows : []).map((row, index) => {
      const requirement = normalizeTenderRowText((row as any)?.requirement);
      const response = normalizeTenderRowText((row as any)?.response);
      const note = normalizeTenderRowText((row as any)?.note);
  
      const ref =
        normalizeTenderRowText((row as any)?.ref) ||
        `${kind === "technical" ? "T" : "B"}-${String(index + 1).padStart(2, "0")}`;
  
      const hasGoodResponse = response.length >= 24;
      const hasNote = note.length >= 12;
  
      return {
        ...row,
        ref,
        requirement,
        response: hasGoodResponse ? response : "待结合招标文件逐项补充。",
        status:
          (row as any)?.status === "满足" || (row as any)?.status === "响应"
            ? "待确认"
            : (row as any)?.status || "待确认",
        risk:
          (row as any)?.risk ||
          (hasGoodResponse || hasNote ? "medium" : "high"),
        note: hasNote
          ? note
          : "建议补充与招标条款逐条对应的响应依据。",
      } as TenderRiskRow;
    });
  };
  
  const isOptimizedTenderRow = (row: TenderRiskRow | null | undefined) => {
    if (!row) return false;
  
    const status = normalizeTenderRowText((row as any)?.status);
    const risk = normalizeTenderRowText((row as any)?.risk);
    const source = normalizeTenderRowText((row as any)?.source);
    const response = normalizeTenderRowText((row as any)?.response);
  
    if (source === "tender-optimize") return true;
    if (risk === "已补强") return true;
    if (status === "响应" && response.length >= 80) return true;
  
    return false;
  };
  
  const shouldKeepOptimizedRows = (rows: TenderRiskRow[]) =>
    Array.isArray(rows) && rows.some((row) => isOptimizedTenderRow(row));

  useEffect(() => {
    let cancelled = false;
  
    const timer = window.setTimeout(async () => {
      const raw = tenderRawText?.trim() ?? "";
      setTenderRiskLoading(true);
  
      try {
        if (!raw) {
          if (!cancelled) {
            setTenderRisk(null);
            setTenderRiskLoading(false);
          }
          return;
        }
  
        const parseRes = await fetch("/api/tender-parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText: raw,
            sourceName: tenderFileName,
          }),
        });
  
        const parsed = await parseRes.json().catch(() => null);
        if (cancelled) return;
  
        if (!parseRes.ok || !parsed?.ok) {
          setTechnicalRowsWithTrace([], "parse-failed");
          setBusinessRowsWithTrace([], "parse-failed");
          setTenderRisk(null);
          setTenderRiskLoading(false);
          return;
        }
  
        const tech = mapParsedToTechnicalRows(
          parsed.technicalRequirements || []
        );
  
        const biz = mapParsedToBusinessRows(
          parsed.businessRequirements || []
        );
  
        const baselineTechnicalRows = buildConservativeBaselineRows(
          tech,
          "technical"
        );
  
        const baselineBusinessRows = buildConservativeBaselineRows(
          biz,
          "business"
        );
  
        setTechnicalRowsWithTrace(baselineTechnicalRows, "parse-baseline");
        setBusinessRowsWithTrace(baselineBusinessRows, "parse-baseline");

        const riskRes = await fetch("/api/tender-risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technicalRows: baselineTechnicalRows,
            businessRows: baselineBusinessRows,
            rawText: tenderRawText,
            sourceName: tenderFileName,
            mode: budgetLevel === "government" ? "government" : "enterprise",
          }),
        }).then((r) => r.json());
        
        let nextRisk = null;
        if (riskRes?.ok) {
          nextRisk = riskRes.risk ?? riskRes;
        }
        
        setTenderRisk(nextRisk);
        
        const scoreRes = await fetch("/api/tender-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technicalRows: baselineTechnicalRows,
            businessRows: baselineBusinessRows,
            rawText: tenderRawText,
            sourceName: tenderFileName,
            mode: budgetLevel === "government" ? "government" : "enterprise",
            risk: nextRisk,
          }),
        }).then((r) => r.json());
        
        if (scoreRes?.ok) {
          setTenderScoreResult(scoreRes);
        } else {
          setTenderScoreResult(null);
        }

        setTenderRiskLoading(false);
      } catch (error) {
        if (!cancelled) {
          setTenderRisk(null);
          setTenderRiskLoading(false);
        }
      }
    }, 120);
  
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tenderRawText, tenderFileName]);

  useEffect(() => {
    let cancelled = false;
  
    // ❗关键：如果已经有 rows，就不要再解析覆盖
    if (technicalRows.length > 0 || businessRows.length > 0) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const raw = tenderRawText.trim();
      if (!raw) {
        setTenderRisk(null);
        setTenderRiskLoading(false);
        return;
      }
    
      setTenderRiskLoading(true);
    
      try {
        const parseRes = await fetch("/api/tender-parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-force-allow": "1",   // ✅ 同样加
          },
          body: JSON.stringify({
            rawText: raw,
            sourceName: tenderFileName,
          }),
        });
  
        const parsed = await parseRes.json().catch(() => null);
        if (cancelled) return;
  
        if (!parseRes.ok || !parsed?.ok) {
          setTechnicalRowsWithTrace([], "parse-failed");
          setBusinessRowsWithTrace([], "parse-failed");
          setTenderRisk(null);
          return;
        }
        
        const rawTech = Array.isArray(parsed?.technicalRows) ? parsed.technicalRows : [];
const rawBiz = Array.isArray(parsed?.businessRows) ? parsed.businessRows : [];

const baselineTechnicalRows = buildConservativeBaselineRows(
  rawTech,
  "technical"
);

const baselineBusinessRows = buildConservativeBaselineRows(
  rawBiz,
  "business"
);
        
  const hasBaselineRows =
    baselineTechnicalRows.length > 0 || baselineBusinessRows.length > 0;
  
  if (!hasBaselineRows) {
    return;
  }
  
  setTechnicalRowsWithTrace(baselineTechnicalRows, "parse-baseline");
  setBusinessRowsWithTrace(baselineBusinessRows, "parse-baseline");
  
  await refreshTenderDecisionState({
    technicalRows: baselineTechnicalRows,
    businessRows: baselineBusinessRows,
    rawText: tenderRawText,
  });

      } catch {
      } finally {
        if (!cancelled) {
          setTenderRiskLoading(false);
        }
      }
    }, 300);
  
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tenderRawText]); // ❗不要依赖 technicalRows/businessRows

  function buildFallbackGateRisksFromTenderRisk(risk: any) {
    const refs = Array.isArray(risk?.topRisks) ? risk.topRisks : [];
    const techRows = Array.isArray(risk?.technicalRows) ? risk.technicalRows : [];
    const bizRows = Array.isArray(risk?.businessRows) ? risk.businessRows : [];
    const allRows = [...techRows, ...bizRows];
  
    return refs.map((ref: string, index: number) => {
      const matched =
        allRows.find((row: any) => row?.ref === ref) ||
        allRows.find((row: any) => row?.id === ref) ||
        null;
  
      return {
        id: ref || `R-${index + 1}`,
        level: "block",
        title:
          matched?.requirement ||
          matched?.clause ||
          matched?.title ||
          ref ||
          `风险项 ${index + 1}`,
        reason:
          matched?.note ||
          matched?.response ||
          matched?.requirement ||
          "该条款当前证据不足，建议优先补强。",
        suggestion:
          matched?.note ||
          "建议补齐与招标条款逐条对应的响应依据、证明材料或实施说明。",
        canAutoFix: true,
      };
    });
  }

  const refreshTenderDecisionState = useCallback(
    async (next?: {
      technicalRows?: TenderRiskRow[];
      businessRows?: TenderRiskRow[];
      rawText?: string;
    }) => {
      const raw = (next?.rawText ?? tenderRawText ?? "").trim();

      const nextTechnicalRows =
        Array.isArray(next?.technicalRows) && next!.technicalRows.length > 0
          ? next!.technicalRows
          : technicalRows;
      
      const nextBusinessRows =
        Array.isArray(next?.businessRows) && next!.businessRows.length > 0
          ? next!.businessRows
          : businessRows;

      if (!raw) {
        return;
      }

const riskRes = await fetch("/api/tender-risk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    technicalRows,
    businessRows,
    rawText: tenderRawText,
    sourceName: tenderFileName,
    mode: budgetLevel === "government" ? "government" : "enterprise",
  }),
}).then((r) => r.json()).catch(() => null);

let nextRisk = null;

if (riskRes?.ok) {
  if (riskRes.risk) {
    nextRisk = riskRes.risk;
  } else if (riskRes.level) {
    nextRisk = riskRes;
  }
}

setTenderRisk(nextRisk);

const finalTechnicalRows =
  Array.isArray(riskRes?.technicalRows) ? riskRes.technicalRows : nextTechnicalRows;
const finalBusinessRows =
  Array.isArray(riskRes?.businessRows) ? riskRes.businessRows : nextBusinessRows;

const scoreRes = await fetch("/api/tender-score", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    technicalRows: finalTechnicalRows,
    businessRows: finalBusinessRows,
    rawText: raw,
    sourceName: tenderFileName,
    mode: budgetLevel === "government" ? "government" : "enterprise",
    risk: nextRisk,
  }),
}).then((r) => r.json()).catch(() => null);

if (scoreRes?.ok) {
  setTenderScoreResult(scoreRes);
} else {
  setTenderScoreResult(null);
}
  
      try {
        const currentTechnicalRows = latestTechnicalRowsRef.current;
const currentBusinessRows = latestBusinessRowsRef.current;
        const precheckRes = await fetch("/api/tender-pack/precheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            rawText: tenderRawText,
            sourceName: tenderFileName,
            mode: budgetLevel === "government" ? "government" : "enterprise",
            technicalRows: currentTechnicalRows,
            businessRows: currentBusinessRows,
          }),
        }).then((r) => r.json());
  
        if (precheckRes?.gate) {
          const computedScore =
            typeof scoreRes?.result?.totalScore === "number" &&
            typeof scoreRes?.result?.totalMaxScore === "number"
              ? Math.round(
                  (scoreRes.result.totalScore / scoreRes.result.totalMaxScore) * 100
                )
              : typeof precheckRes.gate.score === "number"
              ? precheckRes.gate.score
              : undefined;
        
          const highRiskCount =
            (nextRisk?.summary?.techPending ?? 0) +
            (nextRisk?.summary?.bizPending ?? 0);
        
          let computedAction: "allow" | "warn" | "block" = "allow";
        
          if (computedScore !== undefined) {
            if (computedScore < 60 || highRiskCount >= 10) {
              computedAction = "block";
            } else if (computedScore < 75 || highRiskCount >= 5) {
              computedAction = "warn";
            } else {
              computedAction = "allow";
            }
          } else {
            computedAction =
              precheckRes.gate.action === "allow"
                ? "allow"
                : precheckRes.gate.action === "warn"
                ? "warn"
                : "block";
          }
        
          const panelGate = {
            action: computedAction,
            summary:
              precheckRes.gate.summary ||
              precheckRes.gate.message ||
              "已完成风险与评分分析",
            score: computedScore,
            risks:
              Array.isArray(precheckRes.gate.risks) && precheckRes.gate.risks.length > 0
                ? precheckRes.gate.risks
                : buildFallbackGateRisksFromTenderRisk(nextRisk),
            decisionLabel: precheckRes.gate.decisionLabel ?? null,
          };
        
          setDownloadGate(panelGate as any);
          setActiveRiskId(panelGate.risks?.[0]?.id ?? null);
          setShowDownloadGate(panelGate.action !== "allow");
        }

      } catch (err) {
        console.error("[refreshTenderDecisionState error]", err);
      }
    },
    [
      planId,
      tenderRawText,
      tenderFileName,
      budgetLevel,
      technicalRows,
      businessRows,
    ]
  );

  const handleTenderOptimize = useCallback(async () => {
    try {
      setOptimizeLoading(true);
  
      const optimizeRes = await fetch("/api/tender-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicalRows,
          businessRows,
          rawText: tenderRawText,
          sourceName: tenderFileName,
          mode: budgetLevel === "government" ? "government" : "enterprise",
        }),
      }).then((r) => r.json());
  
      if (!optimizeRes?.ok) {
        throw new Error(optimizeRes?.message || "优化失败");
      }
  
      const nextTechnicalRows = Array.isArray(optimizeRes.technicalRows)
        ? optimizeRes.technicalRows
        : technicalRows;
  
      const nextBusinessRows = Array.isArray(optimizeRes.businessRows)
        ? optimizeRes.businessRows
        : businessRows;
  
      setTechnicalRowsWithTrace(nextTechnicalRows, "optimize");
      setBusinessRowsWithTrace(nextBusinessRows, "optimize");
  
      packForceAllowOnceRef.current = true;

      setShowTenderRiskDetails(true);
      setShowTenderScoreDetails(true);
      setShowDownloadGate(false);
      setActiveRiskId(null);
  
      await refreshTenderDecisionState({
        technicalRows: nextTechnicalRows,
        businessRows: nextBusinessRows,
        rawText: tenderRawText,
      });
    } catch (err) {
      console.error("[handleTenderOptimize error]", err);
    } finally {
      setOptimizeLoading(false);
    }
  }, [
    technicalRows,
    businessRows,
    tenderRawText,
    tenderFileName,
    budgetLevel,
    refreshTenderDecisionState,
  ]);

  const shouldOpenGateBeforeDownload = useCallback(() => {
    const action = downloadGate?.action;
    if (action === "warn" || action === "block") {
      setShowDownloadGate(true);
      return true;
    }
    return false;
  }, [
    planId,
    tenderRawText,
    tenderFileName,
    budgetLevel,
    tenderRisk,
    tenderScoreResult,
  ]);

  const isDownloadBlocked = downloadGate?.action === "block";
  const isDownloadWarn = downloadGate?.action === "warn";
  const canDownloadNow =
    downloadGate?.action === "allow" ||
    (downloadGate?.risks?.length ?? 0) === 0;

  /**
   * 付费资源（Pro/Enterprise 购买与下载）：当服务端 entitlement 已确认档位时，
   * 不因本地 tender「风险闸门」单独拦截（避免有权益却点不动）。
   * Free 简版下载仍只用 `canDownloadNow`。
   */
  const canProceedWithPaidDownloads = useMemo(
    () =>
      canDownloadNow ||
      entitlementLevel === "pro" ||
      entitlementLevel === "enterprise" ||
      entitlement?.effectiveLevel === "pro" ||
      entitlement?.effectiveLevel === "enterprise" ||
      entitlement?.proEnabled === true ||
      entitlement?.enterpriseEnabled === true,
    [canDownloadNow, entitlementLevel, entitlement],
  );

  useEffect(() => {
    console.info("[DEBUG][download-gate]", {
      canDownloadNow,
      canProceedWithPaidDownloads,
      downloadGateAction: downloadGate?.action,
      riskCount: downloadGate?.risks?.length ?? 0,
      entitlementLevel,
      entitlementSnapshot: entitlement
        ? {
            effectiveLevel: entitlement.effectiveLevel,
            zipEnabled: entitlement.zipEnabled,
            budgetEnabled: entitlement.budgetEnabled,
            enterpriseEnabled: entitlement.enterpriseEnabled,
            proEnabled: entitlement.proEnabled,
          }
        : null,
      zipEnabled,
      fallbackUsed,
      hasReadyProjectIdForPaidDownload,
      pdfDownloadBusy,
      zipDownloadBusy,
      checkoutBusyTier,
    });
  }, [
    canDownloadNow,
    canProceedWithPaidDownloads,
    downloadGate?.action,
    downloadGate?.risks?.length,
    entitlementLevel,
    entitlement,
    zipEnabled,
    fallbackUsed,
    hasReadyProjectIdForPaidDownload,
    pdfDownloadBusy,
    zipDownloadBusy,
    checkoutBusyTier,
  ]);

  const beforeNonPanelDownload = useCallback(() => {
    if (shouldOpenGateBeforeDownload()) return false;
    return true;
  }, [shouldOpenGateBeforeDownload]);

  const beforeTenderPackDownload = useCallback(async () => {
    try {
      setDownloadGateLoading(true);
  
      const currentTechnicalRows = latestTechnicalRowsRef.current;
      const currentBusinessRows = latestBusinessRowsRef.current;
  
      const currentScore =
        typeof (tenderScoreResult as any)?.result?.totalScore === "number" &&
        typeof (tenderScoreResult as any)?.result?.totalMaxScore === "number"
          ? Math.round(
              (((tenderScoreResult as any).result.totalScore as number) /
                ((tenderScoreResult as any).result.totalMaxScore as number)) *
                100
            )
          : typeof tenderRisk?.score === "number"
          ? tenderRisk.score
          : undefined;
  
      const currentHighRiskCount =
        (tenderRisk?.summary?.techPending ?? 0) +
        (tenderRisk?.summary?.bizPending ?? 0);
  
      let computedAction: "allow" | "warn" | "block" = "allow";
  
      if (currentScore !== undefined) {
        if (currentScore < 60 || currentHighRiskCount >= 10) {
          computedAction = "block";
        } else if (currentScore < 75 || currentHighRiskCount >= 5) {
          computedAction = "warn";
        } else {
          computedAction = "allow";
        }
      }
  
      // ✅ 当前页面已经是 allow，就直接放行，不再相信旧 precheck
      if (computedAction === "allow") {
        packForceAllowOnceRef.current = true;
        return true;
      }
  
      const precheckRes = await fetch("/api/tender-pack/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          rawText: tenderRawText,
          sourceName: tenderFileName,
          mode: budgetLevel === "government" ? "government" : "enterprise",
          technicalRows: currentTechnicalRows,
          businessRows: currentBusinessRows,
        }),
      });

      const { rawText, json } = await safeReadJsonOrText(precheckRes);

      if (!precheckRes.ok || !json?.ok) {
        throw new Error(
          json?.message ||
            json?.code ||
            rawText ||
            `precheck failed: ${precheckRes.status}`
        );
      }

      const decisionLevel = String(
        json?.summary?.decision?.level || ""
      ).toLowerCase();
      const explicitAllow = json?.allow === true;
      const proceed =
        explicitAllow ||
        decisionLevel === "allow" ||
        decisionLevel === "safe" ||
        decisionLevel === "cautious";

      if (!proceed) {
        if (json?.gate) {
          handlePackRiskBlocked(toPanelGate(json.gate));
        }
        return false;
      }

      packForceAllowOnceRef.current = true;
      return true;
    } catch (error) {
      console.error("[beforeTenderPackDownload] failed", error);
      return true;
    } finally {
      setDownloadGateLoading(false);
    }
  }, [
    planId,
    tenderRawText,
    tenderFileName,
    budgetLevel,
    tenderRisk,
    tenderScoreResult,
  ]);

  const resolveTenderPackGate = useCallback((passed: boolean) => {
    const resolver = tenderPackGateResolverRef.current;
    tenderPackGateResolverRef.current = null;
    setShowDownloadGate(false);
    if (resolver) resolver(passed);
  }, []);

  const getRiskTargetSection = useCallback(
    (riskId?: string | null) => {
      if (!riskId || !downloadGate?.risks?.length) return "risk";

      const risk = downloadGate.risks.find((item) => item.id === riskId);
      if (!risk) return "risk";

      type RiskTextExtras = { summary?: string; missingItems?: string[] };
      const r = risk as BidRiskItem & RiskTextExtras;

      const text = [
        r.title,
        r.summary,
        r.reason,
        r.suggestion,
        ...(r.missingItems ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        text.includes("技术") ||
        text.includes("technical") ||
        text.includes("参数")
      ) {
        return "tech";
      }
      if (
        text.includes("商务") ||
        text.includes("business") ||
        text.includes("报价")
      ) {
        return "biz";
      }
      if (
        text.includes("附件") ||
        text.includes("材料") ||
        text.includes("证书")
      ) {
        return "attachment";
      }

      return "risk";
    },
    [downloadGate]
  );

  const getRiskHighlightKey = useCallback(
    (riskId?: string | null) => {
      if (!riskId || !downloadGate?.risks?.length) return null;

      const risk = downloadGate.risks.find((item) => item.id === riskId);
      if (!risk) return null;

      type RiskTextExtras = { summary?: string; missingItems?: string[] };
      const r = risk as BidRiskItem & RiskTextExtras;

      const text = [
        r.title,
        r.summary,
        r.reason,
        r.suggestion,
        ...(r.missingItems ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        text.includes("品牌") ||
        text.includes("型号") ||
        text.includes("规格") ||
        text.includes("参数")
      ) {
        return "tech-spec";
      }
      if (text.includes("响应表") || text.includes("技术响应")) {
        return "tech-response";
      }
      if (
        text.includes("报价") ||
        text.includes("价格") ||
        text.includes("商务")
      ) {
        return "biz-price";
      }
      if (
        text.includes("资质") ||
        text.includes("营业执照") ||
        text.includes("业绩") ||
        text.includes("合同")
      ) {
        return "biz-qualification";
      }
      if (
        text.includes("附件") ||
        text.includes("上传") ||
        text.includes("扫描件") ||
        text.includes("证明") ||
        text.includes("证书")
      ) {
        return "attachment-file";
      }
      if (
        text.includes("盖章") ||
        text.includes("签字") ||
        text.includes("签署")
      ) {
        return "attachment-sign";
      }

      return "risk-summary";
    },
    [downloadGate]
  );

  const getRiskHighlightRowKey = useCallback(
    (riskId?: string | null) => {
      if (!riskId || !downloadGate?.risks?.length) return null;

      const risk = downloadGate.risks.find((item) => item.id === riskId);
      if (!risk) return null;

      type RiskTextExtras = { summary?: string; missingItems?: string[] };
      const r = risk as BidRiskItem & RiskTextExtras;

      const text = [
        r.title,
        r.summary,
        r.reason,
        r.suggestion,
        ...(r.missingItems ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (text.includes("品牌")) return "tech-brand";
      if (text.includes("型号")) return "tech-model";
      if (text.includes("规格")) return "tech-spec";
      if (text.includes("参数")) return "tech-parameter";
      if (text.includes("技术响应")) return "tech-response";

      if (text.includes("报价")) return "biz-price";
      if (text.includes("价格")) return "biz-price";
      if (text.includes("商务条款")) return "biz-terms";
      if (text.includes("资质")) return "biz-qualification";
      if (text.includes("营业执照")) return "biz-license";
      if (text.includes("业绩")) return "biz-performance";
      if (text.includes("合同")) return "biz-contract";

      if (text.includes("附件")) return "attachment-file";
      if (text.includes("证明")) return "attachment-proof";
      if (text.includes("证书")) return "attachment-certificate";
      if (text.includes("扫描件")) return "attachment-scan";
      if (text.includes("盖章")) return "attachment-stamp";
      if (text.includes("签字")) return "attachment-sign";
      if (text.includes("签署")) return "attachment-sign";
      if (text.includes("上传")) return "attachment-upload";

      return null;
    },
    [downloadGate]
  );

  const triggerFixHighlight = useCallback((key: string | null) => {
    setHighlightFixKey(key);

    if (!key) return;

    setTimeout(() => {
      setHighlightFixKey((current) => (current === key ? null : current));
    }, 2200);
  }, []);

  const triggerRowHighlight = useCallback((rowKey: string | null) => {
    if (rowHighlightTimerRef.current) {
      clearTimeout(rowHighlightTimerRef.current);
      rowHighlightTimerRef.current = null;
    }

    setHighlightRowKey(rowKey);

    if (!rowKey) return;

    rowHighlightTimerRef.current = setTimeout(() => {
      setHighlightRowKey((current) => (current === rowKey ? null : current));
      rowHighlightTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (rowHighlightTimerRef.current) {
        clearTimeout(rowHighlightTimerRef.current);
      }
    };
  }, []);

  const getHighlightRowClass = useCallback(
    (rowKey: string) => {
      if (highlightRowKey !== rowKey) {
        return "border-transparent bg-transparent";
      }

      return "border-amber-400/70 bg-amber-400/10 ring-2 ring-amber-300/50 transition-all duration-300";
    },
    [highlightRowKey]
  );

  const getFixHighlightClass = useCallback(
    (key: string) => {
      if (highlightFixKey !== key) {
        return "border-white/10 bg-white/5";
      }

      return "border-amber-400 bg-amber-500/15 ring-2 ring-amber-300/60 shadow-[0_0_0_1px_rgba(251,191,36,0.35)] transition-all duration-300";
    },
    [highlightFixKey]
  );

  const scrollToFixSection = useCallback(
    (section: "tech" | "biz" | "attachment" | "risk") => {
      const map = {
        tech: techResponseSectionRef,
        biz: bizResponseSectionRef,
        attachment: attachmentSectionRef,
        risk: riskDetailsSectionRef,
score: scoreDetailsSectionRef,
      } as const;

      const targetRef = map[section];

      setTimeout(() => {
        requestAnimationFrame(() => {
          targetRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }, 80);
    },
    []
  );

  const handleGoFixFromGate = useCallback(
    (riskId?: string | null) => {
      const nextRiskId =
        riskId ?? activeRiskId ?? downloadGate?.risks?.[0]?.id ?? null;
  
      if (nextRiskId) {
        setActiveRiskId(nextRiskId);
      }
  
      setShowDownloadGate(false);
      setShowTenderRiskDetails(true);
      setShowTenderScoreDetails(true);
  
      const targetSection = getRiskTargetSection(nextRiskId);
      const highlightKey = getRiskHighlightKey(nextRiskId);
      const rowKey = getRiskHighlightRowKey(nextRiskId);
  
      triggerFixHighlight(highlightKey);
      triggerRowHighlight(rowKey);
      scrollToFixSection(targetSection);
    },
    [
      activeRiskId,
      downloadGate,
      getRiskTargetSection,
      getRiskHighlightKey,
      getRiskHighlightRowKey,
      triggerFixHighlight,
      triggerRowHighlight,
      scrollToFixSection,
    ]
  );
  
  const handleOpenAnalysisDetails = useCallback(async () => {
    setAnalysisDetailError(null);
    setAnalysisDetailBusy(true);
    setPageOpLabel("查看分析明细");
    setPageOpOutcome("idle");

    setShowTenderRiskDetails(true);
    setShowTenderScoreDetails(true);
    setHighlightFixKey("risk-summary");

    requestAnimationFrame(() => {
      riskDetailsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    if (!tenderRawText.trim()) {
      const msg = "暂无招标文件正文，无法刷新分析。";
      setAnalysisDetailError(msg);
      setPageLastError(msg);
      setPageOpOutcome("error");
      setAnalysisDetailBusy(false);
      return;
    }

    if (tenderRisk || tenderScoreResult) {
      setPageOpOutcome("success");
      setPageLastError(null);
      setAnalysisDetailBusy(false);
      return;
    }

    try {
      setPageOpLabel("分析中...");
      await refreshTenderDecisionState({
        technicalRows,
        businessRows,
        rawText: tenderRawText,
      });
      setPageOpOutcome("success");
      setPageLastError(null);
      setPageOpLabel("查看分析明细");
    } catch (err) {
      console.error("[handleOpenAnalysisDetails] failed", err);
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisDetailError(msg);
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("查看分析明细");
    } finally {
      setAnalysisDetailBusy(false);
    }
  }, [
    tenderRawText,
    technicalRows,
    businessRows,
    tenderRisk,
    tenderScoreResult,
    refreshTenderDecisionState,
  ]);

  const handleResolveRiskBeforeDownload = useCallback(() => {
    const nextRiskId = activeRiskId ?? downloadGate?.risks?.[0]?.id ?? null;
    handleGoFixFromGate(nextRiskId);
  }, [activeRiskId, downloadGate, handleGoFixFromGate]);

  const handleGateSelectRiskId = useCallback((riskId: string) => {
    setActiveRiskId(riskId);
  }, []);

  const beforeEnterprisePdfDownload = useCallback(async () => {
    pendingDownloadKindRef.current = "plan-pdf";
    setPendingDownloadKind("plan-pdf");
    // 企业合并 PDF 由 /api/tender-pack?format=merged 产出，属于 pack 授权资源
    setPendingDownloadMode("pack");

    return await beforeTenderPackDownload();
  }, [beforeTenderPackDownload, setPendingDownloadMode]);

  const beforeEnterpriseZipDownload = useCallback(async () => {
    pendingDownloadKindRef.current = "enterprise-zip";
    setPendingDownloadKind("enterprise-zip");
    setPendingDownloadMode("pack");
  
    return await beforeTenderPackDownload();
  }, [beforeTenderPackDownload, setPendingDownloadMode]);

  const handlePackRiskBlocked = useCallback((gate: BidDecisionGateResult) => {
    setDownloadGate(gate);
    setActiveRiskId(gate.risks?.[0]?.id ?? null);
    setRiskFixResults({});
    setShowDownloadGate(true);
  }, []);

  const toPanelGate = useCallback((gate: any): BidDecisionGateResult => {
    if (!gate) {
      return {
        action: "block",
        summary: "当前下载被拦截，但未返回有效风险详情。",
        score: 0,
        risks: [
          {
            id: "R-01",
            level: "block",
            title: "下载前校验未通过",
            reason: "系统未返回完整风险结构。",
            suggestion: "请先重新执行风险分析后再下载。",
          },
        ],
      };
    }
  
    if (typeof gate.action === "string" && Array.isArray(gate.risks)) {
      return gate as BidDecisionGateResult;
    }
  
    const score = Number(
      gate.score ??
        gate.totalScore ??
        ((gate.meta?.scoreRatio ?? 0) * 100)
    );
  
    const reasons = Array.isArray(gate.reasons) ? gate.reasons : [];
    const nextSteps = Array.isArray(gate.suggestedNextSteps)
      ? gate.suggestedNextSteps
      : [];
  
    const summaryText =
      typeof gate.summary === "string"
        ? gate.summary
        : gate.message ||
          gate.title ||
          "当前仍存在待处理风险，建议先补强后再下载。";
  
    const risks =
      reasons.length > 0
        ? reasons.map((reason: string, index: number) => ({
            id: `R-${String(index + 1).padStart(2, "0")}`,
            level: "block" as const,
            title: gate.title || `风险项 ${index + 1}`,
            reason,
            suggestion:
              nextSteps[index] ||
              nextSteps[0] ||
              "请先补充响应依据、执行说明或附件支撑后再下载。",
          }))
        : [
            {
              id: "R-01",
              level: "block" as const,
              title: gate.title || "仍存在待处理风险",
              reason:
                gate.message || "当前下载前校验未通过。",
              suggestion:
                nextSteps[0] || "建议先完成补强，再下载正式文件。",
            },
          ];
  
    return {
      action: gate.action === "allow" ? "allow" : "block",
      summary: summaryText,
      score,
      risks,
    };
  }, []); 

  const submitEnterpriseLeadUnlock = useCallback(async () => {
    setEnterpriseUnlockMessage(
      "旧版企业解锁入口已停用，请使用企业信息表单与邮箱验证码流程。"
    );
  }, []);

  const openEnterpriseLeadForm = useCallback((email?: string) => {
    setEnterpriseLeadEmail(email ?? "");
    setShowEnterpriseLeadForm(true);
  }, []);

  const handleEnterpriseLeadSubmit = useCallback(
    async (value: EnterpriseLeadFormValue) => {
      setEnterpriseLeadSubmitting(true);
      try {
        const saveRes = await fetch("/api/lead/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: value.email,
            phone: value.phone,
            company: value.company,
            name: value.name,
            title: value.title,
            planId,
            intent: "unlock_enterprise",
            source: "download",
            payload: {
              from: "result_page",
              mode: "enterprise",
              pendingDownloadKind,
            },
          }),
        });
  
        const saveData = await saveRes.json().catch(() => null);
  
        if (!saveRes.ok || !saveData?.ok) {
          throw new Error(
            saveData?.message || saveData?.error || "企业信息提交失败"
          );
        }
  
        const verifyRes = await fetch("/api/auth/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
            email: value.email,
            mode: pendingDownloadMode === "pack" ? "pack" : "full",
            planId,
            planLevel: commercialPlanFromUserPlan(userPlanFromUrl),
          }),
        });
  
        const verifyData = await verifyRes.json().catch(() => null);
  
        if (!verifyRes.ok || !verifyData?.ok) {
          throw new Error(
            verifyData?.message || verifyData?.error || "验证码发送失败"
          );
        }
  
        setEnterpriseLeadDraft(value);
        setEnterpriseLeadEmail(value.email);
        setShowEnterpriseLeadForm(false);
        setEnterpriseVerifyCode("");
        setShowEnterpriseVerifyDialog(true);
      } finally {
        setEnterpriseLeadSubmitting(false);
      }
    },
    [planId, pendingDownloadKind, userPlanFromUrl, pendingDownloadMode]
  );



  const handleDownloadPdf = useCallback(async () => {
    if (
      process.env.NODE_ENV === "development" &&
      devForceFreeMode &&
      !devForceFreeDownloadBypassRef.current
    ) {
      trackEvent("open_upgrade_modal", {
        planId,
        planLevel: "free",
        reason: "dev_force_free",
      });
      setUpgradeModalEntryMode("upgrade");
      setUpgradeModalOpen(true);
      return;
    }

    const proceed = await beforeEnterprisePdfDownload();
    if (proceed === false) return;

    trackEvent("click_download_pdf", {
      planId,
      planLevel: commercialPlanForAnalyticsRef.current,
    });

    try {
      const unlockToken = getStoredEnterpriseUnlockToken(planId);

      if (!unlockToken) {
        setPendingDownloadKind("plan-pdf");
        // 企业合并投标包 PDF 由 /api/tender-pack?format=merged 产出，后端按 mode=pack 鉴权
        setPendingDownloadMode("pack");
        setEnterpriseLeadEmail("");
        setShowEnterpriseLeadForm(true);
        return;
      }

      // 第 4 刀：每次点击都必须重新请求一次性 downloadToken，不缓存
      // 注意：企业合并 PDF 走 /api/tender-pack?format=merged，mode 必须是 "pack"，否则 TOKEN_MODE_MISMATCH
      let downloadToken: string;
      try {
        downloadToken = await requestEnterpriseDownloadToken({
          planId,
          mode: "pack",
          unlockToken,
        });
      } catch (err) {
        console.warn(
          "[unlockToken] stored token invalid on pdf download, fallback to email verify",
          err
        );
        clearStoredEnterpriseUnlockToken(planId);
        setPendingDownloadKind("plan-pdf");
        setPendingDownloadMode("pack");
        setEnterpriseLeadEmail("");
        setShowEnterpriseLeadForm(true);
        return;
      }

      setPdfDownloadBusy(true);
      setPageOpLabel("正在生成投标文件，请稍候…");
      setPageOpOutcome("idle");

      try {
        // 每次点击都重新拼 URL，带上新鲜的 downloadToken。不做任何缓存。
        const apiUrl = new URL("/api/tender-pack", window.location.origin);
        apiUrl.searchParams.set("planId", planId);
        apiUrl.searchParams.set("format", "merged");
        apiUrl.searchParams.set("level", "enterprise");
        apiUrl.searchParams.set("theme", "brand");
        apiUrl.searchParams.set("variant", "enterprise");
        apiUrl.searchParams.set("includeCover", "1");
        apiUrl.searchParams.set("downloadToken", downloadToken);
        apiUrl.searchParams.set("forceAllow", "1");

        const res = await fetch(apiUrl.toString(), {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "x-force-allow": "1",
          },
          body: JSON.stringify({
            rawText: tenderRawText,
            sourceName: tenderFileName,
            technicalRows,
            businessRows,
          }),
        });

        if (!res.ok) {
          const { rawText: errText, json: errJson } =
            await safeReadJsonOrText(res);
          if (
            res.status === 409 &&
            errJson?.code === PACK_RISK_BLOCK_CODE &&
            errJson?.gate
          ) {
            handlePackRiskBlocked(toPanelGate(errJson.gate));
            return;
          }

          throw new Error(
            errJson?.message ||
              errJson?.code ||
              errText ||
              `legacy merged download failed: ${res.status}`
          );
        }

        const blob = await res.blob();
        triggerEnterpriseBlobDownload(blob, enterpriseMergedFilename(planId));
        trackEvent("download_success", { planId, mode: "pack" });
        logDownloadSuccess({ mode: "pack", tier: commercialPlanForAnalyticsRef.current, planId });
        setPdfDownloadFlash(true);
        setPageOpOutcome("success");
        setPageLastError(null);
        setPageOpLabel("投标包 PDF");
      } finally {
        setPdfDownloadBusy(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownloadError({ mode: "pack", planId, message: msg });
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载招标包 PDF");
    }
  }, [
    planId,
    tenderRawText,
    tenderFileName,
    technicalRows,
    businessRows,
    beforeEnterprisePdfDownload,
    handlePackRiskBlocked,
    devForceFreeMode,
  ]);

  /** Pro/Enterprise 的 PDF 仅允许在「create-order → 支付 → webhook」之后由购买 handler 调用（afterPurchaseGate） */
  type PaidPdfDownloadOpts = {
    allowTenderGenerate?: boolean;
    afterPurchaseGate?: boolean;
  };

  const handleDownloadPlanPdf = useCallback(
    async (
      forcedTier?: CommercialPlanLevel,
      downloadOpts?: PaidPdfDownloadOpts,
    ) => {
    const requestTier = forcedTier ?? commercialPlanForAnalyticsRef.current;
    if (
      (requestTier === "pro" || requestTier === "enterprise") &&
      !downloadOpts?.afterPurchaseGate
    ) {
      console.warn("[purchase-flow] blocked-direct-download", {
        tier: requestTier,
        doc: "plan",
      });
      setPageLastError(
        "付费版下载需先完成订单支付流程，请使用页面上的「开通 / 下载」按钮。",
      );
      setPageOpOutcome("error");
      setPageOpLabel("下载计划书 PDF");
      return;
    }
    const realProjectId = await ensureProjectId({
      allowTenderGenerate: downloadOpts?.allowTenderGenerate !== false,
    });
    if (isBlockedPaidDownloadProjectId(realProjectId, planId)) {
      console.info("[projectId-missing]", { phase: "download-plan-pdf" });
      const msg =
        "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。";
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载计划书 PDF");
      return;
    }

    const resolvedProjectId = realProjectId as string;

    trackEvent("click_download_pdf", {
      planId,
      planLevel: commercialPlanForAnalyticsRef.current,
      docType: "plan",
    });

    try {
      setPdfDownloadBusy(true);
      setPageOpLabel("正在生成计划书 PDF...");
      setPageOpOutcome("idle");
      let licenseSnapshot:
        | { licenseKey: string; fingerprint: string; planId: string }
        | undefined;
      if (requestTier === "pro" || requestTier === "enterprise") {
        const snap = getPaidDownloadLicenseSnapshot(requestTier);
        licenseSnapshot = snap ?? undefined;
        setPageOpLabel("正在生成计划书 PDF...");
      }
      const headers = buildCommercialPdfFetchHeaders({
        docMode: "plan",
        tier: requestTier,
        projectId: resolvedProjectId,
        licenseSnapshot,
      });

      if (requestTier === "pro" || requestTier === "enterprise") {
        console.info("[purchase-flow] download-allowed", {
          docType: "plan",
          tier: requestTier,
          projectId: resolvedProjectId,
        });
      }

      console.info("[handler] plan", {
        tier: requestTier,
        url: "/api/pdf/tender/plan",
      });
      const PDF_ENTRY_URL = "/api/pdf/tender/plan";
      const res = await fetch(PDF_ENTRY_URL, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          projectId: resolvedProjectId,
          planId,
          tier: requestTier,
          mode: requestTier,
          docType: "plan",
        }),
      });
      if (!res.ok) {
        const { rawText, json } = await safeReadJsonOrText(res);
        throw new Error(
          resolveDownloadErrorMessage(
            requestTier,
            res.status,
            json,
            rawText,
            `plan download failed: ${res.status}`,
          ),
        );
      }

      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/pdf")) {
        const raw = await res.text();
        throw new Error(
          raw?.trim()
            ? `计划书接口返回非 PDF（Content-Type: ${ct || "缺失"}）：${raw.slice(0, 500)}`
            : `计划书接口返回非 PDF（Content-Type: ${ct || "缺失"}）`,
        );
      }

      const blob = await res.blob();
      triggerEnterpriseBlobDownload(blob, "plan.pdf");
      trackEvent("download_success", { planId, mode: "plan" });
      logDownloadSuccess({ mode: "plan", tier: requestTier, planId, projectId: resolvedProjectId });
      setPageOpOutcome("success");
      setPageLastError(null);
      setPageOpLabel("计划书 PDF");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownloadError({ mode: "plan", tier: requestTier, planId, message: msg });
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载计划书 PDF");
    } finally {
      setPdfDownloadBusy(false);
    }
  }, [
    planId,
    projectId,
    ensureProjectId,
    resolveDownloadErrorMessage,
    buildCommercialPdfFetchHeaders,
    getPaidDownloadLicenseSnapshot,
  ]);

  const handleDownloadBudgetPdf = useCallback(
    async (
      forcedTier?: CommercialPlanLevel,
      downloadOpts?: PaidPdfDownloadOpts,
    ) => {
    const requestTier = forcedTier ?? commercialPlanForAnalyticsRef.current;
    if (
      (requestTier === "pro" || requestTier === "enterprise") &&
      !downloadOpts?.afterPurchaseGate
    ) {
      console.warn("[purchase-flow] blocked-direct-download", {
        tier: requestTier,
        doc: "budget",
      });
      setPageLastError(
        "付费版下载需先完成订单支付流程，请使用页面上的「开通 / 下载」按钮。",
      );
      setPageOpOutcome("error");
      setPageOpLabel("下载预算书 PDF");
      return;
    }
    const realProjectId = await ensureProjectId({
      allowTenderGenerate: downloadOpts?.allowTenderGenerate !== false,
    });
    if (isBlockedPaidDownloadProjectId(realProjectId, planId)) {
      console.info("[projectId-missing]", { phase: "download-budget-pdf" });
      const msg =
        "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。";
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载预算书 PDF");
      return;
    }

    const resolvedBudgetProjectId = realProjectId as string;

    trackEvent("click_download_pdf", {
      planId,
      planLevel: commercialPlanForAnalyticsRef.current,
      docType: "budget",
    });

    try {
      setPdfDownloadBusy(true);
      setPageOpLabel("正在生成预算书 PDF...");
      setPageOpOutcome("idle");
      let licenseSnapshot:
        | { licenseKey: string; fingerprint: string; planId: string }
        | undefined;
      if (requestTier === "pro" || requestTier === "enterprise") {
        const snap = getPaidDownloadLicenseSnapshot(requestTier);
        licenseSnapshot = snap ?? undefined;
        setPageOpLabel("正在生成预算书 PDF...");
      }
      const headers = buildCommercialPdfFetchHeaders({
        docMode: "budget",
        tier: requestTier,
        projectId: resolvedBudgetProjectId,
        licenseSnapshot,
      });

      if (requestTier === "pro" || requestTier === "enterprise") {
        console.info("[purchase-flow] download-allowed", {
          docType: "budget",
          tier: requestTier,
          projectId: resolvedBudgetProjectId,
        });
      }

      console.log("[download] budget-triggered", {
        tier: requestTier,
        url: "/api/pdf/tender/budget",
      });
      const PDF_ENTRY_URL = "/api/pdf/tender/budget";
      const res = await fetch(PDF_ENTRY_URL, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          projectId: resolvedBudgetProjectId,
          planId,
          tier: requestTier,
          mode: requestTier,
          docType: "budget",
        }),
      });
      if (!res.ok) {
        const { rawText, json } = await safeReadJsonOrText(res);
        throw new Error(
          resolveDownloadErrorMessage(
            requestTier,
            res.status,
            json,
            rawText,
            `budget download failed: ${res.status}`,
          ),
        );
      }

      const blob = await res.blob();
      triggerEnterpriseBlobDownload(blob, "budget.pdf");
      trackEvent("download_success", { planId, mode: "budget" });
      logDownloadSuccess({
        mode: "budget",
        tier: requestTier,
        planId,
        projectId: resolvedBudgetProjectId,
      });
      setPageOpOutcome("success");
      setPageLastError(null);
      setPageOpLabel("预算书 PDF");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownloadError({ mode: "budget", tier: requestTier, planId, message: msg });
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载预算书 PDF");
    } finally {
      setPdfDownloadBusy(false);
    }
  }, [
    planId,
    projectId,
    ensureProjectId,
    resolveDownloadErrorMessage,
    buildCommercialPdfFetchHeaders,
    getPaidDownloadLicenseSnapshot,
  ]);

  /** Pro：仅支付（不下载）；下载请点「下载计划书」手动触发 */
  const handleProPlanPurchaseFlow = useCallback(async () => {
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "pro-plan-download" });
      return;
    }
    console.info("[purchase-flow] click", { tier: "pro", product: "plan-pdf" });
    setCheckoutBusyTier("pro");
    try {
      setPageOpLabel("正在处理支付...");
      setPageOpOutcome("idle");
      await runPayPurchaseOnly("pro");
      setPageOpOutcome("success");
      setPageLastError(null);
      setPageOpLabel("支付完成，请点击「下载计划书」获取文件");
    } catch (e) {
      if (e instanceof CheckoutRedirectError) return;
      const msg = e instanceof Error ? e.message : String(e);
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("开通 Pro");
    } finally {
      setCheckoutBusyTier(null);
    }
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    runPayPurchaseOnly,
  ]);

  /**
   * Pro 计划书：无有效授权时先完整 purchase flow，再请求 plan（不在按钮层直连 fetch）。
   */
  const handleProPlanDownloadWithPurchase = useCallback(async () => {
    console.log("[handler] plan purchase flow start");
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "pro-plan-with-purchase" });
      return;
    }
    /** 仅服务端 entitlement 可跳过支付；本地 snapshot 单独为真仍会 403，不得绕过 purchase */
    const serverPaidPro =
      entitlement?.proEnabled === true ||
      entitlement?.effectiveLevel === "pro" ||
      entitlement?.effectiveLevel === "enterprise";
    if (!serverPaidPro) {
      console.info("[purchase-flow] click", {
        tier: "pro",
        product: "plan-pdf",
        withPurchase: true,
      });
      setCheckoutBusyTier("pro");
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly("pro");
        setPageOpOutcome("success");
        setPageLastError(null);
      } catch (e) {
        if (e instanceof CheckoutRedirectError) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("下载计划书 PDF");
        return;
      } finally {
        setCheckoutBusyTier(null);
      }
    }
    if (!ensurePaidEntitlementReady("pro", "下载计划书 PDF")) return;
    console.info("[download] manual-triggered", {
      tier: "pro",
      product: "plan-pdf",
      via: "with-purchase",
    });
    await handleDownloadPlanPdf("pro", {
      allowTenderGenerate: false,
      afterPurchaseGate: true,
    });
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    entitlement,
    runPayPurchaseOnly,
    ensurePaidEntitlementReady,
    handleDownloadPlanPdf,
  ]);

  /**
   * Pro 预算书：无有效授权时先完整 purchase flow，再请求 budget（不在按钮层直连 fetch）。
   */
  const handleProBudgetDownloadWithPurchase = useCallback(async () => {
    console.log("[handler] pro-budget-purchase", { step: "entry" });
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "pro-budget-with-purchase" });
      return;
    }
    const serverPaidPro =
      entitlement?.proEnabled === true ||
      entitlement?.effectiveLevel === "pro" ||
      entitlement?.effectiveLevel === "enterprise";
    if (!serverPaidPro) {
      console.log("[handler] pro-budget-purchase", { step: "begin-pay" });
      console.info("[purchase-flow] click", {
        tier: "pro",
        product: "budget-pdf",
        withPurchase: true,
      });
      setCheckoutBusyTier("pro");
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly("pro");
        setPageOpOutcome("success");
        setPageLastError(null);
      } catch (e) {
        if (e instanceof CheckoutRedirectError) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("下载预算书 PDF");
        return;
      } finally {
        setCheckoutBusyTier(null);
      }
    }
    if (!ensurePaidEntitlementReady("pro", "下载预算书 PDF")) return;
    console.info("[download] manual-triggered", {
      tier: "pro",
      product: "budget-pdf",
      via: "with-purchase",
    });
    await handleDownloadBudgetPdf("pro", {
      allowTenderGenerate: false,
      afterPurchaseGate: true,
    });
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    entitlement,
    runPayPurchaseOnly,
    ensurePaidEntitlementReady,
    handleDownloadBudgetPdf,
  ]);

  const handleDownloadEnterprisePackZip = useCallback(
    async (
      forcedTier?: CommercialPlanLevel,
      downloadOpts?: PaidPdfDownloadOpts,
    ) => {
    const requestTier: CommercialPlanLevel = forcedTier ?? "enterprise";
    if (
      (requestTier === "pro" || requestTier === "enterprise") &&
      !downloadOpts?.afterPurchaseGate
    ) {
      console.warn("[purchase-flow] blocked-direct-download", {
        tier: requestTier,
        doc: "zip",
      });
      setPageLastError(
        "付费版下载需先完成订单支付流程，请使用页面上的「开通 / 下载」按钮。",
      );
      setPageOpOutcome("error");
      setPageOpLabel("下载完整投标包（ZIP）");
      return;
    }
    const realProjectId = await ensureProjectId({ allowTenderGenerate: false });
    if (isBlockedPaidDownloadProjectId(realProjectId, planId)) {
      console.info("[projectId-missing]", { phase: "download-enterprise-zip" });
      const msg =
        "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。";
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载完整投标包（ZIP）");
      return;
    }

    const resolvedZipProjectId = realProjectId as string;

    trackEvent("click_download_zip", {
      planId,
      planLevel: commercialPlanForAnalyticsRef.current,
      docType: "enterprise-pack",
    });

    try {
      setZipDownloadBusy(true);
      setPageOpLabel("正在打包完整投标文件（ZIP）...");
      setPageOpOutcome("idle");

      let licenseSnapshot:
        | { licenseKey: string; fingerprint: string; planId: string }
        | undefined;
      if (requestTier === "pro" || requestTier === "enterprise") {
        const snap = getPaidDownloadLicenseSnapshot(requestTier);
        licenseSnapshot = snap ?? undefined;
        setPageOpLabel("正在打包完整投标文件（ZIP）...");
      }

      const headers = buildCommercialPdfFetchHeaders({
        docMode: "zip",
        tier: requestTier,
        projectId: resolvedZipProjectId,
        licenseSnapshot,
      });
      headers["x-paid"] = "true";

      if (requestTier === "pro" || requestTier === "enterprise") {
        console.info("[purchase-flow] download-allowed", {
          docType: "zip",
          tier: requestTier,
          projectId: resolvedZipProjectId,
          entitlementLevel,
          zipEnabled,
        });
      }

      console.info("[handler] zip", {
        tier: requestTier,
        url: "/api/pdf/tender/zip",
      });
      const PDF_ENTRY_URL = "/api/pdf/tender/zip";
      const res = await fetch(PDF_ENTRY_URL, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          projectId: resolvedZipProjectId,
          planId,
          tier: requestTier,
          mode: requestTier,
          docType: "zip",
        }),
      });
      if (!res.ok) {
        const { rawText, json } = await safeReadJsonOrText(res);
        throw new Error(
          resolveDownloadErrorMessage(
            requestTier,
            res.status,
            json,
            rawText,
            `zip download failed: ${res.status}`,
          ),
        );
      }

      const blob = await res.blob();
      triggerEnterpriseBlobDownload(blob, "enterprise-pack.zip");
      trackEvent("download_success", { planId, mode: "zip-pack" });
      setZipDownloadFlash(true);
      setPageOpOutcome("success");
      setPageLastError(null);
      setPageOpLabel("完整投标包 ZIP");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载完整投标包（ZIP）");
    } finally {
      setZipDownloadBusy(false);
    }
  },
  [
    planId,
    ensureProjectId,
    resolveDownloadErrorMessage,
    buildCommercialPdfFetchHeaders,
    getPaidDownloadLicenseSnapshot,
    entitlementLevel,
    zipEnabled,
  ],
);

  const handleDownloadZip = useCallback(async () => {
    if (!planId) return;

    if (
      process.env.NODE_ENV === "development" &&
      devForceFreeMode &&
      !devForceFreeDownloadBypassRef.current
    ) {
      trackEvent("open_upgrade_modal", {
        planId,
        planLevel: "free",
        reason: "dev_force_free",
      });
      setUpgradeModalEntryMode("upgrade");
      setUpgradeModalOpen(true);
      return;
    }

    const proceed = await beforeEnterpriseZipDownload();
    if (proceed === false) return;

    trackEvent("click_download_zip", {
      planId,
      planLevel: commercialPlanForAnalyticsRef.current,
    });

    try {
      const unlockToken = getStoredEnterpriseUnlockToken(planId);

      if (!unlockToken) {
        setPendingDownloadKind("enterprise-zip");
        setPendingDownloadMode("pack");
        setEnterpriseLeadEmail("");
        setShowEnterpriseLeadForm(true);
        return;
      }

      // 第 4 刀：每次点击都必须重新请求一次性 downloadToken，不缓存
      let downloadToken: string;
      try {
        downloadToken = await requestEnterpriseDownloadToken({
          planId,
          mode: "pack",
          unlockToken,
        });
      } catch (err) {
        console.warn(
          "[unlockToken] stored token invalid on zip download, fallback to email verify",
          err
        );
        clearStoredEnterpriseUnlockToken(planId);
        setPendingDownloadKind("enterprise-zip");
        setPendingDownloadMode("pack");
        setEnterpriseLeadEmail("");
        setShowEnterpriseLeadForm(true);
        return;
      }

      setZipDownloadBusy(true);
      setPageOpLabel("正在生成投标文件，请稍候…");
      setPageOpOutcome("idle");

      try {
        // 每次点击都重新拼 URL，带上新鲜的 downloadToken。不做任何缓存。
        const apiUrl = new URL("/api/tender-pack", window.location.origin);
        apiUrl.searchParams.set("planId", planId);
        apiUrl.searchParams.set("format", "zip");
        apiUrl.searchParams.set("level", "enterprise");
        apiUrl.searchParams.set("theme", "brand");
        apiUrl.searchParams.set("variant", "enterprise");
        apiUrl.searchParams.set("includeCover", "1");
        apiUrl.searchParams.set("downloadToken", downloadToken);
        apiUrl.searchParams.set("forceAllow", "1");

        const res = await fetch(apiUrl.toString(), {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "x-force-allow": "1",
          },
          body: JSON.stringify({
            rawText: tenderRawText,
            sourceName: tenderFileName,
            technicalRows,
            businessRows,
          }),
        });

        if (!res.ok) {
          const { rawText: errText, json: errJson } =
            await safeReadJsonOrText(res);
          if (
            res.status === 409 &&
            errJson?.code === PACK_RISK_BLOCK_CODE &&
            errJson?.gate
          ) {
            handlePackRiskBlocked(toPanelGate(errJson.gate));
            return;
          }

          throw new Error(
            errJson?.message ||
              errJson?.code ||
              errText ||
              `zip failed: ${res.status}`
          );
        }

        const blob = await res.blob();
        triggerEnterpriseBlobDownload(blob, enterpriseZipFilename(planId));
        trackEvent("download_success", { planId, mode: "pack" });
        logDownloadSuccess({ mode: "zip-pack", tier: commercialPlanForAnalyticsRef.current, planId });
        setZipDownloadFlash(true);
        setPageOpOutcome("success");
        setPageLastError(null);
        setPageOpLabel("ZIP 打包");
      } finally {
        setZipDownloadBusy(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logDownloadError({ mode: "zip-pack", planId, message: msg });
      setPageLastError(msg);
      setPageOpOutcome("error");
      setPageOpLabel("下载 ZIP");
    }
  }, [
    planId,
    tenderRawText,
    tenderFileName,
    technicalRows,
    businessRows,
    beforeEnterpriseZipDownload,
    handlePackRiskBlocked,
    devForceFreeMode,
  ]);

  const dismissDownloadGate = useCallback(() => {
    pendingDownloadKindRef.current = null;
    setPendingDownloadKind(null);
    setPendingDownloadMode(null);
    setActiveRiskId(null);
    setFixingRiskId(null);
    resolveTenderPackGate(false);
  }, [resolveTenderPackGate]);

  const handleJumpToRisk = useCallback(
    (risk: BidRiskItem) => {
      if (!risk.target) return;

      pendingDownloadKindRef.current = null;
      setPendingDownloadKind(null);
      setPendingDownloadMode(null);
      resolveTenderPackGate(false);
      setShowDownloadGate(false);

      window.setTimeout(() => {
        jumpToRiskTarget(risk.target);
      }, 120);
    },
    [resolveTenderPackGate]
  );

  const handleAutoFixRisk = useCallback(
    async (risk: BidRiskItem) => {
      try {
        setFixingRiskId(risk.id);
  
        const response = await fetch("/api/tender/risk-fix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-force-allow": "1",   // ✅ 同样加
          },
          body: JSON.stringify({
            planId,
            riskId: risk.id,
            technicalRows,
            businessRows,
          }),
        });
  
        const res = await response.json().catch(() => null);
  
        if (res?.ok) {
          const nextTechnicalRows = Array.isArray(res.technicalRows)
            ? (res.technicalRows as TenderRiskRow[])
            : [];
  
          const nextBusinessRows = Array.isArray(res.businessRows)
            ? (res.businessRows as TenderRiskRow[])
            : [];
  
          setRiskFixResults((prev) => ({
            ...prev,
            [risk.id]: res,
          }));
  
          setTechnicalRows(nextTechnicalRows);
          setBusinessRows(nextBusinessRows);
  
          await refreshTenderDecisionState({
            technicalRows: nextTechnicalRows,
            businessRows: nextBusinessRows,
            rawText: tenderRawText,
          });

        } else {
          setRiskFixResults((prev) => ({
            ...prev,
            [risk.id]: res?.message || "补强失败，请稍后重试。",
          }));
        }
      } catch (error) {
        console.error("[risk-fix] failed", error);
        setRiskFixResults((prev) => ({
          ...prev,
          [risk.id]: "补强失败，请稍后重试。",
        }));
      } finally {
        setFixingRiskId(null);
      }
    },
    [planId, technicalRows, businessRows, refreshTenderDecisionState]
  );

  const handleTenderFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTenderFile(true);

      const lowerName = file.name.toLowerCase();
      setTenderFileName(file.name);

      if (
        lowerName.endsWith(".txt") ||
        lowerName.endsWith(".md") ||
        lowerName.endsWith(".csv")
      ) {
        const text = await file.text();
        setTenderRawText(text);
        return;
      }

      if (lowerName.endsWith(".pdf") || lowerName.endsWith(".docx")) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/tender/intake", {
          method: "POST",
          body: formData,
        });

        const { json, rawText } = await safeReadJsonOrText(res);

        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.message ||
              json?.code ||
              rawText ||
              `intake failed: ${res.status}`,
          );
        }

        setTenderRawText(String(json?.rawText || ""));
        setTenderFileName(String(json?.sourceName || file.name));
        setTenderIntelligence(null);
        setTenderAnalyzeError(null);
        setTenderSemantic(null);
        setTenderSemanticError(null);
        setTenderCompose(null);
        setTenderComposeError(null);
        setTenderSku(null);
        setTenderSkuError(null);
        setTenderCompliance(null);
        setTenderComplianceError(null);
        return;
      }

      throw new Error("暂不支持该文件类型，请上传 txt / pdf / docx");
    } catch (err: any) {
      console.error(
        "[handleTenderFileChange] failed",
        err?.message || "文件上传失败，请稍后重试",
        err
      );
    } finally {
      setUploadingTenderFile(false);
      e.target.value = "";
    }
  };

  const runTenderIntelligenceAnalyze = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw && !tenderFileName) {
      setTenderAnalyzeError("请先上传或粘贴招标文件");
      return;
    }
    setTenderAnalyzeLoading(true);
    setTenderAnalyzeError(null);
    try {
      const res = await fetch("/api/tender/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: raw,
          sourceName: tenderFileName || undefined,
        }),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `analyze: ${res.status}`,
        );
      }
      setTenderIntelligence({
        metadata: json.metadata || {},
        requirements: json.requirements || [],
        counts: json.counts || {
          total: 0,
          technical: 0,
          commercial: 0,
          qualification: 0,
          scoring: 0,
          attachment: 0,
        },
        sourceName: json.sourceName,
        rawTextLength: json.rawTextLength,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "分析失败";
      setTenderAnalyzeError(msg);
      setTenderIntelligence(null);
    } finally {
      setTenderAnalyzeLoading(false);
    }
  }, [tenderRawText, tenderFileName]);

  const runTenderSemanticAnalyze = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw) {
      setTenderSemanticError("请先上传或粘贴招标文件");
      return;
    }
    setTenderSemanticLoading(true);
    setTenderSemanticError(null);
    try {
      const res = await fetch("/api/tender/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: raw,
          sourceName: tenderFileName || undefined,
        }),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `semantic: ${res.status}`,
        );
      }
      setTenderSemantic({
        graph: json.graph,
        overview: json.overview,
        sourceName: json.sourceName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "语义分析失败";
      setTenderSemanticError(msg);
      setTenderSemantic(null);
    } finally {
      setTenderSemanticLoading(false);
    }
  }, [tenderRawText, tenderFileName]);

  const runTenderCompose = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw) {
      setTenderComposeError("请先上传或粘贴招标文件");
      return;
    }
    setTenderComposeLoading(true);
    setTenderComposeError(null);
    try {
      const body: Record<string, unknown> = {
        rawText: raw,
        sourceName: tenderFileName || undefined,
      };
      if (tenderSemantic?.graph) {
        body.graph = tenderSemantic.graph;
      }
      if (tenderSku?.skuResult) {
        body.skuResult = tenderSku.skuResult;
      }
      if (tenderCompliance?.compliance) {
        body.compliance = tenderCompliance.compliance;
      }
      const res = await fetch("/api/tender/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `response: ${res.status}`,
        );
      }
      setTenderCompose({
        responses: json.responses,
        sourceName: json.sourceName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "响应生成失败";
      setTenderComposeError(msg);
      setTenderCompose(null);
    } finally {
      setTenderComposeLoading(false);
    }
  }, [
    tenderRawText,
    tenderFileName,
    tenderSemantic?.graph,
    tenderSku?.skuResult,
    tenderCompliance?.compliance,
  ]);

  const runTenderComplianceAnalyze = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw) {
      setTenderComplianceError("请先上传或粘贴招标文件");
      return;
    }
    setTenderComplianceLoading(true);
    setTenderComplianceError(null);
    try {
      const body: Record<string, unknown> = {
        rawText: raw,
        sourceName: tenderFileName || undefined,
      };
      if (tenderSemantic?.graph) body.graph = tenderSemantic.graph;
      if (tenderSku?.skuResult) body.skuResult = tenderSku.skuResult;
      const res = await fetch("/api/tender/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `compliance: ${res.status}`,
        );
      }
      setTenderCompliance({
        compliance: json.compliance,
        sourceName: json.sourceName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "符合性分析失败";
      setTenderComplianceError(msg);
      setTenderCompliance(null);
    } finally {
      setTenderComplianceLoading(false);
    }
  }, [tenderRawText, tenderFileName, tenderSemantic?.graph, tenderSku?.skuResult]);

  const runExecutiveVisualizationDashboard = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw) {
      setExecutiveVisualizationError("请先上传或粘贴招标文件");
      return;
    }
    setExecutiveVisualizationLoading(true);
    setExecutiveVisualizationError(null);
    try {
      const res = await fetch("/api/evidence/visualization/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: raw,
          fileName: tenderFileName || "tender.txt",
          tenderTitle: "Result Page Dashboard",
        }),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `visualization: ${res.status}`,
        );
      }
      setExecutiveVisualization(json.visualization);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Runtime 看板加载失败";
      setExecutiveVisualizationError(msg);
      setExecutiveVisualization(null);
    } finally {
      setExecutiveVisualizationLoading(false);
    }
  }, [tenderRawText, tenderFileName]);

  const runTenderSkuAnalyze = useCallback(async () => {
    const raw = tenderRawText.trim();
    if (!raw) {
      setTenderSkuError("请先上传或粘贴招标文件");
      return;
    }
    setTenderSkuLoading(true);
    setTenderSkuError(null);
    try {
      const body: Record<string, unknown> = {
        rawText: raw,
        sourceName: tenderFileName || undefined,
      };
      if (tenderSemantic?.graph) {
        body.graph = tenderSemantic.graph;
      }
      const res = await fetch("/api/tender/sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { json, rawText: errText } = await safeReadJsonOrText(res);
      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.message || json?.code || errText || `sku: ${res.status}`,
        );
      }
      setTenderSku({
        skuResult: json.skuResult,
        requirements:
          tenderSemantic?.graph?.requirements || json.requirements,
        sourceName: json.sourceName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SKU 匹配失败";
      setTenderSkuError(msg);
      setTenderSku(null);
    } finally {
      setTenderSkuLoading(false);
    }
  }, [tenderRawText, tenderFileName, tenderSemantic?.graph]);

  const companySizeTier = useMemo(() => headcountToSizeTier(headcount), [headcount]);
  const participationRate = useMemo(
    () => intensityToParticipation(usageIntensity),
    [usageIntensity]
  );

  const peakUsers = useMemo(() => {
    const v = Math.round((headcount || 0) * participationRate);
    return Math.max(0, v);
  }, [headcount, participationRate]);

  // 与 SSR 首帧一致：挂载前不读 URL，避免 canUseEnterprise / radio 等与服务器 HTML 不一致导致 hydration mismatch
  const mode: Mode = mounted ? modeFromUrl : "client";
  const userPlan: UserPlan = mounted ? userPlanFromUrl : "free";
  const isProductionPrimaryFlow = process.env.NODE_ENV === "production";

  const effectiveCommercialPlan =
    process.env.NODE_ENV === "development" && devForceFreeMode
      ? ("free" as CommercialPlanLevel)
      : getEffectiveCommercialPlanLevel(planId, userPlan);
  const commercialPlanMerged =
    process.env.NODE_ENV === "development" && devForceFreeMode
      ? ("free" as CommercialPlanLevel)
      : process.env.NODE_ENV === "development" && devAuthTierOverride !== null
        ? devAuthTierOverride
        : effectiveCommercialPlan;

  const apiCommercialPlanFromSnapshot = useMemo((): CommercialPlanLevel => {
    if (!entitlement) return "free";
    if (entitlement.effectiveLevel === "enterprise") return "enterprise";
    if (entitlement.effectiveLevel === "pro") return "pro";
    return "free";
  }, [entitlement]);

  const commercialPlan =
    process.env.NODE_ENV === "development" && devForceFreeMode
      ? ("free" as CommercialPlanLevel)
      : maxCommercialPlan(
          maxCommercialPlan(commercialPlanMerged, entitlementLevel),
          apiCommercialPlanFromSnapshot,
        );

  commercialPlanForAnalyticsRef.current = commercialPlan;

  /**
   * 开发专用：create-order → webhook 模拟履约并发证，与真实购买共用同一 API；
   * 正式收银接入后仅替换中间支付层，勿在本函数混入真实结算逻辑。
   */
  const runDevSimulatePayWebhookPersist = useCallback(async () => {
    if (!showDevLicensePanel) return;
    const targetLevel: "pro" | "enterprise" =
      commercialPlan === "enterprise" ? "enterprise" : "pro";
    setPaySimBusy(true);
    try {
      const realProjectId = await ensureProjectId({
        allowTenderGenerate: false,
      });
      if (isBlockedPaidDownloadProjectId(realProjectId, planId)) {
        setPageLastError(
          "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。",
        );
        return;
      }
      const { licenseKey } = await executePayPurchaseAndIssueLicense({
        planId,
        targetLevel,
        amountCents: upgradeAmountForLevel(targetLevel),
        projectId: realProjectId as string,
      });
      applyWebhookLicensePersist(licenseKey);
      void refreshEntitlements();
    } catch (e) {
      if (e instanceof CheckoutRedirectError) return;
      const msg = e instanceof Error ? e.message : "模拟支付失败";
      setPageLastError(msg);
      console.error("[simulate-pay-webhook-error]", e);
    } finally {
      setPaySimBusy(false);
    }
  }, [
    commercialPlan,
    planId,
    applyWebhookLicensePersist,
    showDevLicensePanel,
    refreshEntitlements,
    ensureProjectId,
  ]);

  const enterprisePdfButtonLabel = useMemo(() => {
    if (commercialPlan === "free") return "解锁后下载 PDF";
    if (pdfDownloadFlash) return "下载已开始";
    if (pdfDownloadBusy) return "正在生成投标包 PDF...";
    if (!canProceedWithPaidDownloads) return "先处理风险后下载招标包 PDF";
    return "下载招标包 PDF";
  }, [
    commercialPlan,
    pdfDownloadFlash,
    pdfDownloadBusy,
    canProceedWithPaidDownloads,
  ]);

  const enterpriseZipButtonLabel = useMemo(() => {
    if (commercialPlan === "free") return "升级企业版下载 ZIP";
    if (commercialPlan === "pro") return "企业版可用";
    if (zipDownloadFlash) return "下载已开始";
    if (zipDownloadBusy) return "正在生成 ZIP...";
    if (!canProceedWithPaidDownloads) return "先处理风险后下载 ZIP";
    return "下载 ZIP";
  }, [
    commercialPlan,
    zipDownloadFlash,
    zipDownloadBusy,
    canProceedWithPaidDownloads,
  ]);

  /** 开发：清空本机授权与登录会话，回到未授权态以便重测 purchase flow；不触发任何下载 */
  const handleDevResetEnterpriseAuth = useCallback(() => {
    void (async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // ignore
      }
      clearPersistedLicenseForm();
      clearAllEnterpriseUnlockStorage();
      clearStoredEnterpriseUnlockToken(planId);
      try {
        sessionStorage.removeItem("__result_dev_force_free");
      } catch {
        // ignore
      }
      setDevForceFreeMode(false);
      setLicenseForm({
        licenseKey: "",
        fingerprint: "",
        planId: planId || "attaguy-plan",
      });
      setLicenseSaveMessage(null);
      setDevAuthTierOverride("free");
      setPendingDownloadKind(null);
      setPendingDownloadMode(null);
      pendingDownloadKindRef.current = null;
      setUpgradeModalOpen(false);
      setPageLastError(null);
      await refreshEntitlements();
      console.info("[auth-reset] local-commercial-auth-cleared");
    })();
  }, [
    planId,
    setLicenseForm,
    setLicenseSaveMessage,
    refreshEntitlements,
  ]);

  /** Enterprise ZIP：无 enterprise 授权时先 purchase flow，再 zip。 */
  const handleEnterpriseZipDownloadWithPurchase = useCallback(async () => {
    console.log("[handler] zip purchase flow start");
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "enterprise-zip-with-purchase" });
      return;
    }
    const serverPaidEnterprise =
      entitlement?.zipEnabled === true ||
      entitlement?.effectiveLevel === "enterprise" ||
      entitlement?.enterpriseEnabled === true;
    if (!serverPaidEnterprise) {
      console.info("[purchase-flow] click", {
        tier: "enterprise",
        product: "zip-pack",
        withPurchase: true,
      });
      setCheckoutBusyTier("enterprise");
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly("enterprise");
        setPageOpOutcome("success");
        setPageLastError(null);
      } catch (e) {
        if (e instanceof CheckoutRedirectError) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("下载完整投标包（ZIP）");
        return;
      } finally {
        setCheckoutBusyTier(null);
      }
    }
    if (!ensurePaidEntitlementReady("enterprise", "下载完整投标包（ZIP）")) return;
    console.info("[download] manual-triggered", {
      tier: "enterprise",
      product: "zip-pack",
      via: "with-purchase",
    });
    await handleDownloadEnterprisePackZip("enterprise", {
      afterPurchaseGate: true,
    });
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    entitlement,
    runPayPurchaseOnly,
    ensurePaidEntitlementReady,
    handleDownloadEnterprisePackZip,
  ]);

  const handleEnterprisePlanDownloadWithPurchase = useCallback(async () => {
    console.log("[handler] enterprise plan purchase flow start");
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "enterprise-plan-with-purchase" });
      return;
    }
    const serverPaidEnterprise =
      entitlement?.zipEnabled === true ||
      entitlement?.effectiveLevel === "enterprise" ||
      entitlement?.enterpriseEnabled === true;
    if (!serverPaidEnterprise) {
      console.info("[purchase-flow] click", {
        tier: "enterprise",
        product: "plan-pdf",
        withPurchase: true,
      });
      setCheckoutBusyTier("enterprise");
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly("enterprise");
        setPageOpOutcome("success");
        setPageLastError(null);
      } catch (e) {
        if (e instanceof CheckoutRedirectError) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("下载计划书 PDF");
        return;
      } finally {
        setCheckoutBusyTier(null);
      }
    }
    if (!ensurePaidEntitlementReady("enterprise", "下载计划书 PDF")) return;
    console.info("[download] manual-triggered", {
      tier: "enterprise",
      product: "plan-pdf",
      via: "with-purchase",
    });
    await handleDownloadPlanPdf("enterprise", {
      allowTenderGenerate: false,
      afterPurchaseGate: true,
    });
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    entitlement,
    runPayPurchaseOnly,
    ensurePaidEntitlementReady,
    handleDownloadPlanPdf,
  ]);

  const handleEnterpriseBudgetDownloadWithPurchase = useCallback(async () => {
    console.log("[handler] enterprise budget purchase flow start");
    if (!canProceedWithPaidDownloads) {
      handleResolveRiskBeforeDownload();
      return;
    }
    if (!hasReadyProjectIdForPaidDownload) {
      console.info("[projectId-missing]", { gate: "enterprise-budget-with-purchase" });
      return;
    }
    const serverPaidEnterprise =
      entitlement?.zipEnabled === true ||
      entitlement?.effectiveLevel === "enterprise" ||
      entitlement?.enterpriseEnabled === true;
    if (!serverPaidEnterprise) {
      console.info("[purchase-flow] click", {
        tier: "enterprise",
        product: "budget-pdf",
        withPurchase: true,
      });
      setCheckoutBusyTier("enterprise");
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly("enterprise");
        setPageOpOutcome("success");
        setPageLastError(null);
      } catch (e) {
        if (e instanceof CheckoutRedirectError) return;
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("下载预算书 PDF");
        return;
      } finally {
        setCheckoutBusyTier(null);
      }
    }
    if (!ensurePaidEntitlementReady("enterprise", "下载预算书 PDF")) return;
    console.info("[download] manual-triggered", {
      tier: "enterprise",
      product: "budget-pdf",
      via: "with-purchase",
    });
    await handleDownloadBudgetPdf("enterprise", {
      allowTenderGenerate: false,
      afterPurchaseGate: true,
    });
  }, [
    canProceedWithPaidDownloads,
    handleResolveRiskBeforeDownload,
    hasReadyProjectIdForPaidDownload,
    entitlement,
    runPayPurchaseOnly,
    ensurePaidEntitlementReady,
    handleDownloadBudgetPdf,
  ]);

  const handleEnterpriseVerifyAndDownload = useCallback(async () => {
    const email =
      enterpriseLeadDraft?.email?.trim() || enterpriseLeadEmail.trim();
    if (!email) {
      alert("缺少企业邮箱信息，请重新填写。");
      return;
    }

    if (!enterpriseVerifyCode.trim()) {
      alert("请输入验证码。");
      return;
    }

    console.info("[purchase-flow] enterprise-verify-submit", { email });
    setEnterpriseVerifySubmitting(true);
    try {
      const verifyRes = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: enterpriseVerifyCode.trim(),
          mode: pendingDownloadMode === "pack" ? "pack" : "full",
          planId,
          planLevel: commercialPlanFromUserPlan(userPlanFromUrl),
        }),
      });

      const verifyData = await verifyRes.json().catch(() => null);

      if (!verifyRes.ok || !verifyData?.ok) {
        throw new Error(
          verifyData?.message || verifyData?.error || "验证码校验失败",
        );
      }

      const unlockToken = String(verifyData?.unlockToken || "").trim();

      if (!unlockToken) {
        throw new Error("验证成功，但未返回企业下载解锁凭证。");
      }

      const verifiedLevelRaw = verifyData?.planLevel;
      const verifiedCommercialPlan: CommercialPlanLevel =
        verifiedLevelRaw === "free" ||
        verifiedLevelRaw === "pro" ||
        verifiedLevelRaw === "enterprise"
          ? verifiedLevelRaw
          : commercialPlanFromUserPlan(userPlanFromUrl);

      storeEnterpriseUnlockToken(planId, unlockToken, verifiedCommercialPlan);
      setDevAuthTierOverride(null);

      setShowEnterpriseVerifyDialog(false);

      devForceFreeDownloadBypassRef.current = true;
      try {
        const ensurePaidByOrder = async (level: "pro" | "enterprise") => {
          await runPayPurchaseOnly(level);
        };

        if (pendingDownloadKind === "enterprise-zip") {
          await ensurePaidByOrder("enterprise");
          await handleEnterpriseZipDownloadWithPurchase();
        } else if (pendingDownloadKind === "budget-pdf") {
          if (verifiedCommercialPlan === "enterprise") {
            await ensurePaidByOrder("enterprise");
            await handleEnterpriseBudgetDownloadWithPurchase();
          } else if (verifiedCommercialPlan === "pro") {
            await ensurePaidByOrder("pro");
            await handleProBudgetDownloadWithPurchase();
          } else {
            await ensurePaidByOrder("pro");
            await handleProBudgetDownloadWithPurchase();
          }
        } else {
          if (verifiedCommercialPlan === "enterprise") {
            await ensurePaidByOrder("enterprise");
            await handleEnterprisePlanDownloadWithPurchase();
          } else if (verifiedCommercialPlan === "pro") {
            await ensurePaidByOrder("pro");
            await handleProPlanDownloadWithPurchase();
          } else {
            await ensurePaidByOrder("pro");
            await handleProPlanDownloadWithPurchase();
          }
        }
      } finally {
        devForceFreeDownloadBypassRef.current = false;
      }

      setPendingDownloadKind(null);
      setPendingDownloadMode(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "验证失败，请稍后重试。");
    } finally {
      setEnterpriseVerifySubmitting(false);
    }
  }, [
    enterpriseLeadDraft,
    enterpriseLeadEmail,
    enterpriseVerifyCode,
    pendingDownloadKind,
    pendingDownloadMode,
    planId,
    userPlanFromUrl,
    handleProPlanDownloadWithPurchase,
    handleProBudgetDownloadWithPurchase,
    handleEnterprisePlanDownloadWithPurchase,
    handleEnterpriseBudgetDownloadWithPurchase,
    handleEnterpriseZipDownloadWithPurchase,
    runPayPurchaseOnly,
  ]);

  /** 升级弹窗：仅走真实收银（create-order → start-payment → webhook），不触发下载 */
  const handleUpgradeModalStartPaidPurchase = useCallback(
    async (target: "pro" | "enterprise") => {
      if (!canProceedWithPaidDownloads) {
        handleResolveRiskBeforeDownload();
        return;
      }
      if (!hasReadyProjectIdForPaidDownload) {
        console.info("[projectId-missing]", { gate: "upgrade-modal-purchase" });
        throw new Error(
          "缺少 projectId：请从生成结果页进入（链接需含 projectId），或先在流程中生成项目。",
        );
      }
      console.info("[purchase-flow] click", {
        tier: target,
        source: "upgrade_modal",
      });
      setCheckoutBusyTier(target);
      try {
        setPageOpLabel("正在处理支付...");
        setPageOpOutcome("idle");
        await runPayPurchaseOnly(target);
        setPageOpOutcome("success");
        setPageLastError(null);
        setPageOpLabel("支付完成，请在弹窗内点击「立即下载」获取文件");
      } catch (e) {
        if (e instanceof CheckoutRedirectError) {
          throw e;
        }
        const msg = e instanceof Error ? e.message : String(e);
        setPageLastError(msg);
        setPageOpOutcome("error");
        setPageOpLabel("支付");
        throw e;
      } finally {
        setCheckoutBusyTier(null);
      }
    },
    [
      canProceedWithPaidDownloads,
      handleResolveRiskBeforeDownload,
      hasReadyProjectIdForPaidDownload,
      runPayPurchaseOnly,
    ],
  );

  const handleUpgradeModalManualDownloadPdf = useCallback(
    async (tier: "pro" | "enterprise") => {
      setPendingDownloadKind("plan-pdf");
      setPendingDownloadMode("full");
      devForceFreeDownloadBypassRef.current = true;
      try {
        if (tier === "enterprise") {
          await handleEnterprisePlanDownloadWithPurchase();
        } else {
          await handleProPlanDownloadWithPurchase();
        }
      } finally {
        devForceFreeDownloadBypassRef.current = false;
      }
    },
    [handleEnterprisePlanDownloadWithPurchase, handleProPlanDownloadWithPurchase],
  );

  const handleUpgradeModalManualDownloadZip = useCallback(async () => {
    setPendingDownloadKind("enterprise-zip");
    setPendingDownloadMode("full");
    devForceFreeDownloadBypassRef.current = true;
    try {
      await handleEnterpriseZipDownloadWithPurchase();
    } finally {
      devForceFreeDownloadBypassRef.current = false;
    }
  }, [handleEnterpriseZipDownloadWithPurchase]);

  const canUseEnterprise = mode === "engine" ? true : userPlan === "pro" || userPlan === "tender";
  const canUseGovernment = mode === "engine" ? true : userPlan === "tender";

  const budgetInspectUrl = useMemo(() => {
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
    if (budgetLevel === "government") params.docSeq = "01";
    return buildUrl("/api/pdf", params);
  }, [
      planId,
      companyName,
    headcount,
      participationRate,
      spaceSqm,
      budgetTier,
      buildType,
    preferSmart,
    preferQuiet,
    sections,
    budgetLevel,
  ]);

  const tenderPackUrl = useMemo(() => {
    const packLevel = budgetLevel === "brand" ? "enterprise" : budgetLevel;

    return buildUrl("/api/tender-pack", {
      planId,
      format: "merged",
      level: packLevel,
      theme: packLevel === "enterprise" ? "tender" : "brand",
      watermark: 0,
      includeCover: 1,
      includeDeclaration: 1,
      packFooter: 1,
      companyName,
      companySize: headcount,
      tz: "Asia/Shanghai",
    });
  }, [planId, budgetLevel, companyName, headcount]);

  /** 无招标正文时可用 GET（含 dev downloadToken）；有正文时为空串，由按钮内 POST/blob 继续 */
  const tenderPackPdfUrl = useMemo(() => {
    if (!planId || tenderRawText.trim()) return "";
    return buildUrl("/api/tender-pack", {
      planId,
      format: "merged",
      level: "enterprise",
      theme: "brand",
      variant: "enterprise",
      includeCover: 1,
    });
  }, [planId, tenderRawText]);

  const tenderPackZipUrl = useMemo(() => {
    if (!planId || tenderRawText.trim()) return "";
    return buildUrl("/api/tender-pack", {
      planId,
      format: "zip",
      level: "enterprise",
      theme: "brand",
      variant: "enterprise",
      includeCover: 1,
    });
  }, [planId, tenderRawText]);

  const handleProceedAfterGate = useCallback(() => {
    pendingDownloadKindRef.current = null;

    if (pendingDownloadKind === "enterprise-zip" && tenderPackZipUrl) {
      resolveTenderPackGate(false);
      window.location.href = tenderPackZipUrl;
    } else {
      resolveTenderPackGate(true);
    }

    setShowDownloadGate(false);
    setPendingDownloadKind(null);
    setPendingDownloadMode(null);
  }, [
    pendingDownloadKind,
    tenderPackZipUrl,
    resolveTenderPackGate,
  ]);

  useEffect(() => {
    if (mode !== "engine") return;

    let cancelled = false;

    async function run() {
      try {
        setBudgetHeadLoading(true);
        setBudgetHeadErr("");

        const res = await fetch(budgetInspectUrl, { method: "HEAD" });

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
  }, [mode, budgetInspectUrl]);

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

  const budgetOk =
    mode === "engine" && !budgetHeadErr && Object.keys(budgetHead || {}).length > 0;
  const packOk =
    mode === "engine" && !tenderPackHeadErr && Object.keys(tenderPackHead || {}).length > 0;

  function getH(h: Record<string, string>, k: string) {
    return (h?.[k] || "").trim();
  }

  const auditSummaryText = useMemo(() => {
    const reqsig = getH(budgetHead, "x-reqsig") || getH(tenderPackHead, "x-reqsig");
    const reqsigShort = reqsig ? reqsig.slice(0, 8).toUpperCase() : "";

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
      `企业: ${companyName}｜人数: ${headcount}｜面积: ${spaceSqm}㎡｜档位: ${String(
        budgetTier
      ).toUpperCase()}｜建设: ${buildType}`,
      "",
      "— 预算 PDF（/api/pdf?mode=budget）—",
      `level: ${bLevel || "(空)"}｜tenderLevel: ${bTenderLevel || "(空)"}｜theme: ${
        bTheme || "(空)"
      }`,
      `pdfVersion: ${bVer || "(空)"}｜engineFP: ${bEngineFp || "(空)"}`,
      `REQSIG: ${reqsig || "(空)"}${reqsigShort ? `（短码 ${reqsigShort}）` : ""}`,
      "",
      "— 招标包（/api/tender-pack?format=merged）—",
      `tenderLevel: ${tenderLevel || "(空)"}｜tenderNo: ${tenderNo || "(空)"}`,
      `tenderPackFP: ${tenderPackFp || "(空)"}`,
      `planVersion: ${planVer}｜budgetVersion: ${budgetVer}`,
      `includeCover: ${includeCover}｜includeDeclaration: ${includeDecl}`,
      `packPagination: ${packPagination}｜packFooter: ${packFooter}｜skipFirst: ${
        packSkip || "(空)"
      }`,
      `budgetSections: ${packSections || "(空)"}`,
      "",
      "— URLs —",
      `Budget: ${budgetInspectUrl}`,
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
    budgetInspectUrl,
    tenderPackUrl,
    budgetHead,
    tenderPackHead,
  ]);

  async function copyAuditSummary() {
    if (!auditSummaryText) return;
    try {
      await navigator.clipboard.writeText(auditSummaryText);
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = auditSummaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
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

  if (!mounted) {
    return null;
  }

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
              （切换：URL 后加 <code className="text-white/70">?mode=engine</code>）
            </span>
          </div>

          {mode === "engine" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
              <span className="font-semibold text-white/80">ENGINE STATUS</span>

              <span
                className={`rounded-full px-3 py-1 ${
                  budgetOk ? "bg-white/10 text-white/80" : "bg-red-500/10 text-red-200/90"
                }`}
              >
                Budget HEAD: {budgetOk ? "OK" : "FAIL"}
              </span>

              <span
                className={`rounded-full px-3 py-1 ${
                  packOk ? "bg-white/10 text-white/80" : "bg-red-500/10 text-red-200/90"
                }`}
              >
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
          <div className={cardCls}>
            <div className="text-xl font-semibold">企业信息</div>
            <div className="mt-1 text-sm text-white/60">
              用于生成招标级 PDF 的关键输入（已隐藏工程字段）
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <div className={labelCls}>Plan ID（内部）</div>
                <input className={inputCls} value={planId} onChange={(e) => setPlanId(e.target.value)} />
              </div>

              <div>
                <div className={labelCls}>企业名称</div>
                <input
                  className={inputCls}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
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
                  <div className="mt-2 text-xs text-white/50">
                    当前选择：{cnBudgetTierLabel(budgetTier)}档
                  </div>
                </div>

                <div>
                  <div className={labelCls}>建设类型</div>
                  <select
                    className={inputCls}
                    value={buildType}
                    onChange={(e) => setBuildType(e.target.value as "new_build" | "renovation")}
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
                  onChange={(e) =>
                    setUsageIntensity(
                      e.target.value as "conservative" | "standard" | "active"
                    )
                  }
                >
                  <option value="conservative">保守（低频使用）</option>
                  <option value="standard">标准（常规企业）</option>
                  <option value="active">高活跃（健康文化强）</option>
                </select>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  <div>系统预测使用比例：{Math.round(participationRate * 100)}%</div>
                  <div>峰值同时使用人数（估算）：{peakUsers} 人</div>
                  <div className="mt-1 text-xs text-white/50">
                    说明：使用比例 = 预计经常使用健身房的员工占比，用于器材规模与容量推导。
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
                    <span
                      style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}
                    >
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
                  政府评审版（5页，含编号签章）
                  {!canUseGovernment && (
                    <span
                      style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}
                    >
                      需升级 Tender
                    </span>
                  )}
                </label>

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
                    当前套餐：
                    <b style={{ color: "rgba(255,255,255,0.85)" }}>{userPlan.toUpperCase()}</b>
                    <span style={{ marginLeft: 10 }}>
                    {userPlan === "free" && "（当前可下载预览版；Pro 解锁完整企业评审版，Tender 解锁政府评审版）"}
                    {userPlan === "pro" && "（Tender 解锁政府评审版）"}
                    {userPlan === "tender" && "（已解锁全部版本）"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">
                  招标文本（测试入口）
                </label>

                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.pdf,.docx"
                    onChange={handleTenderFileChange}
                    className="block text-sm"
                  />

                  {uploadingTenderFile ? (
                    <span className="text-sm opacity-70">解析中...</span>
                  ) : null}

                  {tenderFileName ? (
                    <span className="text-sm opacity-70">已载入：{tenderFileName}</span>
                  ) : null}

                  {!!tenderRawText && !uploadingTenderFile ? (
                    <span className="text-sm opacity-70">
                      文本长度：{tenderRawText.length} 字
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setTenderRawText("");
                      setTenderFileName("");
                      setTenderIntelligence(null);
                      setTenderAnalyzeError(null);
                      setTenderSemantic(null);
                      setTenderSemanticError(null);
                      setTenderCompose(null);
                      setTenderComposeError(null);
                      setTenderSku(null);
                      setTenderSkuError(null);
                      setTenderCompliance(null);
                      setTenderComplianceError(null);
                    }}
                    className="rounded-lg border px-3 py-1 text-sm"
                  >
                    清空
                  </button>
                </div>

                <textarea
                  value={tenderRawText}
                  onChange={(e) => setTenderRawText(e.target.value)}
                  placeholder="可直接粘贴招标文件正文，或上传 txt / pdf / docx 文件后自动填充..."
                  className="w-full min-h-[220px] rounded-xl border p-3"
                />

                <TenderAnalysisPanel
                  loading={tenderAnalyzeLoading}
                  error={tenderAnalyzeError}
                  data={tenderIntelligence}
                  canAnalyze={!!tenderRawText.trim()}
                  onAnalyze={runTenderIntelligenceAnalyze}
                />

                <TenderSemanticPanel
                  loading={tenderSemanticLoading}
                  error={tenderSemanticError}
                  data={tenderSemantic}
                  canRun={!!tenderRawText.trim()}
                  onRun={runTenderSemanticAnalyze}
                />

                <TenderSkuPanel
                  loading={tenderSkuLoading}
                  error={tenderSkuError}
                  data={tenderSku}
                  canRun={!!tenderRawText.trim()}
                  onRun={runTenderSkuAnalyze}
                />

                <TenderCompliancePanel
                  loading={tenderComplianceLoading}
                  error={tenderComplianceError}
                  data={tenderCompliance}
                  canRun={!!tenderRawText.trim()}
                  onRun={runTenderComplianceAnalyze}
                />

                <ExecutiveRuntimeVisualizationPanel
                  loading={executiveVisualizationLoading}
                  error={executiveVisualizationError}
                  data={executiveVisualization}
                  canRefresh={!!tenderRawText.trim()}
                  onRefresh={runExecutiveVisualizationDashboard}
                />

                <TenderResponsePanel
                  loading={tenderComposeLoading}
                  error={tenderComposeError}
                  data={tenderCompose}
                  canRun={!!tenderRawText.trim()}
                  onRun={runTenderCompose}
                />
              </div>

            
              
              {!isProductionPrimaryFlow ? (
                <div
                  ref={riskDetailsSectionRef}
                  className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">
                      投标评估摘要
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">

  {tenderRisk?.level ? (
    <span className="rounded-full border border-white/10 px-2 py-1 text-white/70">
      风险级数：
      {tenderRisk.level === "safe"
        ? "低"
        : tenderRisk.level === "caution"
        ? "中"
        : "高"}
    </span>
  ) : null}

{tenderScoreResult?.score != null && (
  <span className="rounded-full border border-white/10 px-2 py-1 text-white/70">
    综合评分： {String(tenderScoreResult.score)} / 100
  </span>
)}
</div>

                    <div className="mt-2 text-sm text-zinc-300">
                      {downloadGate?.summary || "已完成风险与评分分析"}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={analysisDetailBusy}
                    onClick={() => void handleOpenAnalysisDetails()}
                    className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analysisDetailBusy ? "分析中..." : "查看分析明细"}
                  </button>
                </div>

                {analysisDetailError ? (
                  <div className="mt-2 text-sm text-red-300/95">
                    {analysisDetailError}
                  </div>
                ) : null}

                {showTenderRiskDetails ? (
  <div ref={riskDetailsSectionRef} className="mt-4 space-y-4">
                    <div
                      className={[
                        "rounded-xl border",
                        getFixHighlightClass("risk-summary"),
                      ].join(" ")}
                    >
                      <TenderRiskCard
                        risk={tenderRisk}
                        loading={tenderRiskLoading}
                        onOptimize={handleTenderOptimize}
                        optimizeLoading={optimizeLoading}
                        hasRowsForOptimize={
                          technicalRows.length > 0 || businessRows.length > 0
                        }
                      />
                    </div>

                    <TenderRiskTables
                      technicalRows={technicalRows}
                      businessRows={businessRows}
                      attachmentCodes={tenderRisk?.missingAttachments ?? []}
                      techResponseSectionRef={techResponseSectionRef}
                      bizResponseSectionRef={bizResponseSectionRef}
                      attachmentSectionRef={attachmentSectionRef}
                      highlightFixKey={highlightFixKey}
                      getFixHighlightClass={getFixHighlightClass}
                      highlightRowKey={highlightRowKey}
                      getHighlightRowClass={getHighlightRowClass}
                    />

                    <TenderScoreSimulationCard
                      result={tenderScoreResult}
                      profileName={tenderScoreProfileName}
                      source={tenderScoreSource}
                      loading={tenderScoreLoading}
                    />
                  </div>
                ) : null}
                </div>
              ) : null}

              <div className="mb-3 space-y-2">
                <AccountAuthBar onSessionChange={handleEntitlementSessionChange} />
              </div>

              <div className="mt-4 mb-2 text-xs text-zinc-400">
                {downloadGate?.action === "allow"
                  ? "当前评估允许下载正式文件。"
                  : downloadGate?.action === "warn"
                    ? "当前存在风险，下载前请先确认。"
                    : downloadGate?.action === "block"
                      ? "当前不建议直接下载，请先处理关键问题。"
                      : "可根据评估结果下载对应版本文件。"}
              </div>
              <div className="mb-2 text-sm text-white/75">
                当前方案：{commercialPlan.toUpperCase()}
                {hasClientPaidLicense ? (
                  <span className="ml-2 font-medium text-emerald-200/95">
                    · 本机已保存付费授权
                  </span>
                ) : null}
                。请选择版本完成下载或升级。
              </div>
              {mounted && !hasReadyProjectIdForPaidDownload ? (
                <div className="mb-3 rounded-xl border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
                  未检测到有效的{" "}
                  <span className="font-mono text-rose-50">projectId</span>
                  ：请从生成结果页进入本页（链接中带{" "}
                  <span className="font-mono">projectId</span>
                  ），或先在流程中生成项目。{" "}
                  <span className="text-rose-200/80">
                    Pro / Enterprise 下载与购买已暂时不可用。
                  </span>
                </div>
              ) : null}
              {mounted && hasClientPaidLicense ? (
                <div className="mb-3 rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-50">
                  <div className="font-semibold text-emerald-100">
                    已授权 · 已激活
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-emerald-100/90">
                    本设备已绑定付费授权，可直接使用下方 Pro / Enterprise
                    下载能力（最终以服务端校验为准）。
                  </div>
                </div>
              ) : null}

              {process.env.NODE_ENV === "production" &&
              mounted &&
              !hasClientPaidLicense ? (
                <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-zinc-300">
                  购买成功后系统将自动在本机激活授权，无需手动填写授权码；若支付完成仍未解锁，请刷新页面或联系支持。
                </div>
              ) : null}

              {showDevLicensePanel ? (
                <div className="mb-3 rounded-xl border border-amber-400/40 bg-amber-50/10 p-3">
                  <details className="rounded-lg border border-amber-400/25 bg-black/15 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-2 text-xs font-medium text-amber-100 hover:bg-white/5">
                      <span>开发调试 · License / 支付模拟</span>
                      <span className="shrink-0 text-right text-[11px] font-normal leading-snug text-zinc-400">
                        {licenseSaveMessage ? (
                          <span className="text-emerald-300">
                            {licenseSaveMessage}
                          </span>
                        ) : (
                          "展开"
                        )}
                      </span>
                    </summary>
                    <div className="mt-3 space-y-3 border-t border-amber-400/20 pt-3">
                      <div className="text-[11px] text-amber-100/75">
                        非 production
                        构建专用：可手动写入 License Key、指纹与 planId，或使用测试发证 /
                        模拟支付链路。正式用户不会看到本面板。
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <input
                          value={licenseForm.licenseKey}
                          onChange={(e) => {
                            setLicenseForm((prev) => {
                              return { ...prev, licenseKey: e.target.value };
                            });
                          }}
                          placeholder="licenseKey"
                          className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-500"
                        />
                        <input
                          value={licenseForm.fingerprint}
                          onChange={(e) => {
                            setLicenseForm((prev) => {
                              return {
                                ...prev,
                                fingerprint: e.target.value,
                              };
                            });
                          }}
                          placeholder="fingerprint"
                          className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-500"
                        />
                        <input
                          value={licenseForm.planId}
                          onChange={(e) => {
                            setLicenseForm((prev) => {
                              return { ...prev, planId: e.target.value };
                            });
                          }}
                          placeholder="planId"
                          className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-500"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSaveLicense}
                          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                        >
                          保存 license
                        </button>
                        <button
                          type="button"
                          disabled={paySimBusy}
                          onClick={() =>
                            void runDevSimulatePayWebhookPersist()
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-sky-400/50 bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-100 hover:bg-sky-500/30 disabled:opacity-50"
                        >
                          {paySimBusy ? "模拟支付中…" : "模拟支付并发证"}
                        </button>
                      </div>
                      <div className="space-y-2 border-t border-amber-400/15 pt-3">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/55 transition hover:border-white/15 hover:text-white/70">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 accent-emerald-500"
                            checked={devForceFreeMode}
                            onChange={() => {
                              setDevForceFreeMode((prev) => {
                                const next = !prev;
                                try {
                                  sessionStorage.setItem(
                                    "__result_dev_force_free",
                                    next ? "1" : "0",
                                  );
                                } catch {
                                  // ignore
                                }
                                return next;
                              });
                            }}
                          />
                          <span>【强制 FREE 模式】</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleDevResetEnterpriseAuth}
                          className="inline-flex w-full items-center justify-center rounded-lg border border-white/[0.08] bg-transparent px-3 py-2 text-xs font-normal text-white/38 transition hover:border-white/15 hover:text-white/55"
                        >
                          重置授权（清本机 License / 解锁 + 登出，可重测支付；无自动下载）
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              ) : null}

              <div className="mt-3 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-lg font-semibold text-white">Free（免费）</div>
                  <div className="mt-1 text-2xl font-bold text-white">￥0</div>
                  <div className="mt-1 text-xs text-amber-200/90">仅供参考，不可投标</div>
                  <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                    <li>简版 Plan（前 5 页）</li>
                    <li>含“仅供参考”水印</li>
                    <li>不含 Budget / ZIP</li>
                  </ul>
                  <button
                    type="button"
                    disabled={pdfDownloadBusy || zipDownloadBusy || checkoutBusyTier !== null}
                    onClick={() => {
                      console.info("[ui-click] free-plan");
                      if (!canDownloadNow) {
                        handleResolveRiskBeforeDownload();
                        return;
                      }
                      void handleDownloadPlanPdf("free");
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    下载计划书（简版）
                  </button>
                </div>

                <div className="rounded-2xl border border-violet-400/30 bg-violet-500/[0.08] p-5">
                  <div className="inline-flex rounded-full border border-violet-300/40 bg-violet-400/20 px-2 py-0.5 text-xs font-semibold text-violet-100">
                    推荐
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">Pro（专业版）</div>
                  <div className="mt-1 text-2xl font-bold text-white">￥299</div>
                  <div className="mt-1 text-xs text-violet-100/90">适合内部评审</div>
                  <ul className="mt-3 space-y-1 text-sm text-zinc-200">
                    <li>完整版 Plan</li>
                    <li>Budget 预算书下载</li>
                    <li>无水印，适合评审会</li>
                  </ul>
                  {!canDownloadPaidTier("pro") ? (
                    <button
                      type="button"
                      disabled={
                        checkoutBusyTier !== null ||
                        pdfDownloadBusy ||
                        zipDownloadBusy ||
                        !hasReadyProjectIdForPaidDownload
                      }
                      onClick={() => {
                        console.info("[ui-click] pro-purchase");
                        void handleProPlanPurchaseFlow();
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutBusyTier === "pro"
                        ? "正在处理支付..."
                        : "立即开通 Pro"}
                    </button>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        disabled={
                          pdfDownloadBusy ||
                          zipDownloadBusy ||
                          checkoutBusyTier !== null ||
                          !hasReadyProjectIdForPaidDownload
                        }
                        onClick={() => {
                          console.info("[ui-click] pro-plan");
                          void handleProPlanDownloadWithPurchase();
                        }}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        下载计划书
                      </button>
                      <button
                        type="button"
                        disabled={
                          pdfDownloadBusy ||
                          zipDownloadBusy ||
                          checkoutBusyTier !== null ||
                          !hasReadyProjectIdForPaidDownload
                        }
                        onClick={() => {
                          console.log("[ui-click] pro-budget");
                          void handleProBudgetDownloadWithPurchase();
                        }}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        下载预算书
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-b from-amber-300/15 to-transparent p-5 shadow-[0_0_30px_rgba(251,191,36,0.18)]">
                  <div className="inline-flex rounded-full border border-amber-200/60 bg-amber-300/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                    最常用 / 投标首选
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    Enterprise（投标版）
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white">￥999</div>
                  <div className="mt-1 text-xs text-amber-100">可直接用于投标</div>
                  <ul className="mt-3 space-y-1 text-sm text-zinc-100">
                    <li>包含：Plan + Budget + 完整投标包（ZIP）</li>
                    <li>封面 / 声明 / 投标编号</li>
                    <li className="text-xs text-amber-100/80">
                      一键下载完整 ZIP，无需分别获取 Plan / Budget
                    </li>
                  </ul>
                  <button
                    type="button"
                    disabled={
                      pdfDownloadBusy ||
                      zipDownloadBusy ||
                      checkoutBusyTier !== null ||
                      !hasReadyProjectIdForPaidDownload
                    }
                    onClick={() => {
                      if (!canDownloadPaidTier("enterprise")) {
                        console.info("[ui-click] enterprise-zip-purchase");
                        void handleEnterpriseZipDownloadWithPurchase();
                        return;
                      }
                      console.info("[ui-click] enterprise-zip");
                      if (!canProceedWithPaidDownloads) {
                        handleResolveRiskBeforeDownload();
                        return;
                      }
                      void handleEnterpriseZipDownloadWithPurchase();
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutBusyTier === "enterprise"
                      ? "支付处理中..."
                      : "下载完整投标包（ZIP）"}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-4">
                {mode === "engine" && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        process.env.NODE_ENV === "development" &&
                        devForceFreeMode
                      ) {
                        trackEvent("open_upgrade_modal", {
                          planId,
                          planLevel: "free",
                          reason: "dev_force_free_engine_pack",
                        });
                        setUpgradeModalEntryMode("upgrade");
                        setUpgradeModalOpen(true);
                        return;
                      }

                      const ok = await beforeTenderPackDownload();
                      if (!ok) return;
                    
                      const url = new URL(tenderPackUrl, window.location.origin);
                      url.searchParams.set("forceAllow", "1");
                    
                      window.location.href = url.toString();

                    }}
                    className={`inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                      isDownloadBlocked
                        ? "border-white/10 bg-white/5 text-white/50"
                        : isDownloadWarn
                          ? "border-white/20 bg-white/5 text-white/85"
                          : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }`}
                    title="Engine 模式：合并版招标包（封面 / 目录 / 声明 / 方案 / 预算）"
                  >
                    {isDownloadBlocked
                      ? "先处理风险后查看招标包"
                      : isDownloadWarn
                        ? "确认风险后下载招标包"
                        : "下载招标包（合并版）"}
                  </button>
                )}
              </div>

              {showDownloadGate && downloadGate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="w-[960px] max-w-[96vw]">
                    <BidDecisionGatePanel
                      gate={downloadGate}
                      loading={downloadGateLoading}
                      activeRiskId={activeRiskId}
                      fixingRiskId={fixingRiskId}
                      fixResult={
                        activeRiskId
                          ? riskFixResultToDisplay(
                              riskFixResults[activeRiskId]
                            )
                          : null
                      }
                      onSelectRisk={handleGateSelectRiskId}
                      onJumpToRisk={handleJumpToRisk}
                      onAutoFixRisk={handleAutoFixRisk}
                      onProceed={handleProceedAfterGate}
                      onForceProceed={handleProceedAfterGate}
                      onBackToFix={dismissDownloadGate}
                      onClose={dismissDownloadGate}
                      onGoFix={handleGoFixFromGate}
                    />
                  </div>
                </div>
              )}

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
                  <div className="mb-2 text-xs text-white/50">
                    level=<span className="text-white/80">{budgetLevel}</span>
                    {budgetLevel === "government" ? (
                      <span className="ml-2 text-white/50">docSeq=01</span>
                    ) : null}
                  </div>

                  <div className="mb-3 break-all text-xs text-white/60">url：{budgetInspectUrl}</div>

                  {budgetHeadLoading ? (
                    <div className="text-xs text-white/60">读取中...</div>
                  ) : budgetHeadErr ? (
                    <div className="text-xs text-red-300/90">读取失败：{budgetHeadErr}</div>
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
                          <div className="mt-1 break-all text-xs text-white/80">
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
                  <div className="mb-2 text-xs text-white/50">
                    packLevel=
                    <span className="text-white/80">
                      {budgetLevel === "brand" ? "enterprise" : budgetLevel}
                    </span>
                  </div>

                  <div className="mb-3 break-all text-xs text-white/60">url：{tenderPackUrl}</div>

                  {tenderPackHeadLoading ? (
                    <div className="text-xs text-white/60">读取中...</div>
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
                          <div className="mt-1 break-all text-xs text-white/80">
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
                  当前为 Client 模式：已隐藏“模块顺序、0-1 参与率、英文模块名”等工程字段，更适合面向客户 / 评审展示。
                </div>
              )}
            </div>
          </div>

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
                            onChange={(e) =>
                              toggleSection(m.id as SectionId, e.target.checked)
                            }
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
                  说明：Engine 模式只用于你内部验收 PDF 结构与渲染稳定性；对外交付请使用
                  Client 模式默认页面。
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">方案结构概览（Client）</div>
                <div className="mt-1 text-sm text-white/60">
                  面向客户 / 评审的展示：不暴露工程模块名与顺序控制
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { t: "项目背景与目标", d: "企业健康支持目标、建设原则与收益说明" },
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
                  需要进入内部调试？在地址后加{" "}
                  <code className="text-white/70">?mode=engine</code>。
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-400">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              当前操作：
              <span className="text-zinc-200">{pageOpLabel}</span>
            </span>
            <span>
              状态：
              <span
                className={
                  pageOpOutcome === "success"
                    ? "text-emerald-400/95"
                    : pageOpOutcome === "error"
                      ? "text-red-400/95"
                      : "text-zinc-500"
                }
              >
                {pageOpOutcome === "success"
                  ? "成功"
                  : pageOpOutcome === "error"
                    ? "失败"
                    : "—"}
              </span>
            </span>
          </div>
          {pageLastError ? (
            <div className="mt-2 border-t border-white/10 pt-2 text-red-300/95">
              最近错误：{pageLastError}
            </div>
          ) : null}
        </div>

        <div className="mt-10 text-xs text-white/35">
          UI 分层目标：Client 模式用于对外展示与交付；Engine 模式用于内部调试 PDF
          引擎，不向客户暴露。
        </div>
      </div>

      <EnterpriseLeadForm
        open={showEnterpriseLeadForm}
        loading={enterpriseLeadSubmitting}
        initialEmail={enterpriseLeadEmail}
        onClose={() => setShowEnterpriseLeadForm(false)}
        onSubmit={handleEnterpriseLeadSubmit}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradeModalEntryMode("upgrade");
        }}
        currentTierLabel={commercialTierDisplay(commercialPlan)}
        analytics={{ planId }}
        entryMode={upgradeModalEntryMode}
        startPaidPurchase={handleUpgradeModalStartPaidPurchase}
        onManualDownloadPdf={handleUpgradeModalManualDownloadPdf}
        onManualDownloadZip={handleUpgradeModalManualDownloadZip}
        onReturn={() => {
          setUpgradeModalOpen(false);
          setUpgradeModalEntryMode("upgrade");
        }}
      />

      {showEnterpriseVerifyDialog ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">邮箱验证</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              验证码已发送至{" "}
              <span className="text-white">{enterpriseLeadEmail}</span>
              ，请输入验证码后继续下载。
            </p>

            <div className="mt-4">
              <div className="mb-1.5 text-sm text-white/85">验证码</div>
              <input
                value={enterpriseVerifyCode}
                onChange={(e) => setEnterpriseVerifyCode(e.target.value)}
                placeholder="请输入邮箱验证码"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/8"
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowEnterpriseVerifyDialog(false);
                  setPendingDownloadKind(null);
                  setPendingDownloadMode(null);
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleEnterpriseVerifyAndDownload}
                disabled={enterpriseVerifySubmitting}
                className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enterpriseVerifySubmitting ? "验证中..." : "验证并下载"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f14]" aria-hidden />}>
      <ResultPageInner />
    </Suspense>
  );
}