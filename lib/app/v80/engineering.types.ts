/**
 * V80 APP P2 — Engineering decomposition types (spec only)
 */

export const V80_APP_ENGINEERING_VERSION = "v80-app-engineering-decomposition-1" as const;
export const V80_APP_ENGINEERING_FREEZE_VERSION =
  "v80-app-engineering-decomposition-freeze-1" as const;

export type EngineeringFolderKind = "app" | "lib" | "api" | "prisma" | "pdf" | "workflow";

export type EngineeringFolderEntry = {
  id: string;
  kind: EngineeringFolderKind;
  path: string;
  productModuleRef: string;
  apiRef?: string;
  required: boolean;
  description: string;
};

export type PrismaDomainKind =
  | "identity"
  | "commercial"
  | "tender"
  | "document"
  | "workflow"
  | "audit";

export type PrismaModuleEntry = {
  id: string;
  domain: PrismaDomainKind;
  schemaFile: string;
  models: string[];
  productModuleRef: string;
  relations: string[];
  required: boolean;
  description: string;
};

export type ApiHandlerSpec = {
  id: string;
  productApiRef: string;
  route: string;
  method: string;
  handlerPath: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  prismaModels: string[];
  pdfLib?: string;
  required: boolean;
  description: string;
};

export type WorkflowDagNode = {
  id: string;
  stepKey: string;
  apiRoute: string;
  pdfStage?: string;
  prismaWrite: string[];
  required: boolean;
};

export type WorkflowDagEdge = {
  id: string;
  fromNode: string;
  toNode: string;
  condition: string;
};

export type WorkflowDagSpec = {
  id: string;
  workflowRef: string;
  dagKey: string;
  nodes: WorkflowDagNode[];
  edges: WorkflowDagEdge[];
  pdfPipeline: string[];
  required: boolean;
  description: string;
};

export type EngineeringDecompositionManifest = {
  version: typeof V80_APP_ENGINEERING_VERSION;
  productCompilerVersion: string;
  folderCount: number;
  prismaModuleCount: number;
  apiSpecCount: number;
  dagNodeCount: number;
  decompositionComplete: boolean;
  summary: string;
};

export type EngineeringDecompositionReport = {
  version: typeof V80_APP_ENGINEERING_VERSION;
  freezeVersion: typeof V80_APP_ENGINEERING_FREEZE_VERSION;
  reportId: string;
  productCompilerReady: boolean;
  manifest: EngineeringDecompositionManifest;
  folders: EngineeringFolderEntry[];
  prismaModules: PrismaModuleEntry[];
  apiSpecs: ApiHandlerSpec[];
  workflowDag: WorkflowDagSpec;
  decompositionReady: boolean;
  readinessScore: number;
  summary: string;
};
