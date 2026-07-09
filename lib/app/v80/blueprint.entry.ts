/**
 * V80 APP P3 — Implementation blueprint entry (read-only)
 */
export {
  API_IMPLEMENTATION_SPECS,
  getApiImplementationByRoute,
  isApiImplementationSpecComplete,
} from "./blueprint.api.impl";
export { assertImplementationBlueprintPass, buildImplementationBlueprint } from "./blueprint.builder";
export {
  PDF_PIPELINE_BLUEPRINTS,
  getPdfPipelineByType,
  isPdfPipelineBlueprintComplete,
} from "./blueprint.pdf.pipeline";
export {
  PRISMA_RELATION_MODEL,
  getPrismaRelationsForModel,
  isPrismaRelationModelComplete,
} from "./blueprint.prisma.relations";
export {
  TENDER_PACK_EXECUTION_BLUEPRINT,
  getWorkflowStepBlueprint,
  isWorkflowExecutionBlueprintComplete,
} from "./blueprint.workflow.execution";
export {
  V80_APP_BLUEPRINT_FREEZE_VERSION,
  V80_APP_BLUEPRINT_VERSION,
} from "./blueprint.types";
export type {
  ApiImplementationSpec,
  ImplementationBlueprintReport,
  PdfPipelineBlueprint,
  PrismaRelationSpec,
  WorkflowExecutionBlueprint,
} from "./blueprint.types";

import { buildImplementationBlueprint } from "./blueprint.builder";
import type { ImplementationBlueprintReport } from "./blueprint.types";

export function runImplementationBlueprint(input?: {
  deploymentId?: string;
}): ImplementationBlueprintReport {
  return buildImplementationBlueprint(input);
}

export function formatImplementationBlueprintSummary(
  report: ImplementationBlueprintReport,
): string {
  return [
    "V80 APP Implementation Blueprint",
    `  ready: ${report.blueprintReady}`,
    `  score: ${report.readinessScore}/100`,
    `  engineering: ${report.engineeringDecompositionReady}`,
    `  apiSpecs: ${report.manifest.apiSpecCount}`,
    `  relations: ${report.manifest.relationCount}`,
    `  workflowSteps: ${report.manifest.workflowStepCount}`,
    `  pdfPipelines: ${report.manifest.pdfPipelineCount}`,
  ].join("\n");
}
