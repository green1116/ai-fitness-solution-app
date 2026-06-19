/**
 * Generate V49 META freeze artifact (JSON)
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { V49_META } from "../lib/saas-product/freeze/v49-final-meta";

const outDir = join(process.cwd(), "docs", "commercialization");
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "V49-META.json");
writeFileSync(outPath, `${JSON.stringify(V49_META, null, 2)}\n`, "utf8");

console.log(`Wrote ${outPath}`);
console.log(`tag=${V49_META.tag}`);
