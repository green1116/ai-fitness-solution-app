import type { SupplierEntry } from "../shared/types";

export const SUPPLIER_CATALOG: SupplierEntry[] = [
  {
    id: "supplier-technogym-cn",
    brand: "Technogym",
    supplierName: "Technogym China (Shanghai)",
    region: "East China",
    authorizationLevel: "national",
    contact: "sales.cn@technogym.com",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "supplier-life-fitness-cn",
    brand: "Life Fitness",
    supplierName: "Life Fitness Asia Pacific",
    region: "East China",
    authorizationLevel: "national",
    contact: "china@lifefitness.com",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "supplier-matrix-cn",
    brand: "Matrix",
    supplierName: "Matrix Fitness China",
    region: "East China",
    authorizationLevel: "regional",
    contact: "matrix.cn@johnsonhealthtech.com",
    status: "active",
    mode: "supplier-network",
  },
  {
    id: "supplier-shuhua",
    brand: "Shuhua",
    supplierName: "Shandong Shuhua Sports Equipment Co., Ltd.",
    region: "North China",
    authorizationLevel: "national",
    contact: "sales@shuhua.com.cn",
    status: "active",
    mode: "supplier-network",
  },
];

export function getSupplierById(id: string): SupplierEntry | undefined {
  return SUPPLIER_CATALOG.find((s) => s.id === id);
}

export function getSuppliersByBrand(brand: string): SupplierEntry[] {
  return SUPPLIER_CATALOG.filter((s) => s.brand === brand);
}

export function getAllSuppliers(): SupplierEntry[] {
  return [...SUPPLIER_CATALOG];
}
