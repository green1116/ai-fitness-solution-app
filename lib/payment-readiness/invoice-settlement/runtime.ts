import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildInvoiceSettlementRecords,
  buildInvoiceSettlementStates,
  buildInvoiceSettlementTransitions,
  INVOICE_SETTLEMENT_STATUSES,
} from "./states";
import type { InvoiceSettlementRuntimePayload } from "./types";
import { INVOICE_SETTLEMENT_RUNTIME_VERSION } from "./types";

export function validateInvoiceSettlementRuntime(input?: {
  deploymentId?: string;
}): {
  statesValid: boolean;
  transitionsValid: boolean;
  recordsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "invoice-settlement-default";
  const states = buildInvoiceSettlementStates();
  const transitions = buildInvoiceSettlementTransitions();
  const records = buildInvoiceSettlementRecords({ deploymentId });
  const statusSet = new Set(states.map((state) => state.status));

  return {
    statesValid:
      states.length === INVOICE_SETTLEMENT_STATUSES.length &&
      INVOICE_SETTLEMENT_STATUSES.every((status) => statusSet.has(status)),
    transitionsValid:
      transitions.length >= 3 &&
      transitions.some((t) => t.from === "pending" && t.to === "paid"),
    recordsValid:
      records.length === INVOICE_SETTLEMENT_STATUSES.length &&
      records.every((record) => record.mode === "readiness-stub"),
  };
}

export function runInvoiceSettlementRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<InvoiceSettlementRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "invoice-settlement-default";
  const stages: PaymentReadinessStageResult[] = [];

  const states = runStage(
    "invoice-settlement-states",
    "Invoice Settlement States",
    () => buildInvoiceSettlementStates(),
    stages,
  );
  const transitions = runStage(
    "invoice-settlement-transitions",
    "Invoice Settlement Transitions",
    () => buildInvoiceSettlementTransitions(),
    stages,
  );
  const records = runStage(
    "invoice-settlement-records",
    "Invoice Settlement Records",
    () => buildInvoiceSettlementRecords({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "invoice-settlement-validate",
    "Invoice Settlement Validation",
    () => validateInvoiceSettlementRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Invoice settlement runtime validation failed");
  }

  const payload: InvoiceSettlementRuntimePayload = {
    version: INVOICE_SETTLEMENT_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    states,
    transitions,
    records,
    summary: `invoice-settlement-runtime states=${states.length} transitions=${transitions.length} records=${records.length}`,
  };

  return finalizeRuntime({
    domain: "invoice-settlement",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
