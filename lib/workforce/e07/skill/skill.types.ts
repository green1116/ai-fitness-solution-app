/**
 * E07-P1 — Digital Workforce Skill types
 */

import type { SkillKind } from "../core/workforce.types";

export type SkillDefinition = {
  id: string;
  kind: SkillKind;
  name: string;
  description: string;
  inputHints: string[];
  outputHints: string[];
  readOnly: true;
};

export type SkillRegistryManifest = {
  skillCount: number;
  kinds: SkillKind[];
  skills: SkillDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
