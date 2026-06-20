import { WORKSPACE_QUOTE_RUNTIME_P1_META } from "./freeze/v55-p1-meta";
import { WORKSPACE_QUOTE_RUNTIME_P2_META } from "./freeze/v55-p2-meta";
import { WORKSPACE_QUOTE_RUNTIME_P3_META } from "./domain/freeze/v55-p3-meta";
import { WORKSPACE_QUOTE_RUNTIME_P4_META } from "./lifecycle/freeze/v55-p4-meta";
import { WORKSPACE_QUOTE_RUNTIME_P5_META } from "./assembly/freeze/v55-p5-meta";
import { WORKSPACE_QUOTE_RUNTIME_P6_META } from "./ports/freeze/v55-p6-meta";
import { WORKSPACE_QUOTE_RUNTIME_P7_META } from "./validation/freeze/v55-p7-meta";
import { WORKSPACE_QUOTE_RUNTIME_P8_META } from "./alignment/freeze/v55-p8-meta";
import { WORKSPACE_QUOTE_RUNTIME_FINAL_META } from "./freeze/v55-final-meta";

/** P1 meta pointer — kept for historical verify:v55-p1 compatibility */
export const WORKSPACE_QUOTE_RUNTIME_META = {
  version: WORKSPACE_QUOTE_RUNTIME_P1_META.version,
  tag: WORKSPACE_QUOTE_RUNTIME_P1_META.tag,
  phase: WORKSPACE_QUOTE_RUNTIME_P1_META.phase,
  status: WORKSPACE_QUOTE_RUNTIME_P1_META.status,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P1_META.dependencyTag,
  frozen: WORKSPACE_QUOTE_RUNTIME_P1_META.frozen,
  nextHorizon: WORKSPACE_QUOTE_RUNTIME_P1_META.nextHorizon,
} as const;

/** P2 active quote context phase meta */
export const WORKSPACE_QUOTE_RUNTIME_CONTEXT_META = WORKSPACE_QUOTE_RUNTIME_P2_META;

/** P3 active quote domain phase meta */
export const WORKSPACE_QUOTE_RUNTIME_DOMAIN_META = WORKSPACE_QUOTE_RUNTIME_P3_META;

/** P4 active quote lifecycle phase meta */
export const WORKSPACE_QUOTE_RUNTIME_LIFECYCLE_META = WORKSPACE_QUOTE_RUNTIME_P4_META;

/** P5 active quote assembly phase meta */
export const WORKSPACE_QUOTE_RUNTIME_ASSEMBLY_META = WORKSPACE_QUOTE_RUNTIME_P5_META;

/** P6 active quote port phase meta */
export const WORKSPACE_QUOTE_RUNTIME_PORTS_META = WORKSPACE_QUOTE_RUNTIME_P6_META;

/** P7 active quote verification phase meta */
export const WORKSPACE_QUOTE_RUNTIME_VERIFICATION_META = WORKSPACE_QUOTE_RUNTIME_P7_META;

/** P8 active quote workspace alignment phase meta */
export const WORKSPACE_QUOTE_RUNTIME_ALIGNMENT_META = WORKSPACE_QUOTE_RUNTIME_P8_META;

/** V55 final quote runtime foundation meta */
export const WORKSPACE_QUOTE_RUNTIME_FINAL_META_POINTER = WORKSPACE_QUOTE_RUNTIME_FINAL_META;
