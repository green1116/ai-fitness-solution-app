"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadBudgetPdf } from "@/components/documents/downloadBudgetPdf";
import { downloadQuotePdf } from "@/components/documents/downloadQuotePdf";
import { downloadTenderPack } from "@/components/documents/downloadTenderPack";
import { downloadTenderPdf } from "@/components/documents/downloadTenderPdf";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { VersionBadge } from "./VersionBadge";
import { useDocuments } from "./DocumentProvider";

const ARTIFACT_LABELS: Record<string, string> = {
  plan_pdf: "Plan PDF",
  budget_pdf: "Budget PDF",
  quote_pdf: "Quote PDF",
  merged_pdf: "Merged PDF",
  zip_package: "ZIP Package",
  tender_pack: "Tender Pack",
};

type DeliveryRowProps = {
  delivery: DeliveryRecord;
  showProject?: boolean;
};

export function DeliveryRow({ delivery, showProject = true }: DeliveryRowProps) {
  const { trackEvent } = useDocuments();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = () => {
    trackEvent("pdf_downloaded", {
      deliveryId: delivery.id,
      projectId: delivery.projectId,
      quoteId: delivery.quoteId,
      meta: { artifactType: delivery.artifactType },
    });
  };

  async function runDownload(task: () => Promise<void>) {
    if (downloading) return;
    handleDownload();
    setDownloading(true);
    setDownloadError("");
    try {
      await task();
    } catch (e) {
      const message = e instanceof Error ? e.message : "下载失败";
      setDownloadError(message);
      console.error("[DeliveryRow] download failed", e);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <li className="rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">
              {ARTIFACT_LABELS[delivery.artifactType] ?? delivery.artifactType}
            </span>
            <VersionBadge version={delivery.version} isLatest={delivery.isLatest} />
            <DeliveryStatusBadge status={delivery.status} />
          </div>
          {delivery.fileName ? (
            <p className="mt-1 truncate text-xs text-zinc-500">{delivery.fileName}</p>
          ) : null}
          {showProject && delivery.projectName ? (
            <p className="mt-1 text-xs text-zinc-400">
              项目：{delivery.projectName}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-600">
            {new Date(delivery.createdAt).toLocaleString()} · 下载 {delivery.downloadCount} 次
          </p>
          {downloadError ? (
            <p className="mt-2 text-xs text-red-400">{downloadError}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {delivery.quoteId ? (
            <Link
              href={`/documents/quotes/${delivery.quoteId}`}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium hover:border-zinc-500"
            >
              交付详情
            </Link>
          ) : null}
          <Link
            href={`/documents/projects/${delivery.projectId}`}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium hover:border-zinc-500"
          >
            项目包
          </Link>
          {delivery.artifactType === "quote_pdf" ? (
            <button
              type="button"
              onClick={() =>
                void runDownload(() =>
                  downloadQuotePdf(
                    delivery.projectId ?? "",
                    delivery.fileName ?? `quote-${delivery.quoteId?.slice(0, 8) ?? "export"}.pdf`,
                    delivery.quoteId,
                  ),
                )
              }
              disabled={downloading}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载"}
            </button>
          ) : delivery.artifactType === "budget_pdf" ? (
            <button
              type="button"
              onClick={() =>
                void runDownload(() =>
                  downloadBudgetPdf(
                    delivery.projectId ?? "",
                    delivery.fileName ?? `budget-${delivery.id.slice(0, 8)}.pdf`,
                  ),
                )
              }
              disabled={downloading || !delivery.projectId}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载"}
            </button>
          ) : delivery.artifactType === "tender_pack" || delivery.artifactType === "merged_pdf" ? (
            <button
              type="button"
              onClick={() =>
                void runDownload(() =>
                  downloadTenderPdf(
                    delivery.projectId ?? "",
                    delivery.fileName ?? "tender.pdf",
                  ),
                )
              }
              disabled={downloading || !delivery.projectId}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载 PDF"}
            </button>
          ) : delivery.artifactType === "zip_package" ? (
            <button
              type="button"
              onClick={() =>
                void runDownload(() =>
                  downloadTenderPack(
                    delivery.projectId ?? "",
                    delivery.fileName ?? "enterprise-package.zip",
                  ),
                )
              }
              disabled={downloading || !delivery.projectId}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载 ZIP"}
            </button>
          ) : delivery.projectId ? (
            <button
              type="button"
              onClick={() =>
                void runDownload(() =>
                  downloadTenderPdf(delivery.projectId ?? "", delivery.fileName ?? "tender.pdf"),
                )
              }
              disabled={downloading}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载"}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
