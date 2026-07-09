/**
 * V80 APP P3 — Implementation blueprint builder (read-only P2 consumer)
 */
import { buildEngineeringDecomposition } from "./engineering.decomposition.builder";
import { V80_APP_ENGINEERING_VERSION } from "./engineering.types";
import { isApiImplementationSpecComplete, API_IMPLEMENTATION_SPECS } from "./blueprint.api.impl";
import {
  isPdfPipelineBlueprintComplete,
  PDF_PIPELINE_BLUEPRINTS,
} from "./blueprint.pdf.pipeline";
import {
  isPrismaRelationModelComplete,
  PRISMA_RELATION_MODEL,
} from "./blueprint.prisma.relations";
import {
  isWorkflowExecutionBlueprintComplete,
  TENDER_PACK_EXECUTION_BLUEPRINT,
} from "./blueprint.workflow.execution";
import type {
  ImplementationBlueprintManifest,
  ImplementationBlueprintReport,
} from "./blueprint.types";
import {
  V80_APP_BLUEPRINT_FREEZE_VERSION,
  V80_APP_BLUEPRINT_VERSION,
} from "./blueprint.types";

export function buildImplementationBlueprintManifest(input: {
  engineeringReady: boolean;
}): ImplementationBlueprintManifest {
  const apiComplete = isApiImplementationSpecComplete();
  const relationsComplete = isPrismaRelationModelComplete();
  const workflowComplete = isWorkflowExecutionBlueprintComplete();
  const pdfComplete = isPdfPipelineBlueprintComplete();

  const blueprintComplete =
    input.engineeringReady && apiComplete && relationsComplete && workflowComplete && pdfComplete;

  return {
    version: V80_APP_BLUEPRINT_VERSION,
    engineeringVersion: V80_APP_ENGINEERING_VERSION,
    apiSpecCount: API_IMPLEMENTATION_SPECS.length,
    relationCount: PRISMA_RELATION_MODEL.length,
    workflowStepCount: TENDER_PACK_EXECUTION_BLUEPRINT.steps.length,
    pdfPipelineCount: PDF_PIPELINE_BLUEPRINTS.length,
    blueprintComplete,
    summary: `implementation-blueprint complete=${blueprintComplete} apis=${API_IMPLEMENTATION_SPECS.length} relations=${PRISMA_RELATION_MODEL.length}`,
  };
}

export function buildImplementationBlueprint(input?: {
  deploymentId?: string;
}): ImplementationBlueprintReport {
  const deploymentId = input?.deploymentId ?? "v80-app-blueprint-default";
  const engineering = buildEngineeringDecomposition({ deploymentId });
  const manifest = buildImplementationBlueprintManifest({
    engineeringReady: engineering.decompositionReady,
  });

  const blueprintReady = engineering.decompositionReady && manifest.blueprintComplete;

  return {
    version: V80_APP_BLUEPRINT_VERSION,
    freezeVersion: V80_APP_BLUEPRINT_FREEZE_VERSION,
    reportId: `implementation-blueprint-${deploymentId}`,
    engineeringDecompositionReady: engineering.decompositionReady,
    manifest,
    apiImplementations: API_IMPLEMENTATION_SPECS,
    prismaRelations: PRISMA_RELATION_MODEL,
    workflowExecution: TENDER_PACK_EXECUTION_BLUEPRINT,
    pdfPipelines: PDF_PIPELINE_BLUEPRINTS,
    blueprintReady,
    readinessScore: blueprintReady ? 100 : 0,
    summary: [
      `implementation-blueprint ready=${blueprintReady}`,
      `engineering=${engineering.decompositionReady}`,
      `workflowSteps=${manifest.workflowStepCount}`,
    ].join(" "),
  };
}

export function assertImplementationBlueprintPass(
  report: ImplementationBlueprintReport,
): asserts report is ImplementationBlueprintReport & { blueprintReady: true } {
  if (!report.blueprintReady) {
    throw new Error(`V80 APP implementation blueprint not ready: ${report.summary}`);
  }
}
