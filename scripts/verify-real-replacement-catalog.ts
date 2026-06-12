import { validateRealReplacementCatalog } from "../lib/real-catalog-foundation";

const r = validateRealReplacementCatalog();
if (!r.valid) throw new Error("ASSERT: replacement catalog validation failed");
if (r.coverage !== 100) throw new Error(`ASSERT: replacement coverage 100%, got ${r.coverage}%`);
console.log(`PASS — real-replacement-catalog count=${r.count} coverage=${r.coverage}%`);
