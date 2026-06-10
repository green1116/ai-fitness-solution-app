import { buildComplianceKnowledgeAssets } from "../compliance/builders";
import { buildEquipmentKnowledgeAssets } from "../equipment/builders";
import { buildProjectKnowledgeAssets } from "../project/builders";
import { buildProposalKnowledgeAssets } from "../proposal/builders";
import { buildRiskKnowledgeAssets } from "../risk/builders";
import type { KnowledgeCatalog, KnowledgeCatalogCategory } from "./types";

const CATEGORY_LABELS: Record<KnowledgeCatalogCategory, string> = {
  project: "Project 项目知识",
  equipment: "Equipment 设备知识",
  proposal: "Proposal 方案知识",
  risk: "Risk 风险知识",
  compliance: "Compliance 合规知识",
};

export function collectKnowledgeAssets(deploymentId: string) {
  return {
    project: buildProjectKnowledgeAssets({ deploymentId }),
    equipment: buildEquipmentKnowledgeAssets({ deploymentId }),
    proposal: buildProposalKnowledgeAssets({ deploymentId }),
    risk: buildRiskKnowledgeAssets({ deploymentId }),
    compliance: buildComplianceKnowledgeAssets({ deploymentId }),
  };
}

export function buildKnowledgeCatalog(input?: {
  deploymentId?: string;
}): KnowledgeCatalog {
  const deploymentId = input?.deploymentId ?? "catalog-default";
  const collected = collectKnowledgeAssets(deploymentId);

  const entries = (
    Object.entries(collected) as Array<
      [KnowledgeCatalogCategory, Array<{ assetId: string }>]
    >
  ).map(([category, assets]) => ({
    entryId: `catalog-entry-${category}-${deploymentId}`,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    assetCount: assets.length,
    assetIds: assets.map((a) => a.assetId),
  }));

  const totalAssets = entries.reduce((sum, e) => sum + e.assetCount, 0);

  return {
    catalogId: `knowledge-catalog-${deploymentId}`,
    entries,
    totalAssets,
    generatedAt: new Date().toISOString(),
  };
}

export { CATEGORY_LABELS };
