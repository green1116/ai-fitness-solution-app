/**
 * V1 Commercial Freeze — 出版级绘制辅助（克制 / 无 UI 装饰）
 */
import type { PDFFont, PDFPage } from "pdf-lib";

import {
  FREEZE_CHAPTER_NUM_COLOR,
  FREEZE_CHAPTER_NUM_SIZE,
  FREEZE_DIVIDER_COLOR,
  FREEZE_DIVIDER_THICKNESS,
  FREEZE_DIVIDER_WIDTH_RATIO,
  FREEZE_EN_LETTER_GAP,
  FREEZE_EN_SIZE,
  FREEZE_EN_WORD_GAP,
  FREEZE_INK_CALLOUT,
  FREEZE_INK_EXECUTIVE,
  FREEZE_INK_NUMBER,
  FREEZE_INK_STRATEGIC,
  FREEZE_NARRATIVE_RULE,
  FREEZE_PAUSE_AFTER_EXECUTIVE,
  FREEZE_PAUSE_AFTER_STRATEGIC,
  FREEZE_PAUSE_BEFORE_LIST,
  FREEZE_TOC_CHAP_COLOR,
  FREEZE_TOC_LEADER_COLOR,
  FREEZE_USE_BACKGROUND_BLOCKS,
  FREEZE_USE_STRATEGIC_BAR,
} from "@/lib/pdf/commercialFreezeDesignSystem";
import type { PlanBodyLineKind } from "@/lib/pdf/planTypography.body";

export const EDITORIAL_CHAPTER_NUM_SIZE = FREEZE_CHAPTER_NUM_SIZE;
export const EDITORIAL_CHAPTER_NUM_COLOR = FREEZE_CHAPTER_NUM_COLOR;
export const EDITORIAL_DIVIDER_WIDTH_RATIO = FREEZE_DIVIDER_WIDTH_RATIO;
export const EDITORIAL_DIVIDER_THICKNESS = FREEZE_DIVIDER_THICKNESS;
export const EDITORIAL_DIVIDER_COLOR = FREEZE_DIVIDER_COLOR;
export const EDITORIAL_EN_WORD_GAP = FREEZE_EN_WORD_GAP;
export const EDITORIAL_EN_LETTER_GAP = FREEZE_EN_LETTER_GAP;
export const EDITORIAL_EN_SIZE = FREEZE_EN_SIZE;
export const EDITORIAL_INTRO_INK = FREEZE_INK_EXECUTIVE;
export const EDITORIAL_STRATEGIC_INK = FREEZE_INK_STRATEGIC;
export const EDITORIAL_CALLOUT_INK = FREEZE_INK_CALLOUT;
export const EDITORIAL_CALLOUT_RULE = FREEZE_NARRATIVE_RULE;
export const EDITORIAL_NUMBER_MUTED = FREEZE_INK_NUMBER;
export const EDITORIAL_NARRATIVE_RULE = FREEZE_NARRATIVE_RULE;
export const EDITORIAL_TOC_LEADER_COLOR = FREEZE_TOC_LEADER_COLOR;
export const EDITORIAL_TOC_CHAP_COLOR = FREEZE_TOC_CHAP_COLOR;

export type NarrativeLayer = "executive" | "strategic" | "operational";

export function isEditorialIntroLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.startsWith("【")) return false;
  return (
    /^本[章节部]/.test(t) ||
    /^本节/.test(t) ||
    t.includes("本章对") ||
    t.includes("本章节对") ||
    t.includes("本章从")
  );
}

export function classifyNarrativeLayer(
  line: string,
  kind: PlanBodyLineKind,
): NarrativeLayer {
  if (kind === "numbered" || kind === "sublist" || kind === "empty") {
    return "operational";
  }
  const t = line.trim();
  if (!t || kind === "callout") return "operational";
  if (isEditorialIntroLine(line)) return "executive";
  if (isStrategicNarrativeLine(t)) return "strategic";
  return "operational";
}

function isStrategicNarrativeLine(t: string): boolean {
  if (t.length < 16 || /^\d+\./.test(t)) return false;
  return /兼顾|闭环|体系|战略|原则|适配|可靠性|目标|评审|交付|配置|实施|运维/.test(t);
}

export function parseCalloutLabel(line: string): { label: string; rest: string } | null {
  const m = line.trim().match(/^【([^】]+)】\s*(.*)$/);
  if (!m) return null;
  return { label: m[1], rest: m[2].trim() };
}

export function drawEditorialDivider(
  page: PDFPage,
  y: number,
  marginL: number,
  pageW: number,
  widthRatio = FREEZE_DIVIDER_WIDTH_RATIO,
  color = FREEZE_DIVIDER_COLOR,
  thickness = FREEZE_DIVIDER_THICKNESS,
): void {
  const lineW = (pageW - marginL * 2) * widthRatio;
  page.drawLine({
    start: { x: marginL, y },
    end: { x: marginL + lineW, y },
    thickness,
    color,
  });
}

export function drawEditorialSpacedUppercase(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: ReturnType<typeof import("pdf-lib").rgb>,
  wordGap = FREEZE_EN_WORD_GAP,
  letterGap = FREEZE_EN_LETTER_GAP,
): void {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  let cx = x;
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      page.drawText(ch, { x: cx, y, size, font, color });
      cx += font.widthOfTextAtSize(ch, size) + letterGap;
    }
    if (wi < words.length - 1) cx += wordGap;
  }
}

/** 冻结：无背景块，仅保留排版节奏（可选极细左线） */
export function drawEditorialIntroBand(
  page: PDFPage,
  x: number,
  y: number,
  _width: number,
  bandHeight: number,
): void {
  if (!FREEZE_USE_BACKGROUND_BLOCKS) return;
  void page;
  void x;
  void y;
  void bandHeight;
}

export function drawNarrativeSeparator(
  page: PDFPage,
  marginL: number,
  pageW: number,
  y: number,
  widthRatio = 0.32,
): void {
  drawEditorialDivider(
    page,
    y,
    marginL,
    pageW,
    widthRatio,
    FREEZE_NARRATIVE_RULE,
    0.15,
  );
}

/** 冻结：不使用战略色条 */
export function drawStrategicEmphasisBar(
  _page: PDFPage,
  _x: number,
  _y: number,
  _height: number,
): void {
  if (!FREEZE_USE_STRATEGIC_BAR) return;
}

export function freezeNarrativePause(layer: NarrativeLayer, prev?: NarrativeLayer): number {
  if (layer === "executive") return FREEZE_PAUSE_AFTER_EXECUTIVE;
  if (layer === "strategic" && prev === "executive") return FREEZE_PAUSE_AFTER_STRATEGIC;
  if (layer === "operational" && prev === "strategic") return FREEZE_PAUSE_BEFORE_LIST;
  return 0;
}
