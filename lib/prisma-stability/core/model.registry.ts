/**
 * Prisma Stability — model registry
 */

import type { ParsedModel, ParsedSchema } from "../core/schema.parser";
import { getModelOwnership } from "../conventions/business-domain.map";

export type RegisteredModel = ParsedModel & {
  domain?: string;
  concept?: string;
};

const registry = new Map<string, RegisteredModel>();

export function registerModelDefinition(model: RegisteredModel): RegisteredModel {
  registry.set(model.name, model);
  return model;
}

export function registerSchemaModels(schema: ParsedSchema): RegisteredModel[] {
  registry.clear();
  return schema.models.map((m) => {
    const ownership = getModelOwnership(m.name);
    return registerModelDefinition({
      ...m,
      domain: ownership?.domain,
      concept: ownership?.concept,
    });
  });
}

export function getRegisteredModels(): RegisteredModel[] {
  return [...registry.values()];
}

export function getRegisteredModel(name: string): RegisteredModel | undefined {
  return registry.get(name);
}
