import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import { buildInvoiceSummary, buildInvoices } from "./builders";
import type { InvoiceRuntimePayload } from "./types";
import { INVOICE_RUNTIME_VERSION } from "./types";

export function validateInvoiceRuntime(input?: { deploymentId?: string }): {
  modelValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "invoice-default";
  const invoices = buildInvoices({ deploymentId });
  const summary = buildInvoiceSummary({ deploymentId, invoices });
  const statuses = new Set(invoices.map((inv) => inv.status));

  return {
    modelValid:
      invoices.length >= 4 &&
      statuses.has("draft") &&
      statuses.has("issued") &&
      statuses.has("paid") &&
      statuses.has("overdue") &&
      invoices.every((inv) => inv.total >= inv.subtotal),
    summaryValid:
      summary.totalInvoices === invoices.length &&
      summary.paidCount >= 1 &&
      summary.totalBilled >= summary.totalCollected,
  };
}

export function runInvoiceRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<InvoiceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "invoice-default";
  const stages: RevenueStageResult[] = [];

  const invoices = runStage(
    "invoice-model",
    "Invoice Model",
    () => buildInvoices({ deploymentId }),
    stages,
  );
  const summary = runStage(
    "invoice-summary",
    "Invoice Summary",
    () => buildInvoiceSummary({ deploymentId, invoices }),
    stages,
  );

  const validation = runStage(
    "invoice-validate",
    "Invoice Validation",
    () => validateInvoiceRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Invoice runtime validation failed");
  }

  const payload: InvoiceRuntimePayload = {
    version: INVOICE_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    invoices,
    summary,
  };

  return finalizeRuntime({
    domain: "invoice",
    deploymentId,
    stages,
    payload,
    summary: summary.summary,
  });
}
