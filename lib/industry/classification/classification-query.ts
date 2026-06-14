import type { RegistryValidation } from "../shared/types";
import { getAllCategoryAssignments, getAssignmentsByTarget } from "./category-assignment";
import {
  getAllCategories,
  getCategoryByCode,
  getCategoryById,
  getChildCategories,
} from "./category-registry";
import { validateClassificationContextRegistry } from "./classification-context";
import { validateCategoryAssignmentRegistry } from "./category-assignment";
import { validateCategoryRegistry } from "./category-registry";
import type {
  ClassificationQuery,
  ClassificationQueryResult,
  IndustryClassificationValidation,
} from "./types";
import { CANONICAL_INDUSTRY_CLASSIFICATION_QUERY } from "./types";

function matchesKeyword(category: ReturnType<typeof getAllCategories>[number], keyword: string): boolean {
  const normalized = keyword.toLowerCase();
  return (
    category.categoryName.toLowerCase().includes(normalized) ||
    category.categoryCode.toLowerCase().includes(normalized) ||
    category.description.toLowerCase().includes(normalized) ||
    Object.values(category.metadata).some((value) => value.toLowerCase().includes(normalized))
  );
}

export function queryClassification(input: ClassificationQuery = {}): ClassificationQueryResult {
  let categories = getAllCategories();
  let assignments = getAllCategoryAssignments();

  if (input.categoryId) {
    categories = categories.filter((category) => category.categoryId === input.categoryId);
    assignments = assignments.filter((assignment) => assignment.categoryId === input.categoryId);
  }

  if (input.categoryCode) {
    const matched = getCategoryByCode(input.categoryCode);
    categories = matched ? [matched] : [];
    assignments = matched
      ? assignments.filter((assignment) => assignment.categoryId === matched.categoryId)
      : [];
  }

  if (input.parentCategoryId !== undefined) {
    categories = categories.filter(
      (category) => category.parentCategoryId === input.parentCategoryId,
    );
  }

  if (input.level !== undefined) {
    categories = categories.filter((category) => category.level === input.level);
    const categoryIds = new Set(categories.map((category) => category.categoryId));
    assignments = assignments.filter((assignment) => categoryIds.has(assignment.categoryId));
  }

  if (input.targetType && input.targetId) {
    assignments = getAssignmentsByTarget(input.targetType, input.targetId);
    const categoryIds = new Set(assignments.map((assignment) => assignment.categoryId));
    categories = [...categoryIds]
      .map((categoryId) => getCategoryById(categoryId))
      .filter((category): category is NonNullable<typeof category> => category !== undefined);
  } else if (input.targetType) {
    assignments = assignments.filter((assignment) => assignment.targetType === input.targetType);
  }

  if (input.keyword) {
    categories = categories.filter((category) => matchesKeyword(category, input.keyword!));
    const categoryIds = new Set(categories.map((category) => category.categoryId));
    assignments = assignments.filter((assignment) => categoryIds.has(assignment.categoryId));
  }

  const queryParts = [
    input.categoryId ?? "all-category-ids",
    input.categoryCode ?? "all-codes",
    input.parentCategoryId ?? "all-parents",
    input.level?.toString() ?? "all-levels",
    input.targetType ?? "all-target-types",
    input.targetId ?? "all-target-ids",
    input.keyword ?? "no-keyword",
  ];

  const hitCount = categories.length + assignments.length;

  return {
    queryId: `classification-query-${queryParts.join("-")}`,
    query: input,
    categories,
    assignments,
    hitCount,
    classificationReady: categories.length > 0 || assignments.length > 0,
  };
}

export function queryCategoriesByParent(parentCategoryId: string | null): ClassificationQueryResult {
  const categories = getChildCategories(parentCategoryId);
  return {
    queryId: `classification-query-parent-${parentCategoryId ?? "root"}`,
    query: { parentCategoryId },
    categories,
    assignments: [],
    hitCount: categories.length,
    classificationReady: categories.length > 0,
  };
}

export function queryAssignmentsByTarget(
  targetType: ClassificationQuery["targetType"] & string,
  targetId: string,
): ClassificationQueryResult {
  return queryClassification({ targetType: targetType as NonNullable<typeof targetType>, targetId });
}

export function validateClassificationQueryRegistry(): RegistryValidation {
  const canonical = queryClassification(CANONICAL_INDUSTRY_CLASSIFICATION_QUERY);
  const equipmentChildren = queryCategoriesByParent("ind-cat-fitness-equipment");
  const levelOne = queryClassification({ level: 1 });
  const lfAssignments = queryAssignmentsByTarget("directory-entry", "ind-dir-brand-life-fitness");
  const orgAssignments = queryAssignmentsByTarget("organization", "ind-org-brand-life-fitness");

  const valid =
    canonical.classificationReady &&
    canonical.categories.length >= 1 &&
    equipmentChildren.hitCount >= 3 &&
    levelOne.hitCount >= 9 &&
    lfAssignments.assignments.length >= 2 &&
    orgAssignments.assignments.length >= 0;

  return {
    valid,
    count: canonical.hitCount,
    summary: `classification-query canonical=${canonical.categories.length} equipmentChildren=${equipmentChildren.hitCount} lfAssignments=${lfAssignments.assignments.length} valid=${valid}`,
  };
}

export function validateIndustryClassification(): IndustryClassificationValidation {
  const categoryRegistry = validateCategoryRegistry();
  const categoryAssignment = validateCategoryAssignmentRegistry();
  const classificationContext = validateClassificationContextRegistry();
  const classificationQuery = validateClassificationQueryRegistry();

  return {
    valid:
      categoryRegistry.valid &&
      categoryAssignment.valid &&
      classificationContext.valid &&
      classificationQuery.valid,
    categoryRegistry,
    categoryAssignment,
    classificationContext,
    classificationQuery,
  };
}
