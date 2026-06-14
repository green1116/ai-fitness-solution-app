import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";
import type { DataAssetReadValidation, LayerReadValidation } from "./shared/types";
import {
  buildDataAssetStatistics,
  getV25TenderKnowledgeCatalog,
  loadBenchmarkAssets,
  loadBrandAssets,
  loadProjectAssets,
  loadSupplierAssets,
} from "./reader";

const REQUIRED_SUPPLIER_CITIES = ["Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Chengdu"];
const REQUIRED_PROJECT_CITIES = [
  "Shanghai",
  "Beijing",
  "Guangzhou",
  "Shenzhen",
  "Chengdu",
  "Hangzhou",
  "Nanjing",
  "Wuhan",
  "Suzhou",
  "Xi'an",
];
const REQUIRED_INDUSTRIES: ProjectType[] = [
  "commercial-gym",
  "hotel",
  "campus",
  "community",
  "enterprise",
];
const REQUIRED_BENCHMARK_INDUSTRIES = [
  ...REQUIRED_INDUSTRIES,
  "government",
  "fitness-club",
] as const;
const REQUIRED_SKU_TYPES = ["Treadmill", "Bike", "Elliptical", "Strength", "Functional"];
const TARGET_PROJECT_COUNT = 100;
const TARGET_BENCHMARK_COUNT = 7;
const TARGET_WON_COUNT = 58;
const TARGET_LOST_COUNT = 42;

function isValidBrandFile(file: ReturnType<typeof loadBrandAssets>[number], errors: string[]): boolean {
  let valid = true;
  if (file.brand.mode !== "real-catalog") {
    errors.push(`brand ${file.brand.brandId}: invalid mode`);
    valid = false;
  }
  if (file.equipment.length !== 5) {
    errors.push(`brand ${file.brand.brandId}: expected 5 SKUs, got ${file.equipment.length}`);
    valid = false;
  }
  for (const subCategory of REQUIRED_SKU_TYPES) {
    if (!file.equipment.some((item) => item.subCategory === subCategory)) {
      errors.push(`brand ${file.brand.brandId}: missing SKU type ${subCategory}`);
      valid = false;
    }
  }
  for (const item of file.equipment) {
    if (item.brandId !== file.brand.brandId || item.mode !== "real-catalog") {
      errors.push(`brand ${file.brand.brandId}: equipment ${item.sku} mismatch`);
      valid = false;
    }
  }
  return valid;
}

function validateProjectAsset(file: ReturnType<typeof loadProjectAssets>[number], errors: string[]): void {
  if (file.historicalTender.projectId !== file.projectId) {
    errors.push(`project ${file.projectId}: historicalTender.projectId mismatch`);
  }
  if (file.historicalTender.result !== file.historicalBidOutcome.result) {
    errors.push(`project ${file.projectId}: tender result mismatch`);
  }
  if (file.historicalProposal.score !== file.proposal.proposalScore) {
    errors.push(`project ${file.projectId}: proposal score mismatch`);
  }
  if (file.historicalProposal.winProbability !== file.proposal.winProbability) {
    errors.push(`project ${file.projectId}: winProbability mismatch`);
  }
  if (file.historicalProposal.strategy !== file.proposal.strategyType) {
    errors.push(`project ${file.projectId}: strategy mismatch`);
  }
  if (file.historicalBidOutcome.winningPrice !== file.outcome.winPrice) {
    errors.push(`project ${file.projectId}: winningPrice mismatch`);
  }
  if (file.historicalBidOutcome.grossMargin !== file.outcome.marginPercent) {
    errors.push(`project ${file.projectId}: grossMargin mismatch`);
  }
  if (file.proposal.tenderId !== file.tender.tenderId) {
    errors.push(`project ${file.projectId}: proposal tenderId mismatch`);
  }
  if (file.outcome.proposalId !== file.proposal.proposalId) {
    errors.push(`project ${file.projectId}: outcome proposalId mismatch`);
  }
}

export function validateV20DataAssetRead(): LayerReadValidation {
  const errors: string[] = [];
  const brands = loadBrandAssets();
  const skuCount = brands.reduce((total, file) => total + file.equipment.length, 0);

  if (brands.length !== 10) {
    errors.push(`expected 10 brands, got ${brands.length}`);
  }
  if (skuCount !== 50) {
    errors.push(`expected 50 SKUs, got ${skuCount}`);
  }

  for (const file of brands) {
    isValidBrandFile(file, errors);
  }

  return {
    valid: errors.length === 0,
    brandCount: brands.length,
    skuCount,
    errors,
  };
}

export function validateV21DataAssetRead(): LayerReadValidation {
  const errors: string[] = [];
  const suppliers = loadSupplierAssets();
  const dealerCount = suppliers.reduce((total, file) => total + file.dealers.length, 0);
  const cities = new Set(suppliers.flatMap((file) => file.dealers.map((dealer) => dealer.city)));

  if (suppliers.length !== 10) {
    errors.push(`expected 10 suppliers, got ${suppliers.length}`);
  }
  for (const city of REQUIRED_SUPPLIER_CITIES) {
    if (!cities.has(city)) {
      errors.push(`missing supplier coverage for ${city}`);
    }
  }
  for (const file of suppliers) {
    if (file.supplier.mode !== "supplier-network" || file.supplier.status !== "active") {
      errors.push(`supplier ${file.supplier.id}: invalid entry`);
    }
    if (file.dealers.length === 0) {
      errors.push(`supplier ${file.supplier.id}: no dealers`);
    }
    if (file.inventory.length === 0) {
      errors.push(`supplier ${file.supplier.id}: no inventory`);
    }
  }

  return {
    valid: errors.length === 0,
    supplierCount: suppliers.length,
    dealerCount,
    errors,
  };
}

export function validateV25TenderKnowledgeRead(): LayerReadValidation {
  const errors: string[] = [];
  const projects = loadProjectAssets();
  const benchmarks = loadBenchmarkAssets();
  const catalog = getV25TenderKnowledgeCatalog();
  const industryCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  let wonCount = 0;

  if (projects.length !== TARGET_PROJECT_COUNT) {
    errors.push(`expected ${TARGET_PROJECT_COUNT} projects, got ${projects.length}`);
  }
  if (benchmarks.length !== TARGET_BENCHMARK_COUNT) {
    errors.push(`expected ${TARGET_BENCHMARK_COUNT} benchmarks, got ${benchmarks.length}`);
  }
  if (catalog.tenders.length !== projects.length) {
    errors.push("V25 tender catalog count mismatch");
  }
  if (catalog.proposals.length !== projects.length) {
    errors.push("V25 proposal catalog count mismatch");
  }
  if (catalog.outcomes.length !== projects.length) {
    errors.push("V25 outcome catalog count mismatch");
  }
  if (catalog.coreBenchmarks.length !== 5) {
    errors.push(`expected 5 core V25 benchmarks, got ${catalog.coreBenchmarks.length}`);
  }

  for (const industry of REQUIRED_BENCHMARK_INDUSTRIES) {
    if (!benchmarks.some((file) => file.industry === industry)) {
      errors.push(`missing benchmark industry ${industry}`);
    }
  }

  for (const file of projects) {
    validateProjectAsset(file, errors);

    if (file.tender.mode !== "tender-knowledge") {
      errors.push(`project ${file.projectId}: invalid tender mode`);
    }

    industryCounts.set(
      file.historicalTender.industry,
      (industryCounts.get(file.historicalTender.industry) ?? 0) + 1,
    );
    cityCounts.set(file.historicalTender.city, (cityCounts.get(file.historicalTender.city) ?? 0) + 1);

    if (file.historicalBidOutcome.result === "won") {
      wonCount += 1;
    }
  }

  for (const industry of REQUIRED_INDUSTRIES) {
    if (industryCounts.get(industry) !== 20) {
      errors.push(`industry ${industry}: expected 20 projects, got ${industryCounts.get(industry) ?? 0}`);
    }
  }
  for (const city of REQUIRED_PROJECT_CITIES) {
    if (cityCounts.get(city) !== 10) {
      errors.push(`city ${city}: expected 10 projects, got ${cityCounts.get(city) ?? 0}`);
    }
  }
  if (wonCount !== TARGET_WON_COUNT) {
    errors.push(`expected ${TARGET_WON_COUNT} won projects, got ${wonCount}`);
  }
  if (projects.length - wonCount !== TARGET_LOST_COUNT) {
    errors.push(`expected ${TARGET_LOST_COUNT} lost projects, got ${projects.length - wonCount}`);
  }

  return {
    valid: errors.length === 0,
    projectCount: projects.length,
    benchmarkCount: benchmarks.length,
    errors,
  };
}

export function validateV25DataAssetRead(): LayerReadValidation {
  return validateV25TenderKnowledgeRead();
}

export function validateDataAssetRead(): DataAssetReadValidation {
  const v20 = validateV20DataAssetRead();
  const v21 = validateV21DataAssetRead();
  const v25 = validateV25TenderKnowledgeRead();

  return {
    v20,
    v21,
    v25,
    allValid: v20.valid && v21.valid && v25.valid,
  };
}

export function buildDataAssetSprintReport() {
  const statistics = buildDataAssetStatistics();
  const validation = validateDataAssetRead();

  return {
    version: "data-asset-sprint-2" as const,
    reportId: `data-asset-sprint-2-report-${Date.now()}`,
    statistics,
    validation,
    summary: [
      "data-asset-sprint-2",
      `brands=${statistics.brandCount}`,
      `skus=${statistics.skuCount}`,
      `suppliers=${statistics.supplierCount}`,
      `projects=${statistics.projectCount}`,
      `benchmarks=${statistics.benchmarkCount}`,
      `won=${statistics.wonCount}`,
      `lost=${statistics.lostCount}`,
      `v20=${validation.v20.valid}`,
      `v21=${validation.v21.valid}`,
      `v25=${validation.v25.valid}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
