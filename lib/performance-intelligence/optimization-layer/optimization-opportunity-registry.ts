import {
  buildDeliveryIssueRegistry,
  buildDeliveryRiskRegistry,
} from "@/lib/project-delivery-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildBenchmarkContext } from "../benchmark-layer/benchmark-context";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import type {
  OptimizationOpportunityRecord,
  OptimizationOpportunityRegistry,
} from "./optimization-types";

function resolvePriority(expectedImpact: number): OptimizationOpportunityRecord["priority"] {
  if (expectedImpact >= 20) return "high";
  if (expectedImpact >= 10) return "medium";
  return "low";
}

function buildBenchmarkOpportunities(): OptimizationOpportunityRecord[] {
  const benchmark = buildBenchmarkContext();
  const records: OptimizationOpportunityRecord[] = [];

  const topBrandScore = benchmark.brandBenchmarks.records[0]?.averageScore ?? 100;
  for (const brand of benchmark.brandBenchmarks.records) {
    if (brand.rank === 1) continue;
    const gap = topBrandScore - brand.averageScore;
    if (gap <= 0) continue;

    records.push({
      opportunityId: `pi-opportunity-brand-benchmark-${brand.entityId}`,
      type: "brand",
      source: "benchmark",
      priority: resolvePriority(gap),
      description: `Improve brand benchmark for ${brand.entityName}`,
      expectedImpact: gap,
      entityId: brand.entityId,
    });
  }

  const topSupplierScore = benchmark.supplierBenchmarks.records[0]?.averageScore ?? 100;
  for (const supplier of benchmark.supplierBenchmarks.records) {
    if (supplier.rank === 1) continue;
    const gap = topSupplierScore - supplier.averageScore;
    if (gap <= 0) continue;

    records.push({
      opportunityId: `pi-opportunity-supplier-benchmark-${supplier.entityId}`,
      type: "supplier",
      source: "benchmark",
      priority: resolvePriority(gap),
      description: `Close supplier benchmark gap for ${supplier.entityName}`,
      expectedImpact: gap,
      entityId: supplier.entityId,
    });
  }

  const topProductScore = benchmark.productBenchmarks.records[0]?.averageScore ?? 100;
  for (const product of benchmark.productBenchmarks.records) {
    if (product.rank === 1) continue;
    const gap = topProductScore - product.averageScore;
    if (gap <= 0) continue;

    records.push({
      opportunityId: `pi-opportunity-product-benchmark-${product.entityId}`,
      type: "product",
      source: "benchmark",
      priority: resolvePriority(gap),
      description: `Upgrade product benchmark position for ${product.entityName}`,
      expectedImpact: gap,
      entityId: product.entityId,
    });
  }

  const averageProjectScore = benchmark.projectBenchmarks.records.length
    ? Math.round(
        benchmark.projectBenchmarks.records.reduce((sum, record) => sum + record.averageScore, 0) /
          benchmark.projectBenchmarks.records.length,
      )
    : 0;

  for (const project of benchmark.projectBenchmarks.records) {
    if (project.averageScore >= averageProjectScore) continue;

    const gap = averageProjectScore - project.averageScore;
    records.push({
      opportunityId: `pi-opportunity-project-benchmark-${project.projectId}`,
      type: "project",
      source: "benchmark",
      priority: resolvePriority(gap),
      description: `Raise project benchmark score for ${project.entityName}`,
      expectedImpact: gap,
      entityId: project.projectId,
      projectId: project.projectId,
    });
  }

  return records;
}

function buildPerformanceOpportunities(): OptimizationOpportunityRecord[] {
  const performance = buildPerformanceRegistry();
  const records: OptimizationOpportunityRecord[] = [];

  for (const record of performance.records) {
    if (record.score >= performance.averageScore && record.status !== "poor") continue;

    const gap = Math.max(0, performance.averageScore - record.score);
    const acceptanceGap = Math.max(0, 80 - record.acceptanceScore);

    records.push({
      opportunityId: `pi-opportunity-performance-${record.projectId}`,
      type: "project",
      source: "performance",
      priority: resolvePriority(Math.max(gap, acceptanceGap)),
      description: `Improve delivery performance for ${record.projectId}`,
      expectedImpact: Math.max(gap, acceptanceGap, 8),
      projectId: record.projectId,
      entityId: record.projectId,
    });
  }

  return records;
}

function mapRiskCategoryToType(
  category: ReturnType<typeof buildDeliveryRiskRegistry>["records"][number]["riskCategory"],
): OptimizationOpportunityRecord["type"] {
  if (category === "supplier" || category === "availability" || category === "leadTime") {
    return "supplier";
  }
  if (category === "execution") return "project";
  return "product";
}

function buildRiskOpportunities(): OptimizationOpportunityRecord[] {
  return buildDeliveryRiskRegistry().records
    .filter((risk) => risk.riskLevel === "high" || risk.riskLevel === "medium")
    .map((risk) => ({
      opportunityId: `pi-opportunity-risk-${risk.riskId}`,
      type: mapRiskCategoryToType(risk.riskCategory),
      source: "risk" as const,
      priority: risk.riskLevel === "high" ? ("high" as const) : ("medium" as const),
      description: `Mitigate ${risk.riskCategory} risk on ${risk.projectId}`,
      expectedImpact: Math.min(35, Math.round(risk.riskScore / 2)),
      projectId: risk.projectId,
      entityId: risk.riskId,
    }));
}

function buildIssueOpportunities(): OptimizationOpportunityRecord[] {
  return buildDeliveryIssueRegistry().records
    .filter((issue) => issue.status === "open" || issue.status === "mitigating")
    .map((issue) => ({
      opportunityId: `pi-opportunity-issue-${issue.issueId}`,
      type: "project" as const,
      source: "issue" as const,
      priority:
        issue.severity === "critical"
          ? ("high" as const)
          : issue.severity === "major"
            ? ("medium" as const)
            : ("low" as const),
      description: `Resolve ${issue.severity} delivery issue on ${issue.projectId}`,
      expectedImpact:
        issue.severity === "critical" ? 25 : issue.severity === "major" ? 15 : 8,
      projectId: issue.projectId,
      entityId: issue.issueId,
    }));
}

let cachedRegistry: OptimizationOpportunityRegistry | undefined;

export function buildOptimizationOpportunityRegistry(): OptimizationOpportunityRegistry {
  if (cachedRegistry) return cachedRegistry;

  const records = [
    ...buildBenchmarkOpportunities(),
    ...buildPerformanceOpportunities(),
    ...buildRiskOpportunities(),
    ...buildIssueOpportunities(),
  ];

  cachedRegistry = {
    registryId: "pi-optimization-opportunity-registry-v46-p3",
    records,
    count: records.length,
    highPriorityCount: records.filter((record) => record.priority === "high").length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
