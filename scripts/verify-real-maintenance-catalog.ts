import { validateRealMaintenanceCatalog } from "../lib/real-catalog-foundation";

const r = validateRealMaintenanceCatalog();
if (!r.valid) throw new Error("ASSERT: maintenance catalog validation failed");
if (r.coverage !== 100) throw new Error(`ASSERT: maintenance coverage 100%, got ${r.coverage}%`);
console.log(`PASS — real-maintenance-catalog count=${r.count} coverage=${r.coverage}%`);
