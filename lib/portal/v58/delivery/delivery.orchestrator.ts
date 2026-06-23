/**
 * V58 — Delivery orchestration (wraps existing artifacts, no Quote Engine changes)
 */

import type { DeliveryArtifactType, DeliveryRecord, DeliveryStatus } from "./delivery.types";
import { mergeDownloadCounts, registerDeliveryOverlay } from "./delivery.store";

function mapDocType(type: string): DeliveryArtifactType {
  switch (type) {
    case "plan":
      return "plan_pdf";
    case "budget":
      return "budget_pdf";
    case "merged":
      return "merged_pdf";
    case "zip":
      return "zip_package";
    case "tender":
    default:
      return "tender_pack";
  }
}

function mapTenderStatus(status: string): DeliveryStatus {
  if (status === "READY") return "delivered";
  if (status === "FAILED") return "archived";
  if (status === "GENERATING") return "pending";
  return "ready";
}

export function buildDeliveryId(parts: string[]): string {
  return `del_${parts.join("_")}`;
}

export function synthesizeDeliveryFromExport(input: {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  docType: string;
  fileName: string;
  fileUrl?: string | null;
  renderVersion: string;
  createdAt: Date;
  version?: number;
  isLatest?: boolean;
}): DeliveryRecord {
  return {
    id: buildDeliveryId(["export", input.id]),
    organizationId: input.organizationId,
    projectId: input.projectId,
    projectName: input.projectName,
    version: input.version ?? 1,
    isLatest: input.isLatest ?? true,
    artifactType: mapDocType(input.docType),
    status: input.fileUrl ? "delivered" : "ready",
    fileName: input.fileName,
    downloadUrl: input.fileUrl ?? `/api/pdf?projectId=${input.projectId}&type=${input.docType}`,
    renderVersion: input.renderVersion,
    createdAt: input.createdAt.toISOString(),
    downloadCount: 0,
  };
}

export function synthesizeDeliveryFromTender(input: {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  quoteId?: string | null;
  budgetId?: string | null;
  status: string;
  fileName?: string | null;
  fileUrl?: string | null;
  renderVersion: string;
  createdAt: Date;
  version?: number;
  isLatest?: boolean;
}): DeliveryRecord {
  return {
    id: buildDeliveryId(["tender", input.id]),
    organizationId: input.organizationId,
    projectId: input.projectId,
    projectName: input.projectName,
    quoteId: input.quoteId ?? undefined,
    budgetId: input.budgetId ?? undefined,
    version: input.version ?? 1,
    isLatest: input.isLatest ?? true,
    artifactType: "tender_pack",
    status: mapTenderStatus(input.status),
    fileName: input.fileName ?? `tender-${input.id}.pdf`,
    downloadUrl: input.fileUrl ?? `/tender?projectId=${input.projectId}`,
    renderVersion: input.renderVersion,
    createdAt: input.createdAt.toISOString(),
    downloadCount: 0,
  };
}

export function synthesizeDeliveryFromQuote(input: {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  status: string;
  createdAt: Date;
  version?: number;
  isLatest?: boolean;
}): DeliveryRecord {
  return {
    id: buildDeliveryId(["quote", input.id]),
    organizationId: input.organizationId,
    projectId: input.projectId,
    projectName: input.projectName,
    quoteId: input.id,
    version: input.version ?? 1,
    isLatest: input.isLatest ?? true,
    artifactType: "quote_pdf",
    status: input.status === "DRAFT" ? "pending" : "ready",
    fileName: `quote-${input.id.slice(0, 8)}.pdf`,
    downloadUrl: `/documents/quotes/${input.id}`,
    renderVersion: "v58-delivery",
    createdAt: input.createdAt.toISOString(),
    downloadCount: 0,
  };
}

export function registerQuoteDelivery(input: Parameters<typeof synthesizeDeliveryFromQuote>[0]): DeliveryRecord {
  const record = synthesizeDeliveryFromQuote(input);
  return registerDeliveryOverlay(record);
}

export function applyVersionGroups(records: DeliveryRecord[]): DeliveryRecord[] {
  const byKey = new Map<string, DeliveryRecord[]>();
  for (const r of records) {
    const key = `${r.projectId}:${r.artifactType}`;
    const list = byKey.get(key) ?? [];
    list.push(r);
    byKey.set(key, list);
  }

  const result: DeliveryRecord[] = [];
  for (const list of byKey.values()) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    sorted.forEach((r, i) => {
      result.push({ ...r, isLatest: i === 0, version: sorted.length - i });
    });
  }
  return mergeDownloadCounts(result);
}

export function buildTenderPackBundle(projectId: string, deliveries: DeliveryRecord[]) {
  const projectDeliveries = deliveries.filter((d) => d.projectId === projectId);
  return {
    projectId,
    planPdf: projectDeliveries.find((d) => d.artifactType === "plan_pdf" && d.isLatest),
    budgetPdf: projectDeliveries.find((d) => d.artifactType === "budget_pdf" && d.isLatest),
    quotePdf: projectDeliveries.find((d) => d.artifactType === "quote_pdf" && d.isLatest),
    mergedPdf: projectDeliveries.find((d) => d.artifactType === "merged_pdf" && d.isLatest),
    zipPackage: projectDeliveries.find((d) => d.artifactType === "zip_package" && d.isLatest),
    tenderPack: projectDeliveries.find((d) => d.artifactType === "tender_pack" && d.isLatest),
    all: projectDeliveries,
    history: projectDeliveries.filter((d) => !d.isLatest),
  };
}
