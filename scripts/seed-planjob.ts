import { prisma } from "@/lib/prisma";

async function main() {
  const id = "attaguy-plan";

  const plan = {
    meta: { plan_id: id, proposalNo: "ATG-DEMO-0001" },
    client_profile: {
      company_size: 200,
      space_area: 120,
      scene: "办公健身房",
      budget_range: "10-20万",
      industry: "互联网",
      potential_scope: ["有氧区", "力量区", "拉伸区"],
    },
    solution_summary: {
      management_conclusion: [
        "本方案适用于 200 人规模企业的办公健身空间。",
        "建议 120㎡ 可落地基础有氧+力量配置。",
        "预算建议控制在 10-20 万，优先保障商用耐用与安全。",
      ],
    },
    equipment_plan: [
      { category: "有氧", items: [{ name: "商用跑步机", qty: 2, purpose: "心肺训练" }] },
      { category: "力量", items: [{ name: "史密斯机", qty: 1, purpose: "基础复合训练" }] },
      { category: "自由力量", items: [{ name: "可调哑铃组", qty: 1, purpose: "覆盖多关节训练" }] },
    ],
    implementation: {
      phase_1: "需求复核、场地条件确认、设备清单与预算锁定",
      phase_2: "设备采购、物流与安装、调试与使用培训",
      phase_3: "反馈收集、配置优化建议、扩展升级规划",
    },
    upsell_modules: { layout_design: true, "3d_render": true, rehab_module: true },
  };

  await (prisma as any).planJob.upsert({
    where: { id },
    create: { id, plan, input: {}, status: "DONE" },
    update: { plan, status: "DONE" },
  });

  console.log("✅ Seeded planJob:", id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

