import { getDirectoryEntryById } from "../directory/organization-directory";
import { getOrganizationById } from "../organization-registry";
import type { RegistryValidation } from "../shared/types";
import { getCategoryById } from "./category-registry";
import type { IndustryCategoryAssignment } from "./types";

export const CATEGORY_ASSIGNMENT_REGISTRY: IndustryCategoryAssignment[] = [
  {
    assignmentId: "ind-assign-org-lf-brand-equipment",
    targetType: "organization",
    targetId: "ind-org-brand-life-fitness",
    categoryId: "ind-cat-fitness-equipment",
    assignedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-lf-brand-cardio",
    targetType: "directory-entry",
    targetId: "ind-dir-brand-life-fitness",
    categoryId: "ind-cat-cardio-equipment",
    assignedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-lf-brand-treadmills",
    targetType: "directory-entry",
    targetId: "ind-dir-brand-life-fitness",
    categoryId: "ind-cat-treadmills",
    assignedAt: "2026-02-02T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-tg-brand-cardio",
    targetType: "directory-entry",
    targetId: "ind-dir-brand-technogym",
    categoryId: "ind-cat-cardio-equipment",
    assignedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-tg-brand-functional",
    targetType: "directory-entry",
    targetId: "ind-dir-brand-technogym",
    categoryId: "ind-cat-functional-training",
    assignedAt: "2026-02-02T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-matrix-brand-strength",
    targetType: "directory-entry",
    targetId: "ind-dir-brand-matrix",
    categoryId: "ind-cat-strength-equipment",
    assignedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-buyer-sh-gym-venue",
    targetType: "directory-entry",
    targetId: "ind-dir-buyer-sh-gym",
    categoryId: "ind-cat-commercial-gym",
    assignedAt: "2026-02-03T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-buyer-bj-hotel-venue",
    targetType: "directory-entry",
    targetId: "ind-dir-buyer-bj-hotel",
    categoryId: "ind-cat-hotel-fitness",
    assignedAt: "2026-02-03T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-consultant-advisory",
    targetType: "directory-entry",
    targetId: "ind-dir-consultant-fitness-advisory",
    categoryId: "ind-cat-consulting",
    assignedAt: "2026-02-04T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-contractor-sh-install",
    targetType: "directory-entry",
    targetId: "ind-dir-contractor-sh-fitout",
    categoryId: "ind-cat-installation",
    assignedAt: "2026-02-04T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-supplier-lf-maintenance",
    targetType: "directory-entry",
    targetId: "ind-dir-supplier-lf-cn",
    categoryId: "ind-cat-maintenance",
    assignedAt: "2026-02-05T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-org-buyer-sh-gym-venue",
    targetType: "organization",
    targetId: "ind-org-buyer-sh-gym",
    categoryId: "ind-cat-commercial-gym",
    assignedAt: "2026-02-03T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-org-consultant-advisory",
    targetType: "organization",
    targetId: "ind-org-consultant-fitness-advisory",
    categoryId: "ind-cat-consulting",
    assignedAt: "2026-02-04T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    assignmentId: "ind-assign-dir-manufacturer-lf-equipment",
    targetType: "directory-entry",
    targetId: "ind-dir-manufacturer-lf-global",
    categoryId: "ind-cat-fitness-equipment",
    assignedAt: "2026-02-05T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
];

export function getAllCategoryAssignments(): IndustryCategoryAssignment[] {
  return [...CATEGORY_ASSIGNMENT_REGISTRY];
}

export function getCategoryAssignmentById(
  assignmentId: string,
): IndustryCategoryAssignment | undefined {
  return CATEGORY_ASSIGNMENT_REGISTRY.find((assignment) => assignment.assignmentId === assignmentId);
}

export function getAssignmentsByCategoryId(categoryId: string): IndustryCategoryAssignment[] {
  return CATEGORY_ASSIGNMENT_REGISTRY.filter((assignment) => assignment.categoryId === categoryId);
}

export function getAssignmentsByTarget(
  targetType: IndustryCategoryAssignment["targetType"],
  targetId: string,
): IndustryCategoryAssignment[] {
  return CATEGORY_ASSIGNMENT_REGISTRY.filter(
    (assignment) => assignment.targetType === targetType && assignment.targetId === targetId,
  );
}

function resolveTarget(assignment: IndustryCategoryAssignment): boolean {
  if (assignment.targetType === "organization") {
    return getOrganizationById(assignment.targetId) !== undefined;
  }
  return getDirectoryEntryById(assignment.targetId) !== undefined;
}

export function validateCategoryAssignmentRegistry(): RegistryValidation {
  const assignments = getAllCategoryAssignments();
  const orgAssignments = assignments.filter((assignment) => assignment.targetType === "organization");
  const dirAssignments = assignments.filter(
    (assignment) => assignment.targetType === "directory-entry",
  );

  const categoryLinksValid = assignments.every(
    (assignment) =>
      assignment.assignmentId.length > 0 &&
      getCategoryById(assignment.categoryId) !== undefined &&
      resolveTarget(assignment) &&
      assignment.status === "active" &&
      assignment.mode === "industry-platform",
  );

  const valid =
    assignments.length >= 14 &&
    orgAssignments.length >= 2 &&
    dirAssignments.length >= 10 &&
    categoryLinksValid;

  return {
    valid,
    count: assignments.length,
    summary: `category-assignment count=${assignments.length} org=${orgAssignments.length} directory=${dirAssignments.length} valid=${valid}`,
  };
}
