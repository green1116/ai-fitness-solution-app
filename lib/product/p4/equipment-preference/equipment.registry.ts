/**
 * Product P4 — Equipment preference registry
 */

import { EQUIPMENT_PREFERENCE_LEVELS } from "../questionnaire/questionnaire.constants";
import type {
  EquipmentPreference,
  EquipmentPreferenceLevel,
  RecordEquipmentPreferenceInput,
} from "./equipment.types";

const preferences = new Map<string, EquipmentPreference>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePreference(
  preference: EquipmentPreference,
): EquipmentPreference {
  return { ...preference, metadata: { ...preference.metadata } };
}

export function recordEquipmentPreference(
  input: RecordEquipmentPreferenceInput,
): EquipmentPreference {
  const projectRef = input.projectRef.trim();
  const equipmentKey = input.equipmentKey.trim().toLowerCase();
  if (!projectRef) throw new Error("equipment.projectRef is required");
  if (!equipmentKey) throw new Error("equipment.equipmentKey is required");
  if (
    !(EQUIPMENT_PREFERENCE_LEVELS as readonly string[]).includes(input.level)
  ) {
    throw new Error(`invalid equipment preference level: ${input.level}`);
  }

  const id = input.id?.trim() || createId("p4eqp");
  if (preferences.has(id)) {
    throw new Error(`equipment preference already exists: ${id}`);
  }

  const notes = (input.notes ?? "").trim() || `level=${input.level}`;
  const preference: EquipmentPreference = {
    id,
    projectRef,
    equipmentKey,
    level: input.level,
    notes,
    detail: `equipment=${equipmentKey} level=${input.level}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  preferences.set(id, preference);
  return clonePreference(preference);
}

export function getEquipmentPreference(
  id: string,
): EquipmentPreference | undefined {
  const preference = preferences.get(id.trim());
  return preference ? clonePreference(preference) : undefined;
}

export function listEquipmentPreferences(filter?: {
  projectRef?: string;
  level?: EquipmentPreferenceLevel;
}): EquipmentPreference[] {
  let result = [...preferences.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((p) => p.projectRef === pref);
  }
  if (filter?.level) result = result.filter((p) => p.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePreference);
}

export function clearEquipmentPreferences(): void {
  preferences.clear();
}
