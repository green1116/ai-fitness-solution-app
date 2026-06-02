import type { ProductPlaceholder, ProjectInput } from "@/lib/domain/tender";
import { buildPlaceholders } from "@/lib/templates/placeholderTemplates";

export function generatePlaceholders(
  projectId: string,
  input: ProjectInput,
): ProductPlaceholder[] {
  return buildPlaceholders(projectId, input);
}
