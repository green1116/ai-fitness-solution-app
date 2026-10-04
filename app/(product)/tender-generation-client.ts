/**
 * Tender page → POST generateTender. A Tender is only requested for an explicit
 * projectId + quoteId + budgetId; binding errors from the server are shown as concrete reasons.
 */
export type TenderGenerationContext = {
  projectId: string;
  quoteId: string;
  budgetId: string;
  organizationId: string;
};

export type TenderGenerationOutcome =
  | { ok: true; tenderId: string }
  | { ok: false; code: string; message: string };

export const TENDER_GENERATION_FALLBACK_MESSAGE = "投标文件生成失败，请稍后重试";

const TENDER_GENERATION_ERROR_MESSAGES: Record<string, string> = {
  PROJECT_REQUIRED: "无法确认当前项目，请返回项目页重新进入。",
  QUOTE_REQUIRED: "当前缺少方案信息，请先完成方案与预算。",
  BUDGET_ID_REQUIRED: "当前方案尚未生成预算，请先生成预算后再生成投标文件。",
  BUDGET_QUOTE_MISMATCH: "预算不是基于当前方案版本计算的，请为当前方案重新计算预算。",
  QUOTE_NOT_READY: "方案尚未就绪，请稍后刷新或重新生成方案。",
  QUOTE_PROJECT_MISMATCH: "方案不属于当前项目，请返回项目页重新进入。",
  BUDGET_PROJECT_MISMATCH: "预算不属于当前项目，请返回项目页重新进入。",
};

/** Codes whose remedy is (re)calculating the Budget for the current Quote. */
export const TENDER_BUDGET_REMEDY_CODES = new Set(["BUDGET_ID_REQUIRED", "BUDGET_QUOTE_MISMATCH"]);

export function tenderGenerationErrorMessage(code: string | undefined): string {
  return (code && TENDER_GENERATION_ERROR_MESSAGES[code]) || TENDER_GENERATION_FALLBACK_MESSAGE;
}

export function missingTenderGenerationContext(
  ctx: Pick<TenderGenerationContext, "projectId" | "quoteId" | "budgetId">,
): { code: "PROJECT_REQUIRED" | "QUOTE_REQUIRED" | "BUDGET_ID_REQUIRED"; message: string } | null {
  const code = !ctx.projectId.trim()
    ? "PROJECT_REQUIRED"
    : !ctx.quoteId.trim()
      ? "QUOTE_REQUIRED"
      : !ctx.budgetId.trim()
        ? "BUDGET_ID_REQUIRED"
        : null;
  return code ? { code, message: tenderGenerationErrorMessage(code) } : null;
}

export async function submitTenderGeneration(
  endpoint: string,
  ctx: TenderGenerationContext,
  fetchImpl: typeof fetch = fetch,
): Promise<TenderGenerationOutcome> {
  const missing = missingTenderGenerationContext(ctx);
  if (missing) return { ok: false, ...missing };

  const organizationId = ctx.organizationId.trim();
  const res = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(organizationId ? { "x-organization-id": organizationId } : {}),
    },
    body: JSON.stringify({
      projectId: ctx.projectId.trim(),
      quoteId: ctx.quoteId.trim(),
      budgetId: ctx.budgetId.trim(),
      ...(organizationId ? { organizationId } : {}),
    }),
  });
  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    code?: string;
    tenderId?: string;
  } | null;
  const tenderId = typeof data?.tenderId === "string" ? data.tenderId.trim() : "";
  if (res.ok && data?.ok === true && tenderId) return { ok: true, tenderId };
  const code = typeof data?.code === "string" ? data.code : "";
  return { ok: false, code, message: tenderGenerationErrorMessage(code) };
}
