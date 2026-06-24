/**
 * V58 — Delivery record types (Portal layer, no schema change)
 */

export type DeliveryArtifactType =
  | "plan_pdf"
  | "budget_pdf"
  | "quote_pdf"
  | "merged_pdf"
  | "zip_package"
  | "tender_pack";

export type DeliveryStatus = "pending" | "ready" | "delivered" | "archived";

export type DeliveryRecord = {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  quoteId?: string;
  budgetId?: string;
  version: number;
  isLatest: boolean;
  artifactType: DeliveryArtifactType;
  status: DeliveryStatus;
  fileName?: string;
  downloadUrl?: string;
  renderVersion?: string;
  createdAt: string;
  downloadCount: number;
};

export type DeliveryVersionGroup = {
  artifactType: DeliveryArtifactType;
  projectId: string;
  latest: DeliveryRecord;
  archived: DeliveryRecord[];
};
