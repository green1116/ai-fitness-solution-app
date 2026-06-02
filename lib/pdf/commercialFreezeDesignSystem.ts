/**
 * V1 Commercial Freeze — 企业投标 PDF 最终设计基线
 *
 * 原则：whitespace > decoration · typography > graphics · rhythm > styling · restraint
 * 后续 PDF 视觉仅允许在本文件做微调，禁止重构 hierarchy / cadence。
 */
import { rgb } from "pdf-lib";

export const COMMERCIAL_FREEZE_VERSION = "V1 Commercial Freeze";

// —— Page grid ——
export const FREEZE_PAGE_WIDTH = 595.28;
export const FREEZE_PAGE_HEIGHT = 841.89;
export const FREEZE_MARGIN_X = 52;
export const FREEZE_BODY_TOP = FREEZE_PAGE_HEIGHT - 88;
export const FREEZE_BODY_BOTTOM = 92;

// —— Typography ——
export const FREEZE_BODY_SIZE = 11;
export const FREEZE_LINE_HEIGHT = 20;
export const FREEZE_EXECUTIVE_SIZE = 11.35;
export const FREEZE_STRATEGIC_SIZE = 11.05;
export const FREEZE_CALLOUT_SIZE = 10.5;

export const FREEZE_LIST_INDENT = 18;
export const FREEZE_SUBLIST_INDENT = 34;
export const FREEZE_CALLOUT_INDENT = 4;

// —— Chapter opener ——
export const FREEZE_CHAPTER_NUM_SIZE = 64;
export const FREEZE_CHAPTER_NUM_COLOR = rgb(0.86, 0.87, 0.89);
export const FREEZE_TITLE_TOP_SPACING = 48;
export const FREEZE_TITLE_TOP_SPACING_CONT = 14;
export const FREEZE_TITLE_GAP_AFTER_NUM = 16;
export const FREEZE_TITLE_GAP_ZH_TO_EN = 16;
export const FREEZE_TITLE_GAP_AFTER_EN = 22;
export const FREEZE_TITLE_BOTTOM_SPACING = 44;
export const FREEZE_DIVIDER_WIDTH_RATIO = 0.94;
export const FREEZE_DIVIDER_THICKNESS = 0.2;
export const FREEZE_DIVIDER_COLOR = rgb(0.91, 0.92, 0.94);
export const FREEZE_EN_SIZE = 9.6;
export const FREEZE_EN_WORD_GAP = 5;
export const FREEZE_EN_LETTER_GAP = 0.75;

// —— TOC ——
export const FREEZE_TOC_ROW_STEP = 40;
export const FREEZE_TOC_LEADER_GAP = 1.28;
export const FREEZE_TOC_LEADER_DOT_SIZE = 6.5;
export const FREEZE_TOC_LEADER_COLOR = rgb(0.8, 0.82, 0.85);
export const FREEZE_TOC_CHAP_COLOR = rgb(0.44, 0.46, 0.5);

// —— Editorial rhythm (typography-only; 无背景/色条) ——
export const FREEZE_INK_BODY = rgb(0.12, 0.12, 0.14);
export const FREEZE_INK_EXECUTIVE = rgb(0.14, 0.16, 0.2);
export const FREEZE_INK_STRATEGIC = rgb(0.18, 0.2, 0.24);
export const FREEZE_INK_CALLOUT = rgb(0.4, 0.42, 0.46);
export const FREEZE_INK_NUMBER = rgb(0.48, 0.5, 0.54);
export const FREEZE_NARRATIVE_RULE = rgb(0.9, 0.91, 0.93);
export const FREEZE_PAUSE_AFTER_EXECUTIVE = 6;
export const FREEZE_PAUSE_AFTER_STRATEGIC = 3;
export const FREEZE_PAUSE_BEFORE_LIST = 10;

/** 冻结：不使用 intro 背景块 / 战略色条（减法式） */
export const FREEZE_USE_BACKGROUND_BLOCKS = false;
export const FREEZE_USE_STRATEGIC_BAR = false;

// —— Cover confidentiality cadence ——
export const FREEZE_COVER_CONFIDENTIAL_BASE_Y = 78;
export const FREEZE_COVER_CONFIDENTIAL_GAP_STATUS_TO_CONF = 18;
export const FREEZE_COVER_CONFIDENTIAL_GAP_CONF_TO_EVAL = 14;
export const FREEZE_COVER_META_LINE_GAP = 24;
export const FREEZE_SIGN_PAGE_ARCHIVE_START_Y = 168;

// —— Commercial summary (budget header) ——
export const FREEZE_INVESTMENT_PRICE_SIZE = 34;
export const FREEZE_INVESTMENT_BOX_HEIGHT = 128;
export const FREEZE_INVESTMENT_LABEL_SIZE = 7.5;

// —— Front matter ——
export const FREEZE_DELIVERY_NOTICE_PAGE_INDEX = 1;

export function freezeFrontMatterPageCount(tier: "free" | "pro" | "enterprise"): number {
  return tier === "free" ? 3 : 4;
}

export function freezeBodyStartPage1Based(tier: "free" | "pro" | "enterprise"): number {
  return freezeFrontMatterPageCount(tier) + 1;
}
