import { randomUUID } from "crypto";
import type { ProjectInput, ProjectRecord, TenderPackage } from "@/lib/domain/tender";
import { generateSolution } from "@/lib/services/generateSolution";
import { generatePlaceholders } from "@/lib/services/generatePlaceholders";
import { generateBudget } from "@/lib/services/generateBudget";

export function createProjectRecord(input: ProjectInput): ProjectRecord {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    input,
    createdAt: now,
    updatedAt: now,
  };
}

export async function generateTenderPackage(
  input: ProjectInput,
): Promise<TenderPackage> {
  const project = createProjectRecord(input);
  const solution = generateSolution(project);
  const placeholders = generatePlaceholders(project);
  const budget = generateBudget(project, placeholders);

  return {
    project,
    solution,
    placeholders,
    budget,
  };
}
