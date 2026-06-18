import { PI_CANONICAL_ID } from "../shared/constants";
import { buildBrandBenchmarkRegistry } from "./brand-benchmark-registry";
import { buildProductBenchmarkRegistry } from "./product-benchmark-registry";
import { buildProjectBenchmarkRegistry } from "./project-benchmark-registry";
import { buildSupplierBenchmarkRegistry } from "./supplier-benchmark-registry";
import type { BenchmarkContext } from "./benchmark-types";

let cachedContext: BenchmarkContext | undefined;

export function buildBenchmarkContext(): BenchmarkContext {
  if (cachedContext) return cachedContext;

  cachedContext = {
    contextId: "pi-benchmark-context-v46-p2",
    brandBenchmarks: buildBrandBenchmarkRegistry(),
    supplierBenchmarks: buildSupplierBenchmarkRegistry(),
    productBenchmarks: buildProductBenchmarkRegistry(),
    projectBenchmarks: buildProjectBenchmarkRegistry(),
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}
