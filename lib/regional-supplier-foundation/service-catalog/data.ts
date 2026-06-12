import type { ServiceEntry } from "../shared/types";

export const SERVICE_CATALOG: ServiceEntry[] = [
  {
    id: "svc-shanghai-premium",
    city: "Shanghai",
    serviceProvider: "Technogym China Service Center",
    responseTime: "4h",
    onsiteTime: "24h",
    sla: "Premium — 48h resolution guarantee",
    engineerCount: 18,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "svc-shanghai-standard",
    city: "Shanghai",
    serviceProvider: "Life Fitness Shanghai Service Team",
    responseTime: "8h",
    onsiteTime: "24h",
    sla: "Standard — 72h resolution",
    engineerCount: 12,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "svc-beijing-standard",
    city: "Beijing",
    serviceProvider: "Life Fitness North China Service",
    responseTime: "8h",
    onsiteTime: "24h",
    sla: "Standard — 72h resolution",
    engineerCount: 10,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "svc-guangzhou-standard",
    city: "Guangzhou",
    serviceProvider: "Matrix South China Service Network",
    responseTime: "12h",
    onsiteTime: "48h",
    sla: "Standard — 72h resolution",
    engineerCount: 8,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "svc-chengdu-basic",
    city: "Chengdu",
    serviceProvider: "Shuhua Southwest Service Partner",
    responseTime: "24h",
    onsiteTime: "48h",
    sla: "Basic — 96h resolution",
    engineerCount: 4,
    sparePartsAvailable: false,
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "svc-wuhan-basic",
    city: "Wuhan",
    serviceProvider: "Impulse Central China Service",
    responseTime: "24h",
    onsiteTime: "72h",
    sla: "Basic — 96h resolution",
    engineerCount: 3,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-network",
  },
];

export function getServicesByCity(city: string): ServiceEntry[] {
  return SERVICE_CATALOG.filter((s) => s.city === city);
}

export function getAllServices(): ServiceEntry[] {
  return [...SERVICE_CATALOG];
}
