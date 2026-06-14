/**
 * V38 Brand Intelligence Network — Phase 1 verification
 */
import {
  BRAND_INTELLIGENCE_NETWORK_P1_TAG,
  BRAND_INTELLIGENCE_NETWORK_VERSION,
  buildBrandContext,
  findBrandById,
  findBrandByNameOrAlias,
  findBrandRecords,
  findBrandRecordsByTier,
  findBrandRecordsBySector,
  findManufacturerById,
  findManufacturersByRegion,
  normalizeBrandAlias,
  resolveBrandIdByAlias,
  validateBrandIntelligenceNetworkPhase1,
} from "../lib/brand-intelligence-network";
import { validateProductCatalogFoundation } from "../lib/product-catalog";
import { validateTenderProposalFoundation } from "../lib/tender-proposal";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateBrandIntelligenceNetworkPhase1();
assert(validation.valid, "phase1 validation");
assert(validation.brandRegistry.valid, "brand registry");
assert(validation.manufacturerRegistry.valid, "manufacturer registry");
assert(validation.aliasRegistry.valid, "alias registry");
assert(validation.brandContext.valid, "brand context");

const brands = findBrandRecords(10);
assert(brands.length >= 8, "findBrands");
assert(findBrandRecordsByTier("premium").length >= 1, "findBrandsByTier");
assert(findBrandRecordsBySector("gym-equipment").length >= 1, "findBrandsBySector");

const lf = findBrandById("brand-life-fitness");
assert(Boolean(lf), "findBrandById");
assert(resolveBrandIdByAlias("力健") === "brand-life-fitness", "alias resolve");
assert(normalizeBrandAlias(" Life-Fitness ") === normalizeBrandAlias("life fitness"), "alias normalize");

const mfr = findManufacturerById(lf!.manufacturerId);
assert(Boolean(mfr), "findManufacturerById");
assert(findManufacturersByRegion(mfr!.region).length >= 1, "findManufacturersByRegion");

assert(validateTenderProposalFoundation().valid, "tender proposal unchanged");
assert(validateProductCatalogFoundation().valid, "product catalog unchanged");

console.log("✓ brand registry", validation.brandRegistry.summary);
console.log("✓ manufacturer registry", validation.manufacturerRegistry.summary);
console.log("✓ brand context", validation.brandContext.summary);
console.log(" ", `version=${BRAND_INTELLIGENCE_NETWORK_VERSION} tag=${BRAND_INTELLIGENCE_NETWORK_P1_TAG}`);
console.log("Brand Intelligence Network Phase 1 PASS");
