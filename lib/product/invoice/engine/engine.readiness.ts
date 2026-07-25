/**
 * Product Invoice — readiness
 */

import { PRODUCT_PRICING_MANAGEMENT_ID } from "../../pricing/management/management.constants";
import { listDocuments } from "../document/document.registry";
import { listLines } from "../line/line.registry";
import { listSettlements } from "../settlement/settlement.registry";
import { listTaxes } from "../tax/tax.registry";
import { PRODUCT_INVOICE_ENGINE_BASE } from "./engine.constants";
import type {
  InvoiceReadinessCheck,
  InvoiceReadinessResult,
} from "./engine.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): InvoiceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateInvoiceEngineReadiness(): InvoiceReadinessResult {
  const checks: InvoiceReadinessCheck[] = [];

  checks.push(
    check(
      "INV-BASE",
      "foundation",
      "Pricing management baseline aligned",
      PRODUCT_INVOICE_ENGINE_BASE === PRODUCT_PRICING_MANAGEMENT_ID,
      `base=${PRODUCT_INVOICE_ENGINE_BASE}`,
    ),
  );

  const documents = listDocuments();
  checks.push(
    check(
      "INV-DOC",
      "document",
      "Issued or settled documents present",
      documents.some(
        (d) => d.status === "ISSUED" || d.status === "SETTLED",
      ),
      `documents=${documents.length}`,
    ),
  );

  const lines = listLines();
  checks.push(
    check(
      "INV-LN",
      "line",
      "Invoice lines present",
      lines.some((l) => l.kind === "CHARGE"),
      `lines=${lines.length}`,
    ),
  );

  const taxes = listTaxes();
  checks.push(
    check(
      "INV-TAX",
      "tax",
      "Tax applications present",
      taxes.length >= 1,
      `taxes=${taxes.length}`,
    ),
  );

  const settlements = listSettlements();
  checks.push(
    check(
      "INV-SET",
      "settlement",
      "Settled settlements present",
      settlements.some((s) => s.result === "SETTLED"),
      `settlements=${settlements.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-invoice readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertInvoiceEngineReadinessReady(
  result: InvoiceReadinessResult,
): asserts result is InvoiceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product invoice engine not ready: ${result.summary}`);
  }
}
