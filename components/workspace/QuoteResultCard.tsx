"use client";

import Link from "next/link";
import { useWorkspace } from "./WorkspaceProvider";

type QuoteResultCardProps = {
  quoteId: string;
  projectId?: string;
};

export function QuoteResultCard({ quoteId, projectId }: QuoteResultCardProps) {
  const { currentProject, trackEvent } = useWorkspace();
  const resolvedProjectId = projectId ?? currentProject?.id;

  return (
    <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Quote Generated</p>
      <h2 className="mt-2 text-xl font-bold text-white">方案已生成</h2>
      <p className="mt-1 font-mono text-sm text-emerald-200/80">{quoteId}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/quotes/${quoteId}`}
          onClick={() => trackEvent("quote_viewed", { quoteId, projectId: resolvedProjectId })}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          View Quote
        </Link>
        {resolvedProjectId ? (
          <Link
            href={`/tender?projectId=${encodeURIComponent(resolvedProjectId)}`}
            onClick={() => trackEvent("pdf_downloaded", { quoteId, projectId: resolvedProjectId })}
            className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
          >
            Download PDF
          </Link>
        ) : null}
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
          href="/dashboard"
          className="rounded-xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-900/30"
        >
          Back To Workspace
        </Link>
      </div>
    </section>
  );
}
