import type { PerformanceIntelligenceMode } from "../shared/constants";

export interface BenchmarkRecordBase {
  entityId: string;
  entityName: string;
  projectCount: number;
  averageScore: number;
  rank: number;
}

export interface BrandBenchmarkRecord extends BenchmarkRecordBase {}

export interface SupplierBenchmarkRecord extends BenchmarkRecordBase {}

export interface ProductBenchmarkRecord extends BenchmarkRecordBase {}

export interface ProjectBenchmarkRecord extends BenchmarkRecordBase {
  projectId: string;
}

export interface BenchmarkRegistryBase<T extends BenchmarkRecordBase> {
  registryId: string;
  records: T[];
  count: number;
  mode: PerformanceIntelligenceMode;
}

export interface BrandBenchmarkRegistry extends BenchmarkRegistryBase<BrandBenchmarkRecord> {}

export interface SupplierBenchmarkRegistry extends BenchmarkRegistryBase<SupplierBenchmarkRecord> {}

export interface ProductBenchmarkRegistry extends BenchmarkRegistryBase<ProductBenchmarkRecord> {}

export interface ProjectBenchmarkRegistry extends BenchmarkRegistryBase<ProjectBenchmarkRecord> {}

export interface BenchmarkContext {
  contextId: string;
  brandBenchmarks: BrandBenchmarkRegistry;
  supplierBenchmarks: SupplierBenchmarkRegistry;
  productBenchmarks: ProductBenchmarkRegistry;
  projectBenchmarks: ProjectBenchmarkRegistry;
  mode: PerformanceIntelligenceMode;
}

export interface BenchmarkLayerValidation {
  valid: boolean;
  brandBenchmarkCount: number;
  supplierBenchmarkCount: number;
  productBenchmarkCount: number;
  projectBenchmarkCount: number;
  summary: string;
}

export function rankBenchmarkRecords<T extends BenchmarkRecordBase>(
  records: Omit<T, "rank">[],
): T[] {
  const sorted = [...records].sort((left, right) => {
    if (right.averageScore !== left.averageScore) {
      return right.averageScore - left.averageScore;
    }
    return right.projectCount - left.projectCount;
  });

  return sorted.map((record, index) => ({
    ...record,
    rank: index + 1,
  })) as T[];
}
