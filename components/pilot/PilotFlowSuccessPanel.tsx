"use client";

import Link from "next/link";
import { useState } from "react";

import { downloadBudgetPdf } from "@/components/documents/downloadBudgetPdf";

type PilotFlowSuccessPanelProps = {
  title: string;
  message: string;
  status?: "generated" | "downloadable" | "delivered";
  projectId?: string;
  quoteId?: string;
  budgetId?: string;
  showBudgetDownload?: boolean;
  budgetTier?: "low" | "mid" | "high";
};

export function PilotFlowSuccessPanel({
  title,
  message,
  status = "downloadable",
  projectId,
  quoteId,
  budgetId,
  showBudgetDownload = false,
  budgetTier,
}: PilotFlowSuccessPanelProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const docHref = projectId
    ? `/documents/projects/${encodeURIComponent(projectId)}`
    : "/documents";

  const tenderHref =
    projectId
      ? `/tender?projectId=${encodeURIComponent(projectId)}${
          quoteId ? `&quoteId=${encodeURIComponent(quoteId)}` : ""
        }${budgetId ? `&budgetId=${encodeURIComponent(budgetId)}` : ""}`
      : "/tender";

  const quoteHref = projectId
    ? `/quote?projectId=${encodeURIComponent(projectId)}`
    : "/quote";

  async function handleBudgetDownload() {
    if (!projectId || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadBudgetPdf(projectId, `budget-${budgetId?.slice(0, 8) ?? "export"}.pdf`, {
        budgetId,
        tier: budgetTier,
      });
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "下载失败");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-800/60 bg-emerald-950/20 p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
          {status === "delivered" ? "已交付" : status === "generated" ? "已生成" : "可下载"}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-emerald-100/90">{message}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {showBudgetDownload && projectId ? (
          <button
            type="button"
            onClick={() => void handleBudgetDownload()}
            disabled={downloading}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {downloading ? "下载中…" : "下载预算 PDF"}
          </button>
        ) : null}
        <Link
          href={docHref}
          className="rounded-xl border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-900/30"
        >
          查看 Document Center
        </Link>
        <Link
          href={tenderHref}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
        >
          继续 Tender
        </Link>
        <Link
          href={quoteHref}
          className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white"
        >
          返回 Quote
        </Link>
      </div>

      {downloadError ? <p className="text-sm text-red-400">{downloadError}</p> : null}
    </section>
  );
}
