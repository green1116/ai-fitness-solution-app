export async function loadSummaryPdfRenderer() {
  return import("@/lib/commercial-products/access-layer/pdf/render-summary-pdf");
}

export async function loadSummaryPdfRuntime() {
  return import("@/lib/commercial-products/access-layer/pdf/summary-pdf-runtime");
}

export async function loadPlanPdfRenderer() {
  return import("@/lib/pdf/render");
}

export async function loadBudgetPdfRenderer() {
  return import("@/lib/pdf/budgetRender");
}
