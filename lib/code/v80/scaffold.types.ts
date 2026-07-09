/**
 * V80 CODE P1 — Code scaffold types
 */

export const V80_CODE_SCAFFOLD_VERSION = "v80-code-scaffold-1" as const;
export const V80_CODE_SCAFFOLD_FREEZE_VERSION = "v80-code-scaffold-freeze-1" as const;

export type ScaffoldFolderKind = "app" | "api" | "lib" | "prisma" | "workflow" | "pdf";

export type ScaffoldFolderNode = {
  id: string;
  kind: ScaffoldFolderKind;
  path: string;
  blueprintRef: string;
  required: boolean;
};

export type ScaffoldModuleStub = {
  id: string;
  path: string;
  exportName: string;
  apiRef: string;
  kind: "service" | "pdf" | "workflow" | "route";
};

export type ScaffoldManifest = {
  version: typeof V80_CODE_SCAFFOLD_VERSION;
  productionVersion: string;
  folderCount: number;
  moduleCount: number;
  routeCount: number;
  prismaSkeleton: string;
  scaffoldComplete: boolean;
  summary: string;
};

export type ScaffoldReport = {
  version: typeof V80_CODE_SCAFFOLD_VERSION;
  freezeVersion: typeof V80_CODE_SCAFFOLD_FREEZE_VERSION;
  reportId: string;
  productionReady: boolean;
  manifest: ScaffoldManifest;
  folders: ScaffoldFolderNode[];
  modules: ScaffoldModuleStub[];
  scaffoldReady: boolean;
  readinessScore: number;
  summary: string;
};
