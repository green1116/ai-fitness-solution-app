import {
  PI_MIN_BRAND_BENCHMARK_COUNT,
  PI_MIN_PRODUCT_BENCHMARK_COUNT,
  PI_MIN_PROJECT_BENCHMARK_COUNT,
  PI_MIN_SUPPLIER_BENCHMARK_COUNT,
} from "../shared/constants";
import { buildBrandBenchmarkRegistry } from "./brand-benchmark-registry";
import { buildProductBenchmarkRegistry } from "./product-benchmark-registry";
import { buildProjectBenchmarkRegistry } from "./project-benchmark-registry";
import { buildSupplierBenchmarkRegistry } from "./supplier-benchmark-registry";
import type { BenchmarkLayerValidation } from "./benchmark-types";

let cachedValidation: BenchmarkLayerValidation | undefined;

export function validateBenchmarkLayer(): BenchmarkLayerValidation {
  if (cachedValidation) return cachedValidation;

  const brandBenchmarks = buildBrandBenchmarkRegistry();
  const supplierBenchmarks = buildSupplierBenchmarkRegistry();
  const productBenchmarks = buildProductBenchmarkRegistry();
  const projectBenchmarks = buildProjectBenchmarkRegistry();

  const valid =
    brandBenchmarks.count >= PI_MIN_BRAND_BENCHMARK_COUNT &&
    supplierBenchmarks.count >= PI_MIN_SUPPLIER_BENCHMARK_COUNT &&
    productBenchmarks.count >= PI_MIN_PRODUCT_BENCHMARK_COUNT &&
    projectBenchmarks.count >= PI_MIN_PROJECT_BENCHMARK_COUNT;

  const summary = [
    `brands=${brandBenchmarks.count}`,
    `suppliers=${supplierBenchmarks.count}`,
    `products=${productBenchmarks.count}`,
    `projects=${projectBenchmarks.count}`,
  ].join(" ");

  cachedValidation = {
    valid,
    brandBenchmarkCount: brandBenchmarks.count,
    supplierBenchmarkCount: supplierBenchmarks.count,
    productBenchmarkCount: productBenchmarks.count,
    projectBenchmarkCount: projectBenchmarks.count,
    summary,
  };

  return cachedValidation;
}
