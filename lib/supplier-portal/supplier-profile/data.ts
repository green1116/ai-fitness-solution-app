import type { SupplierProfile } from "../shared/types";

export const SUPPLIER_PROFILES: SupplierProfile[] = [
  {
    supplierId: "supplier-life-fitness-cn",
    supplierName: "Life Fitness Asia Pacific",
    city: "Shanghai",
    region: "East China",
    contact: "china@lifefitness.com",
    serviceLevel: "premium",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-technogym-cn",
    supplierName: "Technogym China (Shanghai)",
    city: "Shanghai",
    region: "East China",
    contact: "sales.cn@technogym.com",
    serviceLevel: "premium",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-matrix-cn",
    supplierName: "Matrix Fitness China",
    city: "Guangzhou",
    region: "South China",
    contact: "matrix.cn@johnsonhealthtech.com",
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-relax-cn",
    supplierName: "Relax Fitness Shenzhen",
    city: "Shenzhen",
    region: "South China",
    contact: "sales@relaxfitness.cn",
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-shuhua",
    supplierName: "Shandong Shuhua Sports Equipment Co., Ltd.",
    city: "Chengdu",
    region: "Southwest China",
    contact: "sales@shuhua.com.cn",
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-precor-cn",
    supplierName: "Precor China (Shanghai)",
    city: "Shanghai",
    region: "East China",
    contact: "china@precor.com",
    serviceLevel: "premium",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-impulse-cn",
    supplierName: "Impulse Health Tech China",
    city: "Chengdu",
    region: "Southwest China",
    contact: "sales@impulsefitness.com",
    serviceLevel: "basic",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-dhz-cn",
    supplierName: "DHZ Fitness Guangzhou",
    city: "Guangzhou",
    region: "South China",
    contact: "sales@dhzfitness.com",
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-bodystrength-cn",
    supplierName: "BodyStrong Shenzhen Distribution",
    city: "Shenzhen",
    region: "South China",
    contact: "sales@bodystrength.cn",
    serviceLevel: "basic",
    status: "active",
    mode: "supplier-portal",
  },
  {
    supplierId: "supplier-sportsart-cn",
    supplierName: "SportsArt China (Beijing)",
    city: "Beijing",
    region: "North China",
    contact: "china@gosportsart.com",
    serviceLevel: "standard",
    status: "active",
    mode: "supplier-portal",
  },
];

export function getAllSupplierProfiles(): SupplierProfile[] {
  return [...SUPPLIER_PROFILES];
}

export function getSupplierProfileById(supplierId: string): SupplierProfile | undefined {
  return SUPPLIER_PROFILES.find((s) => s.supplierId === supplierId);
}

export function getSupplierProfilesByCity(city: string): SupplierProfile[] {
  return SUPPLIER_PROFILES.filter((s) => s.city === city);
}
