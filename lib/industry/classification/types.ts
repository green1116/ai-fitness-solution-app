import type { IndustryEntityStatus, IndustryPlatformDataMode, RegistryValidation } from "../shared/types";

export const INDUSTRY_CLASSIFICATION_VERSION = "v30-industry-platform-4" as const;
export const INDUSTRY_CLASSIFICATION_TAG = "v30-industry-classification-foundation" as const;

export type ClassificationTargetType = "organization" | "directory-entry";

export interface IndustryCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  parentCategoryId: string | null;
  level: number;
  description: string;
  status: IndustryEntityStatus;
  metadata: Record<string, string>;
  mode: IndustryPlatformDataMode;
}

export interface IndustryCategoryAssignment {
  assignmentId: string;
  targetType: ClassificationTargetType;
  targetId: string;
  categoryId: string;
  assignedAt: string;
  status: IndustryEntityStatus;
  mode: IndustryPlatformDataMode;
}

export interface CategoryTreeNode {
  category: IndustryCategory;
  children: CategoryTreeNode[];
}

export interface IndustryClassificationContext {
  contextId: string;
  categories: IndustryCategory[];
  assignments: IndustryCategoryAssignment[];
  categoryTree: CategoryTreeNode[];
  totalCategories: number;
  totalAssignments: number;
  mode: IndustryPlatformDataMode;
}

export interface ClassificationQuery {
  categoryId?: string;
  categoryCode?: string;
  parentCategoryId?: string | null;
  level?: number;
  targetType?: ClassificationTargetType;
  targetId?: string;
  keyword?: string;
}

export interface ClassificationQueryResult {
  queryId: string;
  query: ClassificationQuery;
  categories: IndustryCategory[];
  assignments: IndustryCategoryAssignment[];
  hitCount: number;
  classificationReady: boolean;
}

export interface IndustryClassificationValidation {
  valid: boolean;
  categoryRegistry: RegistryValidation;
  categoryAssignment: RegistryValidation;
  classificationContext: RegistryValidation;
  classificationQuery: RegistryValidation;
}

export const CANONICAL_INDUSTRY_CLASSIFICATION_QUERY: ClassificationQuery = {
  categoryCode: "CARDIO_EQUIPMENT",
  level: 1,
  keyword: "cardio",
} as const;

export const CANONICAL_CATEGORY_ID = "ind-cat-cardio-equipment" as const;
