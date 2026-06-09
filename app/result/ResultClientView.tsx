"use client";

import type { CommercialPlanLevel } from "@/lib/commercial/enterpriseUnlockStorage";
import {
  PROJECT_NOT_READY,
  toClientFacingError,
  toTenderIntakeClientError,
} from "@/lib/client/clientFacingMessages";

type BudgetTier = "low" | "mid" | "high";
type CompanySize = "small" | "medium" | "large";

function tierLabel(level: CommercialPlanLevel): string {
  if (level === "pro") return "Pro";
  if (level === "enterprise") return "Enterprise";
  return "Free";
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

const CARD_CLS =
  "rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur px-6 py-6";
const LABEL_CLS = "text-sm text-white/70";
const INPUT_CLS =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/20";

const SOLUTION_SECTIONS = [
  { t: "项目背景与目标", d: "企业健康支持目标、建设原则与收益说明" },
  { t: "需求分析与容量推导", d: "规模、使用强度与峰值容量的推导说明" },
  { t: "方案对比与推荐", d: "Lite / Standard / Pro 三档对比与推荐理由" },
  { t: "推荐方案详细配置", d: "功能区、器材配置依据与交付范围" },
  { t: "实施计划与验收", d: "施工、安装、调试、验收节点与标准" },
  { t: "运维与售后保障", d: "质保、响应机制、巡检与培训" },
  { t: "风险控制与边界", d: "安全、预算、使用与运营风险控制" },
  { t: "附录与声明", d: "参数表、品牌建议、声明函等" },
] as const;

export type ResultClientViewProps = {
  mounted: boolean;
  companyEmail: string;
  planScenario: string;
  planGoal: string;
  companyName: string;
  headcount: number;
  companySizeTier: CompanySize;
  spaceSqm: number;
  budgetTier: BudgetTier;
  commercialPlan: CommercialPlanLevel;
  projectLoading: boolean;
  projectLoadError: string | null;
  projectNotReady: boolean;
  hasReadyProjectIdForPaidDownload: boolean;
  hasClientPaidLicense: boolean;
  hasEnterpriseZipAccess: boolean;
  canDownloadPaidTier: (tier: "pro" | "enterprise") => boolean;
  canDownloadDocuments: boolean;
  pdfDownloadBusy: boolean;
  zipDownloadBusy: boolean;
  checkoutBusyTier: CommercialPlanLevel | null;
  enterpriseZipCardButtonLabel: string;
  pageLastError: string | null;
  onDownloadFreePlan: () => void;
  onProPurchase: () => void;
  onProPlanDownload: () => void;
  onProBudgetDownload: () => void;
  onEnterpriseZip: () => void;
  /** 招标文件上传区 */
  showUpload?: boolean;
  uploadingTenderFile?: boolean;
  tenderFileName?: string;
  tenderUploadError?: string | null;
  onTenderFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ResultClientView(props: ResultClientViewProps) {
  const {
    mounted,
    companyEmail,
    planScenario,
    planGoal,
    companyName,
    headcount,
    companySizeTier,
    spaceSqm,
    budgetTier,
    commercialPlan,
    projectLoading,
    projectLoadError,
    projectNotReady,
    hasReadyProjectIdForPaidDownload,
    hasClientPaidLicense,
    hasEnterpriseZipAccess,
    canDownloadPaidTier,
    canDownloadDocuments,
    pdfDownloadBusy,
    zipDownloadBusy,
    checkoutBusyTier,
    enterpriseZipCardButtonLabel,
    pageLastError,
    onDownloadFreePlan,
    onProPurchase,
    onProPlanDownload,
    onProBudgetDownload,
    onEnterpriseZip,
    showUpload = false,
    uploadingTenderFile = false,
    tenderFileName = "",
    tenderUploadError = null,
    onTenderFileChange,
  } = props;

  return (
    <>
      <div className="mb-8">
        <div className="text-3xl font-semibold">方案结果</div>
        <div className="mt-2 text-white/60">查看推荐方案并下载投标文档</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className={CARD_CLS}>
          <div className="text-xl font-semibold">企业信息</div>
          <div className="mt-1 text-sm text-white/60">以下信息将用于生成投标文档</div>

          <div className="mt-6 grid gap-5">
            <div>
              <div className={LABEL_CLS}>联系邮箱</div>
              <input className={INPUT_CLS} type="email" value={companyEmail} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={LABEL_CLS}>场景</div>
                <input className={INPUT_CLS} value={planScenario} readOnly />
              </div>
              <div>
                <div className={LABEL_CLS}>目标</div>
                <input className={INPUT_CLS} value={planGoal} readOnly />
              </div>
            </div>

            <div>
              <div className={LABEL_CLS}>企业名称</div>
              <input className={INPUT_CLS} value={companyName} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={LABEL_CLS}>员工人数</div>
                <input className={INPUT_CLS} type="number" value={headcount} readOnly />
                <div className="mt-2 text-xs text-white/50">
                  企业规模：{cnSizeLabel(companySizeTier)}
                </div>
              </div>
              <div>
                <div className={LABEL_CLS}>场地面积（㎡）</div>
                <input className={INPUT_CLS} type="number" value={spaceSqm} readOnly />
              </div>
            </div>

            <div>
              <div className={LABEL_CLS}>预算等级</div>
              <select className={INPUT_CLS} value={budgetTier} disabled>
                <option value="low">低</option>
                <option value="mid">中</option>
                <option value="high">高</option>
              </select>
              <div className="mt-2 text-xs text-white/50">
                当前选择：{cnBudgetTierLabel(budgetTier)}档
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">
              <div className="text-sm font-medium text-white/90">方案结果摘要</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                已为 <span className="text-white/90">{companyName || "您的企业"}</span>{" "}
                生成企业健身房投标方案。场景：{planScenario || "—"}；目标：
                {planGoal || "—"}。员工约 {headcount || "—"} 人，场地约 {spaceSqm || "—"}{" "}
                ㎡，预算为{cnBudgetTierLabel(budgetTier)}档。可下载 Plan / Budget 文档，或升级后获取完整投标包
                ZIP。
              </p>
            </div>

            {showUpload && onTenderFileChange ? (
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="text-sm font-medium text-white/90">招标文本上传</div>
                <p className="mt-1 text-xs text-white/50">
                  支持 PDF / DOCX / TXT，用于辅助生成与校验投标内容
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.pdf,.docx"
                    onChange={onTenderFileChange}
                    className="block text-sm text-white/80"
                  />
                  {uploadingTenderFile ? (
                    <span className="text-sm text-white/60">正在解析…</span>
                  ) : null}
                  {tenderFileName ? (
                    <span className="text-sm text-white/60">已选择：{tenderFileName}</span>
                  ) : null}
                </div>
                {tenderUploadError ? (
                  <div className="mt-2 rounded-lg border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-100">
                    {toClientFacingError(
                      tenderUploadError,
                      toTenderIntakeClientError(tenderUploadError),
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mb-2 text-sm text-white/75">
              当前方案：{tierLabel(commercialPlan)}
            </div>

            {mounted && projectLoading ? (
              <div className="mb-3 rounded-xl border border-sky-400/40 bg-sky-950/30 px-3 py-2 text-xs text-sky-100">
                正在准备方案与下载内容，请稍候…
              </div>
            ) : null}

            {mounted && projectLoadError && projectNotReady ? (
              <div className="mb-3 rounded-xl border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
                {toClientFacingError(projectLoadError)}
              </div>
            ) : null}

            {mounted && projectNotReady && !projectLoading ? (
              <div className="mb-3 rounded-xl border border-amber-400/35 bg-amber-950/25 px-3 py-2 text-xs text-amber-100">
                {PROJECT_NOT_READY}{" "}
                <a href="/plan" className="underline">
                  返回填写页
                </a>
              </div>
            ) : null}

            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-zinc-300">
              <div className="font-medium text-white/85">套餐下载范围</div>
              <ul className="mt-1.5 space-y-1">
                <li>
                  <span className="font-medium text-violet-200/95">Pro</span>
                  ：完整 Plan PDF + Budget PDF
                </li>
                <li>
                  <span className="font-medium text-amber-200/95">Enterprise</span>
                  ：完整投标包 ZIP（含 Plan + Budget + 封面 / 声明 / 投标编号）
                </li>
              </ul>
            </div>

            {mounted && !hasReadyProjectIdForPaidDownload ? (
              <div className="mb-3 rounded-xl border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
                未找到有效方案记录，请先完成方案填写并生成结果后再购买或下载。{" "}
                <span className="text-rose-200/80">付费下载与购买暂不可用。</span>{" "}
                <a href="/plan" className="underline">
                  返回填写页
                </a>
              </div>
            ) : null}

            {mounted && hasClientPaidLicense ? (
              <div className="mb-3 rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-50">
                <div className="font-semibold text-emerald-100">已授权 · 已激活</div>
                <div className="mt-1 text-xs leading-relaxed text-emerald-100/90">
                  {hasEnterpriseZipAccess ? (
                    <>可下载完整 Plan / Budget 及完整投标包 ZIP。</>
                  ) : commercialPlan === "pro" || canDownloadPaidTier("pro") ? (
                    <>
                      可下载完整 Plan / Budget。完整投标包 ZIP 需升级至 Enterprise。
                    </>
                  ) : (
                    <>请按下方套餐说明选择对应下载项。</>
                  )}
                </div>
              </div>
            ) : null}

            {mounted && !hasClientPaidLicense ? (
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-zinc-300">
                购买成功后系统将自动在本机激活授权；若支付完成仍未解锁，请刷新页面或联系支持。
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
                  disabled={
                    pdfDownloadBusy ||
                    zipDownloadBusy ||
                    checkoutBusyTier !== null ||
                    !canDownloadDocuments
                  }
                  onClick={onDownloadFreePlan}
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
                <ul className="mt-3 space-y-1 text-sm text-zinc-200">
                  <li>完整版 Plan PDF</li>
                  <li>完整版 Budget PDF</li>
                  <li className="text-xs text-zinc-400">不含完整投标包 ZIP</li>
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
                    onClick={onProPurchase}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutBusyTier === "pro" ? "正在处理支付..." : "立即开通 Pro"}
                  </button>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      disabled={
                        pdfDownloadBusy ||
                        zipDownloadBusy ||
                        checkoutBusyTier !== null ||
                        !hasReadyProjectIdForPaidDownload ||
                        !canDownloadDocuments
                      }
                      onClick={onProPlanDownload}
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
                        !hasReadyProjectIdForPaidDownload ||
                        !canDownloadDocuments
                      }
                      onClick={onProBudgetDownload}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      下载预算书
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-b from-amber-300/15 to-transparent p-5 shadow-[0_0_30px_rgba(251,191,36,0.18)]">
                <div className="inline-flex rounded-full border border-amber-200/60 bg-amber-300/20 px-2 py-0.5 text-xs font-semibold text-amber-100">
                  投标首选
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Enterprise（投标版）</div>
                <div className="mt-1 text-2xl font-bold text-white">￥999</div>
                <ul className="mt-3 space-y-1 text-sm text-zinc-100">
                  <li>完整投标包 ZIP（含 Plan + Budget）</li>
                  <li>封面 / 声明 / 投标编号</li>
                </ul>
                {!hasEnterpriseZipAccess ? (
                  <div className="mt-3 rounded-lg border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-xs leading-relaxed text-amber-50/95">
                    完整投标包 ZIP 为 Enterprise 专属；Pro 可单独下载 Plan / Budget。
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={
                    pdfDownloadBusy ||
                    zipDownloadBusy ||
                    checkoutBusyTier !== null ||
                    !hasReadyProjectIdForPaidDownload ||
                    !canDownloadDocuments
                  }
                  onClick={onEnterpriseZip}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enterpriseZipCardButtonLabel}
                </button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-amber-100/70">
                  {hasEnterpriseZipAccess
                    ? "可下载完整投标包 ZIP"
                    : "完整投标包 ZIP 需 Enterprise 授权"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={CARD_CLS}>
          <div className="text-xl font-semibold">方案结构概览</div>
          <div className="mt-1 text-sm text-white/60">推荐方案的主要章节与内容说明</div>
          <div className="mt-5 space-y-3">
            {SOLUTION_SECTIONS.map((x) => (
              <div
                key={x.t}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="font-semibold">{x.t}</div>
                <div className="mt-1 text-xs text-white/55">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pageLastError ? (
        <div className="mt-10 rounded-xl border border-rose-400/35 bg-rose-950/25 px-4 py-3 text-sm text-rose-100">
          {toClientFacingError(pageLastError)}
        </div>
      ) : null}

      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/55">
        当前为 Client 模式
      </div>
    </>
  );
}
