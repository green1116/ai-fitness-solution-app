/**
 * Post-Launch P1 — Production Operation Model
 * Integrates launch control plane + SLA support bindings
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getLaunchOrchestration } from "../../launch/control/control.orchestration";
import { getProductionProfile } from "../../launch/launch.profile";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import { PRODUCTION_OPERATION_STATUSES } from "./production.constants";
import type {
  CreateProductionOperationInput,
  ProductionOperation,
  ProductionOperationStatus,
} from "./production.types";

const operations = new Map<string, ProductionOperation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOperation(operation: ProductionOperation): ProductionOperation {
  return {
    ...operation,
    metadata: { ...operation.metadata },
  };
}

export function createProductionOperation(
  input: CreateProductionOperationInput,
): ProductionOperation {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();

  if (!name) throw new Error("productionOperation.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  if (input.orchestrationId) {
    const orch = getLaunchOrchestration(input.orchestrationId.trim());
    if (!orch || orch.productId !== productId) {
      throw new Error(`orchestration not found: ${input.orchestrationId}`);
    }
  }

  if (input.supportSlaProfileId) {
    const support = getSupportSlaProfile(input.supportSlaProfileId.trim());
    if (!support || support.productId !== productId) {
      throw new Error(
        `support sla profile not found: ${input.supportSlaProfileId}`,
      );
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(PRODUCTION_OPERATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid production operation status: ${status}`);
  }

  const id = input.id?.trim() || createId("prodop");
  if (operations.has(id)) {
    throw new Error(`production operation already exists: ${id}`);
  }

  const now = nowIso();
  const operation: ProductionOperation = {
    id,
    name,
    productId,
    productionProfileId,
    orchestrationId: input.orchestrationId?.trim() || undefined,
    supportSlaProfileId: input.supportSlaProfileId?.trim() || undefined,
    cloudRuntimeId: input.cloudRuntimeId?.trim() || undefined,
    status,
    metadata: {
      ...(input.metadata ?? {}),
      launchCompleteBase: ENTERPRISE_LAUNCH_COMPLETE_ID,
    },
    createdAt: now,
    updatedAt: now,
  };
  operations.set(id, operation);
  return cloneOperation(operation);
}

export function getProductionOperation(
  id: string,
): ProductionOperation | undefined {
  const operation = operations.get(id.trim());
  return operation ? cloneOperation(operation) : undefined;
}

export function listProductionOperations(filter?: {
  productId?: string;
  status?: ProductionOperationStatus;
}): ProductionOperation[] {
  let result = [...operations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOperation);
}

export function setProductionOperationStatus(
  id: string,
  status: ProductionOperationStatus,
): ProductionOperation {
  const operation = operations.get(id.trim());
  if (!operation) throw new Error(`production operation not found: ${id}`);
  if (!(PRODUCTION_OPERATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid production operation status: ${status}`);
  }
  operation.status = status;
  operation.updatedAt = nowIso();
  operations.set(operation.id, operation);
  return cloneOperation(operation);
}

export function clearProductionOperations(): void {
  operations.clear();
}
