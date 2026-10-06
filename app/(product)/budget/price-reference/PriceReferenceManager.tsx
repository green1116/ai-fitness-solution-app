"use client";

import { useEffect, useState } from "react";

import {
  ESTIMATE_PRICE_TIERS,
  ESTIMATE_SUBCATEGORIES,
  MAX_ESTIMATE_SOURCE_NOTE_LENGTH,
  MAX_ESTIMATE_UNIT_PRICE,
} from "@/lib/budget/estimate-price-reference";
import type { PriceBand } from "@/lib/domain/tender";
import type { OrganizationPriceReferenceView } from "@/lib/services/organization-price-reference.service";

export const PRICE_REFERENCES_API = "/api/organization-price-references";

export const PRICE_TIER_LABEL: Record<PriceBand, string> = {
  low: "LOW · 基础",
  mid: "MID · 标准",
  high: "HIGH · 高端",
};

export const PLATFORM_ESTIMATE_TEXT = "使用平台通用估算";

/** Registry rows grouped by category, in registry order. */
export const PRICE_REFERENCE_GROUPS = ESTIMATE_SUBCATEGORIES.reduce<
  Array<{ category: string; subcategories: Array<(typeof ESTIMATE_SUBCATEGORIES)[number]> }>
>((groups, entry) => {
  const last = groups[groups.length - 1];
  if (last && last.category === entry.category) last.subcategories.push(entry);
  else groups.push({ category: entry.category, subcategories: [entry] });
  return groups;
}, []);

export const cellKey = (subcategoryKey: string, tier: PriceBand) => `${subcategoryKey}|${tier}`;

export type PriceReferenceDraft = {
  subcategoryKey: string;
  budgetTier: PriceBand;
  unitPriceMin: string;
  unitPriceMax: string;
  sourceNote: string;
};

export type PriceReferencePutBody = {
  subcategoryKey: string;
  budgetTier: PriceBand;
  unitPriceMin: number;
  unitPriceMax: number;
  sourceNote: string;
};

const CONTROL_CHAR_RE = /[\u0000-\u001f\u007f]/;

export function sourceNoteLength(note: string): number {
  return note.trim().length;
}

export function formatYuanRange(min: number, max: number): string {
  return `¥${min.toLocaleString("en-US")}–¥${max.toLocaleString("en-US")}`;
}

/** Client-side assistance only; the API remains the authoritative validator. */
export function validatePriceReferenceDraft(
  draft: PriceReferenceDraft,
): { ok: true; body: PriceReferencePutBody } | { ok: false; error: string } {
  const parse = (value: string) => (/^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN);
  const min = parse(draft.unitPriceMin);
  const max = parse(draft.unitPriceMax);
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 1 || max < 1) {
    return { ok: false, error: "单价下限和上限需为正整数（元）。" };
  }
  if (max > MAX_ESTIMATE_UNIT_PRICE) {
    return { ok: false, error: `单价上限不能超过 ${MAX_ESTIMATE_UNIT_PRICE.toLocaleString("en-US")} 元。` };
  }
  if (min > max) return { ok: false, error: "单价下限不能高于上限。" };
  const note = draft.sourceNote.trim();
  if (!note) return { ok: false, error: "请填写来源说明。" };
  if (note.length > MAX_ESTIMATE_SOURCE_NOTE_LENGTH) {
    return {
      ok: false,
      error: `来源说明最多 ${MAX_ESTIMATE_SOURCE_NOTE_LENGTH} 字（当前 ${note.length} 字）。`,
    };
  }
  if (CONTROL_CHAR_RE.test(note)) return { ok: false, error: "来源说明不能包含换行等控制字符。" };
  return {
    ok: true,
    body: {
      subcategoryKey: draft.subcategoryKey,
      budgetTier: draft.budgetTier,
      unitPriceMin: min,
      unitPriceMax: max,
      sourceNote: note,
    },
  };
}

/** Fixed Chinese feedback per API code / status; server messages and internal details are never shown. */
export function priceReferenceErrorMessage(
  status: number,
  body: unknown,
  action: "load" | "save" | "deactivate",
): string {
  const code =
    body && typeof body === "object" && typeof (body as { code?: unknown }).code === "string"
      ? (body as { code: string }).code
      : "";
  if (code === "PRICE_REFERENCE_INVALID") {
    return `价目数据无效：单价需为 1–${MAX_ESTIMATE_UNIT_PRICE.toLocaleString("en-US")} 的整数且下限不高于上限，来源说明需为 1–${MAX_ESTIMATE_SOURCE_NOTE_LENGTH} 字且不含换行等控制字符。`;
  }
  if (code === "PRICE_REFERENCE_FORBIDDEN") return "权限不足：仅组织所有者或管理员可维护组织估算价目表。";
  if (code === "PRICE_REFERENCE_CONFLICT") return "价目已被其他操作更新，请刷新后重试。";
  if (code === "PRICE_REFERENCE_NOT_FOUND") return "该价目不存在或已停用，请刷新后重试。";
  if (status === 401) return "登录已失效，请重新登录后重试。";
  if (status === 403) return "权限不足：当前账号无权访问该组织的估算价目表。";
  if (action === "load") return "组织估算价目表加载失败，请稍后重试。";
  if (action === "save") return "保存失败，请稍后重试。";
  return "停用失败，请稍后重试。";
}

type Fetcher = typeof fetch;
type ApiResult<T> = { ok: true; value: T } | { ok: false; error: string };

async function callPriceReferenceApi<T>(
  fetcher: Fetcher,
  url: string,
  init: RequestInit,
  action: "load" | "save" | "deactivate",
  read: (body: Record<string, unknown>) => T | null,
): Promise<ApiResult<T>> {
  try {
    const res = await fetcher(url, init);
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const value = res.ok && body?.ok === true ? read(body) : null;
    if (value === null) return { ok: false, error: priceReferenceErrorMessage(res.status, body, action) };
    return { ok: true, value };
  } catch {
    return { ok: false, error: "网络异常，请检查网络后重试。" };
  }
}

const isView = (value: unknown): value is OrganizationPriceReferenceView =>
  Boolean(value) && typeof value === "object" && typeof (value as { id?: unknown }).id === "string";

export function loadPriceReferences(organizationId: string, fetcher: Fetcher = fetch) {
  return callPriceReferenceApi(
    fetcher,
    PRICE_REFERENCES_API,
    { headers: { "x-organization-id": organizationId } },
    "load",
    (body) => (Array.isArray(body.references) ? body.references.filter(isView) : null),
  );
}

export function savePriceReference(
  organizationId: string,
  body: PriceReferencePutBody,
  fetcher: Fetcher = fetch,
) {
  return callPriceReferenceApi(
    fetcher,
    PRICE_REFERENCES_API,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
      body: JSON.stringify(body),
    },
    "save",
    (res) => (isView(res.reference) ? res.reference : null),
  );
}

export function deactivatePriceReference(organizationId: string, id: string, fetcher: Fetcher = fetch) {
  return callPriceReferenceApi(
    fetcher,
    `${PRICE_REFERENCES_API}/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { "x-organization-id": organizationId } },
    "deactivate",
    (res) => (isView(res.reference) ? res.reference : null),
  );
}

type Editing = { key: string; draft: PriceReferenceDraft } | null;

export function PriceReferenceTable({
  references,
  canManage,
  editing = null,
  busy = false,
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
  onDeactivate,
}: {
  references: readonly OrganizationPriceReferenceView[];
  canManage: boolean;
  editing?: Editing;
  busy?: boolean;
  onEdit?: (subcategoryKey: string, tier: PriceBand) => void;
  onDraftChange?: (draft: PriceReferenceDraft) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDeactivate?: (reference: OrganizationPriceReferenceView) => void;
}) {
  const active = new Map(
    references.filter((r) => r.active).map((r) => [cellKey(r.subcategoryKey, r.budgetTier), r]),
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500">
            <th className="w-48 border-b border-zinc-800 px-3 py-2 font-normal">子品类</th>
            {ESTIMATE_PRICE_TIERS.map((tier) => (
              <th key={tier} className="border-b border-zinc-800 px-3 py-2 font-normal">
                {PRICE_TIER_LABEL[tier]}
              </th>
            ))}
          </tr>
        </thead>
        {PRICE_REFERENCE_GROUPS.map((group) => (
          <tbody key={group.category}>
            <tr>
              <th colSpan={4} className="bg-zinc-900 px-3 py-1.5 text-left text-xs font-medium text-zinc-300">
                {group.category}
              </th>
            </tr>
            {group.subcategories.map((entry) => (
              <tr key={entry.key} className="align-top">
                <td className="border-b border-zinc-900 px-3 py-3 text-zinc-100">{entry.subCategory}</td>
                {ESTIMATE_PRICE_TIERS.map((tier) => {
                  const key = cellKey(entry.key, tier);
                  const reference = active.get(key);
                  const draft = editing?.key === key ? editing.draft : null;
                  return (
                    <td
                      key={tier}
                      data-cell={key}
                      className="border-b border-zinc-900 px-3 py-3 text-xs text-zinc-300"
                    >
                      {draft ? (
                        <PriceReferenceEditor
                          draft={draft}
                          busy={busy}
                          onDraftChange={onDraftChange}
                          onSave={onSave}
                          onCancel={onCancel}
                        />
                      ) : (
                        <div className="space-y-1">
                          {reference ? (
                            <>
                              <p className="text-sm text-zinc-100">
                                {formatYuanRange(reference.unitPriceMin, reference.unitPriceMax)}
                              </p>
                              <p>{`第 ${reference.revision} 版 · 生效中`}</p>
                              <p className="break-words text-zinc-500">{`来源：${reference.sourceNote}`}</p>
                            </>
                          ) : (
                            <p className="text-zinc-500">{PLATFORM_ESTIMATE_TEXT}</p>
                          )}
                          {canManage ? (
                            <div className="flex gap-3 pt-1">
                              <button
                                type="button"
                                disabled={busy || editing !== null}
                                onClick={() => onEdit?.(entry.key, tier)}
                                className="text-emerald-400 underline disabled:opacity-40"
                              >
                                {reference ? "编辑" : "设置"}
                              </button>
                              {reference ? (
                                <button
                                  type="button"
                                  disabled={busy || editing !== null}
                                  onClick={() => onDeactivate?.(reference)}
                                  className="text-zinc-400 underline disabled:opacity-40"
                                >
                                  停用
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function PriceReferenceEditor({
  draft,
  busy,
  onDraftChange,
  onSave,
  onCancel,
}: {
  draft: PriceReferenceDraft;
  busy: boolean;
  onDraftChange?: (draft: PriceReferenceDraft) => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const noteLength = sourceNoteLength(draft.sourceNote);
  const check = validatePriceReferenceDraft(draft);
  return (
    <div className="space-y-2">
      <label className="block space-y-1">
        <span className="text-zinc-400">单价下限（元）</span>
        <input
          inputMode="numeric"
          value={draft.unitPriceMin}
          onChange={(e) => onDraftChange?.({ ...draft, unitPriceMin: e.target.value })}
          className="w-full rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-zinc-400">单价上限（元）</span>
        <input
          inputMode="numeric"
          value={draft.unitPriceMax}
          onChange={(e) => onDraftChange?.({ ...draft, unitPriceMax: e.target.value })}
          className="w-full rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-zinc-400">来源说明</span>
        <input
          value={draft.sourceNote}
          onChange={(e) => onDraftChange?.({ ...draft, sourceNote: e.target.value })}
          placeholder="例如：2026 Q3 华东采购参考"
          className="w-full rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
        />
        <span
          data-note-count
          className={noteLength > MAX_ESTIMATE_SOURCE_NOTE_LENGTH ? "text-rose-300" : "text-zinc-500"}
        >
          {`${noteLength} / ${MAX_ESTIMATE_SOURCE_NOTE_LENGTH}`}
        </span>
      </label>
      {!check.ok ? <p className="text-amber-300">{check.error}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy || !check.ok}
          onClick={() => onSave?.()}
          className="rounded border border-zinc-600 px-3 py-1 text-zinc-100 disabled:opacity-40"
        >
          {busy ? "保存中…" : "保存"}
        </button>
        <button type="button" disabled={busy} onClick={() => onCancel?.()} className="text-zinc-400 underline">
          取消
        </button>
      </div>
    </div>
  );
}

export function PriceReferenceManager({
  organizationId,
  canManage,
}: {
  organizationId: string;
  canManage: boolean;
}) {
  const [references, setReferences] = useState<OrganizationPriceReferenceView[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function reload() {
    setNotice(null);
    setStatus("loading");
    const res = await loadPriceReferences(organizationId);
    if (res.ok) {
      setReferences(res.value);
      setStatus("ready");
    } else {
      setNotice({ tone: "error", text: res.error });
      setStatus("error");
    }
  }

  useEffect(() => {
    let cancelled = false;
    void loadPriceReferences(organizationId).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setReferences(res.value);
        setStatus("ready");
      } else {
        setNotice({ tone: "error", text: res.error });
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  function startEdit(subcategoryKey: string, tier: PriceBand) {
    const current = references.find(
      (r) => r.active && r.subcategoryKey === subcategoryKey && r.budgetTier === tier,
    );
    setNotice(null);
    setEditing({
      key: cellKey(subcategoryKey, tier),
      draft: {
        subcategoryKey,
        budgetTier: tier,
        unitPriceMin: current ? String(current.unitPriceMin) : "",
        unitPriceMax: current ? String(current.unitPriceMax) : "",
        sourceNote: current?.sourceNote ?? "",
      },
    });
  }

  async function save() {
    if (!editing) return;
    const check = validatePriceReferenceDraft(editing.draft);
    if (!check.ok) {
      setNotice({ tone: "error", text: check.error });
      return;
    }
    const before = references.find(
      (r) => r.active && cellKey(r.subcategoryKey, r.budgetTier) === editing.key,
    );
    setBusy(true);
    const res = await savePriceReference(organizationId, check.body);
    setBusy(false);
    if (!res.ok) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    const saved = res.value;
    setReferences((prev) => [...prev.filter((r) => r.id !== saved.id), saved]);
    setEditing(null);
    setNotice({
      tone: "success",
      text:
        before && before.revision === saved.revision
          ? `内容未变化，仍为第 ${saved.revision} 版。`
          : `已保存，当前为第 ${saved.revision} 版。`,
    });
  }

  async function deactivate(reference: OrganizationPriceReferenceView) {
    if (!window.confirm("停用后该档位改用平台通用估算；已生成的预算不受影响。确定停用？")) return;
    setNotice(null);
    setBusy(true);
    const res = await deactivatePriceReference(organizationId, reference.id);
    setBusy(false);
    if (!res.ok) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    setReferences((prev) => prev.filter((r) => r.id !== reference.id));
    setNotice({ tone: "success", text: `已停用，该档位改为${PLATFORM_ESTIMATE_TEXT}。` });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      {notice ? (
        <p className={notice.tone === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"}>
          {notice.text}
        </p>
      ) : null}
      {status === "loading" ? <p className="text-sm text-zinc-500">加载组织估算价目表…</p> : null}
      {status === "error" ? (
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded border border-zinc-600 px-3 py-1 text-sm text-zinc-100"
        >
          重新加载
        </button>
      ) : null}
      {status === "ready" ? (
        <PriceReferenceTable
          references={references}
          canManage={canManage}
          editing={editing}
          busy={busy}
          onEdit={startEdit}
          onDraftChange={(draft) => setEditing((prev) => (prev ? { ...prev, draft } : prev))}
          onSave={() => void save()}
          onCancel={() => setEditing(null)}
          onDeactivate={(reference) => void deactivate(reference)}
        />
      ) : null}
    </section>
  );
}
