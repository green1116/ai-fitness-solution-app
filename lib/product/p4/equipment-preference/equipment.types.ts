/**
 * Product P4 — Equipment preference types
 */

import type { EQUIPMENT_PREFERENCE_LEVELS } from "../questionnaire/questionnaire.constants";

export type EquipmentPreferenceLevel =
  (typeof EQUIPMENT_PREFERENCE_LEVELS)[number];
export type EquipmentPreferenceMetadata = Record<string, unknown>;

export type EquipmentPreference = {
  id: string;
  projectRef: string;
  equipmentKey: string;
  level: EquipmentPreferenceLevel;
  notes: string;
  detail: string;
  metadata: EquipmentPreferenceMetadata;
  recordedAt: string;
};

export type RecordEquipmentPreferenceInput = {
  id?: string;
  projectRef: string;
  equipmentKey: string;
  level: EquipmentPreferenceLevel;
  notes?: string;
  metadata?: EquipmentPreferenceMetadata;
};
