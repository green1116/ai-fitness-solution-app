import { randomUUID } from "crypto";
import type { Phase, ProjectRecord, SolutionRecord, Zone } from "@/lib/domain/tender";

function buildZones(input: ProjectRecord["input"]): Zone[] {
  const baseZones: Zone[] = [
    {
      name: "有氧训练区",
      purpose: "提升心肺功能与日常训练覆盖率",
      areaRatio: 0.28,
      capacity: input.targetUsers
        ? Math.ceil(input.targetUsers * 0.35)
        : undefined,
    },
    {
      name: "力量训练区",
      purpose: "满足基础力量与综合训练需求",
      areaRatio: 0.3,
      capacity: input.targetUsers
        ? Math.ceil(input.targetUsers * 0.25)
        : undefined,
    },
    {
      name: "拉伸与恢复区",
      purpose: "用于训练前后热身、拉伸与康复辅助",
      areaRatio: 0.12,
    },
    {
      name: "储物与更衣区",
      purpose: "提供用户储物、更衣与基础配套",
      areaRatio: 0.12,
    },
    {
      name: "前台与管理区",
      purpose: "用于接待、门禁、登记和管理",
      areaRatio: 0.1,
    },
    {
      name: "辅材与设备缓冲区",
      purpose: "用于设备存放、维护及施工预留",
      areaRatio: 0.08,
    },
  ];

  if (input.siteType === "hospital") {
    baseZones.unshift({
      name: "低冲击康复区",
      purpose: "为医护与康复使用场景提供更温和的运动方案",
      areaRatio: 0.18,
      capacity: input.targetUsers
        ? Math.ceil(input.targetUsers * 0.2)
        : undefined,
    });
  }

  if (input.siteType === "factory") {
    baseZones.push({
      name: "班组快速训练区",
      purpose: "适合高频短时训练与轮换使用",
      areaRatio: 0.1,
    });
  }

  return baseZones;
}

function buildImplementationPlan(input: ProjectRecord["input"]): Phase[] {
  return [
    {
      title: "项目启动与现场确认",
      durationDays: 3,
      tasks: ["现场复核", "需求确认", "施工条件检查", "交付边界确认"],
      deliverables: ["现场确认记录", "项目启动清单"],
    },
    {
      title: "深化方案与配置确认",
      durationDays: 5,
      tasks: ["空间深化", "配置建议", "预算复核", "交付方案确认"],
      deliverables: ["深化方案", "建议配置清单", "预算框架"],
    },
    {
      title: "施工与安装实施",
      durationDays: input.siteType === "factory" ? 10 : 7,
      tasks: ["设备进场", "安装调试", "联动测试", "基础验收"],
      deliverables: ["安装记录", "调试记录", "阶段验收单"],
    },
    {
      title: "交付培训与运维移交",
      durationDays: 2,
      tasks: ["使用培训", "管理培训", "运维交接", "问题闭环"],
      deliverables: ["培训记录", "交付确认单", "运维手册"],
    },
  ];
}

export function generateSolution(project: ProjectRecord): SolutionRecord {
  const now = new Date().toISOString();
  const { input } = project;

  const requirements = [
    "方案应具备投标可读性、交付完整性与预算可解释性。",
    "在缺少具体商品库的情况下，仍需输出可执行的标准化建议配置。",
    "方案应兼顾功能、成本、施工、运维与长期稳定性。",
  ];

  const objectives = [
    "形成适用于企业投标场景的标准化方案文件。",
    "在无 SKU 情况下仍可输出完整预算与配置框架。",
    "为后续商品系统接入预留可替换映射层。",
  ];

  const summary = `${input.clientName ?? "项目"}的投标方案将采用“方案骨架 + 可替换占位配置”的方式，先确保文件可直接用于投标，再为后续商品系统接入留出扩展接口。`;

  const background = [
    `项目类型：${input.siteType}`,
    input.areaM2 ? `规划面积约 ${input.areaM2} 平方米` : "面积待确认",
    input.targetUsers ? `预计使用人数约 ${input.targetUsers} 人` : "使用人数待确认",
    input.city ? `项目所在地：${input.city}` : null,
    input.notes ? `补充说明：${input.notes}` : null,
  ]
    .filter((x): x is string => x != null)
    .join("；");

  const zoning = buildZones(input);
  const implementationPlan = buildImplementationPlan(input);

  const operationsPlan = [
    "建立设备使用、巡检、保养与故障响应机制。",
    "形成月度统计与周期复盘机制，提升运维透明度。",
    "通过统一标准减少交付后维护成本与沟通成本。",
  ];

  const riskControl = [
    "若后续真实商品未接入，则采用标准占位配置保持文件完整。",
    "对预算采用区间制表达，避免投标阶段过度精确造成失真。",
    "对交付周期和施工条件进行前置确认，减少返工风险。",
  ];

  const acceptanceCriteria = [
    "方案章节齐全，满足投标文件结构要求。",
    "建议配置、预算框架与实施计划能够相互对应。",
    "占位商品可后续无缝替换为真实 SKU。",
  ];

  return {
    id: randomUUID(),
    projectId: project.id,
    summary,
    background,
    requirements,
    objectives,
    zoning,
    implementationPlan,
    operationsPlan,
    riskControl,
    acceptanceCriteria,
    createdAt: now,
    updatedAt: now,
  };
}
