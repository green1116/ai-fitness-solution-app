import type { RealReplacementEntry } from "../shared/types";

export const REAL_REPLACEMENT_CATALOG: RealReplacementEntry[] = [
  { replacementId: "repl-skillrun", sku: "TG-SKILLRUN-001", modelName: "Skillrun", brandName: "Technogym", expectedLifespanYears: 10, replacementCycleYears: 8, residualValuePercent: 35, replacementCostEstimate: 195000, upgradePath: "Skillrun TX → Skillrun Unity", endOfLifeDisposal: "Manufacturer take-back program", mode: "real-catalog" },
  { replacementId: "repl-skillbike", sku: "TG-SKILLBIKE-002", modelName: "Technogym Skillbike", brandName: "Technogym", expectedLifespanYears: 10, replacementCycleYears: 8, residualValuePercent: 30, replacementCostEstimate: 125000, upgradePath: "Skillbike → Skillbike Unity", endOfLifeDisposal: "Certified e-waste recycler", mode: "real-catalog" },
  { replacementId: "repl-recovery-r1", sku: "TG-RECOVERY-R1", modelName: "Recovery Station R1", brandName: "Technogym", expectedLifespanYears: 12, replacementCycleYears: 10, residualValuePercent: 25, replacementCostEstimate: 58000, upgradePath: "Modular component refresh", endOfLifeDisposal: "Steel recycling", mode: "real-catalog" },
  { replacementId: "repl-t5", sku: "LF-T5-001", modelName: "T5 Treadmill", brandName: "Life Fitness", expectedLifespanYears: 9, replacementCycleYears: 7, residualValuePercent: 28, replacementCostEstimate: 105000, upgradePath: "T5 → Integrity Series", endOfLifeDisposal: "LF certified recycler", mode: "real-catalog" },
  { replacementId: "repl-synrgy360", sku: "LF-SYNRGY360-001", modelName: "SYNRGY360", brandName: "Life Fitness", expectedLifespanYears: 10, replacementCycleYears: 8, residualValuePercent: 32, replacementCostEstimate: 225000, upgradePath: "SYNRGY360 → SYNRGY360XL", endOfLifeDisposal: "LF certified recycler", mode: "real-catalog" },
  { replacementId: "repl-a5700", sku: "JH-A5700-001", modelName: "Johnson A5700", brandName: "Johnson", expectedLifespanYears: 8, replacementCycleYears: 7, residualValuePercent: 20, replacementCostEstimate: 65000, upgradePath: "A5700 → A5900 series", endOfLifeDisposal: "Steel frame recycling", mode: "real-catalog" },
  { replacementId: "repl-sdrive", sku: "MX-SDRIVE-001", modelName: "Matrix S-Drive", brandName: "Matrix", expectedLifespanYears: 8, replacementCycleYears: 7, residualValuePercent: 22, replacementCostEstimate: 82000, upgradePath: "S-Drive → R-Drive", endOfLifeDisposal: "Regional recycler", mode: "real-catalog" },
  { replacementId: "repl-t8000", sku: "SH-T8000-001", modelName: "SH-T8000", brandName: "Shuhua", expectedLifespanYears: 7, replacementCycleYears: 6, residualValuePercent: 15, replacementCostEstimate: 42000, upgradePath: "T8000 → T9000 series", endOfLifeDisposal: "Domestic metal recycling", mode: "real-catalog" },
  { replacementId: "repl-it7000", sku: "IP-IT7000-001", modelName: "Impulse IT7000", brandName: "Impulse", expectedLifespanYears: 7, replacementCycleYears: 6, residualValuePercent: 12, replacementCostEstimate: 34000, upgradePath: "IT7000 → IT8000 series", endOfLifeDisposal: "Domestic metal recycling", mode: "real-catalog" },
  { replacementId: "repl-aibike", sku: "IF-AIBIKE-001", modelName: "AI Smart Bike Pro", brandName: "IntelligentFit", expectedLifespanYears: 6, replacementCycleYears: 5, residualValuePercent: 18, replacementCostEstimate: 36000, upgradePath: "AI Smart Bike Pro → Pro 2", endOfLifeDisposal: "E-waste certified recycler", mode: "real-catalog" },
];

export function getRealReplacementBySku(sku: string): RealReplacementEntry | undefined {
  return REAL_REPLACEMENT_CATALOG.find((r) => r.sku === sku);
}

export function getAllRealReplacement(): RealReplacementEntry[] {
  return [...REAL_REPLACEMENT_CATALOG];
}
