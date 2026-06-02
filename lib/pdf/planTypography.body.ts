import {
  FREEZE_BODY_SIZE,
  FREEZE_CALLOUT_INDENT,
  FREEZE_CALLOUT_SIZE,
  FREEZE_LINE_HEIGHT,
  FREEZE_LIST_INDENT,
  FREEZE_SUBLIST_INDENT,
} from "@/lib/pdf/commercialFreezeDesignSystem";

export type PlanBodyLineKind =
  | "empty"
  | "callout"
  | "numbered"
  | "sublist"
  | "body";

export function planClassifyBodyLine(line: string): PlanBodyLineKind {
  const t = line.trim();
  if (!t) return "empty";
  if (/^【/.test(t)) return "callout";
  if (/^\d+\.\s/.test(t)) return "numbered";
  if (/^[-–—•]/.test(t) || /^\s{2,}/.test(line)) return "sublist";
  return "body";
}

export function planBodyDrawX(line: string, marginX: number): number {
  const kind = planClassifyBodyLine(line);
  if (kind === "numbered") return marginX + FREEZE_LIST_INDENT;
  if (kind === "sublist") return marginX + FREEZE_SUBLIST_INDENT;
  if (kind === "callout") return marginX + FREEZE_CALLOUT_INDENT;
  return marginX;
}

export function planBodyLineAdvance(line: string, prevKind?: PlanBodyLineKind): number {
  const kind = planClassifyBodyLine(line);
  if (kind === "empty") return FREEZE_LINE_HEIGHT * 0.55;
  if (kind === "callout") return FREEZE_LINE_HEIGHT * 1.18;
  if (kind === "numbered") {
    const extra = prevKind === "numbered" ? 1.08 : 1.14;
    return Math.min(FREEZE_LINE_HEIGHT * extra, FREEZE_LINE_HEIGHT * 1.18);
  }
  if (kind === "sublist") return FREEZE_LINE_HEIGHT * 1.1;
  if (prevKind === "callout" || prevKind === "numbered") return FREEZE_LINE_HEIGHT * 1.1;
  return FREEZE_LINE_HEIGHT;
}

export function planBodyFontSize(line: string): number {
  return planClassifyBodyLine(line) === "callout" ? FREEZE_CALLOUT_SIZE : FREEZE_BODY_SIZE;
}
