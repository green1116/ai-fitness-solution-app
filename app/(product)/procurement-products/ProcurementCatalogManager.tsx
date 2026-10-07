"use client";

import { useEffect, useState } from "react";

import {
  PRICE_FACT_SOURCE_LABEL,
  PRICE_FACT_TAX_STATUS_LABEL,
  type PriceFactSourceType,
  type PriceFactTaxStatus,
  type ProductPriceFact,
} from "@/lib/domain/tender";
import type { ProcurementProductCategoryOption } from "@/lib/product-engine/product-intelligence";
import type { ProcurementProductView } from "@/lib/services/procurement-product.service";

export const PROCUREMENT_PRODUCTS_API = "/api/procurement-products";

export const VERIFIED_PURCHASE_PRICE_TEXT = "已核实采购价";
export const NO_VERIFIED_PURCHASE_PRICE_TEXT = "未提供核实采购价";

export const DEACTIVATE_NOTICE = [
  "停用后该产品不会再出现在新的方案候选中。",
  "已有方案和预算快照不会改变。",
  "当前版本不支持直接重新启用；如需恢复需重新新增。",
] as const;

export type KeySpecLimits = { maxCount: number; maxLength: number };

export type ProcurementProductDraft = {
  category: string;
  brand: string;
  model: string;
  /** One key specification per line. */
  keySpecsText: string;
  includePrice: boolean;
  unitPrice: string;
  sourceType: PriceFactSourceType;
  sourceReference: string;
  quotedAt: string;
  supplier: string;
  taxStatus: "" | PriceFactTaxStatus;
  validUntil: string;
};

export type ProcurementProductBody = {
  category: string;
  brand: string;
  model: string;
  keySpecs: string[];
  /** null = no verified purchase price (on PATCH this clears a stored one). */
  priceFact: ProductPriceFact | null;
};

const SOURCE_TYPES = Object.keys(PRICE_FACT_SOURCE_LABEL) as PriceFactSourceType[];
const TAX_STATUSES = Object.keys(PRICE_FACT_TAX_STATUS_LABEL) as PriceFactTaxStatus[];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRICE_RE = /^\d+(\.\d{1,2})?$/;
const CONTROL_CHAR_RE = /[\u0000-\u001f\u007f]/;

export function emptyProcurementProductDraft(category: string): ProcurementProductDraft {
  return {
    category,
    brand: "",
    model: "",
    keySpecsText: "",
    includePrice: false,
    unitPrice: "",
    sourceType: "supplier_quote",
    sourceReference: "",
    quotedAt: "",
    supplier: "",
    taxStatus: "",
    validUntil: "",
  };
}

export function draftFromProcurementProduct(product: ProcurementProductView): ProcurementProductDraft {
  const fact = product.priceFact;
  return {
    category: product.category,
    brand: product.brand,
    model: product.model,
    keySpecsText: product.keySpecs.join("\n"),
    includePrice: fact !== null,
    unitPrice: fact ? String(fact.unitPrice) : "",
    sourceType: fact?.sourceType ?? "supplier_quote",
    sourceReference: fact?.sourceReference ?? "",
    quotedAt: fact?.quotedAt ?? "",
    supplier: fact?.supplier ?? "",
    taxStatus: fact?.taxStatus ?? "",
    validUntil: fact?.validUntil ?? "",
  };
}

/** Client-side assistance only; the API remains the authoritative validator. */
export function validateProcurementProductDraft(
  draft: ProcurementProductDraft,
  categoryOptions: readonly ProcurementProductCategoryOption[],
  limits: KeySpecLimits,
): { ok: true; body: ProcurementProductBody } | { ok: false; error: string } {
  if (!categoryOptions.some((o) => o.category === draft.category)) {
    return { ok: false, error: "请选择已支持的设备子品类。" };
  }
  const brand = draft.brand.trim();
  const model = draft.model.trim();
  if (!brand) return { ok: false, error: "请填写品牌。" };
  if (!model) return { ok: false, error: "请填写型号。" };
  if (CONTROL_CHAR_RE.test(brand) || CONTROL_CHAR_RE.test(model)) {
    return { ok: false, error: "品牌与型号不能包含换行等控制字符。" };
  }
  const keySpecs = draft.keySpecsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (keySpecs.length > limits.maxCount) {
    return { ok: false, error: `关键参数最多 ${limits.maxCount} 项（每行一项）。` };
  }
  if (keySpecs.some((spec) => spec.length > limits.maxLength || CONTROL_CHAR_RE.test(spec))) {
    return { ok: false, error: `每项关键参数最多 ${limits.maxLength} 字。` };
  }
  if (!draft.includePrice) return { ok: true, body: { category: draft.category, brand, model, keySpecs, priceFact: null } };

  const priceText = draft.unitPrice.trim();
  const unitPrice = PRICE_RE.test(priceText) ? Number(priceText) : Number.NaN;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return { ok: false, error: "核实单价需为大于 0 的金额（元，最多两位小数）。" };
  }
  if (!SOURCE_TYPES.includes(draft.sourceType)) return { ok: false, error: "请选择价格来源类型。" };
  const sourceReference = draft.sourceReference.trim();
  if (!sourceReference) return { ok: false, error: "请填写价格来源凭据（报价单号 / 合同号）。" };
  const quotedAt = draft.quotedAt.trim();
  if (!DATE_RE.test(quotedAt)) return { ok: false, error: "请填写报价日期（YYYY-MM-DD）。" };
  const validUntil = draft.validUntil.trim();
  if (validUntil && (!DATE_RE.test(validUntil) || validUntil < quotedAt)) {
    return { ok: false, error: "有效期需为 YYYY-MM-DD，且不早于报价日期。" };
  }
  if (draft.taxStatus && !TAX_STATUSES.includes(draft.taxStatus)) {
    return { ok: false, error: "含税状态无效。" };
  }
  const supplier = draft.supplier.trim();
  return {
    ok: true,
    body: {
      category: draft.category,
      brand,
      model,
      keySpecs,
      priceFact: {
        unitPrice,
        currency: "CNY",
        sourceType: draft.sourceType,
        sourceReference,
        quotedAt,
        ...(supplier ? { supplier } : {}),
        ...(draft.taxStatus ? { taxStatus: draft.taxStatus } : {}),
        ...(validUntil ? { validUntil } : {}),
      },
    },
  };
}

type Action = "load" | "create" | "update" | "deactivate";

/** Fixed Chinese feedback per API code / status; server messages and internal details are never shown. */
export function procurementProductErrorMessage(status: number, body: unknown, action: Action): string {
  const code =
    body && typeof body === "object" && typeof (body as { code?: unknown }).code === "string"
      ? (body as { code: string }).code
      : "";
  if (code === "PROCUREMENT_PRODUCT_INVALID") {
    return "产品数据无效：请检查子品类、品牌与型号、关键参数，以及核实采购价的单价、来源类型、凭据、报价日期（不晚于今天）和有效期后重试。";
  }
  if (code === "PROCUREMENT_PRODUCT_DUPLICATE") return "采购库中已存在相同品牌与型号的启用产品（不区分大小写）。";
  if (code === "PROCUREMENT_PRODUCT_INACTIVE") return "该产品已停用，不能修改。";
  if (code === "PROCUREMENT_PRODUCT_CONCURRENT_UPDATE") return "该产品已被其他操作修改或停用，请刷新后重试。";
  if (code === "PROCUREMENT_PRODUCT_NOT_FOUND") return "该产品不存在或不属于当前组织，请刷新后重试。";
  if (code === "PROCUREMENT_PRODUCT_ID_REQUIRED") return "缺少产品标识，请刷新后重试。";
  if (code === "PROCUREMENT_PRODUCT_FORBIDDEN") return "权限不足：仅组织所有者或管理员可维护采购库产品。";
  if (status === 401) return "登录已失效，请重新登录后重试。";
  if (status === 403) return "权限不足：当前账号无权访问该组织的采购库。";
  if (action === "load") return "组织采购库加载失败，请稍后重试。";
  if (action === "create") return "新增失败，请稍后重试。";
  if (action === "update") return "保存失败，请稍后重试。";
  return "停用失败，请稍后重试。";
}

type Fetcher = typeof fetch;
type ApiResult<T> = { ok: true; value: T } | { ok: false; error: string };

async function callProcurementApi<T>(
  fetcher: Fetcher,
  url: string,
  init: RequestInit,
  action: Action,
  read: (body: Record<string, unknown>) => T | null,
): Promise<ApiResult<T>> {
  try {
    const res = await fetcher(url, init);
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const value = res.ok && body?.ok === true ? read(body) : null;
    if (value === null) return { ok: false, error: procurementProductErrorMessage(res.status, body, action) };
    return { ok: true, value };
  } catch {
    return { ok: false, error: "网络异常，请检查网络后重试。" };
  }
}

const isView = (value: unknown): value is ProcurementProductView =>
  Boolean(value) && typeof value === "object" && typeof (value as { id?: unknown }).id === "string";

const jsonHeaders = (organizationId: string) => ({
  "Content-Type": "application/json",
  "x-organization-id": organizationId,
});

export function loadProcurementProducts(
  organizationId: string,
  includeInactive: boolean,
  fetcher: Fetcher = fetch,
) {
  return callProcurementApi(
    fetcher,
    includeInactive ? `${PROCUREMENT_PRODUCTS_API}?includeInactive=1` : PROCUREMENT_PRODUCTS_API,
    { headers: { "x-organization-id": organizationId } },
    "load",
    (body) => (Array.isArray(body.products) ? body.products.filter(isView) : null),
  );
}

export function createProcurementProduct(
  organizationId: string,
  body: ProcurementProductBody,
  fetcher: Fetcher = fetch,
) {
  const { priceFact, ...identity } = body;
  return callProcurementApi(
    fetcher,
    PROCUREMENT_PRODUCTS_API,
    {
      method: "POST",
      headers: jsonHeaders(organizationId),
      body: JSON.stringify(priceFact ? body : identity),
    },
    "create",
    (res) => (isView(res.product) ? res.product : null),
  );
}

export function updateProcurementProduct(
  organizationId: string,
  id: string,
  body: ProcurementProductBody,
  fetcher: Fetcher = fetch,
) {
  return callProcurementApi(
    fetcher,
    `${PROCUREMENT_PRODUCTS_API}/${encodeURIComponent(id)}`,
    { method: "PATCH", headers: jsonHeaders(organizationId), body: JSON.stringify(body) },
    "update",
    (res) => (isView(res.product) ? res.product : null),
  );
}

export function deactivateProcurementProduct(organizationId: string, id: string, fetcher: Fetcher = fetch) {
  return callProcurementApi(
    fetcher,
    `${PROCUREMENT_PRODUCTS_API}/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { "x-organization-id": organizationId } },
    "deactivate",
    (res) => (isView(res.product) ? res.product : null),
  );
}

export function formatPurchasePrice(unitPrice: number): string {
  return `¥${unitPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** Concise verified-price facts for the catalog list; the source reference stays in the edit form. */
export function purchasePriceSummary(fact: ProductPriceFact | null): { headline: string; details: string[] } {
  if (!fact) return { headline: NO_VERIFIED_PURCHASE_PRICE_TEXT, details: [] };
  const details = [`报价日期 ${fact.quotedAt}`];
  if (fact.supplier) details.push(`供应商 ${fact.supplier}`);
  if (fact.taxStatus) details.push(PRICE_FACT_TAX_STATUS_LABEL[fact.taxStatus]);
  if (fact.validUntil) details.push(`有效期至 ${fact.validUntil}`);
  return {
    headline: `${VERIFIED_PURCHASE_PRICE_TEXT} ${formatPurchasePrice(fact.unitPrice)} · ${PRICE_FACT_SOURCE_LABEL[fact.sourceType]}`,
    details,
  };
}

export type ProcurementCatalogGroup = {
  category: string;
  label: string;
  products: ProcurementProductView[];
};

/** Groups in the shared category order; a product outside it is shown under its raw category code. */
export function groupProcurementProducts(
  products: readonly ProcurementProductView[],
  categoryOptions: readonly ProcurementProductCategoryOption[],
): ProcurementCatalogGroup[] {
  const groups: ProcurementCatalogGroup[] = categoryOptions.map((o) => ({
    category: o.category,
    label: o.label,
    products: [],
  }));
  for (const product of products) {
    let group = groups.find((g) => g.category === product.category);
    if (!group) {
      group = { category: product.category, label: `未识别品类（${product.category}）`, products: [] };
      groups.push(group);
    }
    group.products.push(product);
  }
  return groups;
}

export function ProcurementCatalogList({
  products,
  categoryOptions,
  canManage,
  busy = false,
  onEdit,
  onDeactivate,
}: {
  products: readonly ProcurementProductView[];
  categoryOptions: readonly ProcurementProductCategoryOption[];
  canManage: boolean;
  busy?: boolean;
  onEdit?: (product: ProcurementProductView) => void;
  onDeactivate?: (product: ProcurementProductView) => void;
}) {
  return (
    <div className="space-y-4">
      {groupProcurementProducts(products, categoryOptions).map((group) => (
        <div key={group.category} data-group={group.category} className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-200">{`${group.label} · ${group.products.length} 个产品`}</h2>
          {group.products.length === 0 ? (
            <p className="text-sm text-zinc-500">暂无产品</p>
          ) : (
            <ul className="space-y-2">
              {group.products.map((product) => {
                const price = purchasePriceSummary(product.priceFact);
                return (
                  <li
                    key={product.id}
                    data-product-id={product.id}
                    className="space-y-1 rounded-lg border border-zinc-800 px-3 py-2 text-sm"
                  >
                    <p className="flex flex-wrap items-center gap-2 text-zinc-100">
                      <span className="font-medium">{`${product.brand} ${product.model}`}</span>
                      <span className="text-xs text-zinc-400">{`第 ${product.revision} 版`}</span>
                      <span className={product.active ? "text-xs text-zinc-300" : "text-xs text-amber-300"}>
                        {product.active ? "启用中" : "已停用"}
                      </span>
                    </p>
                    <p className="text-zinc-300">
                      {`产品身份（参数未核实）：${product.keySpecs.length > 0 ? product.keySpecs.join(" · ") : "未登记关键参数"}`}
                    </p>
                    <p className={product.priceFact ? "text-emerald-200" : "text-zinc-400"}>{price.headline}</p>
                    {price.details.length > 0 ? <p className="text-zinc-400">{price.details.join(" · ")}</p> : null}
                    {canManage && product.active ? (
                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onEdit?.(product)}
                          className="text-emerald-400 underline disabled:opacity-40"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onDeactivate?.(product)}
                          className="text-zinc-400 underline disabled:opacity-40"
                        >
                          停用
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

const inputClass = "w-full rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100";

export function ProcurementProductForm({
  mode,
  draft,
  categoryOptions,
  limits,
  hadPriceFact = false,
  busy = false,
  onDraftChange,
  onSave,
  onCancel,
}: {
  mode: "create" | "edit";
  draft: ProcurementProductDraft;
  categoryOptions: readonly ProcurementProductCategoryOption[];
  limits: KeySpecLimits;
  hadPriceFact?: boolean;
  busy?: boolean;
  onDraftChange?: (draft: ProcurementProductDraft) => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const check = validateProcurementProductDraft(draft, categoryOptions, limits);
  const set = (patch: Partial<ProcurementProductDraft>) => onDraftChange?.({ ...draft, ...patch });
  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 p-4 text-sm">
      <p className="font-medium text-zinc-100">{mode === "create" ? "新增采购库产品" : "编辑采购库产品"}</p>
      <fieldset className="space-y-2">
        <legend className="text-zinc-200">产品身份</legend>
        <label className="block space-y-1">
          <span className="text-zinc-400">设备子品类</span>
          <select value={draft.category} onChange={(e) => set({ category: e.target.value })} className={inputClass}>
            {categoryOptions.map((o) => (
              <option key={o.category} value={o.category}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-zinc-400">品牌</span>
          <input value={draft.brand} onChange={(e) => set({ brand: e.target.value })} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-zinc-400">型号</span>
          <input value={draft.model} onChange={(e) => set({ model: e.target.value })} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className="text-zinc-400">{`关键参数（每行一项，最多 ${limits.maxCount} 项）`}</span>
          <textarea
            rows={3}
            value={draft.keySpecsText}
            onChange={(e) => set({ keySpecsText: e.target.value })}
            className={inputClass}
          />
        </label>
        <p className="text-zinc-400">产品身份来自采购资料登记，参数未核实；同一子品类下可登记多个品牌与型号。</p>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-zinc-200">核实采购价（可选）</legend>
        <label className="flex items-center gap-2 text-zinc-300">
          <input
            type="checkbox"
            checked={draft.includePrice}
            onChange={(e) => set({ includePrice: e.target.checked })}
          />
          提供供应商报价或采购合同的核实单价（CNY）
        </label>
        {!draft.includePrice && hadPriceFact ? (
          <p className="text-amber-300">保存后将清除该产品已登记的核实采购价，之后新的选择按档位估算。</p>
        ) : null}
        {draft.includePrice ? (
          <>
            <label className="block space-y-1">
              <span className="text-zinc-400">核实单价（元，CNY）</span>
              <input
                inputMode="decimal"
                value={draft.unitPrice}
                onChange={(e) => set({ unitPrice: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">价格来源类型</span>
              <select
                value={draft.sourceType}
                onChange={(e) => set({ sourceType: e.target.value as PriceFactSourceType })}
                className={inputClass}
              >
                {SOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PRICE_FACT_SOURCE_LABEL[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">来源凭据（报价单号 / 合同号）</span>
              <input
                value={draft.sourceReference}
                onChange={(e) => set({ sourceReference: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">报价日期</span>
              <input
                type="date"
                value={draft.quotedAt}
                onChange={(e) => set({ quotedAt: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">供应商（可选）</span>
              <input value={draft.supplier} onChange={(e) => set({ supplier: e.target.value })} className={inputClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">含税状态（可选）</span>
              <select
                value={draft.taxStatus}
                onChange={(e) => set({ taxStatus: e.target.value as ProcurementProductDraft["taxStatus"] })}
                className={inputClass}
              >
                <option value="">未注明</option>
                {TAX_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PRICE_FACT_TAX_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-zinc-400">有效期至（可选）</span>
              <input
                type="date"
                value={draft.validUntil}
                onChange={(e) => set({ validUntil: e.target.value })}
                className={inputClass}
              />
            </label>
            <p className="text-zinc-400">含税状态、供应商与有效期仅作采购记录，不改变核实单价或合计。</p>
          </>
        ) : null}
      </fieldset>
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

export function DeactivateProcurementProductConfirm({
  product,
  busy = false,
  onConfirm,
  onCancel,
}: {
  product: ProcurementProductView;
  busy?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-amber-700 p-4 text-sm">
      <p className="font-medium text-zinc-100">{`确认停用 ${product.brand} ${product.model}？`}</p>
      {DEACTIVATE_NOTICE.map((line) => (
        <p key={line} className="text-zinc-300">
          {line}
        </p>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onConfirm?.()}
          className="rounded border border-amber-700 px-3 py-1 text-amber-200 disabled:opacity-40"
        >
          {busy ? "停用中…" : "确认停用"}
        </button>
        <button type="button" disabled={busy} onClick={() => onCancel?.()} className="text-zinc-400 underline">
          取消
        </button>
      </div>
    </div>
  );
}

type FormState =
  | { mode: "create"; draft: ProcurementProductDraft }
  | { mode: "edit"; product: ProcurementProductView; draft: ProcurementProductDraft }
  | null;

export function ProcurementCatalogManager({
  organizationId,
  canManage,
  categoryOptions,
  keySpecLimits,
}: {
  organizationId: string;
  canManage: boolean;
  categoryOptions: readonly ProcurementProductCategoryOption[];
  keySpecLimits: KeySpecLimits;
}) {
  const [products, setProducts] = useState<ProcurementProductView[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [form, setForm] = useState<FormState>(null);
  const [confirming, setConfirming] = useState<ProcurementProductView | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const showInactive = canManage && includeInactive;

  async function reload(withInactive = showInactive) {
    setStatus("loading");
    const res = await loadProcurementProducts(organizationId, withInactive);
    if (res.ok) {
      setProducts(res.value);
      setStatus("ready");
    } else {
      setNotice({ tone: "error", text: res.error });
      setStatus("error");
    }
  }

  useEffect(() => {
    let cancelled = false;
    void loadProcurementProducts(organizationId, showInactive).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setProducts(res.value);
        setStatus("ready");
      } else {
        setNotice({ tone: "error", text: res.error });
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [organizationId, showInactive]);

  async function save() {
    if (!form) return;
    const check = validateProcurementProductDraft(form.draft, categoryOptions, keySpecLimits);
    if (!check.ok) {
      setNotice({ tone: "error", text: check.error });
      return;
    }
    setNotice(null);
    setBusy(true);
    const res =
      form.mode === "create"
        ? await createProcurementProduct(organizationId, check.body)
        : await updateProcurementProduct(organizationId, form.product.id, check.body);
    setBusy(false);
    if (!res.ok) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    const saved = res.value;
    const name = `${saved.brand} ${saved.model}`;
    setNotice({
      tone: "success",
      text:
        form.mode === "create"
          ? `已新增：${name}（第 ${saved.revision} 版）。`
          : form.product.revision === saved.revision
            ? `内容未变化，${name} 仍为第 ${saved.revision} 版。`
            : `已保存：${name}，当前为第 ${saved.revision} 版。`,
    });
    setForm(null);
    await reload();
  }

  async function deactivate() {
    if (!confirming) return;
    const product = confirming;
    setNotice(null);
    setBusy(true);
    const res = await deactivateProcurementProduct(organizationId, product.id);
    setBusy(false);
    if (!res.ok) {
      setNotice({ tone: "error", text: res.error });
      return;
    }
    setConfirming(null);
    setNotice({ tone: "success", text: `已停用：${product.brand} ${product.model}。` });
    await reload();
  }

  const defaultCategory = categoryOptions[0]?.category ?? "";

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      {notice ? (
        <p className={notice.tone === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"}>
          {notice.text}
        </p>
      ) : null}
      {canManage ? (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button
            type="button"
            disabled={busy || form !== null || confirming !== null}
            onClick={() => {
              setNotice(null);
              setForm({ mode: "create", draft: emptyProcurementProductDraft(defaultCategory) });
            }}
            className="rounded border border-zinc-600 px-3 py-1 text-zinc-100 disabled:opacity-40"
          >
            新增产品
          </button>
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            显示已停用产品
          </label>
        </div>
      ) : null}
      {canManage && form ? (
        <ProcurementProductForm
          mode={form.mode}
          draft={form.draft}
          categoryOptions={categoryOptions}
          limits={keySpecLimits}
          hadPriceFact={form.mode === "edit" && form.product.priceFact !== null}
          busy={busy}
          onDraftChange={(draft) => setForm((prev) => (prev ? { ...prev, draft } : prev))}
          onSave={() => void save()}
          onCancel={() => setForm(null)}
        />
      ) : null}
      {canManage && confirming ? (
        <DeactivateProcurementProductConfirm
          product={confirming}
          busy={busy}
          onConfirm={() => void deactivate()}
          onCancel={() => setConfirming(null)}
        />
      ) : null}
      {status === "loading" ? <p className="text-sm text-zinc-500">加载组织采购库…</p> : null}
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
        <ProcurementCatalogList
          products={products}
          categoryOptions={categoryOptions}
          canManage={canManage}
          busy={busy || form !== null || confirming !== null}
          onEdit={(product) => {
            setNotice(null);
            setForm({ mode: "edit", product, draft: draftFromProcurementProduct(product) });
          }}
          onDeactivate={(product) => {
            setNotice(null);
            setConfirming(product);
          }}
        />
      ) : null}
    </section>
  );
}
