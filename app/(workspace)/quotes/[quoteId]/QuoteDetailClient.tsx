"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuoteResultCard } from "@/components/workspace/QuoteResultCard";
import { WorkspaceError } from "@/components/workspace/WorkspaceError";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

export default function QuoteDetailClient({ quoteId }: { quoteId: string }) {
  const { loading: ctxLoading } = useWorkspace();
  const [quote, setQuote] = useState<{
    id: string;
    projectId: string;
    status: string;
    project?: { name: string };
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workspace/quotes/${quoteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          setError(data.code === "NOT_FOUND" ? "Quote 不存在" : "加载失败");
          return;
        }
        setQuote(data.quote);
      })
      .catch(() => setError("网络错误"))
      .finally(() => setLoading(false));
  }, [quoteId]);

  if (ctxLoading || loading) return <WorkspaceLoading message="加载 Quote…" />;
  if (error) return <WorkspaceError message={error} />;
  if (!quote) return null;

  return (
    <div className="space-y-6">
      <Link href="/quotes" className="text-sm text-zinc-400 hover:text-white">
        ← 返回 Quotes
      </Link>
      <QuoteResultCard quoteId={quote.id} projectId={quote.projectId} />
      <section className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-400">
        <div>Status: {quote.status}</div>
        <div>Project: {quote.project?.name ?? quote.projectId}</div>
      </section>
    </div>
  );
}
