import {
  buildDeliverableRoutingContext,
  routeDeliverablePdf,
} from "@/lib/commercial-products/access-layer/pdf/deliverable-pdf-router";
import { getQuoteSnapshotById } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import type {
  DeliverablePackageFile,
  DeliverablePackageManifest,
  DeliverablePackageRequest,
  DeliverablePackageResult,
} from "./deliverable-package-types";
import { DELIVERABLE_PACKAGE_VERSION } from "./deliverable-package-types";
import { renderPackageCoverPdf } from "./render-package-cover-pdf";

function resolveSnapshot(request: DeliverablePackageRequest) {
  return request.snapshot ?? getQuoteSnapshotById(request.quoteId);
}

export async function buildDeliverablePackage(
  request: DeliverablePackageRequest,
): Promise<DeliverablePackageResult> {
  if (!request.quoteId?.trim()) {
    throw new Error("quoteId is required");
  }

  const snapshot = resolveSnapshot(request);
  const generatedAt = new Date().toISOString();
  const routerRequest = {
    quoteId: request.quoteId,
    planId: request.planId,
    budgetId: request.budgetId,
    snapshot,
  };

  const context = buildDeliverableRoutingContext({
    ...routerRequest,
    type: "summary",
  });

  const coverBuffer = await renderPackageCoverPdf({
    quoteId: request.quoteId,
    projectName: context.projectName,
    sku: context.sku,
    generatedAt,
  });

  const summary = await routeDeliverablePdf({ ...routerRequest, type: "summary" });
  const plan = await routeDeliverablePdf({ ...routerRequest, type: "plan" });
  const budget = await routeDeliverablePdf({ ...routerRequest, type: "budget" });

  const includedFiles = ["cover.pdf", "summary.pdf", "plan.pdf", "budget.pdf", "manifest.json"];

  const manifest: DeliverablePackageManifest = {
    quoteId: request.quoteId,
    planId: context.planId,
    budgetId: context.budgetId,
    generatedAt,
    includedFiles,
    version: DELIVERABLE_PACKAGE_VERSION,
    sku: context.sku,
    projectName: context.projectName,
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBuffer = new TextEncoder().encode(manifestJson);

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file("cover.pdf", coverBuffer);
  zip.file("summary.pdf", summary.buffer);
  zip.file("plan.pdf", plan.buffer);
  zip.file("budget.pdf", budget.buffer);
  zip.file("manifest.json", manifestBuffer);

  const buffer = await zip.generateAsync({ type: "uint8array" });

  const files: DeliverablePackageFile[] = [
    { name: "cover.pdf", mimeType: "application/pdf", byteLength: coverBuffer.byteLength },
    { name: "summary.pdf", mimeType: "application/pdf", byteLength: summary.buffer.byteLength },
    { name: "plan.pdf", mimeType: "application/pdf", byteLength: plan.buffer.byteLength },
    { name: "budget.pdf", mimeType: "application/pdf", byteLength: budget.buffer.byteLength },
    { name: "manifest.json", mimeType: "application/json", byteLength: manifestBuffer.byteLength },
  ];

  return {
    filename: `deliverable-package-${request.quoteId}.zip`,
    mimeType: "application/zip",
    buffer,
    source: "deliverable-package",
    files,
    manifest,
  };
}
