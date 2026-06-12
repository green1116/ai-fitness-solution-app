import type { RealMaintenanceEntry } from "../shared/types";

export const REAL_MAINTENANCE_CATALOG: RealMaintenanceEntry[] = [
  { maintenanceId: "maint-skillrun", sku: "TG-SKILLRUN-001", modelName: "Skillrun", brandName: "Technogym", serviceIntervalDays: 90, annualMaintenanceCost: 8500, preventiveMaintenanceCost: 2200, emergencyRepairCost: 4500, sparePartsAvailability: "3-5-days", slaResponseHours: 48, certifiedTechnicianRequired: true, mode: "real-catalog" },
  { maintenanceId: "maint-skillbike", sku: "TG-SKILLBIKE-002", modelName: "Technogym Skillbike", brandName: "Technogym", serviceIntervalDays: 90, annualMaintenanceCost: 4200, preventiveMaintenanceCost: 1200, emergencyRepairCost: 2800, sparePartsAvailability: "3-5-days", slaResponseHours: 48, certifiedTechnicianRequired: true, mode: "real-catalog" },
  { maintenanceId: "maint-recovery-r1", sku: "TG-RECOVERY-R1", modelName: "Recovery Station R1", brandName: "Technogym", serviceIntervalDays: 180, annualMaintenanceCost: 1800, preventiveMaintenanceCost: 600, emergencyRepairCost: 1200, sparePartsAvailability: "1-2-weeks", slaResponseHours: 72, certifiedTechnicianRequired: false, mode: "real-catalog" },
  { maintenanceId: "maint-t5", sku: "LF-T5-001", modelName: "T5 Treadmill", brandName: "Life Fitness", serviceIntervalDays: 60, annualMaintenanceCost: 6200, preventiveMaintenanceCost: 1800, emergencyRepairCost: 3500, sparePartsAvailability: "next-day", slaResponseHours: 24, certifiedTechnicianRequired: true, mode: "real-catalog" },
  { maintenanceId: "maint-synrgy360", sku: "LF-SYNRGY360-001", modelName: "SYNRGY360", brandName: "Life Fitness", serviceIntervalDays: 90, annualMaintenanceCost: 9800, preventiveMaintenanceCost: 2800, emergencyRepairCost: 5200, sparePartsAvailability: "next-day", slaResponseHours: 24, certifiedTechnicianRequired: true, mode: "real-catalog" },
  { maintenanceId: "maint-a5700", sku: "JH-A5700-001", modelName: "Johnson A5700", brandName: "Johnson", serviceIntervalDays: 90, annualMaintenanceCost: 3800, preventiveMaintenanceCost: 1000, emergencyRepairCost: 2200, sparePartsAvailability: "3-5-days", slaResponseHours: 48, certifiedTechnicianRequired: false, mode: "real-catalog" },
  { maintenanceId: "maint-sdrive", sku: "MX-SDRIVE-001", modelName: "Matrix S-Drive", brandName: "Matrix", serviceIntervalDays: 90, annualMaintenanceCost: 5200, preventiveMaintenanceCost: 1500, emergencyRepairCost: 3200, sparePartsAvailability: "3-5-days", slaResponseHours: 72, certifiedTechnicianRequired: true, mode: "real-catalog" },
  { maintenanceId: "maint-t8000", sku: "SH-T8000-001", modelName: "SH-T8000", brandName: "Shuhua", serviceIntervalDays: 120, annualMaintenanceCost: 2800, preventiveMaintenanceCost: 800, emergencyRepairCost: 1800, sparePartsAvailability: "same-day", slaResponseHours: 48, certifiedTechnicianRequired: false, mode: "real-catalog" },
  { maintenanceId: "maint-it7000", sku: "IP-IT7000-001", modelName: "Impulse IT7000", brandName: "Impulse", serviceIntervalDays: 120, annualMaintenanceCost: 2200, preventiveMaintenanceCost: 650, emergencyRepairCost: 1500, sparePartsAvailability: "same-day", slaResponseHours: 48, certifiedTechnicianRequired: false, mode: "real-catalog" },
  { maintenanceId: "maint-aibike", sku: "IF-AIBIKE-001", modelName: "AI Smart Bike Pro", brandName: "IntelligentFit", serviceIntervalDays: 90, annualMaintenanceCost: 3200, preventiveMaintenanceCost: 900, emergencyRepairCost: 2400, sparePartsAvailability: "next-day", slaResponseHours: 24, certifiedTechnicianRequired: false, mode: "real-catalog" },
];

export function getRealMaintenanceBySku(sku: string): RealMaintenanceEntry | undefined {
  return REAL_MAINTENANCE_CATALOG.find((m) => m.sku === sku);
}

export function getAllRealMaintenance(): RealMaintenanceEntry[] {
  return [...REAL_MAINTENANCE_CATALOG];
}
