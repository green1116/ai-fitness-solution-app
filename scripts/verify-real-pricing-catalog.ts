import { validateRealPricingCatalog } from "../lib/real-catalog-foundation";

const r = validateRealPricingCatalog();
if (!r.valid) throw new Error("ASSERT: pricing catalog validation failed");
if (r.coverage !== 100) throw new Error(`ASSERT: pricing coverage 100%, got ${r.coverage}%`);
console.log(`PASS — real-pricing-catalog count=${r.count} coverage=${r.coverage}%`);
