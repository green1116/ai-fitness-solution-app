/**
 * C.1 — Over-Budget Adjustment browser orchestration (pure, client-safe; IO is injected).
 *
 * One submit-eligibility result drives both the confirm button and the click handler.
 * A new Quote version becomes current only after its persisted quantities are re-read
 * and equal the approved quantities; until then drafts and projections are unsaved estimates.
 */
import type { ProductSelection } from "@/lib/product-engine/product-intelligence";
import type { ApprovedQuantities } from "./over-budget-adjustment";

export const UNSAVED_ESTIMATE_LABEL = "预估（未保存）";

export type AdjustmentSubmitInput = {
  quoteId: string;
  organizationId: string;
  projectId: string;
  budgetDetailQuoteId: string | null;
  piSnapshotQuoteId: string | null;
  optionCount: number;
  approvedOk: boolean;
  approvedCount: number;
  loading: boolean;
  applying: boolean;
};

export type AdjustmentSubmitState = { ok: true } | { ok: false; reason: string };

export function resolveAdjustmentSubmitState(input: AdjustmentSubmitInput): AdjustmentSubmitState {
  const quoteId = input.quoteId.trim();
  if (input.applying) return { ok: false, reason: "正在保存调整，请稍候…" };
  if (input.loading) {
    return { ok: false, reason: "预算计算进行中，完成后才能确认调整。" };
  }
  if (!input.organizationId.trim()) {
    return { ok: false, reason: "未识别当前组织，无法保存调整。请刷新页面后重试。" };
  }
  if (!input.projectId.trim()) {
    return { ok: false, reason: "未识别当前项目，无法保存调整。请从项目页重新进入预算。" };
  }
  if (!quoteId || input.budgetDetailQuoteId !== quoteId || input.piSnapshotQuoteId !== quoteId) {
    return {
      ok: false,
      reason: "数量调整依据与当前方案不一致，请点击「按当前方案与预算设置重新计算预算」后再调整。",
    };
  }
  if (input.optionCount === 0) {
    return { ok: false, reason: "当前方案没有可调整数量的器材。" };
  }
  if (!input.approvedOk) return { ok: false, reason: "请先修正上方填写的数量。" };
  if (input.approvedCount === 0) {
    return { ok: false, reason: "请至少为一项器材填写调整后的数量。" };
  }
  return { ok: true };
}

/** status null = the request never completed (network / fetch rejection). */
export function describeAdjustmentSaveFailure(input: {
  status: number | null;
  message?: string;
}): string {
  const message = input.message?.trim() ?? "";
  const unchanged = "当前方案未改变";
  if (input.status == null) {
    return `保存调整失败：网络异常，请求未完成。${unchanged}，请检查网络后重试。`;
  }
  if (input.status === 401) return `保存调整失败：登录已失效，请重新登录后重试。${unchanged}。`;
  if (input.status === 403) {
    return `保存调整失败：当前账号或套餐无权保存新方案版本${message ? `（${message}）` : ""}。${unchanged}。`;
  }
  if (input.status === 429) return `保存调整失败：操作过于频繁，请稍后重试。${unchanged}。`;
  if (input.status === 400) {
    return `保存调整失败：${message || "提交的产品配置未通过校验"}。${unchanged}，请前往方案页检查产品配置。`;
  }
  if (input.status === 404 || input.status === 409) {
    return `保存调整失败：${message || "当前方案状态已变化"}。${unchanged}，请重新计算预算后再调整。`;
  }
  if (input.status >= 200 && input.status < 300) {
    return `保存调整失败：服务器未返回可用的新方案版本。${unchanged}，请稍后重试。`;
  }
  return `保存调整失败（${input.status}）${message ? `：${message}` : ""}。${unchanged}，请稍后重试。`;
}

export type PersistedQuoteSnapshot = {
  quoteId: string;
  selections: ProductSelection[];
};

export type PersistenceCheck = { ok: true } | { ok: false; reason: string };

export function verifyPersistedAdjustment(input: {
  expectedQuoteId: string;
  snapshot: PersistedQuoteSnapshot | null;
  approved: ApprovedQuantities;
}): PersistenceCheck {
  const notSwitched = "当前方案未切换，请刷新页面后在方案页核对。";
  if (!input.snapshot) {
    return { ok: false, reason: `已提交新方案版本，但无法读取其保存结果。${notSwitched}` };
  }
  if (input.snapshot.quoteId !== input.expectedQuoteId) {
    return { ok: false, reason: `已提交新方案版本，但读取到的方案版本不一致。${notSwitched}` };
  }
  const bySlot = new Map(input.snapshot.selections.map((s) => [s.slotKey, s]));
  for (const [slotKey, quantity] of Object.entries(input.approved)) {
    const stored = bySlot.get(slotKey);
    if (!stored || stored.action === "remove" || stored.quantity !== quantity) {
      return {
        ok: false,
        reason: `已提交新方案版本，但保存的数量与确认数量不一致（确认 ${quantity}，读取到 ${stored?.quantity ?? "无"}）。${notSwitched}`,
      };
    }
  }
  return { ok: true };
}

export type AdjustmentSaveResult = {
  status: number;
  nextQuoteId: string;
  projectId: string;
  message: string;
};

export type AdjustmentApplyEffects = {
  approved: ApprovedQuantities;
  /** Rejects only when the request did not complete. */
  saveNewVersion(): Promise<AdjustmentSaveResult>;
  readPersistedSnapshot(nextQuoteId: string, projectId: string): Promise<PersistedQuoteSnapshot | null>;
  commitVerifiedQuote(nextQuoteId: string, projectId: string): void;
  recalculate(nextQuoteId: string): Promise<boolean>;
};

export type AdjustmentApplyOutcome =
  | { stage: "save_failed"; message: string }
  | { stage: "verify_failed"; message: string }
  | { stage: "recalculate_failed"; quoteId: string }
  | { stage: "done"; quoteId: string };

export async function runAdjustmentApply(
  effects: AdjustmentApplyEffects,
): Promise<AdjustmentApplyOutcome> {
  let saved: AdjustmentSaveResult;
  try {
    saved = await effects.saveNewVersion();
  } catch {
    return { stage: "save_failed", message: describeAdjustmentSaveFailure({ status: null }) };
  }
  if (!saved.nextQuoteId) {
    return {
      stage: "save_failed",
      message: describeAdjustmentSaveFailure({ status: saved.status, message: saved.message }),
    };
  }

  const snapshot = await effects
    .readPersistedSnapshot(saved.nextQuoteId, saved.projectId)
    .catch(() => null);
  const check = verifyPersistedAdjustment({
    expectedQuoteId: saved.nextQuoteId,
    snapshot,
    approved: effects.approved,
  });
  if (!check.ok) return { stage: "verify_failed", message: check.reason };

  effects.commitVerifiedQuote(saved.nextQuoteId, saved.projectId);
  const recalculated = await effects.recalculate(saved.nextQuoteId).catch(() => false);
  return recalculated
    ? { stage: "done", quoteId: saved.nextQuoteId }
    : { stage: "recalculate_failed", quoteId: saved.nextQuoteId };
}

export type AdjustmentOutcomeMessages = { notice: string; warning: string; error: string };

export function adjustmentOutcomeMessages(outcome: AdjustmentApplyOutcome): AdjustmentOutcomeMessages {
  if (outcome.stage === "done") {
    return { notice: "已保存为新方案版本，并按新方案重新计算预算。", warning: "", error: "" };
  }
  if (outcome.stage === "recalculate_failed") {
    return {
      notice: "",
      warning:
        "新方案版本已保存（已核对保存数量），但预算尚未按新方案重新计算，旧预算已不再作为当前预算显示。请点击「按当前方案计算预算」重试。",
      error: "",
    };
  }
  return { notice: "", warning: "", error: outcome.message };
}
