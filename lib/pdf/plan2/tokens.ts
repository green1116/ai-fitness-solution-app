// lib/pdf/plan2/tokens.ts
import { rgb } from "pdf-lib";

export const PAGE = {
  WIDTH: 595.28,
  HEIGHT: 841.89,
  MARGIN_L: 48,
  MARGIN_R: 48,
  MARGIN_TOP: 64,
  MARGIN_BOTTOM: 54,
};

export const TYPE = {
  H1: 18,
  H2: 14,
  H3: 12,
  BODY: 10.5,
  SMALL: 9,
};

export const LEADING = {
  H1: 24,
  H2: 20,
  H3: 17,
  BODY: 15,
  SMALL: 13,
};

export const COLOR = {
  ink: rgb(0.08, 0.10, 0.12),
  text: rgb(0.12, 0.14, 0.16),
  mute: rgb(0.50, 0.55, 0.60),
  line: rgb(0.90, 0.92, 0.94),
};
