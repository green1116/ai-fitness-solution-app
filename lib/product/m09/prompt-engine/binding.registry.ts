/**
 * Product M09 — AI Prompt model binding (soft modelKeyRef only)
 */

import { AI_PROMPT_BINDING_STATUSES } from "./prompt.constants";
import { getAiPrompt } from "./prompt.registry";
import type {
  AiPromptBindingStatus,
  AiPromptModelBinding,
  BindAiPromptModelInput,
} from "./prompt.types";
import { getAiPromptVersion } from "./version.registry";

const bindings = new Map<string, AiPromptModelBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: AiPromptModelBinding): AiPromptModelBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiPromptModel(
  input: BindAiPromptModelInput,
): AiPromptModelBinding {
  const promptId = input.promptId.trim();
  const versionId = input.versionId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const modelKeyRef = input.modelKeyRef.trim().toUpperCase();
  if (!promptId) throw new Error("binding.promptId is required");
  if (!versionId) throw new Error("binding.versionId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!modelKeyRef) throw new Error("binding.modelKeyRef is required");

  const prompt = getAiPrompt(promptId);
  if (!prompt) throw new Error(`prompt not found: ${promptId}`);
  if (prompt.status !== "ACTIVE") {
    throw new Error(`prompt not active: ${promptId}`);
  }

  const version = getAiPromptVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.promptId !== promptId) {
    throw new Error(`version prompt mismatch: ${versionId}`);
  }
  if (version.status !== "PUBLISHED") {
    throw new Error(`version not published: ${versionId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.promptId === promptId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("aipromptbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiPromptModelBinding = {
    id,
    promptId,
    versionId,
    bindingKey,
    modelKeyRef,
    status: AI_PROMPT_BINDING_STATUSES[0],
    detail: `model=${modelKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiPromptModelBinding(
  id: string,
): AiPromptModelBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiPromptModelBindings(filter?: {
  promptId?: string;
  status?: AiPromptBindingStatus;
}): AiPromptModelBinding[] {
  let result = [...bindings.values()];
  if (filter?.promptId) {
    const promptId = filter.promptId.trim();
    result = result.filter((b) => b.promptId === promptId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiPromptModelBindings(): void {
  bindings.clear();
}
