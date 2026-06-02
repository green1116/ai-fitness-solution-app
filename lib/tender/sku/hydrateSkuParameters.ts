import type { ProductSKU, SkuParameters } from "./skuTypes";

function parseMotorPowerHp(power?: string): number | undefined {
  if (!power) return undefined;
  const m = power.match(/(\d+(?:\.\d+)?)\s*(?:HP|hp|马力)/);
  return m ? Number(m[1]) : undefined;
}

export function hydrateSkuParameters(sku: ProductSKU): ProductSKU {
  if (sku.parameters && Object.keys(sku.parameters).length > 0) {
    return sku;
  }

  const parameters: SkuParameters = {
    speed: sku.specs.maxSpeedKmH,
    incline: sku.specs.incline,
    loadCapacity: sku.specs.maxLoadKg,
    motorPower: parseMotorPowerHp(sku.specs.power),
    warrantyYears: sku.warrantyYears,
    leadTimeDays: sku.leadTimeDays,
  };

  return { ...sku, parameters };
}
