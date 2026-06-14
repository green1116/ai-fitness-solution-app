import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "data");

const BRANDS = [
  { slug: "life-fitness", brandName: "Life Fitness", prefix: "LF" },
  { slug: "technogym", brandName: "Technogym", prefix: "TG" },
  { slug: "matrix", brandName: "Matrix", prefix: "MX" },
  { slug: "relax", brandName: "Relax", prefix: "RX" },
  { slug: "shuhua", brandName: "Shuhua", prefix: "SH" },
  { slug: "precor", brandName: "Precor", prefix: "PC" },
  { slug: "impulse", brandName: "Impulse", prefix: "IM" },
  { slug: "dhz", brandName: "DHZ", prefix: "DH" },
  { slug: "bodystrength", brandName: "BodyStrong", prefix: "BS" },
  { slug: "sportsart", brandName: "SportsArt", prefix: "SA" },
];

const CITIES = [
  "Shanghai",
  "Beijing",
  "Guangzhou",
  "Shenzhen",
  "Chengdu",
  "Hangzhou",
  "Nanjing",
  "Wuhan",
  "Suzhou",
  "Xi'an",
];

const INDUSTRIES = ["commercial-gym", "hotel", "campus", "community", "enterprise"];

const SKU_SUFFIXES = ["TM", "BK", "EL", "ST", "FN"];

const AREA_BY_INDUSTRY = {
  "commercial-gym": 1200,
  hotel: 650,
  campus: 1800,
  community: 900,
  enterprise: 750,
};

const NEW_BENCHMARKS = [
  {
    slug: "government",
    industry: "government",
    label: "Government Sports Facility",
    city: "Beijing",
    avgWinProbability: 72,
    avgProposalScore: 81,
    avgMarginPercent: 11,
  },
  {
    slug: "fitness-club",
    industry: "fitness-club",
    label: "Fitness Club Chain",
    city: "Shanghai",
    avgWinProbability: 77,
    avgProposalScore: 83,
    avgMarginPercent: 15,
  },
];

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function buildProject(n) {
  const idx = n - 1;
  const industry = INDUSTRIES[idx % 5];
  const city = CITIES[idx % 10];
  const brand = BRANDS[idx % 10];
  const skuSuffix = SKU_SUFFIXES[idx % 5];
  const sku = `${brand.prefix}-${skuSuffix}-001`;
  const result = n <= 58 ? "won" : "lost";
  const quantity = 4 + (idx % 12);
  const unitPrice = 38000 + (idx % 9) * 12000;
  const budget = unitPrice * quantity;
  const area = AREA_BY_INDUSTRY[industry] + (idx % 6) * 50;
  const score = 72 + (idx % 16);
  const winProbability = 62 + (idx % 22);
  const strategy = winProbability >= 80 ? "high-confidence" : winProbability >= 70 ? "balanced" : "cost-optimized";
  const winningPrice = result === "won" ? budget : null;
  const grossMargin = result === "won" ? 11 + (idx % 8) : null;
  const projectId = `project-${String(n).padStart(3, "0")}`;
  const tenderId = `tender-${String(n).padStart(3, "0")}-${industry}`;
  const proposalId = `proposal-${String(n).padStart(3, "0")}`;
  const outcomeId = `outcome-${String(n).padStart(3, "0")}`;

  return {
    schemaVersion: "1.0",
    compatibleLayers: ["v25-tender-knowledge", "v24-proposal-intelligence", "v23-bid-commercial"],
    projectId,
    historicalTender: {
      projectId,
      city,
      industry,
      area,
      budget,
      brand: brand.brandName,
      sku,
      result,
    },
    historicalProposal: {
      score,
      winProbability,
      strategy,
    },
    historicalBidOutcome: {
      result,
      winningPrice,
      grossMargin,
    },
    tender: {
      tenderId,
      projectName: `${city} ${industry.replace("-", " ")} Equipment Project ${n}`,
      city,
      industry,
      budgetMin: Math.round(budget * 0.9),
      budgetMax: Math.round(budget * 1.15),
      tenderDate: `2025-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 27) + 1).padStart(2, "0")}`,
      status: idx % 11 === 0 ? "archived" : "completed",
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
      winProbability,
      strategyType: strategy,
      submittedAt: `2025-${String((idx % 12) + 1).padStart(2, "0")}-15`,
      mode: "tender-knowledge",
    },
    outcome: {
      outcomeId,
      tenderId,
      proposalId,
      outcome: result,
      winPrice: winningPrice,
      competitorCount: 3 + (idx % 4),
      marginPercent: grossMargin,
      recordedAt: `2025-${String((idx % 12) + 2).padStart(2, "0")}-01`,
      mode: "tender-knowledge",
    },
    knowledgeAssisted: {
      baselineProbability: winProbability,
      calibratedProbability: n === 1 ? 78 : null,
      confidence: winProbability >= 80 ? "high" : "medium",
    },
  };
}

for (let n = 1; n <= 100; n++) {
  writeJson(path.join(ROOT, "projects", `project-${String(n).padStart(3, "0")}.json`), buildProject(n));
}

for (const bench of NEW_BENCHMARKS) {
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
        sampleSize: 8,
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

console.log("Generated Data Asset Sprint 2:");
console.log("  projects: 100");
console.log("  new benchmarks: government, fitness-club");
console.log("  total benchmarks: 7");
