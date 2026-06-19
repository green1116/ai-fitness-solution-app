import type { AccessAuditRecord } from "../shared/rbac-types";

const auditRecords: AccessAuditRecord[] = [];

export function recordAccessAudit(input: {
  userId: string;
  tenantId: string;
  roleSystemCode?: string;
  permission: string;
  allowed: boolean;
}): AccessAuditRecord {
  const record: AccessAuditRecord = {
    timestamp: new Date(),
    userId: input.userId,
    tenantId: input.tenantId,
    roleSystemCode: input.roleSystemCode,
    permission: input.permission,
    allowed: input.allowed,
  };

  auditRecords.unshift(record);
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[saas-rbac] access user=${record.userId} tenant=${record.tenantId} permission=${record.permission} allowed=${record.allowed}`,
    );
  }
  return record;
}

export function listAccessAuditRecords(): AccessAuditRecord[] {
  return [...auditRecords];
}

export function clearAccessAuditRecords(): void {
  auditRecords.length = 0;
}
