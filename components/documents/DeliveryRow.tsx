"use client";

import Link from "next/link";
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

  const handleDownload = () => {
    trackEvent("pdf_downloaded", {
      deliveryId: delivery.id,
      projectId: delivery.projectId,
      quoteId: delivery.quoteId,
      meta: { artifactType: delivery.artifactType },
    });
  };

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
          {delivery.downloadUrl ? (
            <a
              href={delivery.downloadUrl}
              onClick={handleDownload}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              下载
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
