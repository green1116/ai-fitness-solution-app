/**
 * V80 APP P3 — Implementation blueprint types (spec only)
 */

export const V80_APP_BLUEPRINT_VERSION = "v80-app-implementation-blueprint-1" as const;
export const V80_APP_BLUEPRINT_FREEZE_VERSION =
  "v80-app-implementation-blueprint-freeze-1" as const;

export type ApiImplementationSpec = {
  id: string;
  engineeringRef: string;
  route: string;
  method: string;
  handlerPath: string;
  input: { source: string; zodSchema: string; required: string[] };
  service: { module: string; function: string; prismaTx: boolean };
  response: { success: Record<string, string>; statusCode: number };
  errors: { code: string; status: number; when: string }[];
  gate: string;
  required: boolean;
};

export type PrismaRelationSpec = {
  id: string;
  from: string;
  to: string;
  fk: string;
  onDelete: "Cascade" | "Restrict" | "SetNull";
  index: string[];
  notes: string;
};

export type WorkflowStateKind =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "retrying";

export type WorkflowStepBlueprint = {
  stepKey: string;
  state: WorkflowStateKind;
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
  onFailure: "abort" | "retry" | "skip";
  dagNodeRef: string;
};

export type WorkflowExecutionBlueprint = {
  id: string;
  dagRef: string;
  jobModel: string;
  initialState: WorkflowStateKind;
  terminalStates: WorkflowStateKind[];
  steps: WorkflowStepBlueprint[];
  stateTransitions: { from: WorkflowStateKind; to: WorkflowStateKind; event: string }[];
};

export type PdfSectionSpec = {
  key: string;
  pages: number;
  renderer: string;
  assets: string[];
};

export type PdfPipelineBlueprint = {
  id: string;
  artifactType: "plan" | "budget" | "proposal" | "bundle";
  entry: string;
  pdfLibFlow: string[];
  sections: PdfSectionSpec[];
  output: { mime: string; storage: string; model: string };
};

export type ImplementationBlueprintManifest = {
  version: typeof V80_APP_BLUEPRINT_VERSION;
  engineeringVersion: string;
  apiSpecCount: number;
  relationCount: number;
  workflowStepCount: number;
  pdfPipelineCount: number;
  blueprintComplete: boolean;
  summary: string;
};

export type ImplementationBlueprintReport = {
  version: typeof V80_APP_BLUEPRINT_VERSION;
  freezeVersion: typeof V80_APP_BLUEPRINT_FREEZE_VERSION;
  reportId: string;
  engineeringDecompositionReady: boolean;
  manifest: ImplementationBlueprintManifest;
  apiImplementations: ApiImplementationSpec[];
  prismaRelations: PrismaRelationSpec[];
  workflowExecution: WorkflowExecutionBlueprint;
  pdfPipelines: PdfPipelineBlueprint[];
  blueprintReady: boolean;
  readinessScore: number;
  summary: string;
};
