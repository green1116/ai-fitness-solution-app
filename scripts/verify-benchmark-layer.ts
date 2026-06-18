/**
 * V46 Performance Intelligence — Benchmark Layer verification
 */
import {
  buildBenchmarkContext,
  buildBrandBenchmarkRegistry,
  buildProductBenchmarkRegistry,
  buildProjectBenchmarkRegistry,
  buildSupplierBenchmarkRegistry,
  PI_MIN_BRAND_BENCHMARK_COUNT,
  PI_MIN_PRODUCT_BENCHMARK_COUNT,
  PI_MIN_PROJECT_BENCHMARK_COUNT,
  PI_MIN_SUPPLIER_BENCHMARK_COUNT,
  validateBenchmarkLayer,
} from "../lib/performance-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const brands = buildBrandBenchmarkRegistry();
assert(brands.count >= PI_MIN_BRAND_BENCHMARK_COUNT, "brand benchmark count");
assert(brands.records.every((record) => record.entityId && record.rank > 0), "brand benchmark fields");

console.log("✓ brand benchmarks");
console.log(`  brands=${brands.count}`);

const suppliers = buildSupplierBenchmarkRegistry();
assert(suppliers.count >= PI_MIN_SUPPLIER_BENCHMARK_COUNT, "supplier benchmark count");
assert(suppliers.records.every((record) => record.entityId && record.rank > 0), "supplier benchmark fields");

console.log("✓ supplier benchmarks");
console.log(`  suppliers=${suppliers.count}`);

const products = buildProductBenchmarkRegistry();
assert(products.count >= PI_MIN_PRODUCT_BENCHMARK_COUNT, "product benchmark count");
assert(products.records.every((record) => record.entityId && record.rank > 0), "product benchmark fields");

console.log("✓ product benchmarks");
console.log(`  products=${products.count}`);

const projects = buildProjectBenchmarkRegistry();
assert(projects.count >= PI_MIN_PROJECT_BENCHMARK_COUNT, "project benchmark count");
assert(projects.records.every((record) => record.projectId && record.rank > 0), "project benchmark fields");

console.log("✓ project benchmarks");
console.log(`  projects=${projects.count}`);

const context = buildBenchmarkContext();
assert(context.brandBenchmarks.count === brands.count, "benchmark context brands");
assert(context.projectBenchmarks.count === projects.count, "benchmark context projects");

const topBrand = brands.records[0]!;
const topSupplier = suppliers.records[0]!;
const topProduct = products.records[0]!;

console.log("✓ benchmark validation");
const validation = validateBenchmarkLayer();
assert(validation.valid, "benchmark validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log(
  `  topBrand=${topBrand.entityName}(${topBrand.averageScore}) topSupplier=${topSupplier.entityName}(${topSupplier.averageScore}) topProduct=${topProduct.entityName}(${topProduct.averageScore})`,
);
console.log("BENCHMARK LAYER PASS");
