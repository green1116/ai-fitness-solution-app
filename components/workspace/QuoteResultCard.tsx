"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadQuotePdf } from "@/components/documents/downloadQuotePdf";
import { useWorkspace } from "./WorkspaceProvider";

type QuoteResultCardProps = {
  quoteId: string;
  projectId?: string;
};

export function QuoteResultCard({ quoteId, projectId }: QuoteResultCardProps) {
  const { currentProject, trackEvent } = useWorkspace();
  const [resolvedProjectId, setResolvedProjectId] = useState(
    projectId ?? currentProject?.id,
  );
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/workspace/quotes/${encodeURIComponent(quoteId)}`)
      .then((r) => r.json())
      .then((data: { ok?: boolean; quote?: { projectId?: string } }) => {
        if (!cancelled && data.ok && data.quote?.projectId) {
          setResolvedProjectId(data.quote.projectId);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  async function handleDownloadPdf() {
    if (downloading) return;
    setDownloadError("");
    setDownloading(true);
    trackEvent("pdf_downloaded", { quoteId, projectId: resolvedProjectId });
    try {
      await downloadQuotePdf(
        resolvedProjectId ?? "",
        `quote-${quoteId.slice(0, 8)}.pdf`,
        quoteId,
      );
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "PDF 下载失败");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Quote Generated</p>
      <h2 className="mt-2 text-xl font-bold text-white">方案已生成</h2>
      <p className="mt-1 font-mono text-sm text-emerald-200/80">{quoteId}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/documents/quotes/${quoteId}`}
          onClick={() => trackEvent("quote_viewed", { quoteId, projectId: resolvedProjectId })}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          Delivery Center
        </Link>
        <Link
          href={`/quotes/${quoteId}`}
          onClick={() => trackEvent("quote_viewed", { quoteId, projectId: resolvedProjectId })}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          View Quote
        </Link>
        <button
          type="button"
          onClick={() => void handleDownloadPdf()}
          disabled={downloading}
          className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? "Downloading…" : "Download PDF"}
        </button>
        {resolvedProjectId ? (
          <Link
            href={`/projects/${resolvedProjectId}`}
            className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
          >
            Edit Project
          </Link>
        ) : null}
        <Link
          href="/projects"
          className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
        >
          Create New Project
        </Link>
        <Link
          href="/documents"
          className="rounded-xl border border-sky-800 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-900/30"
        >
          Document Center
        </Link>
      </div>
      {downloadError ? <p className="mt-3 text-sm text-red-400">{downloadError}</p> : null}
    </section>
  );
}
