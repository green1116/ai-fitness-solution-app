// lib/pdf/tokens.ts
// V3 企业级视觉系统 - 统一设计令牌

import { rgb } from "pdf-lib";

export const TOKENS = {
  marginX: 48,
  topY: 780,
  bottomY: 52,

  colorText: rgb(0.12, 0.12, 0.12),
  colorSubtle: rgb(0.42, 0.42, 0.42),
  colorLine: rgb(0.86, 0.88, 0.9),

  colorBrand: rgb(0.1, 0.27, 0.55),
  colorBrandLight: rgb(0.92, 0.95, 0.99),
  colorAccent: rgb(0.16, 0.47, 0.78),

  fsH1: 24,
  fsH2: 16,
  fsH3: 12,
  fsBody: 10.5,
  fsSmall: 8.5,

  gapXs: 6,
  gapSm: 10,
  gapMd: 16,
  gapLg: 24,
  gapXl: 32,
} as const;
