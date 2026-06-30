"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { downloadQuotePdf } from "@/components/documents/downloadQuotePdf";
import { DocumentEmptyState } from "@/components/documents/DocumentEmptyState";
import { DocumentError } from "@/components/documents/DocumentError";
import { DocumentLoading } from "@/components/documents/DocumentLoading";
import { DeliveryRow } from "@/components/documents/DeliveryRow";
import { DeliveryStatusBadge } from "@/components/documents/DeliveryStatusBadge";
import { VersionBadge } from "@/components/documents/VersionBadge";
import { useDocuments } from "@/components/documents/DocumentProvider";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";

type QuoteDocsPayload = {
  quote: {
    id: string;
    status: string;
    projectId: string;
    projectName: string;
    createdAt: string;
  };
  deliveries: DeliveryRecord[];
  latest?: DeliveryRecord;
  history: DeliveryRecord[];
};

export default function QuoteDeliveryPage() {
  const params = useParams<{ quoteId: string }>();
  const { trackEvent } = useDocuments();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuoteDocsPayload | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!params.quoteId) return;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/quotes/${params.quoteId}`);
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(res.status === 404 ? "Quote 不存在" : "加载失败");
          return;
        }
        setData(json);
        trackEvent("document_viewed", { quoteId: params.quoteId, projectId: json.quote.projectId });
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.quoteId, trackEvent]);

  if (loading) return <DocumentLoading message="加载交付中心…" />;
  if (error) return <DocumentError message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/documents/quotes" className="text-sm text-zinc-400 hover:text-white">
          ← Quote 文档
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Delivery Center</h1>
        <p className="mt-1 font-mono text-sm text-zinc-400">{data.quote.id}</p>
        <p className="text-sm text-zinc-500">
          项目：{data.quote.projectName} ·{" "}
          <DeliveryStatusBadge status={data.quote.status === "DRAFT" ? "pending" : "ready"} />
        </p>
        <div className="mt-4">
          <button
            type="button"
            disabled={downloading}
            onClick={() => {
              trackEvent("pdf_downloaded", {
                quoteId: data.quote.id,
                projectId: data.quote.projectId,
              });
              setDownloading(true);
              void downloadQuotePdf(
                data.quote.projectId ?? "",
                `quote-${data.quote.id.slice(0, 8)}.pdf`,
                data.quote.id,
              )
                .catch((e) => console.error("[QuoteDelivery] pdf download failed", e))
                .finally(() => setDownloading(false));
            }}
            className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
          >
            {downloading ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      </div>

      {data.latest ? (
        <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6">
          <p className="text-xs uppercase tracking-widest text-emerald-400">当前最新版本</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <VersionBadge version={data.latest.version} isLatest />
            <DeliveryStatusBadge status={data.latest.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.latest ? (
              <button
                type="button"
                disabled={downloading}
                onClick={() => {
                  trackEvent("pdf_downloaded", {
                    quoteId: data.quote.id,
                    projectId: data.quote.projectId,
                    deliveryId: data.latest!.id,
                  });
                  setDownloading(true);
                  void downloadQuotePdf(
                    data.quote.projectId ?? "",
                    data.latest.fileName ?? `quote-${data.quote.id.slice(0, 8)}.pdf`,
                    data.quote.id,
                  )
                    .catch((e) => console.error("[QuoteDelivery] pdf download failed", e))
                    .finally(() => setDownloading(false));
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                {downloading ? "生成中…" : "下载最新 PDF"}
              </button>
            ) : null}
            <Link
              href={`/documents/projects/${data.quote.projectId}`}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold"
            >
              查看项目交付包
            </Link>
            <Link
              href={`/quotes/${data.quote.id}`}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold"
            >
              返回 Quote
            </Link>
          </div>
        </section>
      ) : (
        <DocumentEmptyState
          title="暂无交付记录"
          description="该 Quote 尚未注册交付物，生成后将自动出现在此处。"
          actionLabel="查看 Workspace Quote"
          actionHref={`/quotes/${data.quote.id}`}
        />
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">全部交付物</h2>
        {data.deliveries.length === 0 ? (
          <p className="text-sm text-zinc-500">无记录</p>
        ) : (
          <ul className="space-y-3">
            {data.deliveries.map((d) => (
              <DeliveryRow key={d.id} delivery={d} />
            ))}
          </ul>
        )}
      </section>

      {data.history.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">历史版本（Archived）</h2>
          <ul className="space-y-3">
            {data.history.map((d) => (
              <DeliveryRow key={d.id} delivery={d} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
