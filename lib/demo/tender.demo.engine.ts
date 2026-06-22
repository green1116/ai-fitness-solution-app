/**
 * V64 P1 — Tender demo engine
 */

import type { DemoCompanyInput, DemoTenderOutput } from "./demo.types";
import { fallbackDemoTender } from "./demo.fallback";

export function generateDemoTender(input: DemoCompanyInput): DemoTenderOutput {
  const name = input.companyName?.trim();
  if (!name) return fallbackDemoTender("示例企业");

  return {
    title: `${name} · 健身空间采购投标文件（AI 预览）`,
    sections: [
      "一、投标函与资质说明",
      "二、技术方案与平面规划",
      "三、设备清单与品牌说明",
      "四、项目实施与质保承诺",
      "五、商务报价与付款条款",
    ],
    complianceScore: 94,
    preview: `针对 ${name} 的健身空间建设项目，AI 已生成完整标书结构与技术响应框架，注册后可导出完整 PDF。`,
    mode: "demo-stub",
  };
}
