/**
 * Product API SDK — operation catalog (no runtime execution)
 */

import { SDK_OPERATION_METHODS } from "../management/management.constants";
import { getSdkClient } from "../client/client.registry";
import type {
  RegisterSdkOperationInput,
  SdkOperation,
  SdkOperationMethod,
} from "./operation.types";

const operations = new Map<string, SdkOperation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+$/, "") || "/";
}

function cloneOperation(operation: SdkOperation): SdkOperation {
  return { ...operation, metadata: { ...operation.metadata } };
}

export function registerSdkOperation(
  input: RegisterSdkOperationInput,
): SdkOperation {
  const clientId = input.clientId.trim();
  const operationKey = input.operationKey.trim().toUpperCase();
  const routeKeyRef = input.routeKeyRef.trim().toUpperCase();
  const path = normalizePath(input.path);
  if (!clientId) throw new Error("operation.clientId is required");
  if (!operationKey) throw new Error("operation.operationKey is required");
  if (!routeKeyRef) throw new Error("operation.routeKeyRef is required");
  if (!(SDK_OPERATION_METHODS as readonly string[]).includes(input.method)) {
    throw new Error(`invalid operation method: ${input.method}`);
  }

  const client = getSdkClient(clientId);
  if (!client) throw new Error(`client not found: ${clientId}`);
  if (client.status !== "ACTIVE") {
    throw new Error(`client not active: ${clientId}`);
  }

  const duplicate = [...operations.values()].find(
    (o) => o.clientId === clientId && o.operationKey === operationKey,
  );
  if (duplicate) {
    throw new Error(`operationKey already exists: ${operationKey}`);
  }

  const id = input.id?.trim() || createId("apisdkop");
  if (operations.has(id)) throw new Error(`operation already exists: ${id}`);

  const operation: SdkOperation = {
    id,
    clientId,
    operationKey,
    method: input.method,
    path,
    routeKeyRef,
    detail: `${input.method} ${path}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  operations.set(id, operation);
  return cloneOperation(operation);
}

export function getSdkOperation(id: string): SdkOperation | undefined {
  const operation = operations.get(id.trim());
  return operation ? cloneOperation(operation) : undefined;
}

export function listSdkOperations(filter?: {
  clientId?: string;
  method?: SdkOperationMethod;
}): SdkOperation[] {
  let result = [...operations.values()];
  if (filter?.clientId) {
    const clientId = filter.clientId.trim();
    result = result.filter((o) => o.clientId === clientId);
  }
  if (filter?.method) {
    result = result.filter((o) => o.method === filter.method);
  }
  return result
    .slice()
    .sort((a, b) => a.operationKey.localeCompare(b.operationKey))
    .map(cloneOperation);
}

export function clearSdkOperations(): void {
  operations.clear();
}
