# V29 Multi Tenant Foundation

**Version:** `v29-multi-tenant-4`  
**Status:** Frozen — multi-tenant organization & collaboration layer  
**Tag:** `v29-multi-tenant-foundation`  
**Predecessor:** V28 Tender Marketplace Foundation (`v28-tender-marketplace-4`)  
**Successor:** V30+ Platform Runtime / Collaboration UI (read-only extension)

## Goal

为 Brand / Supplier / Tender Owner 未来多人协作建立 **Multi Tenant 数据层与访问控制协作层**：

```
V26 Brand Portal (read-only compat)
V27 Supplier Portal (read-only compat)
V28 Tender Marketplace (read-only compat)
  → Organization / Workspace / Membership / Role / Permission
  → Access Control / Membership Workflow / Workspace Collaboration
  → Validation + Reporting + Freeze Evidence
```

## Principle

- **不新增** Runtime
- **不新增** Dashboard
- **不新增**登录系统
- **不修改** V20–V28
- **仅建设** Data Layer · Access Control · Collaboration · Validation · Report · Freeze Evidence

## Frozen Modules

| Domain | Path | Phase |
|--------|------|-------|
| Organization | `organization/` | 1 |
| Workspace | `workspace/` | 1 |
| Membership | `membership/` | 1 |
| Role | `role/` | 1 |
| Permission | `permission/` | 1 |
| Access Control | `access-control/` | 2 |
| Collaboration | `membership-workflow/` + `workspace-collaboration/` | 2 |
| Validation | `validation/` + `freeze/validators.ts` | 1–Freeze |
| Reporting | `report/` + `freeze/report/` | 1–Freeze |
| Freeze Evidence | `freeze/evidence.ts` | Freeze |

## Membership State Machine (Frozen)

```
pending → accepted → active → removed
```

## Canonical Query (Frozen)

```typescript
{
  organizationId: "org-brand-life-fitness",
  workspaceId: "workspace-brand-life-fitness",
}
```

## Collaboration Workspaces (Frozen)

Brand · Supplier · Tender Owner — 三类工作空间均可协作

## Freeze API

```typescript
import {
  buildMultiTenantFreezeReport,
  buildMultiTenantFreezeEvidence,
  validateMultiTenantFreeze,
  buildMultiTenantCoverageStats,
} from "@/lib/multi-tenant-foundation";
```

## Readiness Target

| Score | Target |
|-------|--------|
| Multi Tenant Readiness | **100%** |
| Multi Tenant Validation | **100%** |
| Multi Tenant Coverage | **100%** |
