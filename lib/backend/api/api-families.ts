/**
 * PI-3.4 — Closed API family catalogue (PD-5.3 §2.2).
 * Existing families only — no new /api inventories.
 */
import type { ProductDomainId } from "../foundation/domain-ownership";

export const API_SURFACE_LAYER_ID =
  "product-backend-api-architecture-v1" as const;

export const API_SURFACE_GATE_ID =
  "product-backend-api-architecture-gate" as const;

export const API_FAMILY_IDS = [
  "FAM-AUTH",
  "FAM-V80",
  "FAM-PROJECT",
  "FAM-WORKSPACE",
  "FAM-TENDER",
  "FAM-DOCUMENTS",
  "FAM-PDF",
  "FAM-SALES",
  "FAM-DOWNLOAD",
  "FAM-OPS",
  "FAM-PLAN",
] as const;

export type ApiFamilyId = (typeof API_FAMILY_IDS)[number];

export type ApiFamilyRecord = Readonly<{
  familyId: ApiFamilyId;
  prefix: string;
  ownerDomain: ProductDomainId;
  role: string;
}>;

/**
 * PD-5.3 §2.2 closed set (11). Prefixes are existing route surfaces only.
 */
export const API_FAMILY_CATALOGUE = [
  {
    familyId: "FAM-AUTH",
    prefix: "/api/auth",
    ownerDomain: "M13",
    role: "Sign-in / session observe",
  },
  {
    familyId: "FAM-V80",
    prefix: "/api/v80",
    ownerDomain: "M13",
    role: "Preferred product runtime (mixed M owners by route)",
  },
  {
    familyId: "FAM-PROJECT",
    prefix: "/api/project",
    ownerDomain: "M13",
    role: "Project list / detail",
  },
  {
    familyId: "FAM-WORKSPACE",
    prefix: "/api/workspace",
    ownerDomain: "M13",
    role: "Workspace summary surfaces",
  },
  {
    familyId: "FAM-TENDER",
    prefix: "/api/tender",
    ownerDomain: "M11",
    role: "Legacy / secondary tender",
  },
  {
    familyId: "FAM-DOCUMENTS",
    prefix: "/api/documents",
    ownerDomain: "M11",
    role: "Document catalog",
  },
  {
    familyId: "FAM-PDF",
    prefix: "/api/v80/pdf",
    ownerDomain: "M11",
    role: "Artifact render / download (+ proposal-pdf)",
  },
  {
    familyId: "FAM-SALES",
    prefix: "/api/sales",
    ownerDomain: "M14",
    role: "Opportunity signals",
  },
  {
    familyId: "FAM-DOWNLOAD",
    prefix: "/api/download-token",
    ownerDomain: "M15",
    role: "Share / delivery nearest",
  },
  {
    familyId: "FAM-OPS",
    prefix: "/api/enterprise-saas",
    ownerDomain: "M13",
    role: "Admin / governance (+ v80 ops)",
  },
  {
    familyId: "FAM-PLAN",
    prefix: "/api/plan",
    ownerDomain: "M14",
    role: "Nearest planning bootstrap",
  },
] as const satisfies readonly ApiFamilyRecord[];

export function getApiFamily(
  familyId: ApiFamilyId,
): ApiFamilyRecord | undefined {
  return API_FAMILY_CATALOGUE.find((row) => row.familyId === familyId);
}

/**
 * Classify an existing route path into a closed family.
 * Longer / more specific prefixes win (e.g. pdf over v80).
 */
export function classifyApiFamily(routePath: string): ApiFamilyId | null {
  const path = routePath.split("?")[0] ?? routePath;
  if (
    path.startsWith("/api/v80/pdf") ||
    path.startsWith("/api/v80/proposal-pdf")
  ) {
    return "FAM-PDF";
  }
  if (
    path.startsWith("/api/v80/ops") ||
    path.startsWith("/api/v80/production")
  ) {
    return "FAM-OPS";
  }
  if (path.startsWith("/api/enterprise-saas")) return "FAM-OPS";
  if (
    path.startsWith("/api/download-token") ||
    path.startsWith("/api/commercial-delivery")
  ) {
    return "FAM-DOWNLOAD";
  }
  if (path.startsWith("/api/onboarding") || path === "/api/plan") {
    return "FAM-PLAN";
  }
  if (path.startsWith("/api/auth")) return "FAM-AUTH";
  if (path.startsWith("/api/project")) return "FAM-PROJECT";
  if (path.startsWith("/api/workspace")) return "FAM-WORKSPACE";
  if (path.startsWith("/api/tender")) return "FAM-TENDER";
  if (path.startsWith("/api/documents")) return "FAM-DOCUMENTS";
  if (path.startsWith("/api/sales")) return "FAM-SALES";
  if (path.startsWith("/api/v80")) return "FAM-V80";
  return null;
}
