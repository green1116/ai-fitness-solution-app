import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "data");

const BRANDS = [
  {
    slug: "life-fitness",
    brandId: "brand-life-fitness",
    brandName: "Life Fitness",
    manufacturer: "Life Fitness LLC (KPS Capital Partners)",
    originCountry: "USA",
    headquarters: "Rosemont, Illinois, USA",
    brandTier: "premium",
    marketPosition: "Global commercial cardio and strength equipment leader",
    chinaDistributor: "Life Fitness Asia Pacific (Shanghai)",
    officialWebsite: "https://www.lifefitness.com",
    targetSegments: ["enterprise", "government", "commercial-gym"],
    competitiveAdvantages: ["Industry-leading durability", "Global service network", "Broad product portfolio"],
    prefix: "LF",
  },
  {
    slug: "technogym",
    brandId: "brand-technogym",
    brandName: "Technogym",
    manufacturer: "Technogym S.p.A.",
    originCountry: "Italy",
    headquarters: "Cesena, Italy",
    brandTier: "premium",
    marketPosition: "Global premium wellness and design-led fitness equipment leader",
    chinaDistributor: "Technogym China (Shanghai)",
    officialWebsite: "https://www.technogym.com",
    targetSegments: ["hotel", "enterprise", "flagship-campus"],
    competitiveAdvantages: ["Italian design IP", "Mywellness digital ecosystem", "Flagship venue prestige"],
    prefix: "TG",
  },
  {
    slug: "matrix",
    brandId: "brand-matrix",
    brandName: "Matrix",
    manufacturer: "Johnson Health Tech (Matrix Fitness)",
    originCountry: "USA",
    headquarters: "Cottage Grove, Wisconsin, USA",
    brandTier: "mid-market",
    marketPosition: "Commercial mid-market fitness with strong price-performance ratio",
    chinaDistributor: "Matrix Fitness China (Shanghai)",
    officialWebsite: "https://www.matrixfitness.com",
    targetSegments: ["enterprise", "campus", "community"],
    competitiveAdvantages: ["Modern UX", "Competitive pricing", "Compact footprint options"],
    prefix: "MX",
  },
  {
    slug: "relax",
    brandId: "brand-relax",
    brandName: "Relax",
    manufacturer: "Relax Fitness Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Ningbo, Zhejiang, China",
    brandTier: "commercial",
    marketPosition: "Mid-tier commercial fitness brand for hotel and community projects",
    chinaDistributor: "Relax China Regional Agents",
    officialWebsite: "https://www.relaxfitness.cn",
    targetSegments: ["hotel", "community", "enterprise"],
    competitiveAdvantages: ["Competitive mid-market pricing", "Fast regional delivery", "Hotel compliance packages"],
    prefix: "RX",
  },
  {
    slug: "shuhua",
    brandId: "brand-shuhua",
    brandName: "Shuhua",
    manufacturer: "Shandong Shuhua Sports Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Dezhou, Shandong, China",
    brandTier: "domestic",
    marketPosition: "Leading domestic fitness equipment brand for government procurement",
    chinaDistributor: "Direct factory sales + provincial agents",
    officialWebsite: "https://www.shuhua.com.cn",
    targetSegments: ["government", "campus", "community", "school"],
    competitiveAdvantages: ["Government procurement compliance", "Fast domestic delivery", "Lowest TCO"],
    prefix: "SH",
  },
  {
    slug: "precor",
    brandId: "brand-precor",
    brandName: "Precor",
    manufacturer: "Precor Incorporated (Peloton)",
    originCountry: "USA",
    headquarters: "Woodinville, Washington, USA",
    brandTier: "premium",
    marketPosition: "Premium commercial cardio with biomechanically optimized motion",
    chinaDistributor: "Precor China (Shanghai)",
    officialWebsite: "https://www.precor.com",
    targetSegments: ["hotel", "enterprise", "commercial-gym"],
    competitiveAdvantages: ["Biomechanical engineering", "Low maintenance design", "Premium hotel adoption"],
    prefix: "PC",
  },
  {
    slug: "impulse",
    brandId: "brand-impulse",
    brandName: "Impulse",
    manufacturer: "Impulse Health Tech Ltd.",
    originCountry: "China",
    headquarters: "Qingdao, Shandong, China",
    brandTier: "value",
    marketPosition: "Value commercial strength equipment for budget-conscious projects",
    chinaDistributor: "Impulse direct + regional dealers",
    officialWebsite: "https://www.impulsefitness.com",
    targetSegments: ["government", "community", "school"],
    competitiveAdvantages: ["Low unit cost", "Fast domestic fulfillment", "Wide strength line"],
    prefix: "IM",
  },
  {
    slug: "dhz",
    brandId: "brand-dhz",
    brandName: "DHZ",
    manufacturer: "Dezhou DHZ Fitness Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Dezhou, Shandong, China",
    brandTier: "domestic",
    marketPosition: "Domestic commercial fitness brand for campus and community projects",
    chinaDistributor: "DHZ factory direct + provincial agents",
    officialWebsite: "https://www.dhzfitness.com",
    targetSegments: ["campus", "community", "enterprise"],
    competitiveAdvantages: ["Factory-direct pricing", "Fast domestic lead time", "Campus project experience"],
    prefix: "DH",
  },
  {
    slug: "bodystrength",
    brandId: "brand-bodystrength",
    brandName: "BodyStrong",
    manufacturer: "BodyStrong Fitness Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Xingtai, Hebei, China",
    brandTier: "value",
    marketPosition: "Value strength and functional training equipment for budget projects",
    chinaDistributor: "BodyStrong national dealer network",
    officialWebsite: "https://www.bodystrength.cn",
    targetSegments: ["community", "school", "enterprise"],
    competitiveAdvantages: ["Lowest strength unit cost", "Wide functional line", "Fast fulfillment"],
    prefix: "BS",
  },
  {
    slug: "sportsart",
    brandId: "brand-sportsart",
    brandName: "SportsArt",
    manufacturer: "SportsArt Fitness International",
    originCountry: "Taiwan",
    headquarters: "Taichung, Taiwan",
    brandTier: "commercial",
    marketPosition: "Eco-friendly commercial cardio with ECO-POWR technology",
    chinaDistributor: "SportsArt China (Beijing)",
    officialWebsite: "https://www.gosportsart.com",
    targetSegments: ["hotel", "enterprise", "commercial-gym"],
    competitiveAdvantages: ["ECO-POWR green technology", "Hotel chain adoption", "Connected cardio platform"],
    prefix: "SA",
  },
];

const SKU_TEMPLATES = [
  { suffix: "TM", model: "Treadmill Pro", category: "cardio", subCategory: "Treadmill", leadTimeDays: 30 },
  { suffix: "BK", model: "Studio Bike", category: "group-training", subCategory: "Bike", leadTimeDays: 21 },
  { suffix: "EL", model: "Cross Trainer", category: "cardio", subCategory: "Elliptical", leadTimeDays: 28 },
  { suffix: "ST", model: "Strength Rack", category: "strength", subCategory: "Strength", leadTimeDays: 14 },
  { suffix: "FN", model: "Functional Trainer", category: "functional", subCategory: "Functional", leadTimeDays: 18 },
];

function buildEquipment(brand) {
  return SKU_TEMPLATES.map((t, i) => ({
    sku: `${brand.prefix}-${t.suffix}-00${i + 1}`,
    modelId: `equip-${brand.slug}-${t.suffix.toLowerCase()}`,
    modelName: `${brand.brandName} ${t.model}`,
    brandId: brand.brandId,
    brandName: brand.brandName,
    category: t.category,
    subCategory: t.subCategory,
    dimensionsCm: { length: 180 + i * 5, width: 80 + i * 2, height: 140 + i * 3 },
    weightKg: 60 + i * 15,
    powerRequirement: t.category === "strength" || t.category === "functional" ? "N/A" : "220V / 10A",
    maxUserWeightKg: 150 + i * 10,
    connectivity: t.category === "cardio" || t.category === "group-training" ? ["Bluetooth"] : [],
    warrantyYears: brand.brandTier === "premium" ? 3 : 2,
    leadTimeDays: t.leadTimeDays,
    procurementAvailability: brand.brandTier === "domestic" || brand.brandTier === "value" ? "in-stock" : "import-lead-time",
    datasheetRef: `DS-${brand.prefix}-${t.suffix}-v1.0`,
    mode: "real-catalog",
  }));
}

const SUPPLIER_CONFIG = [
  { slug: "life-fitness", brand: "Life Fitness", id: "supplier-life-fitness-cn", name: "Life Fitness Asia Pacific", region: "East China", level: "national", contact: "china@lifefitness.com", cities: ["Shanghai", "Beijing"] },
  { slug: "technogym", brand: "Technogym", id: "supplier-technogym-cn", name: "Technogym China (Shanghai)", region: "East China", level: "national", contact: "sales.cn@technogym.com", cities: ["Shanghai", "Beijing"] },
  { slug: "matrix", brand: "Matrix", id: "supplier-matrix-cn", name: "Matrix Fitness China", region: "South China", level: "regional", contact: "matrix.cn@johnsonhealthtech.com", cities: ["Guangzhou"] },
  { slug: "relax", brand: "Relax", id: "supplier-relax-cn", name: "Relax Fitness Shenzhen", region: "South China", level: "regional", contact: "sales@relaxfitness.cn", cities: ["Shenzhen"] },
  { slug: "shuhua", brand: "Shuhua", id: "supplier-shuhua", name: "Shandong Shuhua Sports Equipment Co., Ltd.", region: "Southwest China", level: "national", contact: "sales@shuhua.com.cn", cities: ["Chengdu"] },
  { slug: "precor", brand: "Precor", id: "supplier-precor-cn", name: "Precor China (Shanghai)", region: "East China", level: "national", contact: "china@precor.com", cities: ["Shanghai"] },
  { slug: "impulse", brand: "Impulse", id: "supplier-impulse-cn", name: "Impulse Health Tech China", region: "Southwest China", level: "national", contact: "sales@impulsefitness.com", cities: ["Chengdu"] },
  { slug: "dhz", brand: "DHZ", id: "supplier-dhz-cn", name: "DHZ Fitness Guangzhou", region: "South China", level: "regional", contact: "sales@dhzfitness.com", cities: ["Guangzhou"] },
  { slug: "bodystrength", brand: "BodyStrong", id: "supplier-bodystrength-cn", name: "BodyStrong Shenzhen Distribution", region: "South China", level: "regional", contact: "sales@bodystrength.cn", cities: ["Shenzhen"] },
  { slug: "sportsart", brand: "SportsArt", id: "supplier-sportsart-cn", name: "SportsArt China (Beijing)", region: "North China", level: "national", contact: "china@gosportsart.com", cities: ["Beijing"] },
];

const CITIES = ["Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Chengdu"];
const INDUSTRIES = ["commercial-gym", "hotel", "campus", "community", "enterprise"];
const OUTCOMES = ["won", "lost", "won", "lost", "won"];

const BENCHMARKS = [
  { slug: "commercial-gym", industry: "commercial-gym", label: "Commercial Gym", city: "Shanghai", avgWinProbability: 80, avgProposalScore: 84, avgMarginPercent: 16 },
  { slug: "hotel", industry: "hotel", label: "Hotel Fitness", city: "Beijing", avgWinProbability: 68, avgProposalScore: 78, avgMarginPercent: 12 },
  { slug: "campus", industry: "campus", label: "Campus Gym", city: "Guangzhou", avgWinProbability: 74, avgProposalScore: 80, avgMarginPercent: 13 },
  { slug: "community", industry: "community", label: "Community Sports Center", city: "Chengdu", avgWinProbability: 79, avgProposalScore: 82, avgMarginPercent: 14 },
  { slug: "enterprise", industry: "enterprise", label: "Enterprise Wellness", city: "Shanghai", avgWinProbability: 76, avgProposalScore: 83, avgMarginPercent: 16 },
];

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

for (const brand of BRANDS) {
  writeJson(path.join(ROOT, "brands", `${brand.slug}.json`), {
    schemaVersion: "1.0",
    compatibleLayers: ["v20-real-catalog"],
    brand: {
      brandId: brand.brandId,
      brandName: brand.brandName,
      manufacturer: brand.manufacturer,
      originCountry: brand.originCountry,
      headquarters: brand.headquarters,
      brandTier: brand.brandTier,
      marketPosition: brand.marketPosition,
      chinaDistributor: brand.chinaDistributor,
      officialWebsite: brand.officialWebsite,
      targetSegments: brand.targetSegments,
      competitiveAdvantages: brand.competitiveAdvantages,
      mode: "real-catalog",
    },
    equipment: buildEquipment(brand),
  });
}

for (const cfg of SUPPLIER_CONFIG) {
  const brand = BRANDS.find((b) => b.slug === cfg.slug);
  const treadmillSku = `${brand.prefix}-TM-001`;
  writeJson(path.join(ROOT, "suppliers", `${cfg.slug}.json`), {
    schemaVersion: "1.0",
    compatibleLayers: ["v21-regional-supplier"],
    supplier: {
      id: cfg.id,
      brand: cfg.brand,
      supplierName: cfg.name,
      region: cfg.region,
      authorizationLevel: cfg.level,
      contact: cfg.contact,
      status: "active",
      mode: "supplier-network",
    },
    dealers: cfg.cities.map((city, i) => ({
      id: `dealer-${cfg.slug}-${city.toLowerCase()}`,
      dealerName: `${cfg.brand} ${city} Dealer`,
      city,
      coverageArea: city,
      warehouseCapability: i === 0,
      serviceLevel: i === 0 ? "premium" : "standard",
      status: "active",
      mode: "supplier-network",
    })),
    inventory: cfg.cities.slice(0, 2).map((city, i) => ({
      id: `inv-${cfg.slug}-${city.toLowerCase()}`,
      sku: treadmillSku,
      stockStatus: brand.brandTier === "domestic" || brand.brandTier === "value" ? "in-stock" : i === 0 ? "in-stock" : "made-to-order",
      availableQuantity: brand.brandTier === "domestic" ? 20 : 8 - i * 3,
      safetyStock: 3,
      replenishmentLeadTime: brand.brandTier === "domestic" ? "7-14 days" : "14-30 days",
      warehouseLocation: `${city} Warehouse`,
      lastUpdated: "2026-06-13",
      mode: "supplier-network",
    })),
  });
}

for (let n = 1; n <= 20; n++) {
  const idx = n - 1;
  const industry = INDUSTRIES[idx % 5];
  const city = CITIES[idx % 5];
  const brand = BRANDS[idx % 10];
  const outcome = OUTCOMES[idx % 5];
  const quantity = 4 + (idx % 12);
  const unitPrice = 40000 + (idx % 8) * 15000;
  const tenderId = `tender-${String(n).padStart(3, "0")}-${industry}`;
  const proposalId = `proposal-${String(n).padStart(3, "0")}`;
  const outcomeId = `outcome-${String(n).padStart(3, "0")}`;
  const sku = `${brand.prefix}-TM-001`;
  const score = 75 + (idx % 12);
  const winProb = 65 + (idx % 18);
  const winPrice = outcome === "won" ? unitPrice * quantity : null;

  writeJson(path.join(ROOT, "projects", `project-${String(n).padStart(3, "0")}.json`), {
    schemaVersion: "1.0",
    compatibleLayers: ["v25-tender-knowledge", "v24-proposal-intelligence", "v23-bid-commercial"],
    projectId: `project-${String(n).padStart(3, "0")}`,
    tender: {
      tenderId,
      projectName: `${city} ${industry.replace("-", " ")} Equipment Project ${n}`,
      city,
      industry,
      budgetMin: unitPrice * quantity * 0.9,
      budgetMax: unitPrice * quantity * 1.2,
      tenderDate: `2025-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 28) + 1).padStart(2, "0")}`,
      status: idx % 7 === 0 ? "archived" : "completed",
      mode: "tender-knowledge",
    },
    proposal: {
      proposalId,
      tenderId,
      sku,
      brand: brand.brandName,
      quantity,
      finalPrice: unitPrice,
      proposalScore: score,
      winProbability: winProb,
      strategyType: winProb >= 80 ? "high-confidence" : "balanced",
      submittedAt: `2025-${String((idx % 12) + 1).padStart(2, "0")}-15`,
      mode: "tender-knowledge",
    },
    outcome: {
      outcomeId,
      tenderId,
      proposalId,
      outcome,
      winPrice,
      competitorCount: 3 + (idx % 4),
      marginPercent: outcome === "won" ? 12 + (idx % 6) : null,
      recordedAt: `2025-${String((idx % 12) + 2).padStart(2, "0")}-01`,
      mode: "tender-knowledge",
    },
    knowledgeAssisted: {
      baselineProbability: winProb,
      calibratedProbability: n === 1 ? 78 : null,
      confidence: winProb >= 80 ? "high" : "medium",
    },
  });
}

for (const bench of BENCHMARKS) {
  writeJson(path.join(ROOT, "benchmarks", `${bench.slug}.json`), {
    schemaVersion: "1.0",
    compatibleLayers: ["v25-tender-knowledge"],
    industry: bench.industry,
    profiles: [
      {
        benchmarkId: `bench-${bench.slug}`,
        industry: bench.industry,
        city: bench.city,
        avgWinProbability: bench.avgWinProbability,
        avgProposalScore: bench.avgProposalScore,
        avgMarginPercent: bench.avgMarginPercent,
        sampleSize: 4,
        mode: "tender-knowledge",
      },
    ],
    summary: {
      industryLabel: bench.label,
      primaryCity: bench.city,
      avgWinProbability: bench.avgWinProbability,
      avgProposalScore: bench.avgProposalScore,
      avgMarginPercent: bench.avgMarginPercent,
    },
  });
}

console.log("Generated Sprint 1 data assets:");
console.log(`  brands: ${BRANDS.length} (${BRANDS.length * 5} SKUs)`);
console.log(`  suppliers: ${SUPPLIER_CONFIG.length}`);
console.log(`  projects: 20`);
console.log(`  benchmarks: ${BENCHMARKS.length}`);
