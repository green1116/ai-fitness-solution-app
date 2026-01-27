"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default function ResultPage() {
  const sp = useSearchParams();
  const planId = sp.get("planId") || "";

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>方案已生成</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <DownloadPdfButton
          planId={planId}
          mode="full"
          className="px-4 py-2 rounded bg-black text-white"
        >
          下载完整版 PDF
        </DownloadPdfButton>

        <a
          className="px-4 py-2 rounded border"
          href={`/api/pdf?planId=${encodeURIComponent(planId)}&mode=preview`}
          target="_blank"
          rel="noreferrer"
        >
          下载预览版（免门禁）
        </a>
      </div>

      <div style={{ marginTop: 16, color: "#666" }}>
        planId：{planId || "（未提供）"}
      </div>
    </div>
  );
}

