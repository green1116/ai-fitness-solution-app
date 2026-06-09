"use client";

import React, { useState } from "react";
import BidDecisionGatePanel from "@/components/BidDecisionGatePanel";
import TenderAnalysisPanel, {
  type TenderAnalyzePayload,
} from "@/components/TenderAnalysisPanel";
import TenderSemanticPanel, {
  type TenderSemanticPayload,
} from "@/components/TenderSemanticPanel";
import TenderResponsePanel, {
  type TenderComposePayload,
} from "@/components/TenderResponsePanel";
import TenderSkuPanel, { type TenderSkuPayload } from "@/components/TenderSkuPanel";
import TenderCompliancePanel, {
  type TenderCompliancePayload,
} from "@/components/TenderCompliancePanel";
import ExecutiveRuntimeVisualizationPanel from "@/components/ExecutiveRuntimeVisualizationPanel";
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
import type { RuntimeVisualizationDashboard } from "@/lib/evidence/types";
import AccountAuthBar from "@/app/result/AccountAuthBar";
import type { CommercialPlanLevel } from "@/lib/commercial/enterpriseUnlockStorage";
import {
  toClientFacingError,
  toTenderIntakeClientError,
} from "@/lib/client/clientFacingMessages";

type Mode = "client" | "engine";
type UserPlan = "free" | "pro" | "tender";
type TenderRiskRow = {
  id?: string;
  code?: string;
  title?: string;
  severity?: string;
  status?: string;
  detail?: string;
};

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

const LABEL_CLS = "text-sm text-white/70";
const INPUT_CLS =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/20";

type ResultDebugPanelsProps = {
  mode: Mode;
  effectiveMode: Mode;
  projectId: string;
  budgetOk: boolean;
  packOk: boolean;
  onCopyAuditSummary: () => void;
  buildType: "new_build" | "renovation";
  onBuildTypeChange: (v: "new_build" | "renovation") => void;
  usageIntensity: "conservative" | "standard" | "active";
  onUsageIntensityChange: (v: "conservative" | "standard" | "active") => void;
  participationRate: number;
  peakUsers: number;
  preferSmart: boolean;
  preferQuiet: boolean;
  onTogglePreferSmart: () => void;
  onTogglePreferQuiet: () => void;
  budgetLevel: string;
  onBudgetLevelChange: (v: string) => void;
  canUseEnterprise: boolean;
  canUseGovernment: boolean;
  userPlan: UserPlan;
  tenderRawText: string;
  tenderFileName: string;
  uploadingTenderFile: boolean;
  tenderUploadError: string | null;
  onTenderFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTenderRawTextChange: (v: string) => void;
  onClearTender: () => void;
  tenderAnalyzeLoading: boolean;
  tenderAnalyzeError: string | null;
  tenderIntelligence: TenderAnalyzePayload | null;
  onRunTenderIntelligence: () => void;
  tenderSemanticLoading: boolean;
  tenderSemanticError: string | null;
  tenderSemantic: TenderSemanticPayload | null;
  onRunTenderSemantic: () => void;
  tenderSkuLoading: boolean;
  tenderSkuError: string | null;
  tenderSku: TenderSkuPayload | null;
  onRunTenderSku: () => void;
  tenderComplianceLoading: boolean;
  tenderComplianceError: string | null;
  tenderCompliance: TenderCompliancePayload | null;
  onRunTenderCompliance: () => void;
  executiveVisualizationLoading: boolean;
  executiveVisualizationError: string | null;
  executiveVisualization: RuntimeVisualizationDashboard | null;
  onRefreshExecutiveVisualization: () => void;
  tenderComposeLoading: boolean;
  tenderComposeError: string | null;
  tenderCompose: TenderComposePayload | null;
  onRunTenderCompose: () => void;
  tenderRisk: TenderRiskPayload | null;
  tenderScoreResult: TenderScoreSimulationPayload | null;
  downloadGate: BidDecisionGateResult | null;
  analysisDetailBusy: boolean;
  analysisDetailError: string | null;
  onOpenAnalysisDetails: () => void;
  showTenderRiskDetails: boolean;
  tenderRiskLoading: boolean;
  onTenderOptimize: () => void;
  optimizeLoading: boolean;
  technicalRows: TenderRiskRow[];
  businessRows: TenderRiskRow[];
  tenderScoreProfileName: string | undefined;
  tenderScoreSource: "tender-extracted" | "default" | undefined;
  tenderScoreLoading: boolean;
  riskDetailsSectionRef: React.RefObject<HTMLDivElement | null>;
  techResponseSectionRef: React.RefObject<HTMLDivElement | null>;
  bizResponseSectionRef: React.RefObject<HTMLDivElement | null>;
  attachmentSectionRef: React.RefObject<HTMLDivElement | null>;
  getFixHighlightClass: (key: string) => string;
  highlightFixKey: string | null;
  highlightRowKey: string | null;
  getHighlightRowClass: (key: string) => string;
  projectLoadState: string;
  canDownloadDocuments: boolean;
  commercialPlan: CommercialPlanLevel;
  hasClientPaidLicense: boolean;
  licenseForm: { licenseKey: string; fingerprint: string; planId: string };
  onLicenseFormChange: (field: string, value: string) => void;
  licenseSaveMessage: string | null;
  onSaveLicense: () => void;
  paySimBusy: boolean;
  onSimulatePay: () => void;
  devForceFreeMode: boolean;
  onToggleDevForceFree: () => void;
  onDevResetAuth: () => void;
  isDownloadBlocked: boolean;
  isDownloadWarn: boolean;
  onDownloadMergedPack: () => void;
  budgetInspectUrl: string;
  budgetHeadLoading: boolean;
  budgetHeadErr: string | null;
  budgetHead: Record<string, string>;
  tenderPackUrl: string;
  tenderPackHeadLoading: boolean;
  tenderPackHeadErr: string | null;
  tenderPackHead: Record<string, string>;
  onEntitlementSessionChange: () => void;
};

/** 内部调试面板内容（由 ResultDebugView 容器挂载） */
function ResultDebugPanels(props: ResultDebugPanelsProps) {
  const p = props;
  return (
    <div className="space-y-6">
      <AccountAuthBar
        debugEnabled
        onSessionChange={p.onEntitlementSessionChange}
      />

      <div>
        <div className={LABEL_CLS}>Project ID（主键）</div>
        <input className={INPUT_CLS} value={p.projectId} readOnly />
      </div>

      <div>
        <div className={LABEL_CLS}>建设类型</div>
        <select
          className={INPUT_CLS}
          value={p.buildType}
          onChange={(e) =>
            p.onBuildTypeChange(e.target.value as "new_build" | "renovation")
          }
        >
          <option value="new_build">新建</option>
          <option value="renovation">改造</option>
        </select>
      </div>

      <div>
        <div className={LABEL_CLS}>使用强度</div>
        <select
          className={INPUT_CLS}
          value={p.usageIntensity}
          onChange={(e) =>
            p.onUsageIntensityChange(
              e.target.value as "conservative" | "standard" | "active",
            )
          }
        >
          <option value="conservative">保守（低频使用）</option>
          <option value="standard">标准（常规企业）</option>
          <option value="active">高活跃（健康文化强）</option>
        </select>
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          <div>系统预测使用比例：{Math.round(p.participationRate * 100)}%</div>
          <div>峰值同时使用人数（估算）：{p.peakUsers} 人</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={p.onTogglePreferSmart}
          className={`rounded-full border px-4 py-2 text-sm ${
            p.preferSmart ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
          }`}
        >
          偏好智能
        </button>
        <button
          type="button"
          onClick={p.onTogglePreferQuiet}
          className={`rounded-full border px-4 py-2 text-sm ${
            p.preferQuiet ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
          }`}
        >
          偏好低噪
        </button>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">招标文本（测试入口）</label>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".txt,.md,.csv,.pdf,.docx"
            onChange={p.onTenderFileChange}
            className="block text-sm"
          />
          {p.uploadingTenderFile ? (
            <span className="text-sm opacity-70">解析中...</span>
          ) : null}
          {p.tenderFileName ? (
            <span className="text-sm opacity-70">已载入：{p.tenderFileName}</span>
          ) : null}
          <button type="button" onClick={p.onClearTender} className="rounded-lg border px-3 py-1 text-sm">
            清空
          </button>
        </div>
        <textarea
          value={p.tenderRawText}
          onChange={(e) => p.onTenderRawTextChange(e.target.value)}
          placeholder="粘贴招标文件正文，或上传 txt / pdf / docx..."
          className="w-full min-h-[220px] rounded-xl border p-3"
        />
        {p.tenderUploadError ? (
          <div className="mt-2 rounded-lg border border-rose-400/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-100">
            {toClientFacingError(
              p.tenderUploadError,
              toTenderIntakeClientError(p.tenderUploadError),
            )}
          </div>
        ) : null}

        <TenderAnalysisPanel
          loading={p.tenderAnalyzeLoading}
          error={p.tenderAnalyzeError}
          data={p.tenderIntelligence}
          canAnalyze={!!p.tenderRawText.trim()}
          onAnalyze={p.onRunTenderIntelligence}
        />
        <TenderSemanticPanel
          loading={p.tenderSemanticLoading}
          error={p.tenderSemanticError}
          data={p.tenderSemantic}
          canRun={!!p.tenderRawText.trim()}
          onRun={p.onRunTenderSemantic}
        />
        <TenderSkuPanel
          loading={p.tenderSkuLoading}
          error={p.tenderSkuError}
          data={p.tenderSku}
          canRun={!!p.tenderRawText.trim()}
          onRun={p.onRunTenderSku}
        />
        <TenderCompliancePanel
          loading={p.tenderComplianceLoading}
          error={p.tenderComplianceError}
          data={p.tenderCompliance}
          canRun={!!p.tenderRawText.trim()}
          onRun={p.onRunTenderCompliance}
        />
        <ExecutiveRuntimeVisualizationPanel
          loading={p.executiveVisualizationLoading}
          error={p.executiveVisualizationError}
          data={p.executiveVisualization}
          canRefresh={!!p.tenderRawText.trim()}
          onRefresh={p.onRefreshExecutiveVisualization}
        />
        <TenderResponsePanel
          loading={p.tenderComposeLoading}
          error={p.tenderComposeError}
          data={p.tenderCompose}
          canRun={!!p.tenderRawText.trim()}
          onRun={p.onRunTenderCompose}
        />
      </div>

      <div
        ref={p.riskDetailsSectionRef}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">投标评估摘要</div>
            <div className="mt-2 text-sm text-zinc-300">
              {p.downloadGate?.summary || "已完成风险与评分分析"}
            </div>
          </div>
          <button
            type="button"
            disabled={p.analysisDetailBusy}
            onClick={() => void p.onOpenAnalysisDetails()}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {p.analysisDetailBusy ? "分析中..." : "查看分析明细"}
          </button>
        </div>
        {p.analysisDetailError ? (
          <div className="mt-2 text-sm text-red-300/95">
            {toClientFacingError(p.analysisDetailError)}
          </div>
        ) : null}
        {p.showTenderRiskDetails ? (
          <div className="mt-4 space-y-4">
            <TenderRiskCard
              risk={p.tenderRisk}
              loading={p.tenderRiskLoading}
              onOptimize={p.onTenderOptimize}
              optimizeLoading={p.optimizeLoading}
              hasRowsForOptimize={
                p.technicalRows.length > 0 || p.businessRows.length > 0
              }
            />
            <TenderRiskTables
              technicalRows={p.technicalRows}
              businessRows={p.businessRows}
              attachmentCodes={p.tenderRisk?.missingAttachments ?? []}
              techResponseSectionRef={p.techResponseSectionRef}
              bizResponseSectionRef={p.bizResponseSectionRef}
              attachmentSectionRef={p.attachmentSectionRef}
              highlightFixKey={p.highlightFixKey}
              getFixHighlightClass={p.getFixHighlightClass}
              highlightRowKey={p.highlightRowKey}
              getHighlightRowClass={p.getHighlightRowClass}
            />
            <TenderScoreSimulationCard
              result={p.tenderScoreResult}
              profileName={p.tenderScoreProfileName}
              source={p.tenderScoreSource}
              loading={p.tenderScoreLoading}
            />
          </div>
        ) : null}
      </div>

      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-zinc-300">
        <div className="font-medium text-white/85">授权状态（调试）</div>
        <ul className="mt-1.5 space-y-1">
          <li>projectLoadState: {p.projectLoadState}</li>
          <li>canDownloadDocuments: {String(p.canDownloadDocuments)}</li>
        </ul>
      </div>

      <div className="mb-3 rounded-xl border border-amber-400/40 bg-amber-50/10 p-3">
        <details className="rounded-lg border border-amber-400/25 bg-black/15">
          <summary className="cursor-pointer px-2 py-2 text-xs font-medium text-amber-100">
            开发调试 · License / 支付模拟
          </summary>
          <div className="mt-3 space-y-3 border-t border-amber-400/20 p-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input
                value={p.licenseForm.licenseKey}
                onChange={(e) => p.onLicenseFormChange("licenseKey", e.target.value)}
                placeholder="licenseKey"
                className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black"
              />
              <input
                value={p.licenseForm.fingerprint}
                onChange={(e) => p.onLicenseFormChange("fingerprint", e.target.value)}
                placeholder="fingerprint"
                className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black"
              />
              <input
                value={p.licenseForm.planId}
                onChange={(e) => p.onLicenseFormChange("planId", e.target.value)}
                placeholder="planId"
                className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={p.onSaveLicense} className="rounded-lg border px-3 py-1.5 text-xs text-white">
                保存 license
              </button>
              <button
                type="button"
                disabled={p.paySimBusy}
                onClick={() => void p.onSimulatePay()}
                className="rounded-lg border border-sky-400/50 px-3 py-1.5 text-xs text-sky-100"
              >
                {p.paySimBusy ? "模拟支付中…" : "模拟支付并发证"}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/55">
              <input
                type="checkbox"
                checked={p.devForceFreeMode}
                onChange={p.onToggleDevForceFree}
              />
              强制 FREE 模式
            </label>
            <button type="button" onClick={p.onDevResetAuth} className="text-xs text-white/38">
              重置授权
            </button>
          </div>
        </details>
      </div>

      {p.effectiveMode === "engine" ? (
        <button
          type="button"
          onClick={() => void p.onDownloadMergedPack()}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white"
        >
          下载招标包（合并版）
        </button>
      ) : null}

      {p.effectiveMode === "engine" ? (
        <>
          <CollapsiblePanel title="预算 PDF 验收信息（HEAD）" defaultOpen={false}>
            <div className="mb-3 break-all text-xs text-white/60">url：{p.budgetInspectUrl}</div>
            {p.budgetHeadLoading ? (
              <div className="text-xs text-white/60">读取中...</div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(p.budgetHead).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                    <div className="text-white/50">{k}</div>
                    <div className="text-white/80">{v || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </CollapsiblePanel>
          <CollapsiblePanel title="招标包 验收信息（HEAD）" defaultOpen={false}>
            <div className="mb-3 break-all text-xs text-white/60">url：{p.tenderPackUrl}</div>
            {p.tenderPackHeadLoading ? (
              <div className="text-xs text-white/60">读取中...</div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(p.tenderPackHead).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
                    <div className="text-white/50">{k}</div>
                    <div className="text-white/80">{v || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </CollapsiblePanel>
        </>
      ) : null}
    </div>
  );
}

export type ResultDebugHeaderProps = {
  mode: Mode;
  effectiveMode: Mode;
  projectId: string;
  budgetOk: boolean;
  packOk: boolean;
  onCopyAuditSummary: () => void;
};

export function ResultDebugHeader(props: ResultDebugHeaderProps) {
  const p = props;
  return (
    <div className="mb-6">
      <div className="text-white/60">
        Project ID：<span className="text-white/90">{p.projectId || "—"}</span>
        <span className="ml-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
          当前模式：{p.mode === "client" ? "对外（Client）" : "内部（Engine）"}
        </span>
        <span className="ml-3 text-xs text-white/50">
          （切换：URL 后加 <code className="text-white/70">?mode=engine</code>）
        </span>
      </div>
      {p.effectiveMode === "engine" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
          <span className="font-semibold text-white/80">ENGINE STATUS</span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Budget HEAD: {p.budgetOk ? "OK" : "FAIL"}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            TenderPack HEAD: {p.packOk ? "OK" : "FAIL"}
          </span>
          <button
            type="button"
            onClick={p.onCopyAuditSummary}
            className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-xs"
          >
            复制验收摘要
          </button>
        </div>
      ) : null}
    </div>
  );
}

export type ResultDebugStatusBarProps = {
  pageOpLabel: string;
  pageOpOutcome: string;
  pageLastError: string | null;
  projectLoadState: string;
  canDownloadNow: boolean;
};

export function ResultDebugStatusBar(props: ResultDebugStatusBarProps) {
  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-400">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span>
          当前操作：<span className="text-zinc-200">{props.pageOpLabel}</span>
        </span>
        <span>
          状态：<span className="text-zinc-200">{props.pageOpOutcome}</span>
        </span>
        <span>
          projectLoadState:{" "}
          <span className="text-zinc-200">{props.projectLoadState}</span>
        </span>
        <span>
          canDownloadNow:{" "}
          <span className="text-zinc-200">{String(props.canDownloadNow)}</span>
        </span>
      </div>
      {props.pageLastError ? (
        <div className="mt-2 border-t border-white/10 pt-2 text-red-300/95">
          最近错误：{toClientFacingError(props.pageLastError)}
        </div>
      ) : null}
    </div>
  );
}

export type ResultDebugGateModalProps = {
  showDownloadGate: boolean;
  downloadGate: BidDecisionGateResult | null;
  downloadGateLoading: boolean;
  activeRiskId: string | null;
  fixingRiskId: string | null;
  riskFixResults: Record<string, unknown>;
  riskFixResultToDisplay: (r: unknown) => unknown;
  onSelectRisk: (id: string) => void;
  onJumpToRisk: (risk: BidRiskItem) => void;
  onAutoFixRisk: (risk: BidRiskItem) => void;
  onProceed: () => void;
  onBackToFix: () => void;
  onClose: () => void;
  onGoFix: (riskId?: string | null) => void;
};

export function ResultDebugGateModal(props: ResultDebugGateModalProps) {
  const p = props;
  if (!p.showDownloadGate || !p.downloadGate) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[960px] max-w-[96vw]">
        <BidDecisionGatePanel
          gate={p.downloadGate}
          loading={p.downloadGateLoading}
          activeRiskId={p.activeRiskId}
          fixingRiskId={p.fixingRiskId}
          fixResult={
            p.activeRiskId
              ? (p.riskFixResultToDisplay(p.riskFixResults[p.activeRiskId]) as never)
              : null
          }
          onSelectRisk={p.onSelectRisk}
          onJumpToRisk={p.onJumpToRisk}
          onAutoFixRisk={p.onAutoFixRisk}
          onProceed={p.onProceed}
          onForceProceed={p.onProceed}
          onBackToFix={p.onBackToFix}
          onClose={p.onClose}
          onGoFix={p.onGoFix}
        />
      </div>
    </div>
  );
}

export type ResultDebugEngineOverviewProps = {
  sections: string[];
  sectionMeta: Array<{ id: string; cn: string; desc: string }>;
  onToggleSection: (id: string, checked: boolean) => void;
  onMoveSection: (id: string, delta: 1 | -1) => void;
};

export type ResultDebugViewProps = ResultDebugPanelsProps & {
  pageOpLabel: string;
  pageOpOutcome: string;
  pageLastError: string | null;
  canDownloadNow: boolean;
  sections: string[];
  sectionMeta: Array<{ id: string; cn: string; desc: string }>;
  onToggleSection: (id: string, checked: boolean) => void;
  onMoveSection: (id: string, delta: 1 | -1) => void;
  showDownloadGate: boolean;
  downloadGateLoading: boolean;
  activeRiskId: string | null;
  fixingRiskId: string | null;
  riskFixResults: Record<string, unknown>;
  riskFixResultToDisplay: (r: unknown) => unknown;
  onSelectRisk: (id: string) => void;
  onJumpToRisk: (risk: BidRiskItem) => void;
  onAutoFixRisk: (risk: BidRiskItem) => void;
  onProceed: () => void;
  onBackToFix: () => void;
  onClose: () => void;
  onGoFix: (riskId?: string | null) => void;
};

/** 完整内部调试区：Header + 面板 + 状态条 + 闸门弹窗（仅 dev + ?mode=engine） */
export default function ResultDebugView(props: ResultDebugViewProps) {
  const {
    pageOpLabel,
    pageOpOutcome,
    pageLastError,
    canDownloadNow,
    sections,
    sectionMeta,
    onToggleSection,
    onMoveSection,
    showDownloadGate,
    downloadGateLoading,
    activeRiskId,
    fixingRiskId,
    riskFixResults,
    riskFixResultToDisplay,
    onSelectRisk,
    onJumpToRisk,
    onAutoFixRisk,
    onProceed,
    onBackToFix,
    onClose,
    onGoFix,
    mode,
    effectiveMode,
    projectId,
    budgetOk,
    packOk,
    onCopyAuditSummary,
    downloadGate,
    projectLoadState,
    ...panelProps
  } = props;

  return (
    <>
      <ResultDebugHeader
        mode={mode}
        effectiveMode={effectiveMode}
        projectId={projectId}
        budgetOk={budgetOk}
        packOk={packOk}
        onCopyAuditSummary={onCopyAuditSummary}
      />
      <div className="mt-10 space-y-6 border-t border-white/10 pt-10">
        <div className="text-lg font-semibold text-amber-200/90">内部调试区（Engine）</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6">
          <ResultDebugEngineOverview
            sections={sections}
            sectionMeta={sectionMeta}
            onToggleSection={onToggleSection}
            onMoveSection={onMoveSection}
          />
        </div>
        <ResultDebugPanels
          mode={mode}
          effectiveMode={effectiveMode}
          projectId={projectId}
          budgetOk={budgetOk}
          packOk={packOk}
          onCopyAuditSummary={onCopyAuditSummary}
          downloadGate={downloadGate}
          projectLoadState={projectLoadState}
          {...panelProps}
        />
        <ResultDebugStatusBar
          pageOpLabel={pageOpLabel}
          pageOpOutcome={pageOpOutcome}
          pageLastError={pageLastError}
          projectLoadState={projectLoadState}
          canDownloadNow={canDownloadNow}
        />
      </div>
      <ResultDebugGateModal
        showDownloadGate={showDownloadGate}
        downloadGate={downloadGate}
        downloadGateLoading={downloadGateLoading}
        activeRiskId={activeRiskId}
        fixingRiskId={fixingRiskId}
        riskFixResults={riskFixResults}
        riskFixResultToDisplay={riskFixResultToDisplay}
        onSelectRisk={onSelectRisk}
        onJumpToRisk={onJumpToRisk}
        onAutoFixRisk={onAutoFixRisk}
        onProceed={onProceed}
        onBackToFix={onBackToFix}
        onClose={onClose}
        onGoFix={onGoFix}
      />
    </>
  );
}

export function ResultDebugEngineOverview(props: ResultDebugEngineOverviewProps) {
  return (
    <>
      <div className="text-xl font-semibold">模块顺序（Engine）</div>
      <div className="mt-1 text-sm text-white/60">内部调试用：选择模块并调整顺序</div>
      <div className="mt-4 text-xs text-white/50">当前顺序：{props.sections.join(" / ")}</div>
      <div className="mt-4 space-y-3">
        {props.sectionMeta.map((m) => {
          const checked = props.sections.includes(m.id);
          return (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => props.onToggleSection(m.id, e.target.checked)}
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
                  onClick={() => props.onMoveSection(m.id, -1)}
                  disabled={!checked}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-40"
                >
                  上移
                </button>
                <button
                  type="button"
                  onClick={() => props.onMoveSection(m.id, 1)}
                  disabled={!checked}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-40"
                >
                  下移
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
