"use client";

import { useState } from "react";

export default function DownloadTenderPackButton({
  planId,
}: {
  planId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!planId || loading) return;

    try {
      setLoading(true);

      const tokenRes = await fetch(
        `/api/download-token?mode=pack&planId=${encodeURIComponent(planId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const raw = await tokenRes.text();
      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(`DOWNLOAD_TOKEN_BAD_JSON: ${raw || "(empty)"}`);
      }

      if (!tokenRes.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `DOWNLOAD_TOKEN_HTTP_${tokenRes.status}`
        );
      }

      const downloadToken =
        data?.token ||
        data?.downloadToken ||
        data?.data?.token ||
        data?.data?.downloadToken ||
        "";

      if (!downloadToken) {
        throw new Error(
          data?.message ||
            data?.error ||
            `DOWNLOAD_TOKEN_MISSING_FIELD: ${JSON.stringify(data)}`
        );
      }

      const url = new URL("/api/tender-pack", window.location.origin);
      url.searchParams.set("planId", planId);
      url.searchParams.set("format", "merged");
      url.searchParams.set("level", "enterprise");
      url.searchParams.set("theme", "tender");
      url.searchParams.set("watermark", "0");
      url.searchParams.set("includeCover", "1");
      url.searchParams.set("includeDeclaration", "1");
      url.searchParams.set("packFooter", "1");
      url.searchParams.set("downloadToken", downloadToken);

      window.location.href = url.toString();
    } catch (err: any) {
      console.error("DOWNLOAD_TENDER_PACK_FAILED", err);
      alert(err?.message || "获取企业招标版下载凭证失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? "正在生成企业招标版..." : "下载企业招标版（32页）"}
    </button>
  );
}