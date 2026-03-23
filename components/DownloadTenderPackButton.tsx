"use client";

import { useState } from "react";

type Props = {
  planId: string;
  className?: string;
  label?: string;
};

export default function DownloadTenderPackButton({
  planId,
  className = "",
  label = "下载企业招标版（32页）",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!planId || loading) return;

    try {
      setLoading(true);

      const tokenUrl = new URL("/api/download-token", window.location.origin);
      tokenUrl.searchParams.set("mode", "pack");
      tokenUrl.searchParams.set("planId", planId);

      const r = await fetch(tokenUrl.toString(), {
        method: "GET",
        cache: "no-store",
      });

      const data = await r.json().catch(() => null);

      if (!r.ok || !data?.ok || !data?.token) {
        alert(data?.message || "获取企业招标版下载凭证失败");
        return;
      }

      const pdfUrl = new URL("/api/tender-pack", window.location.origin);
      pdfUrl.searchParams.set("planId", planId);
      pdfUrl.searchParams.set("format", "merged");
      pdfUrl.searchParams.set("level", "enterprise");
      pdfUrl.searchParams.set("theme", "tender");
      pdfUrl.searchParams.set("watermark", "0");
      pdfUrl.searchParams.set("includeCover", "1");
      pdfUrl.searchParams.set("includeDeclaration", "1");
      pdfUrl.searchParams.set("packFooter", "1");
      pdfUrl.searchParams.set("downloadToken", data.token);

      window.location.href = pdfUrl.toString();
    } catch (err) {
      console.error("DOWNLOAD_TENDER_PACK_FAILED", err);
      alert("下载企业招标版失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        className ||
        "w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {loading ? "正在生成企业招标版..." : label}
    </button>
  );
}