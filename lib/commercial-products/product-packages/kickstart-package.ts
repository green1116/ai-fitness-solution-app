import type { ProductPackageResult, ProductPackagingInput } from "../shared/types";
import { buildProductPackageCore } from "./package-core";

const cache = new Map<string, ProductPackageResult>();

export function buildKickstartPackage(input: ProductPackagingInput): ProductPackageResult {
  const cacheKey = JSON.stringify(input);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = buildProductPackageCore("kickstart-package", input);
  cache.set(cacheKey, result);
  return result;
}
