import type { UserMembership, UserProfile } from "./types";

export function buildUserProfiles(input?: { deploymentId?: string }): UserProfile[] {
  const deploymentId = input?.deploymentId ?? "user-default";
  const now = new Date().toISOString();

  return [
    {
      userId: `user-owner-${deploymentId}`,
      tenantId: `tenant-${deploymentId}`,
      email: `owner@${deploymentId}.example.com`,
      displayName: "张负责人",
      status: "active",
      createdAt: now,
      lastLoginAt: now,
    },
    {
      userId: `user-admin-${deploymentId}`,
      tenantId: `tenant-${deploymentId}`,
      email: `admin@${deploymentId}.example.com`,
      displayName: "李管理员",
      status: "active",
      createdAt: now,
      lastLoginAt: now,
    },
    {
      userId: `user-member-${deploymentId}`,
      tenantId: `tenant-${deploymentId}`,
      email: `member@${deploymentId}.example.com`,
      displayName: "王成员",
      status: "active",
      createdAt: now,
      lastLoginAt: null,
    },
    {
      userId: `user-invited-${deploymentId}`,
      tenantId: `tenant-${deploymentId}`,
      email: `invited@${deploymentId}.example.com`,
      displayName: "待邀请用户",
      status: "invited",
      createdAt: now,
      lastLoginAt: null,
    },
  ];
}

export function buildUserMemberships(input?: {
  deploymentId?: string;
  profiles?: UserProfile[];
}): UserMembership[] {
  const deploymentId = input?.deploymentId ?? "user-default";
  const profiles = input?.profiles ?? buildUserProfiles({ deploymentId });
  const workspaceId = `workspace-${deploymentId}`;
  const now = new Date().toISOString();

  const roleMap: Record<string, string> = {
    [`user-owner-${deploymentId}`]: "role-owner",
    [`user-admin-${deploymentId}`]: "role-admin",
    [`user-member-${deploymentId}`]: "role-member",
    [`user-invited-${deploymentId}`]: "role-viewer",
  };

  return profiles.map((profile) => ({
    membershipId: `membership-${profile.userId}`,
    userId: profile.userId,
    workspaceId,
    roleId: roleMap[profile.userId] ?? "role-viewer",
    joinedAt: now,
    status: profile.status === "invited" ? "pending" : "active",
  }));
}
