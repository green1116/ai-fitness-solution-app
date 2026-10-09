"use client";

import { useState } from "react";

export const SAVED_BUDGET_PDF_ENDPOINT = "/api/pdf/tender/budget";

export type SavedBudgetPdfInput = {
  organizationId: string;
  projectId: string;
  budgetId: string;
  budgetTier: "low" | "mid" | "high" | null;
  companySize: number | null;
};

/** The PDF route renders exactly this budgetId (it must belong to projectId); tier / headcount are header metadata. */
export function savedBudgetPdfRequestBody(input: SavedBudgetPdfInput) {
  return {
    projectId: input.projectId,
    planId: input.projectId,
    budgetId: input.budgetId,
    ...(input.budgetTier ? { budgetTier: input.budgetTier } : {}),
    ...(input.companySize ? { companySize: input.companySize } : {}),
  };
}

const ERROR_BY_CODE: Record<string, string> = {
  BUDGET_NOT_FOUND: "未找到该预算，请返回历史预算列表刷新后重试。",
  BUDGET_PROJECT_MISMATCH: "该预算不属于当前项目，请返回项目页重新进入。",
  TENANT_ISOLATION: "当前项目不属于你的组织，无法下载预算 PDF。",
  BUDGET_NOT_ENTITLED: "当前套餐不包含预算 PDF 下载，请升级专业版后重试。",
  RATE_LIMITED: "下载过于频繁，请稍后再试。",
  PROJECT_NOT_FOUND: "项目不存在或已被删除，请返回项目列表。",
};

/** Fixed Chinese copy; server messages are never shown. */
export function savedBudgetPdfErrorMessage(status: number, body: unknown): string {
  const code = body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string"
    ? (body as { error: string }).error
    : "";
  if (ERROR_BY_CODE[code]) return `预算 PDF 下载失败：${ERROR_BY_CODE[code]}`;
  if (status === 401) return "预算 PDF 下载失败：登录已失效，请重新登录后重试。";
  if (status === 403) return "预算 PDF 下载失败：当前账号无权下载该预算 PDF。";
  return "预算 PDF 下载失败，请稍后重试。";
}

export function savedBudgetPdfFileName(budgetId: string): string {
  return `budget-${budgetId.slice(0, 8)}.pdf`;
}

export async function requestSavedBudgetPdf(
  input: SavedBudgetPdfInput,
  fetcher: typeof fetch = fetch,
): Promise<{ ok: true; blob: Blob } | { ok: false; error: string }> {
  try {
    const res = await fetcher(SAVED_BUDGET_PDF_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-organization-id": input.organizationId },
      body: JSON.stringify(savedBudgetPdfRequestBody(input)),
    });
    if (!res.ok) {
      return { ok: false, error: savedBudgetPdfErrorMessage(res.status, await res.json().catch(() => null)) };
    }
    const blob = await res.blob();
    if (!(res.headers.get("content-type") ?? "").includes("application/pdf") || blob.size === 0) {
      return { ok: false, error: "预算 PDF 下载失败：服务器未返回有效的 PDF 文件，请稍后重试。" };
    }
    return { ok: true, blob };
  } catch {
    return { ok: false, error: "预算 PDF 下载失败，请检查网络后重试。" };
  }
}

/** The anchor must be attached for Firefox, and the object URL must outlive the click. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

export function SavedBudgetPdfButton(props: SavedBudgetPdfInput) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    const res = await requestSavedBudgetPdf(props);
    setBusy(false);
    if (res.ok) triggerBlobDownload(res.blob, savedBudgetPdfFileName(props.budgetId));
    else setError(res.error);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void download()}
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {busy ? "正在生成 PDF…" : "下载该预算 PDF"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
