import {
  buildPricingAvailabilityContext,
  runProcurementDecisionEngine,
} from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "@/lib/win-loss-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildProjectRegistry } from "../project-foundation/project-registry";
import { buildExecutionContext } from "../execution-layer/execution-context";
import type { ExecutionContextEntry } from "../execution-layer/execution-types";
import {
  calculateDeliveryRiskScore,
  resolveDeliveryRiskLevel,
  RISK_SCORE_REASON_CODES,
} from "./risk-scoring";
import type { DeliveryRiskRecord, DeliveryRiskRegistry } from "./risk-issue-types";

const LEAD_TIME_DELAY_THRESHOLD_DAYS = 20;
const SUPPLIER_RELIABILITY_THRESHOLD = 75;

function groupEntriesByProject(): Map<string, ExecutionContextEntry[]> {
  const map = new Map<string, ExecutionContextEntry[]>();
  for (const entry of buildExecutionContext().entries) {
    if (!entry.projectId) continue;
    const existing = map.get(entry.projectId) ?? [];
    existing.push(entry);
    map.set(entry.projectId, existing);
  }
  return map;
}

function buildProcurementRisks(
  projectId: string,
  entries: ExecutionContextEntry[],
): DeliveryRiskRecord[] {
  const risks: DeliveryRiskRecord[] = [];
  const pricingContext = buildPricingAvailabilityContext();
  const availabilityByKey = new Map(
    pricingContext.availability.map((record) => [`${record.supplierId}:${record.productId}`, record]),
  );
  const leadTimeByKey = new Map(
    pricingContext.leadTime.map((record) => [`${record.supplierId}:${record.productId}`, record]),
  );
  const supplierById = new Map(pricingContext.suppliers.map((supplier) => [supplier.id, supplier]));
  const decisionsByRequirement = new Map(
    runProcurementDecisionEngine().map((decision) => [decision.requirementId, decision]),
  );
  const seenPairs = new Set<string>();

  for (const entry of entries) {
    if (!entry.procurement) continue;

    const pairKey = `${entry.procurement.supplierId}:${entry.procurement.productId}`;
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);

    const availability = availabilityByKey.get(pairKey);
    const leadTime = leadTimeByKey.get(pairKey);
    const supplier = supplierById.get(entry.procurement.supplierId);
    const decision = decisionsByRequirement.get(entry.procurement.requirementId);

    if (
      availability &&
      (availability.availabilityStatus === "backorder" ||
        availability.availabilityStatus === "unavailable" ||
        availability.availabilityStatus === "limited")
    ) {
      const reasonCodes = [
        RISK_SCORE_REASON_CODES.availability,
        `availability-${availability.availabilityStatus}`,
      ];
      risks.push({
        riskId: `pdi-risk-${projectId}-availability-${entry.procurement.supplierId}`,
        projectId,
        riskCategory: "availability",
        reasonCodes,
        riskScore: calculateDeliveryRiskScore(reasonCodes),
        riskLevel: resolveDeliveryRiskLevel(reasonCodes),
      });
    }

    if (leadTime && leadTime.leadTimeDays >= LEAD_TIME_DELAY_THRESHOLD_DAYS) {
      const reasonCodes = [
        RISK_SCORE_REASON_CODES.leadTime,
        `leadTimeDays=${leadTime.leadTimeDays}`,
      ];
      risks.push({
        riskId: `pdi-risk-${projectId}-leadtime-${entry.procurement.supplierId}`,
        projectId,
        riskCategory: "leadTime",
        reasonCodes,
        riskScore: calculateDeliveryRiskScore(reasonCodes),
        riskLevel: resolveDeliveryRiskLevel(reasonCodes),
      });
    }

    if (
      supplier &&
      (supplier.reliabilityScore < SUPPLIER_RELIABILITY_THRESHOLD ||
        decision?.procurementLevel === "defer" ||
        decision?.procurementLevel === "fallback")
    ) {
      const reasonCodes = [
        RISK_SCORE_REASON_CODES.supplier,
        `supplier-reliability=${supplier.reliabilityScore}`,
        `procurement-level=${decision?.procurementLevel ?? "unknown"}`,
      ];
      risks.push({
        riskId: `pdi-risk-${projectId}-supplier-${entry.procurement.supplierId}`,
        projectId,
        riskCategory: "supplier",
        reasonCodes,
        riskScore: calculateDeliveryRiskScore(reasonCodes),
        riskLevel: resolveDeliveryRiskLevel(reasonCodes),
      });
    }
  }

  return risks;
}

function buildExecutionRisks(
  projectId: string,
  entries: ExecutionContextEntry[],
): DeliveryRiskRecord[] {
  const risks: DeliveryRiskRecord[] = [];

  for (const entry of entries) {
    if (entry.status !== "blocked") continue;

    const reasonCodes = [
      RISK_SCORE_REASON_CODES.execution,
      `taskId=${entry.taskId}`,
      `milestoneId=${entry.milestoneId}`,
    ];
    risks.push({
      riskId: `pdi-risk-${projectId}-execution-${entry.taskId}`,
      projectId,
      riskCategory: "execution",
      reasonCodes,
      riskScore: calculateDeliveryRiskScore(reasonCodes),
      riskLevel: resolveDeliveryRiskLevel(reasonCodes),
    });
  }

  return risks;
}

function buildWinLossRisks(projectId: string): DeliveryRiskRecord[] {
  const risks: DeliveryRiskRecord[] = [];
  const lossOutcomes = buildOutcomeRegistry().records.filter((outcome) => outcome.outcome === "loss");
  const lossReasonCodes = lossOutcomes.flatMap((outcome) => outcome.reasonCodes);

  if (lossReasonCodes.some((code) => code.includes("availability"))) {
    const reasonCodes = [RISK_SCORE_REASON_CODES.availability, "win-loss-availability-gap"];
    risks.push({
      riskId: `pdi-risk-${projectId}-winloss-availability`,
      projectId,
      riskCategory: "availability",
      reasonCodes,
      riskScore: calculateDeliveryRiskScore(reasonCodes),
      riskLevel: resolveDeliveryRiskLevel(reasonCodes),
    });
  }

  if (lossReasonCodes.some((code) => code.includes("lead-time") || code.includes("leadTime"))) {
    const reasonCodes = [RISK_SCORE_REASON_CODES.leadTime, "win-loss-lead-time-risk"];
    risks.push({
      riskId: `pdi-risk-${projectId}-winloss-leadtime`,
      projectId,
      riskCategory: "leadTime",
      reasonCodes,
      riskScore: calculateDeliveryRiskScore(reasonCodes),
      riskLevel: resolveDeliveryRiskLevel(reasonCodes),
    });
  }

  if (lossReasonCodes.some((code) => code.includes("supplier"))) {
    const reasonCodes = [RISK_SCORE_REASON_CODES.supplier, "win-loss-supplier-gap"];
    risks.push({
      riskId: `pdi-risk-${projectId}-winloss-supplier`,
      projectId,
      riskCategory: "supplier",
      reasonCodes,
      riskScore: calculateDeliveryRiskScore(reasonCodes),
      riskLevel: resolveDeliveryRiskLevel(reasonCodes),
    });
  }

  return risks;
}

function buildDelayedExecutionRisks(
  projectId: string,
  entries: ExecutionContextEntry[],
): DeliveryRiskRecord[] {
  const risks: DeliveryRiskRecord[] = [];

  for (const entry of entries) {
    if (entry.status !== "in-progress") continue;
    if (!entry.milestoneId.includes("procurement") && !entry.milestoneId.includes("installation")) {
      continue;
    }

    const reasonCodes = [
      RISK_SCORE_REASON_CODES.execution,
      "execution-delay",
      `taskId=${entry.taskId}`,
    ];
    risks.push({
      riskId: `pdi-risk-${projectId}-delay-${entry.taskId}`,
      projectId,
      riskCategory: "execution",
      reasonCodes,
      riskScore: calculateDeliveryRiskScore(reasonCodes),
      riskLevel: resolveDeliveryRiskLevel(reasonCodes),
    });
  }

  return risks;
}

function buildAggregatedProjectRisk(
  projectId: string,
  projectRisks: DeliveryRiskRecord[],
): DeliveryRiskRecord | undefined {
  const reasonCodes = [...new Set(projectRisks.flatMap((risk) => risk.reasonCodes))];
  const riskScore = calculateDeliveryRiskScore(reasonCodes);
  if (riskScore < 60) return undefined;

  return {
    riskId: `pdi-risk-${projectId}-aggregated`,
    projectId,
    riskCategory: "execution",
    reasonCodes,
    riskScore,
    riskLevel: resolveDeliveryRiskLevel(reasonCodes),
  };
}

let cachedRegistry: DeliveryRiskRegistry | undefined;

export function buildDeliveryRiskRegistry(): DeliveryRiskRegistry {
  if (cachedRegistry) return cachedRegistry;

  const entriesByProject = groupEntriesByProject();
  const records: DeliveryRiskRecord[] = [];

  for (const project of buildProjectRegistry().records) {
    const entries = entriesByProject.get(project.projectId) ?? [];
    const projectRisks = [
      ...buildProcurementRisks(project.projectId, entries),
      ...buildExecutionRisks(project.projectId, entries),
      ...buildDelayedExecutionRisks(project.projectId, entries),
      ...buildWinLossRisks(project.projectId),
    ];

    records.push(...projectRisks);

    const aggregated = buildAggregatedProjectRisk(project.projectId, projectRisks);
    if (aggregated) {
      records.push(aggregated);
    }
  }

  cachedRegistry = {
    registryId: "pdi-delivery-risk-registry-v45-p3",
    records,
    count: records.length,
    highRiskCount: records.filter((record) => record.riskLevel === "high").length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
