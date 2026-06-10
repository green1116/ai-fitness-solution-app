import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import {
  buildOrderLifecycle,
  buildOrderModel,
  buildOrderSummary,
} from "./builders";
import type { OrderRuntimePayload } from "./types";
import { ORDER_RUNTIME_VERSION } from "./types";

export function validateOrderRuntime(input?: { deploymentId?: string }): {
  modelValid: boolean;
  lifecycleValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "order-default";
  const order = buildOrderModel({ deploymentId });
  const lifecycle = buildOrderLifecycle({ deploymentId, order });
  const summary = buildOrderSummary({ deploymentId, order, lifecycle });

  return {
    modelValid:
      order.orderId.length > 0 &&
      order.currency === "CNY" &&
      order.amount >= 0,
    lifecycleValid:
      lifecycle.events.length >= 4 &&
      lifecycle.currentStage === "closed" &&
      lifecycle.events.every((event) => event.orderId === order.orderId),
    summaryValid:
      summary.summaryId.length > 0 &&
      summary.orderId === order.orderId &&
      summary.lifecycleStage === lifecycle.currentStage,
  };
}

export function runOrderRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<OrderRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "order-default";
  const stages: RevenueStageResult[] = [];

  const order = runStage(
    "order-model",
    "Order Model",
    () => buildOrderModel({ deploymentId }),
    stages,
  );
  const lifecycle = runStage(
    "order-lifecycle",
    "Order Lifecycle",
    () => buildOrderLifecycle({ deploymentId, order }),
    stages,
  );
  const summary = runStage(
    "order-summary",
    "Order Summary",
    () => buildOrderSummary({ deploymentId, order, lifecycle }),
    stages,
  );

  const validation = runStage(
    "order-validate",
    "Order Validation",
    () => validateOrderRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Order runtime validation failed");
  }

  const payload: OrderRuntimePayload = {
    version: ORDER_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    order,
    lifecycle,
    summary,
  };

  return finalizeRuntime({
    domain: "order",
    deploymentId,
    stages,
    payload,
    summary: summary.summary,
  });
}
