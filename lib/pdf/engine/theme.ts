// lib/pdf/engine/theme.ts

export type PdfTheme = "brand" | "tender";

export type ThemeConfig = {
  headerBg: { r: number; g: number; b: number } | null;
  headerText: { r: number; g: number; b: number };
  subText: { r: number; g: number; b: number };
  watermarkDefault: boolean;
};

export function getThemeConfig(theme: PdfTheme): ThemeConfig {
  if (theme === "tender") {
    return {
      headerBg: null,
      headerText: { r: 0.12, g: 0.12, b: 0.12 },
      subText: { r: 0.35, g: 0.35, b: 0.35 },
      watermarkDefault: false,
    };
  }

  // brand 默认
  return {
    headerBg: { r: 0.12, g: 0.16, b: 0.22 },
    headerText: { r: 1, g: 1, b: 1 },
    subText: { r: 0.88, g: 0.92, b: 1 },
    watermarkDefault: true,
  };
}