/**
 * E12-P7 — Product Operations Model
 */

import { getOrganization } from "../admin/admin.organization";
import { getProductIdentity } from "../identity/product.identity";
import { getProductTenant } from "../tenant/tenant.product";
import {
  PRODUCT_OPERATION_KINDS,
  PRODUCT_OPERATION_STATUSES,
} from "./commercial.constants";
import type {
  CreateProductOperationInput,
  ProductOperation,
  ProductOperationKind,
  ProductOperationStatus,
} from "./commercial.types";

const operations = new Map<string, ProductOperation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOp(op: ProductOperation): ProductOperation {
  return { ...op, metadata: { ...op.metadata } };
}

export function createProductOperation(
  input: CreateProductOperationInput,
): ProductOperation {
  const productId = input.productId.trim();
  const title = input.title.trim();
  const kind = input.kind;

  if (!title) throw new Error("operation.title is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  if (!(PRODUCT_OPERATION_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid operation kind: ${kind}`);
  }

  if (input.productTenantId) {
    const tenant = getProductTenant(input.productTenantId.trim());
    if (!tenant || tenant.productId !== productId) {
      throw new Error(`product tenant not found: ${input.productTenantId}`);
    }
  }

  if (input.organizationId) {
    const org = getOrganization(input.organizationId.trim());
    if (!org || org.productId !== productId) {
      throw new Error(`organization not found: ${input.organizationId}`);
    }
  }

  const status = input.status ?? "OPEN";
  if (!(PRODUCT_OPERATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid operation status: ${status}`);
  }

  const id = input.id?.trim() || createId("op");
  if (operations.has(id)) throw new Error(`operation already exists: ${id}`);

  const now = nowIso();
  const op: ProductOperation = {
    id,
    productId,
    productTenantId: input.productTenantId?.trim() || undefined,
    organizationId: input.organizationId?.trim() || undefined,
    kind,
    status,
    title,
    detail: input.detail?.trim() || "",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  operations.set(id, op);
  return cloneOp(op);
}

export function setProductOperationStatus(
  id: string,
  status: ProductOperationStatus,
): ProductOperation {
  const op = operations.get(id.trim());
  if (!op) throw new Error(`operation not found: ${id}`);
  if (!(PRODUCT_OPERATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid operation status: ${status}`);
  }
  op.status = status;
  op.updatedAt = nowIso();
  operations.set(op.id, op);
  return cloneOp(op);
}

export function getProductOperation(id: string): ProductOperation | undefined {
  const op = operations.get(id.trim());
  return op ? cloneOp(op) : undefined;
}

export function listProductOperations(filter?: {
  productId?: string;
  productTenantId?: string;
  organizationId?: string;
  kind?: ProductOperationKind;
  status?: ProductOperationStatus;
}): ProductOperation[] {
  let result = [...operations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((o) => o.productTenantId === tid);
  }
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((o) => o.organizationId === oid);
  }
  if (filter?.kind) result = result.filter((o) => o.kind === filter.kind);
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOp);
}

export function clearProductOperations(): void {
  operations.clear();
}
