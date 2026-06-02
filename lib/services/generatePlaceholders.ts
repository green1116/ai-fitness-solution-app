import type { ProductPlaceholder, ProjectRecord } from "@/lib/domain/tender";
import { buildPlaceholders } from "@/lib/templates/placeholderTemplates";

export function generatePlaceholders(
  project: ProjectRecord,
): ProductPlaceholder[] {
  return buildPlaceholders(project.id, project.input);
}
