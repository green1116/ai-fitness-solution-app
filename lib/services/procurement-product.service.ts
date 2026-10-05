/**
 * C.5-A — Organization procurement product master data.
 *
 * Every read/write is scoped by organizationId. A product is a Quote candidate source only:
 * Quotes snapshot the selected candidate and never resolve these rows again. Every accepted
 * change increments `revision`; deactivation is soft and idempotent (no physical delete).
 */

import { Prisma } from "@prisma/client";

import type { ProductPriceFact } from "@/lib/domain/tender";
import {
  isProcurementProductCategory,
  MAX_PROCUREMENT_KEY_SPEC_LENGTH,
  MAX_PROCUREMENT_KEY_SPECS,
  validatePriceFact,
  type ProcurementProductRecord,
} from "@/lib/product-engine/product-intelligence";
import { prisma } from "@/lib/prisma";

const MAX_PRODUCT_TEXT_LENGTH = 100;
const MAX_LISTED_PRODUCTS = 500;
const CONTROL_CHAR_RE = /[\u0000-\u001f\u007f]/;

export class ProcurementProductInputError extends Error {
  readonly status = 400;
  readonly code = "PROCUREMENT_PRODUCT_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "ProcurementProductInputError";
  }
}

export class ProcurementProductNotFoundError extends Error {
  readonly status = 404;
  readonly code = "PROCUREMENT_PRODUCT_NOT_FOUND";

  constructor() {
    super("采购库产品不存在");
    this.name = "ProcurementProductNotFoundError";
  }
}

export type ProcurementProductConflictCode =
  | "PROCUREMENT_PRODUCT_DUPLICATE"
  | "PROCUREMENT_PRODUCT_INACTIVE"
  | "PROCUREMENT_PRODUCT_CONCURRENT_UPDATE";

export class ProcurementProductConflictError extends Error {
  readonly status = 409;

  constructor(
    readonly code: ProcurementProductConflictCode,
    message: string,
  ) {
    super(message);
    this.name = "ProcurementProductConflictError";
  }
}

export type ProcurementProductView = {
  id: string;
  category: string;
  brand: string;
  model: string;
  keySpecs: string[];
  priceFact: ProductPriceFact | null;
  revision: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProcurementProductRow = {
  id: string;
  category: string;
  brand: string;
  model: string;
  keySpecs: Prisma.JsonValue;
  priceFact: Prisma.JsonValue | null;
  revision: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ProductFields = {
  category: string;
  brand: string;
  model: string;
  keySpecs: string[];
  priceFact: ProductPriceFact | null;
};

function normalizeText(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function readRequiredText(value: unknown, label: string): string {
  const text = typeof value === "string" ? normalizeText(value) : "";
  if (!text) throw new ProcurementProductInputError(`请填写${label}`);
  if (text.length > MAX_PRODUCT_TEXT_LENGTH) {
    throw new ProcurementProductInputError(`${label}不超过 ${MAX_PRODUCT_TEXT_LENGTH} 字`);
  }
  if (CONTROL_CHAR_RE.test(text)) {
    throw new ProcurementProductInputError(`${label}包含无效字符`);
  }
  return text;
}

function readCategory(value: unknown): string {
  if (!isProcurementProductCategory(value)) {
    throw new ProcurementProductInputError("产品类别无效");
  }
  return value;
}

function readKeySpecs(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ProcurementProductInputError("关键参数需为文本列表");
  const specs: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") throw new ProcurementProductInputError("关键参数需为文本");
    const text = normalizeText(item);
    if (!text) continue;
    if (text.length > MAX_PROCUREMENT_KEY_SPEC_LENGTH || CONTROL_CHAR_RE.test(text)) {
      throw new ProcurementProductInputError(
        `每项关键参数不超过 ${MAX_PROCUREMENT_KEY_SPEC_LENGTH} 字且不含无效字符`,
      );
    }
    specs.push(text);
  }
  if (specs.length > MAX_PROCUREMENT_KEY_SPECS) {
    throw new ProcurementProductInputError(`关键参数不超过 ${MAX_PROCUREMENT_KEY_SPECS} 项`);
  }
  return specs;
}

function readPriceFactInput(value: unknown, now: Date): ProductPriceFact | null {
  if (value == null) return null;
  const validated = validatePriceFact(value, { now });
  if (!validated.ok) throw new ProcurementProductInputError(validated.message);
  return validated.priceFact;
}

function readBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ProcurementProductInputError("请求格式无效");
  }
  return body as Record<string, unknown>;
}

function identityKey(brand: string, model: string): string {
  return `${encodeURIComponent(brand.toLowerCase())}|${encodeURIComponent(model.toLowerCase())}`;
}

function storedKeySpecs(value: Prisma.JsonValue): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

function storedPriceFact(value: Prisma.JsonValue | null): ProductPriceFact | null {
  if (value == null) return null;
  const validated = validatePriceFact(value, { lenientMetadata: true });
  return validated.ok ? validated.priceFact : null;
}

function toView(row: ProcurementProductRow): ProcurementProductView {
  return {
    id: row.id,
    category: row.category,
    brand: row.brand,
    model: row.model,
    keySpecs: storedKeySpecs(row.keySpecs),
    priceFact: storedPriceFact(row.priceFact),
    revision: row.revision,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function priceFactData(fact: ProductPriceFact | null) {
  return fact ? (fact as unknown as Prisma.InputJsonValue) : Prisma.DbNull;
}

async function assertNoActiveDuplicate(
  organizationId: string,
  key: string,
  excludeId?: string,
): Promise<void> {
  const duplicate = await prisma.procurementProduct.findFirst({
    where: {
      organizationId,
      identityKey: key,
      active: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (duplicate) {
    throw new ProcurementProductConflictError(
      "PROCUREMENT_PRODUCT_DUPLICATE",
      "采购库中已存在相同品牌与型号的启用产品",
    );
  }
}

export async function listProcurementProducts(input: {
  organizationId: string;
  includeInactive?: boolean;
}): Promise<ProcurementProductView[]> {
  const rows = await prisma.procurementProduct.findMany({
    where: {
      organizationId: input.organizationId,
      ...(input.includeInactive ? {} : { active: true }),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: MAX_LISTED_PRODUCTS,
  });
  return rows.map(toView);
}

/** Active products of one organization as DB-free PI records; optionally narrowed to ids. */
export async function listActiveProcurementProductRecords(
  organizationId: string,
  productIds?: string[],
): Promise<ProcurementProductRecord[]> {
  const rows = await prisma.procurementProduct.findMany({
    where: {
      organizationId,
      active: true,
      ...(productIds ? { id: { in: productIds } } : {}),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: MAX_LISTED_PRODUCTS,
  });
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    brand: row.brand,
    model: row.model,
    keySpecs: row.keySpecs,
    priceFact: row.priceFact,
    revision: row.revision,
  }));
}

export async function createProcurementProduct(input: {
  organizationId: string;
  userId: string;
  body: unknown;
  now?: Date;
}): Promise<ProcurementProductView> {
  const body = readBody(input.body);
  const fields: ProductFields = {
    category: readCategory(body.category),
    brand: readRequiredText(body.brand, "品牌"),
    model: readRequiredText(body.model, "型号"),
    keySpecs: readKeySpecs(body.keySpecs),
    priceFact: readPriceFactInput(body.priceFact, input.now ?? new Date()),
  };
  const key = identityKey(fields.brand, fields.model);
  await assertNoActiveDuplicate(input.organizationId, key);
  const row = await prisma.procurementProduct.create({
    data: {
      organizationId: input.organizationId,
      category: fields.category,
      brand: fields.brand,
      model: fields.model,
      identityKey: key,
      keySpecs: fields.keySpecs,
      priceFact: priceFactData(fields.priceFact),
      createdBy: input.userId,
      updatedBy: input.userId,
    },
  });
  return toView(row);
}

async function findOwnedProduct(organizationId: string, id: string) {
  const row = await prisma.procurementProduct.findFirst({ where: { id, organizationId } });
  if (!row) throw new ProcurementProductNotFoundError();
  return row;
}

/**
 * Partial update of an active product; omitted fields keep their value, `priceFact: null` clears it.
 * Any effective change increments `revision` (optimistic on the read revision); a no-op returns as-is.
 */
export async function updateProcurementProduct(input: {
  organizationId: string;
  userId: string;
  id: string;
  body: unknown;
  now?: Date;
}): Promise<ProcurementProductView> {
  const body = readBody(input.body);
  const current = await findOwnedProduct(input.organizationId, input.id);
  if (!current.active) {
    throw new ProcurementProductConflictError(
      "PROCUREMENT_PRODUCT_INACTIVE",
      "采购库产品已停用，不能修改",
    );
  }
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);
  if (!["category", "brand", "model", "keySpecs", "priceFact"].some(has)) {
    throw new ProcurementProductInputError("请至少提供一项需要修改的字段");
  }
  const before: ProductFields = {
    category: current.category,
    brand: current.brand,
    model: current.model,
    keySpecs: storedKeySpecs(current.keySpecs),
    priceFact: storedPriceFact(current.priceFact),
  };
  const next: ProductFields = {
    category: has("category") ? readCategory(body.category) : before.category,
    brand: has("brand") ? readRequiredText(body.brand, "品牌") : before.brand,
    model: has("model") ? readRequiredText(body.model, "型号") : before.model,
    keySpecs: has("keySpecs") ? readKeySpecs(body.keySpecs) : before.keySpecs,
    priceFact: has("priceFact")
      ? readPriceFactInput(body.priceFact, input.now ?? new Date())
      : before.priceFact,
  };
  if (JSON.stringify(next) === JSON.stringify(before)) return toView(current);

  const key = identityKey(next.brand, next.model);
  if (key !== current.identityKey) {
    await assertNoActiveDuplicate(input.organizationId, key, current.id);
  }
  const result = await prisma.procurementProduct.updateMany({
    where: {
      id: current.id,
      organizationId: input.organizationId,
      revision: current.revision,
      active: true,
    },
    data: {
      category: next.category,
      brand: next.brand,
      model: next.model,
      identityKey: key,
      keySpecs: next.keySpecs,
      priceFact: priceFactData(next.priceFact),
      revision: { increment: 1 },
      updatedBy: input.userId,
    },
  });
  if (result.count !== 1) {
    throw new ProcurementProductConflictError(
      "PROCUREMENT_PRODUCT_CONCURRENT_UPDATE",
      "采购库产品已被修改或停用，请刷新后重试",
    );
  }
  return toView(await findOwnedProduct(input.organizationId, current.id));
}

/** Soft deactivation; idempotent and never bumps revision. Historical Quotes keep their snapshots. */
export async function deactivateProcurementProduct(input: {
  organizationId: string;
  userId: string;
  id: string;
}): Promise<ProcurementProductView> {
  const current = await findOwnedProduct(input.organizationId, input.id);
  if (!current.active) return toView(current);
  await prisma.procurementProduct.updateMany({
    where: { id: current.id, organizationId: input.organizationId, active: true },
    data: { active: false, updatedBy: input.userId },
  });
  return toView(await findOwnedProduct(input.organizationId, current.id));
}
