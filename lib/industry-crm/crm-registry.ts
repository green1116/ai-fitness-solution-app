import { buildIndustryLifecycles } from "@/lib/industry-lifecycle";
import type { IndustryLifecycle } from "@/lib/industry-lifecycle";
import { buildCRMScore, resolveCRMStatusFromLifecycle } from "./crm-scoring";
import type { IndustryCRM, IndustryCRMType, RegistryValidation } from "./shared/types";
import { CANONICAL_CRM_SUBJECT_ID } from "./shared/types";

function lifecycleToCRM(lifecycle: IndustryLifecycle, rank: number): IndustryCRM {
  const crmId = `ind-crm-${lifecycle.lifecycleId}`;
  const score = buildCRMScore(crmId, lifecycle, rank);

  return {
    crmId,
    lifecycleId: lifecycle.lifecycleId,
    pipelineId: lifecycle.pipelineId,
    workflowId: lifecycle.workflowId,
    executionId: lifecycle.executionId,
    activationId: lifecycle.activationId,
    opportunityId: lifecycle.opportunityId,
    crmType: lifecycle.lifecycleType,
    subjectId: lifecycle.subjectId,
    subjectType: lifecycle.subjectType,
    title: `${lifecycle.title.replace(" — Lifecycle", "")} — CRM`,
    summary: `${lifecycle.summary} Transitioned to industry CRM relationship stage.`,
    insightIds: [...lifecycle.insightIds],
    crmStatus: resolveCRMStatusFromLifecycle(lifecycle, score, rank),
    score,
    generatedAt: lifecycle.generatedAt,
    metadata: {
      ...lifecycle.metadata,
      sourceLifecycleScore: lifecycle.score.totalLifecycleScore.toString(),
      sourceLayer: "v34-industry-lifecycle",
    },
    mode: "industry-crm",
  };
}

export function buildIndustryCRM(): IndustryCRM[] {
  const lifecycles = buildIndustryLifecycles();

  return lifecycles.map((lifecycle, index) => lifecycleToCRM(lifecycle, index + 1));
}

export function getCRMById(crmId: string): IndustryCRM | undefined {
  return buildIndustryCRM().find((crm) => crm.crmId === crmId);
}

export function getCRMByType(crmType: IndustryCRMType): IndustryCRM[] {
  return buildIndustryCRM().filter((crm) => crm.crmType === crmType);
}

export function getCRMBySubject(subjectId: string): IndustryCRM[] {
  return buildIndustryCRM().filter((crm) => crm.subjectId === subjectId);
}

export function validateCRMRegistry(): RegistryValidation {
  const crmRecords = buildIndustryCRM();
  const requiredTypes: IndustryCRMType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = ["prospect", "active", "strategic", "retained", "dormant", "churned"] as const;

  const typeCoverage = requiredTypes.every((type) =>
    crmRecords.some((crm) => crm.crmType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    crmRecords.some((crm) => crm.crmStatus === status),
  );

  const scoreValid = crmRecords.every(
    (crm) =>
      crm.score.relationshipStrength > 0 &&
      crm.score.lifecycleStrength > 0 &&
      crm.score.confidence > 0 &&
      crm.score.retentionScore > 0 &&
      crm.score.expansionScore > 0 &&
      crm.score.totalCRMScore > 0 &&
      crm.insightIds.length > 0 &&
      crm.mode === "industry-crm",
  );

  const canonical = getCRMBySubject(CANONICAL_CRM_SUBJECT_ID);

  const valid =
    crmRecords.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: crmRecords.length,
    summary: `crm-registry count=${crmRecords.length} types=${requiredTypes.filter((t) => crmRecords.some((c) => c.crmType === t)).length}/4 statuses=${requiredStatuses.filter((s) => crmRecords.some((c) => c.crmStatus === s)).length}/6 valid=${valid}`,
  };
}
