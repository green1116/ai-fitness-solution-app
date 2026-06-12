import { validateRealEquipmentCatalog, getAllRealEquipment } from "../lib/real-catalog-foundation";

const r = validateRealEquipmentCatalog();
if (!r.valid) throw new Error("ASSERT: equipment catalog validation failed");
if (r.count < 10) throw new Error("ASSERT: equipment count >= 10");
const equip = getAllRealEquipment();
if (!equip.every((e) => e.sku.startsWith("TG-") || e.sku.startsWith("LF-") || e.sku.startsWith("JH-") || e.sku.startsWith("MX-") || e.sku.startsWith("SH-") || e.sku.startsWith("IP-") || e.sku.startsWith("IF-"))) {
  throw new Error("ASSERT: valid SKU prefixes");
}
console.log(`PASS — real-equipment-catalog count=${r.count}`);
