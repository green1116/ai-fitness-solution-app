/**
 * Product M09 — AI Prompt registry (declaration only)
 */

import { AI_PROMPT_KINDS, AI_PROMPT_STATUSES } from "./prompt.constants";
import type {
  AiPromptKind,
  AiPromptStatus,
  ProductAiPrompt,
  RegisterAiPromptInput,
  UpdateAiPromptStatusInput,
} from "./prompt.types";

const prompts = new Map<string, ProductAiPrompt>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrompt(prompt: ProductAiPrompt): ProductAiPrompt {
  return { ...prompt, metadata: { ...prompt.metadata } };
}

export function registerAiPrompt(
  input: RegisterAiPromptInput,
): ProductAiPrompt {
  const promptKey = input.promptKey.trim().toUpperCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  if (!promptKey) throw new Error("prompt.promptKey is required");
  if (!name) throw new Error("prompt.name is required");
  if (!summary) throw new Error("prompt.summary is required");
  if (!(AI_PROMPT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid prompt kind: ${input.kind}`);
  }
  if (keys.has(promptKey)) {
    throw new Error(`promptKey already exists: ${promptKey}`);
  }

  const id = input.id?.trim() || createId("aiprompt");
  if (prompts.has(id)) throw new Error(`prompt already exists: ${id}`);

  const now = nowIso();
  const prompt: ProductAiPrompt = {
    id,
    promptKey,
    name,
    kind: input.kind,
    status: AI_PROMPT_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  prompts.set(id, prompt);
  keys.set(promptKey, id);
  return clonePrompt(prompt);
}

export function updateAiPromptStatus(
  input: UpdateAiPromptStatusInput,
): ProductAiPrompt {
  const promptId = input.promptId.trim();
  if (!promptId) throw new Error("prompt.promptId is required");
  if (!(AI_PROMPT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid prompt status: ${input.status}`);
  }

  const existing = prompts.get(promptId);
  if (!existing) throw new Error(`prompt not found: ${promptId}`);

  const updated: ProductAiPrompt = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  prompts.set(promptId, updated);
  return clonePrompt(updated);
}

export function getAiPrompt(id: string): ProductAiPrompt | undefined {
  const prompt = prompts.get(id.trim());
  return prompt ? clonePrompt(prompt) : undefined;
}

export function listAiPrompts(filter?: {
  kind?: AiPromptKind;
  status?: AiPromptStatus;
}): ProductAiPrompt[] {
  let result = [...prompts.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.promptKey.localeCompare(b.promptKey))
    .map(clonePrompt);
}

export function clearAiPrompts(): void {
  prompts.clear();
  keys.clear();
}
