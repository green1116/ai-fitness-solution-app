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

function friendlyMessage(status: number, code?: string, message?: string) {
  const c = (code || "").toUpperCase();

  // 你的 download-token 现在会返回这些
  if (status === 401 || c === "LOGIN_REQUIRED") return "请先登录/完成验证码验证后再下载。";
  if (status === 402 || c === "PAYMENT_REQUIRED") return "未检测到已支付订单，请先完成支付。";
  if (status === 403 && c === "LICENSE_EXHAUSTED") return "下载次数已用完。如需更多次数，请重新购买。";
  if (status === 403 && c === "LICENSE_EXPIRED") return "License 已过期，请重新购买。";
  if (status === 403 && c === "LICENSE_PLAN_MISMATCH") return "License 与当前方案不匹配。";

  // 其他情况兜底
  return message || `请求失败（${status}）`;
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
    const tokenUrl = `/api/download-token?planId=${encodeURIComponent(planId)}&mode=${encodeURIComponent(mode)}`;

    const tokenRes = await fetch(tokenUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const text = await tokenRes.text().catch(() => "");
    let data: any = {};
    try {
      data = JSON.parse(text || "{}");
    } catch {
      data = {};
    }

    if (!tokenRes.ok) {
      const msg = friendlyMessage(tokenRes.status, data?.code, data?.message);
      alert(msg + (data?.code ? `\n（${data.code}）` : ""));
      throw new Error(`token failed ${tokenRes.status} ${data?.code || ""}`);
    }

    const downloadToken = data?.downloadToken;
    if (!downloadToken) {
      alert("服务端未返回 downloadToken（请检查 /api/download-token 输出）");
      throw new Error("missing downloadToken");
    }

    return downloadToken as string;
  }

  async function downloadPlanPdfV4(downloadToken: string) {
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
      alert(`方案 PDF 生成失败（${res.status}）\n${text}`);
      throw new Error(`plan generate failed ${res.status}`);
    }

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    const base64 = data?.data?.pdf?.base64;
    const fileName = data?.data?.pdf?.fileName || `${planId}-方案V4.pdf`;
    if (!base64) {
      alert("方案 PDF 返回缺失 base64 字段");
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

    const pdfRes = await fetch(pdfUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!pdfRes.ok) {
      const body = await pdfRes.text().catch(() => "");
      alert(`预算 PDF 下载失败（${pdfRes.status}）\n${body}`);
      throw new Error(`budget pdf failed ${pdfRes.status}`);
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
      if (mode === "full") await downloadPlanPdfV4(downloadToken);
      else await downloadBudgetPdf(downloadToken);
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
        {downloadingPlan ? "下载中..." : "下载方案 PDF"}
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
