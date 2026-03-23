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

      // ✅ 第一步：获取 token
      const tokenRes = await fetch(
        `/api/download-token?mode=pack&planId=${planId}`,
        { cache: "no-store" }
      );

      const tokenData = await tokenRes.json();

      if (!tokenData?.ok || !tokenData?.token) {
        throw new Error("TOKEN_FETCH_FAILED");
      }

      const token = tokenData.token;

      // ✅ 第二步：拼接下载 URL
      const url = `/api/tender-pack?planId=${planId}&format=merged&level=enterprise&theme=tender&watermark=0&includeCover=1&includeDeclaration=1&packFooter=1&downloadToken=${token}`;

      // ✅ 第三步：触发下载
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("获取企业招标版下载凭证失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? "正在生成企业招标版..." : "下载企业招标版（32页）"}
    </button>
  );
}