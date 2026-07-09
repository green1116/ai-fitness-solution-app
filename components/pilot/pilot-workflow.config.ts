/**
 * Pilot 主流程四区配置（导入 → 计算 → 交付 → 归档）
 */

export type PilotFlowZone = "import" | "calculate" | "deliver" | "archive";

export type PilotFlowStatus =
  | "not_uploaded"
  | "parsed"
  | "generated"
  | "downloadable"
  | "delivered";

export const PILOT_FLOW_ZONES: ReadonlyArray<{
  id: PilotFlowZone;
  label: string;
  description: string;
  href: string;
  matchPrefixes: readonly string[];
}> = [
  {
    id: "import",
    label: "导入",
    description: "上传标书 / 解析招标文件",
    href: "/pilot/intake",
    matchPrefixes: ["/pilot/intake"],
  },
  {
    id: "calculate",
    label: "计算",
    description: "方案 Quote · 预算 Budget",
    href: "/quote",
    matchPrefixes: ["/quote", "/budget"],
  },
  {
    id: "deliver",
    label: "交付",
    description: "标书 Tender · PDF 生成",
    href: "/tender",
    matchPrefixes: ["/tender"],
  },
  {
    id: "archive",
    label: "归档",
    description: "Document Center · 下载与交付记录",
    href: "/documents",
    matchPrefixes: ["/documents"],
  },
] as const;

export const PILOT_FLOW_STATUS_STEPS: ReadonlyArray<{
  id: PilotFlowStatus;
  label: string;
}> = [
  { id: "not_uploaded", label: "未上传" },
  { id: "parsed", label: "已解析" },
  { id: "generated", label: "已生成" },
  { id: "downloadable", label: "可下载" },
  { id: "delivered", label: "已交付" },
] as const;

export const CALCULATE_LINKS = [
  { href: "/quote", label: "Quote 方案" },
  { href: "/budget", label: "Budget 预算" },
] as const;

export function resolveActiveZone(pathname: string): PilotFlowZone | null {
  for (const zone of PILOT_FLOW_ZONES) {
    if (zone.matchPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return zone.id;
    }
  }
  return null;
}
