import { validateRealBrandCatalog, getAllRealBrands } from "../lib/real-catalog-foundation";

const r = validateRealBrandCatalog();
if (!r.valid) throw new Error("ASSERT: brand catalog validation failed");
if (r.count < 6) throw new Error("ASSERT: brand count >= 6");
const brands = getAllRealBrands();
if (!brands.every((b) => b.mode === "real-catalog")) throw new Error("ASSERT: all real-catalog mode");
console.log(`PASS — real-brand-catalog count=${r.count}`);
