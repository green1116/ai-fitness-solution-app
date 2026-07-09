"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentEmptyState } from "@/components/documents/DocumentEmptyState";
import { DocumentError } from "@/components/documents/DocumentError";
import { DocumentLoading } from "@/components/documents/DocumentLoading";
import { DeliveryRow } from "@/components/documents/DeliveryRow";
import { DeliveryStatusBadge } from "@/components/documents/DeliveryStatusBadge";
import { downloadBudgetPdf } from "@/components/documents/downloadBudgetPdf";
import { downloadQuotePdf } from "@/components/documents/downloadQuotePdf";
import { downloadTenderPack } from "@/components/documents/downloadTenderPack";
import { downloadTenderPdf } from "@/components/documents/downloadTenderPdf";
import { useDocuments } from "@/components/documents/DocumentProvider";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";

type TenderPackSlot = DeliveryRecord | undefined;

type ProjectDocsPayload = {
  project: { id: string; name: string; clientName: string | null };
  tenderPack: {
    planPdf: TenderPackSlot;
    budgetPdf: TenderPackSlot;
    quotePdf: TenderPackSlot;
    mergedPdf: TenderPackSlot;
    zipPackage: TenderPackSlot;
    tenderPack: TenderPackSlot;
    history: DeliveryRecord[];
  };
  deliveries: DeliveryRecord[];
};

const PACK_SLOTS: { key: keyof ProjectDocsPayload["tenderPack"]; label: string }[] = [
  { key: "planPdf", label: "Plan PDF" },
  { key: "budgetPdf", label: "Budget PDF" },
  { key: "quotePdf", label: "Quote PDF" },
  { key: "mergedPdf", label: "Merged PDF" },
  { key: "zipPackage", label: "ZIP Package" },
  { key: "tenderPack", label: "Tender Pack" },
];

function SlotDownloadButton({
  slotKey,
  projectId,
  slot,
  onTrack,
}: {
  slotKey: string;
  projectId: string;
  slot: DeliveryRecord;
  onTrack: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setDownloading(true);
    setError("");
    onTrack();
    try {
      if (slotKey === "quotePdf") {
        await downloadQuotePdf(projectId, slot.fileName ?? "quote.pdf");
      } else if (slotKey === "budgetPdf") {
        await downloadBudgetPdf(projectId, slot.fileName ?? "budget.pdf");
      } else if (slotKey === "zipPackage") {
        await downloadTenderPack(projectId, slot.fileName ?? "enterprise-package.zip");
      } else {
        await downloadTenderPdf(projectId, slot.fileName ?? "tender.pdf");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "下载失败");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={downloading}
        onClick={() => void handleDownload()}
        className="inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
      >
        {downloading ? "下载中…" : slotKey === "zipPackage" ? "下载 ZIP" : "下载 PDF"}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export default function ProjectTenderPackPage() {
  const params = useParams<{ projectId: string }>();
  const { trackEvent } = useDocuments();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProjectDocsPayload | null>(null);

  useEffect(() => {
    if (!params.projectId) return;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/projects/${params.projectId}`);
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(res.status === 404 ? "项目不存在" : "加载失败");
          return;
        }
        setData(json);
        trackEvent("tender_pack_generated", { projectId: params.projectId });
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.projectId, trackEvent]);

  if (loading) return <DocumentLoading message="加载招投标交付包…" />;
  if (error) return <DocumentError message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/documents" className="text-sm text-zinc-400 hover:text-white">
          ← 文档中心
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{data.project.name}</h1>
        <p className="text-sm text-zinc-400">Tender Pack Center · {data.project.clientName ?? "—"}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PACK_SLOTS.map(({ key, label }) => {
          const slot = data.tenderPack[key] as TenderPackSlot;
          if (key === "history") return null;
          return (
            <div key={key} className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
              {slot ? (
                <div className="mt-3 space-y-2">
                  <DeliveryStatusBadge status={slot.status} />
                  <p className="text-xs text-zinc-500">{slot.fileName}</p>
                  {slot.projectId || data.project.id ? (
                    <SlotDownloadButton
                      slotKey={key}
                      projectId={data.project.id}
                      slot={slot}
                      onTrack={() =>
                        trackEvent("pdf_downloaded", {
                          projectId: data.project.id,
                          deliveryId: slot.id,
                        })
                      }
                    />
                  ) : (
                    <span className="text-xs text-zinc-600">尚未生成</span>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">暂无</p>
              )}
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">全部交付物</h2>
        {data.deliveries.length === 0 ? (
          <DocumentEmptyState
            title="该项目暂无交付物"
            description="生成 Quote 或 Tender 后，交付记录将按项目聚合展示。"
            actionLabel="生成 Quote"
            actionHref={`/quote?projectId=${data.project.id}`}
          />
        ) : (
          <ul className="space-y-3">
            {data.deliveries.map((d) => (
              <DeliveryRow key={d.id} delivery={d} showProject={false} />
            ))}
          </ul>
        )}
      </section>

      {data.tenderPack.history.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">历史版本</h2>
          <ul className="space-y-3">
            {data.tenderPack.history.map((d) => (
              <DeliveryRow key={d.id} delivery={d} showProject={false} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
