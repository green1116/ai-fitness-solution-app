import type { RegistryValidation } from "../shared/types";
import { getAllCategoryAssignments } from "./category-assignment";
import {
  CANONICAL_CATEGORY_ID,
  INDUSTRY_CLASSIFICATION_TAG,
  INDUSTRY_CLASSIFICATION_VERSION,
} from "./types";
import type { CategoryTreeNode, IndustryCategory, IndustryClassificationContext } from "./types";
import {
  getAllCategories,
  getCategoryById,
  getChildCategories,
  getRootCategories,
} from "./category-registry";

function buildTreeNode(category: IndustryCategory): CategoryTreeNode {
  const children = getChildCategories(category.categoryId).map((child) => buildTreeNode(child));
  return { category, children };
}

export function buildCategoryTree(): CategoryTreeNode[] {
  return getRootCategories().map((root) => buildTreeNode(root));
}

function countTreeNodes(nodes: CategoryTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countTreeNodes(node.children), 0);
}

function maxTreeDepth(nodes: CategoryTreeNode[], depth = 1): number {
  if (nodes.length === 0) {
    return depth - 1;
  }
  return Math.max(...nodes.map((node) => maxTreeDepth(node.children, depth + 1)));
}

export function buildIndustryClassificationContext(): IndustryClassificationContext {
  const categories = getAllCategories();
  const assignments = getAllCategoryAssignments();
  const categoryTree = buildCategoryTree();

  return {
    contextId: `industry-classification-context-${INDUSTRY_CLASSIFICATION_VERSION}`,
    categories,
    assignments,
    categoryTree,
    totalCategories: categories.length,
    totalAssignments: assignments.length,
    mode: "industry-platform",
  };
}

export function validateIndustryClassificationContext(
  context: IndustryClassificationContext,
): boolean {
  const treeNodeCount = countTreeNodes(context.categoryTree);
  const treeDepth = maxTreeDepth(context.categoryTree);

  return (
    context.categories.length >= 14 &&
    context.assignments.length >= 14 &&
    context.categoryTree.length >= 3 &&
    treeNodeCount === context.totalCategories &&
    treeDepth >= 3 &&
    context.totalCategories === context.categories.length &&
    context.totalAssignments === context.assignments.length &&
    getCategoryById(CANONICAL_CATEGORY_ID) !== undefined &&
    context.mode === "industry-platform"
  );
}

export function validateClassificationContextRegistry(): RegistryValidation {
  const context = buildIndustryClassificationContext();
  const canonicalInTree = context.categoryTree.some((root) =>
    containsCategory(root, CANONICAL_CATEGORY_ID),
  );

  const valid =
    validateIndustryClassificationContext(context) &&
    canonicalInTree &&
    INDUSTRY_CLASSIFICATION_VERSION === "v30-industry-platform-4" &&
    INDUSTRY_CLASSIFICATION_TAG === "v30-industry-classification-foundation";

  return {
    valid,
    count: context.totalCategories,
    summary: `classification-context categories=${context.totalCategories} assignments=${context.totalAssignments} treeRoots=${context.categoryTree.length} valid=${valid}`,
  };
}

function containsCategory(node: CategoryTreeNode, categoryId: string): boolean {
  if (node.category.categoryId === categoryId) {
    return true;
  }
  return node.children.some((child) => containsCategory(child, categoryId));
}
