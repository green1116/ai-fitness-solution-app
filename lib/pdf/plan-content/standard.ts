// lib/pdf/plan-content/standard.ts

import type { PlanContent } from "./types";

export const standardContent: PlanContent = {
  tier: "standard",
  recommended: true,
  modules: [
    {
      id: "std_01_scope",
      toc: { l1: "标准版（Standard｜推荐）", l2: "使用场景与覆盖能力" },
      title: "标准版（Standard｜推荐）｜使用场景与覆盖能力",
      blocks: [
        {
          type: "paragraph",
          text: "本方案基于企业规模 {headcount} 人、预计参与率 {participationRatePct}% 进行容量测算，预计日常高峰期同时使用人数约 {peakUsersEstimated} 人。"
        },
        {
          type: "bullet_list",
          items: [
            "中型企业总部与园区",
            "科技/互联网类企业",
            "注重员工健康文化建设的组织"
          ]
        }
      ]
    }
  ]
};