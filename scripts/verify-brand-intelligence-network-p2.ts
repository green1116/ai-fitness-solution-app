/**
 * V38 Brand Intelligence Network — Phase 2 verification
 */
import {
  BRAND_INTELLIGENCE_NETWORK_P2_TAG,
  buildBrandNetworkContext,
  findTopBrandRecords,
  matchAuthorizedBrands,
  matchBrandToCatalog,
  matchBrandToSkuByBrand,
  matchBrandToSupplier,
  validateBrandIntelligenceNetworkPhase2,
} from "../lib/brand-intelligence-network";
import { buildCatalogRegistryRecords } from "../lib/product-catalog";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateBrandIntelligenceNetworkPhase2();
assert(validation.valid, "phase2 validation");
assert(validation.supplierLinkRegistry.valid, "supplier links");
assert(validation.skuLinkRegistry.valid, "sku links");
assert(validation.authorizationLinkRegistry.valid, "authorization links");
assert(validation.brandNetworkContext.valid, "network context");

const supplierMatch = matchBrandToSupplier("brand-life-fitness");
assert(supplierMatch.matchReady, "matchBrandToSupplier");

const skuMatch = matchBrandToSkuByBrand("brand-life-fitness", "LF-T5-001");
assert(skuMatch.matchReady, "matchBrandToSku");

const catalog = buildCatalogRegistryRecords()[0]!;
const catalogMatches = matchBrandToCatalog(catalog.catalogId);
assert(catalogMatches.length >= 1, "matchBrandToCatalog");

const authorized = matchAuthorizedBrands("East China");
assert(authorized.length >= 1, "matchAuthorizedBrands");

const top = findTopBrandRecords(5);
assert(top.length >= 3, "findTopBrands");

const network = buildBrandNetworkContext();
assert(network.networkReady, "brand network context ready");

console.log("✓ network mapping", validation.brandNetworkContext.summary);
console.log(" ", validation.supplierLinkRegistry.summary);
console.log(" ", validation.skuLinkRegistry.summary);
console.log(" ", `tag=${BRAND_INTELLIGENCE_NETWORK_P2_TAG}`);
console.log("Brand Intelligence Network Phase 2 PASS");
