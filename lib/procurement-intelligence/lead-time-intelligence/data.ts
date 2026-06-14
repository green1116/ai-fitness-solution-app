import type { LeadTimeIntelligenceEntry } from "../shared/types";

export const LEAD_TIME_INTELLIGENCE_CATALOG: LeadTimeIntelligenceEntry[] = [
  {
    id: "lt-lf-t5-east-warehouse",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    region: "East China",
    source: "warehouse",
    leadTimeDays: 7,
    availability: "in-stock",
    priority: "standard",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "lt-lf-t5-north-depot",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    region: "North China",
    source: "regional-depot",
    leadTimeDays: 10,
    availability: "in-stock",
    priority: "standard",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "lt-tg-skillrun-mto",
    brand: "Technogym",
    sku: "TG-SKILLRUN-001",
    region: "East China",
    source: "made-to-order",
    leadTimeDays: 35,
    availability: "made-to-order",
    priority: "standard",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "lt-sh-t8000-southwest",
    brand: "Shuhua",
    sku: "SH-T8000-001",
    region: "Southwest China",
    source: "regional-depot",
    leadTimeDays: 5,
    availability: "low-stock",
    priority: "expedited",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "lt-mx-sdrive-south",
    brand: "Matrix",
    sku: "MX-SDRIVE-001",
    region: "South China",
    source: "warehouse",
    leadTimeDays: 12,
    availability: "in-stock",
    priority: "standard",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "lt-tg-skillrun-critical",
    brand: "Technogym",
    sku: "TG-SKILLRUN-001",
    region: "East China",
    source: "manufacturer",
    leadTimeDays: 21,
    availability: "made-to-order",
    priority: "critical",
    status: "active",
    mode: "procurement-intelligence",
  },
];

export function getLeadTimeBySku(sku: string): LeadTimeIntelligenceEntry[] {
  return LEAD_TIME_INTELLIGENCE_CATALOG.filter((e) => e.sku === sku);
}

export function getLeadTimeByRegion(region: string): LeadTimeIntelligenceEntry[] {
  return LEAD_TIME_INTELLIGENCE_CATALOG.filter((e) => e.region === region);
}

export function getAllLeadTimeIntelligence(): LeadTimeIntelligenceEntry[] {
  return [...LEAD_TIME_INTELLIGENCE_CATALOG];
}
