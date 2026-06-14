import { buildBrandAliasRecords, validateAliasRegistry } from "./brand-alias";
import { buildBrandRegistryRecords } from "./brand-registry";
import { buildManufacturerRegistryRecords } from "./manufacturer-registry";
import type { BrandContext, RegistryValidation } from "./shared/types";

export function buildBrandContext(): BrandContext {
  const brands = buildBrandRegistryRecords();
  const manufacturers = buildManufacturerRegistryRecords();
  const aliases = buildBrandAliasRecords();
  const averageScore =
    brands.length === 0
      ? 0
      : Math.round(brands.reduce((sum, b) => sum + b.score.totalBrandScore, 0) / brands.length);

  return {
    contextId: "brand-intelligence-context-v38",
    brands,
    manufacturers,
    aliases,
    brandCount: brands.length,
    manufacturerCount: manufacturers.length,
    averageScore,
    contextReady: brands.length >= 8 && manufacturers.length >= 6,
    mode: "brand-intelligence-network",
  };
}

export function validateBrandContext(): RegistryValidation {
  const context = buildBrandContext();
  const aliasValidation = validateAliasRegistry(context.aliases);
  const valid =
    context.contextReady && context.averageScore > 0 && aliasValidation.valid;

  return {
    valid,
    count: context.brandCount,
    summary: `brand-context brands=${context.brandCount} manufacturers=${context.manufacturerCount} averageScore=${context.averageScore} aliasValid=${aliasValidation.valid} valid=${valid}`,
  };
}

export function validateAliasRegistryLayer(): RegistryValidation {
  const aliases = buildBrandAliasRecords();
  const result = validateAliasRegistry(aliases);
  return {
    valid: result.valid && aliases.length >= 8,
    count: aliases.length,
    summary: `alias-registry count=${aliases.length} conflicts=${result.conflicts.length} valid=${result.valid}`,
  };
}
