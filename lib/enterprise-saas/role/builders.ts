import type { RoleDefinition, RoleKind } from "./types";

export const ROLE_KINDS: RoleKind[] = [
  "owner",
  "admin",
  "manager",
  "member",
  "viewer",
];

const ROLE_META: Record<
  RoleKind,
  { name: string; description: string; hierarchyLevel: number; assignable: boolean }
> = {
  owner: {
    name: "所有者",
    description: "租户最高权限，可管理账单与成员",
    hierarchyLevel: 100,
    assignable: false,
  },
  admin: {
    name: "管理员",
    description: "可管理成员、工作区与权限配置",
    hierarchyLevel: 80,
    assignable: true,
  },
  manager: {
    name: "经理",
    description: "可管理项目与标书，不可改账单",
    hierarchyLevel: 60,
    assignable: true,
  },
  member: {
    name: "成员",
    description: "可创建项目并导出 Plan/Budget",
    hierarchyLevel: 40,
    assignable: true,
  },
  viewer: {
    name: "查看者",
    description: "只读访问项目与结果页",
    hierarchyLevel: 20,
    assignable: true,
  },
};

export function buildRoleDefinitions(input?: {
  deploymentId?: string;
}): RoleDefinition[] {
  const deploymentId = input?.deploymentId ?? "role-default";
  return ROLE_KINDS.map((kind) => ({
    roleId: `role-${kind}-${deploymentId}`,
    kind,
    ...ROLE_META[kind],
  }));
}
