import { runComplianceKnowledgeRuntime } from "../compliance/runtime";
import { runEquipmentKnowledgeRuntime } from "../equipment/runtime";
import { runProjectKnowledgeRuntime } from "../project/runtime";
import { runProposalKnowledgeRuntime } from "../proposal/runtime";
import { runRiskKnowledgeRuntime } from "../risk/runtime";
import { runKnowledgeCatalogRuntime } from "../catalog/runtime";
import { runKnowledgeSearchRuntime } from "../search/runtime";
import type { KnowledgeAssetPackage } from "./types";

export function collectKnowledgeDomains(deploymentId: string) {
  return {
    project: runProjectKnowledgeRuntime({ deploymentId }),
    equipment: runEquipmentKnowledgeRuntime({ deploymentId }),
    proposal: runProposalKnowledgeRuntime({ deploymentId }),
    risk: runRiskKnowledgeRuntime({ deploymentId }),
    compliance: runComplianceKnowledgeRuntime({ deploymentId }),
    catalog: runKnowledgeCatalogRuntime({ deploymentId }),
    search: runKnowledgeSearchRuntime({ deploymentId }),
  };
}

export function buildKnowledgeAssetPackage(input: {
  deploymentId: string;
  collected: ReturnType<typeof collectKnowledgeDomains>;
}): KnowledgeAssetPackage {
  const { project, equipment, proposal, risk, compliance, catalog } = input.collected;
  const totalAssets =
    project.payload.assetCount +
    equipment.payload.assetCount +
    proposal.payload.assetCount +
    risk.payload.assetCount +
    compliance.payload.assetCount;

  return {
    packageId: `knowledge-package-${input.deploymentId}`,
    projectAssetCount: project.payload.assetCount,
    equipmentAssetCount: equipment.payload.assetCount,
    proposalAssetCount: proposal.payload.assetCount,
    riskAssetCount: risk.payload.assetCount,
    complianceAssetCount: compliance.payload.assetCount,
    catalogAssetCount: catalog.payload.catalog.totalAssets,
    totalAssets,
    completeness: 100,
    mode: "readiness-stub",
    generatedAt: new Date().toISOString(),
  };
}
