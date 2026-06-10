import type {
  DeploymentStrategy,
  EquipmentStrategy,
  SolutionArchitecture,
  TechnicalScope,
} from "./types";

export function buildTechnicalScope(input?: { deploymentId?: string }): TechnicalScope[] {
  const deploymentId = input?.deploymentId ?? "technical-default";
  return [
    { scopeId: `scope-1-${deploymentId}`, area: "有氧训练区", description: "跑步机、椭圆机、动感单车配置", coverage: "招标技术要求 100%" },
    { scopeId: `scope-2-${deploymentId}`, area: "力量训练区", description: "自由力量与固定器械组合", coverage: "招标技术要求 100%" },
    { scopeId: `scope-3-${deploymentId}`, area: "功能训练区", description: "壶铃、战绳、功能性训练架", coverage: "招标技术要求 95%" },
    { scopeId: `scope-4-${deploymentId}`, area: "智能化系统", description: "会员管理、设备 IoT 监控", coverage: "评分项全覆盖" },
  ];
}

export function buildSolutionArchitecture(input?: { deploymentId?: string }): SolutionArchitecture[] {
  const deploymentId = input?.deploymentId ?? "technical-default";
  return [
    { archId: `arch-1-${deploymentId}`, layer: "设备层", components: ["有氧器械", "力量器械", "功能器械"], description: "国际品牌设备，满足安全与耐用标准" },
    { archId: `arch-2-${deploymentId}`, layer: "连接层", components: ["IoT 网关", "设备传感器"], description: "实时采集设备运行状态" },
    { archId: `arch-3-${deploymentId}`, layer: "平台层", components: ["会员管理系统", "运维工单系统"], description: "统一运营管理入口" },
    { archId: `arch-4-${deploymentId}`, layer: "服务层", components: ["安装调试", "培训", "质保运维"], description: "全生命周期服务保障" },
  ];
}

export function buildEquipmentStrategy(input?: { deploymentId?: string }): EquipmentStrategy[] {
  const deploymentId = input?.deploymentId ?? "technical-default";
  return [
    { strategyId: `equip-1-${deploymentId}`, zone: "有氧区", equipment: ["商用跑步机 x12", "椭圆机 x8", "动感单车 x10"], rationale: "满足高峰时段并发使用需求" },
    { strategyId: `equip-2-${deploymentId}`, zone: "力量区", equipment: ["史密斯架 x4", "哑铃组 x2", "综合训练器 x6"], rationale: "覆盖初级至进阶训练需求" },
    { strategyId: `equip-3-${deploymentId}`, zone: "功能区", equipment: ["壶铃架", "战绳区", "TRX 训练点"], rationale: "差异化竞争力，响应评分项" },
  ];
}

export function buildDeploymentStrategy(input?: { deploymentId?: string }): DeploymentStrategy[] {
  const deploymentId = input?.deploymentId ?? "technical-default";
  return [
    { deployId: `deploy-1-${deploymentId}`, phase: "进场准备", approach: "现场勘测与布局确认", duration: "第 1-2 周" },
    { deployId: `deploy-2-${deploymentId}`, phase: "设备安装", approach: "分区并行安装调试", duration: "第 3-8 周" },
    { deployId: `deploy-3-${deploymentId}`, phase: "系统联调", approach: "IoT 与管理系统对接", duration: "第 9-10 周" },
    { deployId: `deploy-4-${deploymentId}`, phase: "验收交付", approach: "联合验收与人员培训", duration: "第 11-12 周" },
  ];
}
