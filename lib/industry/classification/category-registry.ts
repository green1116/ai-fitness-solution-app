import type { RegistryValidation } from "../shared/types";
import type { IndustryCategory } from "./types";

export const CATEGORY_REGISTRY: IndustryCategory[] = [
  {
    categoryId: "ind-cat-fitness-equipment",
    categoryCode: "FITNESS_EQUIPMENT",
    categoryName: "Fitness Equipment",
    parentCategoryId: null,
    level: 0,
    description: "Root category for all fitness equipment classifications",
    status: "active",
    metadata: { graphNode: "root-equipment" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-fitness-venue",
    categoryCode: "FITNESS_VENUE",
    categoryName: "Fitness Venue",
    parentCategoryId: null,
    level: 0,
    description: "Root category for venue and facility types",
    status: "active",
    metadata: { graphNode: "root-venue" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-fitness-service",
    categoryCode: "FITNESS_SERVICE",
    categoryName: "Fitness Service",
    parentCategoryId: null,
    level: 0,
    description: "Root category for consulting, installation, and maintenance",
    status: "active",
    metadata: { graphNode: "root-service" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-cardio-equipment",
    categoryCode: "CARDIO_EQUIPMENT",
    categoryName: "Cardio Equipment",
    parentCategoryId: "ind-cat-fitness-equipment",
    level: 1,
    description: "Treadmills, bikes, ellipticals, and rowers",
    status: "active",
    metadata: { equipmentFamily: "cardio" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-strength-equipment",
    categoryCode: "STRENGTH_EQUIPMENT",
    categoryName: "Strength Equipment",
    parentCategoryId: "ind-cat-fitness-equipment",
    level: 1,
    description: "Free weights, racks, and selectorized strength machines",
    status: "active",
    metadata: { equipmentFamily: "strength" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-functional-training",
    categoryCode: "FUNCTIONAL_TRAINING",
    categoryName: "Functional Training",
    parentCategoryId: "ind-cat-fitness-equipment",
    level: 1,
    description: "Functional rigs, turf zones, and training accessories",
    status: "active",
    metadata: { equipmentFamily: "functional" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-treadmills",
    categoryCode: "TREADMILLS",
    categoryName: "Treadmills",
    parentCategoryId: "ind-cat-cardio-equipment",
    level: 2,
    description: "Commercial and light-commercial treadmill products",
    status: "active",
    metadata: { cardioSubtype: "treadmill" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-exercise-bikes",
    categoryCode: "EXERCISE_BIKES",
    categoryName: "Exercise Bikes",
    parentCategoryId: "ind-cat-cardio-equipment",
    level: 2,
    description: "Upright, recumbent, and spin bikes",
    status: "active",
    metadata: { cardioSubtype: "bike" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-commercial-gym",
    categoryCode: "COMMERCIAL_GYM",
    categoryName: "Commercial Gym",
    parentCategoryId: "ind-cat-fitness-venue",
    level: 1,
    description: "Standalone commercial gym and fitness club venues",
    status: "active",
    metadata: { venueType: "commercial-gym" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-hotel-fitness",
    categoryCode: "HOTEL_FITNESS",
    categoryName: "Hotel Fitness",
    parentCategoryId: "ind-cat-fitness-venue",
    level: 1,
    description: "Hotel and hospitality fitness center venues",
    status: "active",
    metadata: { venueType: "hotel" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-corporate-wellness",
    categoryCode: "CORPORATE_WELLNESS",
    categoryName: "Corporate Wellness",
    parentCategoryId: "ind-cat-fitness-venue",
    level: 1,
    description: "Corporate campus and workplace wellness facilities",
    status: "active",
    metadata: { venueType: "corporate" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-consulting",
    categoryCode: "CONSULTING",
    categoryName: "Consulting",
    parentCategoryId: "ind-cat-fitness-service",
    level: 1,
    description: "Industry advisory and project consulting services",
    status: "active",
    metadata: { serviceType: "consulting" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-installation",
    categoryCode: "INSTALLATION",
    categoryName: "Installation",
    parentCategoryId: "ind-cat-fitness-service",
    level: 1,
    description: "Equipment installation and fit-out contracting",
    status: "active",
    metadata: { serviceType: "installation" },
    mode: "industry-platform",
  },
  {
    categoryId: "ind-cat-maintenance",
    categoryCode: "MAINTENANCE",
    categoryName: "Maintenance",
    parentCategoryId: "ind-cat-fitness-service",
    level: 1,
    description: "Preventive maintenance and service contracts",
    status: "active",
    metadata: { serviceType: "maintenance" },
    mode: "industry-platform",
  },
];

export function getAllCategories(): IndustryCategory[] {
  return [...CATEGORY_REGISTRY];
}

export function getCategoryById(categoryId: string): IndustryCategory | undefined {
  return CATEGORY_REGISTRY.find((category) => category.categoryId === categoryId);
}

export function getCategoryByCode(categoryCode: string): IndustryCategory | undefined {
  return CATEGORY_REGISTRY.find((category) => category.categoryCode === categoryCode);
}

export function getChildCategories(parentCategoryId: string | null): IndustryCategory[] {
  return CATEGORY_REGISTRY.filter((category) => category.parentCategoryId === parentCategoryId);
}

export function getRootCategories(): IndustryCategory[] {
  return getChildCategories(null);
}

export function validateCategoryRegistry(): RegistryValidation {
  const categories = getAllCategories();
  const roots = getRootCategories();
  const leafCount = categories.filter(
    (category) => !categories.some((child) => child.parentCategoryId === category.categoryId),
  ).length;

  const parentLinksValid = categories.every((category) => {
    if (category.parentCategoryId === null) {
      return category.level === 0;
    }
    const parent = getCategoryById(category.parentCategoryId);
    return parent !== undefined && parent.level === category.level - 1;
  });

  const uniqueCodes = new Set(categories.map((category) => category.categoryCode)).size;
  const valid =
    categories.length >= 14 &&
    roots.length >= 3 &&
    leafCount >= 5 &&
    parentLinksValid &&
    uniqueCodes === categories.length &&
    categories.every((category) => category.mode === "industry-platform");

  return {
    valid,
    count: categories.length,
    summary: `category-registry count=${categories.length} roots=${roots.length} leaves=${leafCount} valid=${valid}`,
  };
}
