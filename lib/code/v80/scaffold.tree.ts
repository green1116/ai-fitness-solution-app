/**
 * V80 CODE P1 — Next.js folder tree (from APP P1–P4)
 */
import type { ScaffoldFolderNode } from "./scaffold.types";

export const SCAFFOLD_FOLDER_TREE: ScaffoldFolderNode[] = [
  { id: "SCF-FLD-001", kind: "app", path: "app/(dashboard)/", blueprintRef: "ENG-FLD-001", required: true },
  { id: "SCF-FLD-002", kind: "api", path: "app/api/enterprise-saas/", blueprintRef: "BLP-API-001", required: true },
  { id: "SCF-FLD-003", kind: "api", path: "app/api/entitlements/", blueprintRef: "BLP-API-002", required: true },
  { id: "SCF-FLD-004", kind: "api", path: "app/api/budget/calculate/", blueprintRef: "BLP-API-003", required: true },
  { id: "SCF-FLD-005", kind: "api", path: "app/api/autopilot/job/run/", blueprintRef: "BLP-API-004", required: true },
  { id: "SCF-FLD-006", kind: "api", path: "app/api/tender/intake/", blueprintRef: "BLP-API-005", required: true },
  { id: "SCF-FLD-007", kind: "api", path: "app/api/production/integrity/", blueprintRef: "BLP-API-006", required: true },
  { id: "SCF-FLD-008", kind: "api", path: "app/api/proposal-pdf/render/", blueprintRef: "BLP-API-007", required: true },
  { id: "SCF-FLD-009", kind: "api", path: "app/api/pdf/", blueprintRef: "BLP-API-008", required: true },
  { id: "SCF-FLD-010", kind: "lib", path: "lib/scaffold/v80/services/", blueprintRef: "BLP-API-*", required: true },
  { id: "SCF-FLD-011", kind: "workflow", path: "lib/scaffold/v80/workflow/", blueprintRef: "BLP-WFL-001", required: true },
  { id: "SCF-FLD-012", kind: "pdf", path: "lib/scaffold/v80/pdf/", blueprintRef: "BLP-PDF-*", required: true },
  { id: "SCF-FLD-013", kind: "prisma", path: "prisma/scaffold/v80-entities.prisma", blueprintRef: "BLP-REL-*", required: true },
];

export function isScaffoldFolderTreeComplete(): boolean {
  const kinds = new Set(SCAFFOLD_FOLDER_TREE.map((f) => f.kind));
  return SCAFFOLD_FOLDER_TREE.length === 13 && kinds.size === 6;
}

export function formatScaffoldFolderTree(): string {
  return SCAFFOLD_FOLDER_TREE.map((f) => `[${f.kind}] ${f.path}`).join("\n");
}
