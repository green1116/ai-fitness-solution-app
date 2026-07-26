/**
 * Product API SDK — schema registry (no provider integration)
 */

import { SDK_SCHEMA_KINDS } from "../management/management.constants";
import { getSdkOperation } from "../operation/operation.registry";
import type {
  RegisterSdkSchemaInput,
  SdkSchema,
  SdkSchemaKind,
} from "./schema.types";

const schemas = new Map<string, SdkSchema>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSchema(schema: SdkSchema): SdkSchema {
  return { ...schema, metadata: { ...schema.metadata } };
}

export function registerSdkSchema(input: RegisterSdkSchemaInput): SdkSchema {
  const operationId = input.operationId.trim();
  const schemaKey = input.schemaKey.trim().toUpperCase();
  const shapeRef = input.shapeRef.trim().toUpperCase();
  if (!operationId) throw new Error("schema.operationId is required");
  if (!schemaKey) throw new Error("schema.schemaKey is required");
  if (!shapeRef) throw new Error("schema.shapeRef is required");
  if (!(SDK_SCHEMA_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid schema kind: ${input.kind}`);
  }

  const operation = getSdkOperation(operationId);
  if (!operation) throw new Error(`operation not found: ${operationId}`);

  const duplicateKey = [...schemas.values()].find(
    (s) => s.operationId === operationId && s.schemaKey === schemaKey,
  );
  if (duplicateKey) {
    throw new Error(`schemaKey already exists: ${schemaKey}`);
  }

  const duplicateKind = [...schemas.values()].find(
    (s) => s.operationId === operationId && s.kind === input.kind,
  );
  if (duplicateKind) {
    throw new Error(`schema kind already registered: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("apisdkschema");
  if (schemas.has(id)) throw new Error(`schema already exists: ${id}`);

  const schema: SdkSchema = {
    id,
    operationId,
    schemaKey,
    kind: input.kind,
    shapeRef,
    detail: `kind=${input.kind} shape=${shapeRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  schemas.set(id, schema);
  return cloneSchema(schema);
}

export function getSdkSchema(id: string): SdkSchema | undefined {
  const schema = schemas.get(id.trim());
  return schema ? cloneSchema(schema) : undefined;
}

export function listSdkSchemas(filter?: {
  operationId?: string;
  kind?: SdkSchemaKind;
}): SdkSchema[] {
  let result = [...schemas.values()];
  if (filter?.operationId) {
    const operationId = filter.operationId.trim();
    result = result.filter((s) => s.operationId === operationId);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.schemaKey.localeCompare(b.schemaKey))
    .map(cloneSchema);
}

export function clearSdkSchemas(): void {
  schemas.clear();
}
