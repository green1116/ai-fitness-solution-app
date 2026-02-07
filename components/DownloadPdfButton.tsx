"use client";
import { useState } from "react";

type Props = {
  planId: string;

  // 预算 PDF 参数
  companyName?: string;
  companySize?: 50 | 100 | 200;
  budgetTier?: "low" | "mid" | "high";
};

function budgetTierToRange(tier: "low" | "mid" | "high") {
  if (tier === "low") return "≤10万";
  if (tier === "high") return "≥20万";
  return "10-20万";
}

function downloadBase64Pdf(base64: string, fileName: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export default function DownloadPdfButton({
  planId,
  companyName = "未命名企业",
  companySize = 100,
  budgetTier = "mid",
}: Props) {
  const [downloadingPlan, setDownloadingPlan] = useState(false);
  const [downloadingBudget, setDownloadingBudget] = useState(false);

  async function getDownloadToken(mode: "full" | "budget") {
    const tokenUrl = `/api/download-token?planId=${encodeURIComponent(planId)}&mode=${encodeURIComponent(
      mode
    )}`;
    console.info("[Download] requesting token", tokenUrl);

    const tokenRes = await fetch(tokenUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const tokenText = await tokenRes.text().catch(() => "");
    console.info("[Download] tokenRes.status", tokenRes.status, "body:", tokenText);

    if (!tokenRes.ok) {
      alert(`获取 token 失败 ${tokenRes.status}:\n${tokenText}`);
      throw new Error("获取 token 失败");
    }

    let tokenJson: any = {};
    try {
      tokenJson = JSON.parse(tokenText || "{}");
    } catch {
      tokenJson = {};
    }

    const downloadToken = tokenJson?.downloadToken;
    if (!downloadToken) {
      alert("token 返回缺失 downloadToken 字段:\n" + tokenText);
      throw new Error("没有 downloadToken");
    }
    return downloadToken as string;
  }

  async function downloadPlanPdfV4(downloadToken: string) {
    console.info("[V4] generating bundle pdf via /api/v1/plan/generate", { planId });

    const res = await fetch("/api/v1/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({
        planId,
        requireToken: true,
        downloadToken,
        options: { includePdf: true, includeCompare: true },

        // 这段可选：用于减少 usedDefaults，提升输出贴合度
        company: {
          planId,
          industry: "互联网",
          companySize,
          areaSize: 120,
          budgetRange: budgetTierToRange(budgetTier),
        },
      }),
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("[V4] generate failed", res.status, text);
      alert(`方案 PDF（V4）生成失败 ${res.status}:\n${text}`);
      throw new Error(`V4 generate failed ${res.status}`);
    }

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    const base64 = data?.data?.pdf?.base64;
    const fileName = data?.data?.pdf?.fileName || `${planId}-方案V4.pdf`;

    console.info("[V4] generate ok", {
      usedDefaults: data?.data?.usedDefaults,
      hasBase64: Boolean(base64),
      fileName,
    });

    if (!base64) {
      alert("方案 PDF 返回缺失 base64 字段:\n" + text);
      throw new Error("missing pdf.base64");
    }

    downloadBase64Pdf(base64, fileName);
  }

  async function downloadBudgetPdf(downloadToken: string) {
    const pdfUrl = `/api/budget-pdf?planId=${encodeURIComponent(planId)}&companyName=${encodeURIComponent(
      companyName
    )}&companySize=${encodeURIComponent(String(companySize))}&budgetTier=${encodeURIComponent(
      budgetTier
    )}&downloadToken=${encodeURIComponent(downloadToken)}`;

    console.info("[Download] requesting budget pdf", pdfUrl);

    const pdfRes = await fetch(pdfUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!pdfRes.ok) {
      const body = await pdfRes.text().catch(() => "");
      console.error("[Download] budget pdf failed", pdfRes.status, body);
      alert(`预算 PDF 下载失败 ${pdfRes.status}:\n${body}`);
      throw new Error(`预算 PDF 下载失败 ${pdfRes.status}`);
    }

    const blob = await pdfRes.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${planId}-预算.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  async function handleDownload(mode: "full" | "budget") {
    const setLoading = mode === "full" ? setDownloadingPlan : setDownloadingBudget;
    setLoading(true);

    try {
      const downloadToken = await getDownloadToken(mode);

      if (mode === "full") {
        // ✅ 方案：强制走 V4
        await downloadPlanPdfV4(downloadToken);
      } else {
        // ✅ 预算：保持旧链路
        await downloadBudgetPdf(downloadToken);
      }
    } catch (err) {
      console.error("[Download error]", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleDownload("full")}
        disabled={downloadingPlan}
        className="px-6 py-3 rounded-xl bg-black text-white disabled:opacity-60"
      >
        {downloadingPlan ? "下载中..." : "下载方案 PDF（V4）"}
      </button>

      <button
        onClick={() => handleDownload("budget")}
        disabled={downloadingBudget}
        className="px-6 py-3 rounded-xl bg-black text-white disabled:opacity-60"
      >
        {downloadingBudget ? "下载中..." : "下载预算 PDF"}
      </button>
    </div>
  );
}
