import type { ServiceProfile } from "../shared/types";

export const SERVICE_PROFILES: ServiceProfile[] = [
  {
    serviceId: "svc-shanghai-premium",
    city: "Shanghai",
    responseTime: "4h",
    onsiteTime: "24h",
    engineerCount: 18,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-shanghai-standard",
    city: "Shanghai",
    responseTime: "8h",
    onsiteTime: "24h",
    engineerCount: 12,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-beijing-standard",
    city: "Beijing",
    responseTime: "8h",
    onsiteTime: "24h",
    engineerCount: 10,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-guangzhou-standard",
    city: "Guangzhou",
    responseTime: "12h",
    onsiteTime: "48h",
    engineerCount: 8,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-shenzhen-standard",
    city: "Shenzhen",
    responseTime: "12h",
    onsiteTime: "48h",
    engineerCount: 7,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-chengdu-standard",
    city: "Chengdu",
    responseTime: "24h",
    onsiteTime: "48h",
    engineerCount: 6,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-hangzhou-standard",
    city: "Hangzhou",
    responseTime: "12h",
    onsiteTime: "48h",
    engineerCount: 5,
    sparePartsAvailable: false,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-nanjing-standard",
    city: "Nanjing",
    responseTime: "12h",
    onsiteTime: "48h",
    engineerCount: 5,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-wuhan-standard",
    city: "Wuhan",
    responseTime: "24h",
    onsiteTime: "72h",
    engineerCount: 4,
    sparePartsAvailable: true,
    status: "active",
    mode: "supplier-portal",
  },
  {
    serviceId: "svc-suzhou-standard",
    city: "Suzhou",
    responseTime: "12h",
    onsiteTime: "48h",
    engineerCount: 4,
    sparePartsAvailable: false,
    status: "active",
    mode: "supplier-portal",
  },
];

export function getAllServiceProfiles(): ServiceProfile[] {
  return [...SERVICE_PROFILES];
}

export function getServiceProfileById(serviceId: string): ServiceProfile | undefined {
  return SERVICE_PROFILES.find((s) => s.serviceId === serviceId);
}

export function getServiceProfilesByCity(city: string): ServiceProfile[] {
  return SERVICE_PROFILES.filter((s) => s.city === city);
}
