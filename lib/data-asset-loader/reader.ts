import fs from "fs";
import path from "path";
import type {
  BenchmarkAssetFile,
  BrandAssetFile,
  DataAssetCatalog,
  DataAssetStatistics,
  ProjectAssetFile,
  SupplierAssetFile,
  V25TenderKnowledgeCatalog,
} from "./shared/types";
import type { BenchmarkProfile } from "@/lib/tender-knowledge/shared/types";

const DATA_ROOT = path.join(process.cwd(), "data");

function listJsonFiles(dir: string): string[] {
  const fullDir = path.join(DATA_ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function readJsonFile<T>(dir: string, fileName: string): T {
  const filePath = path.join(DATA_ROOT, dir, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadBrandAssets(): BrandAssetFile[] {
  return listJsonFiles("brands").map((file) => readJsonFile<BrandAssetFile>("brands", file));
}

export function loadSupplierAssets(): SupplierAssetFile[] {
  return listJsonFiles("suppliers").map((file) =>
    readJsonFile<SupplierAssetFile>("suppliers", file),
  );
}

export function loadProjectAssets(): ProjectAssetFile[] {
  return listJsonFiles("projects").map((file) => readJsonFile<ProjectAssetFile>("projects", file));
}

export function loadBenchmarkAssets(): BenchmarkAssetFile[] {
  return listJsonFiles("benchmarks").map((file) =>
    readJsonFile<BenchmarkAssetFile>("benchmarks", file),
  );
}

export function loadDataAssetCatalog(): DataAssetCatalog {
  return {
    brands: loadBrandAssets(),
    suppliers: loadSupplierAssets(),
    projects: loadProjectAssets(),
    benchmarks: loadBenchmarkAssets(),
  };
}

export function buildDataAssetStatistics(): DataAssetStatistics {
  const catalog = loadDataAssetCatalog();
  const skuCount = catalog.brands.reduce((total, file) => total + file.equipment.length, 0);
  const supplierCities = [
    ...new Set(
      catalog.suppliers.flatMap((file) => file.dealers.map((dealer) => dealer.city)),
    ),
  ].sort();
  const projectCities = [
    ...new Set(catalog.projects.map((file) => file.historicalTender.city)),
  ].sort();
  const industriesCovered = [
    ...new Set(catalog.projects.map((file) => file.historicalTender.industry)),
  ].sort();
  const wonCount = catalog.projects.filter((file) => file.historicalBidOutcome.result === "won").length;
  const lostCount = catalog.projects.length - wonCount;

  return {
    brandCount: catalog.brands.length,
    skuCount,
    supplierCount: catalog.suppliers.length,
    projectCount: catalog.projects.length,
    benchmarkCount: catalog.benchmarks.length,
    wonCount,
    lostCount,
    citiesCovered: supplierCities,
    industriesCovered,
    projectCitiesCovered: projectCities,
  };
}

export function getV20BrandEntries() {
  return loadBrandAssets().map((file) => file.brand);
}

export function getV20EquipmentEntries() {
  return loadBrandAssets().flatMap((file) => file.equipment);
}

export function getV21SupplierEntries() {
  return loadSupplierAssets().map((file) => file.supplier);
}

export function getV21DealerEntries() {
  return loadSupplierAssets().flatMap((file) => file.dealers);
}

export function getV21InventoryEntries() {
  return loadSupplierAssets().flatMap((file) => file.inventory);
}

export function getV25TenderEntries() {
  return loadProjectAssets().map((file) => file.tender);
}

export function getV25ProposalEntries() {
  return loadProjectAssets().map((file) => file.proposal);
}

export function getV25OutcomeEntries() {
  return loadProjectAssets().map((file) => file.outcome);
}

export function getV25BenchmarkEntries(): BenchmarkProfile[] {
  return loadBenchmarkAssets()
    .flatMap((file) => file.profiles)
    .filter((profile): profile is BenchmarkProfile =>
      ["commercial-gym", "hotel", "campus", "community", "enterprise"].includes(profile.industry),
    );
}

export function getV25ExtendedBenchmarkAssets(): BenchmarkAssetFile[] {
  return loadBenchmarkAssets();
}

export function getV25TenderKnowledgeCatalog(): V25TenderKnowledgeCatalog {
  const projects = loadProjectAssets();
  return {
    tenders: projects.map((file) => file.tender),
    proposals: projects.map((file) => file.proposal),
    outcomes: projects.map((file) => file.outcome),
    coreBenchmarks: getV25BenchmarkEntries(),
    extendedBenchmarks: getV25ExtendedBenchmarkAssets(),
  };
}
