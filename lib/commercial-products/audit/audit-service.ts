import { assertAuditLinkage, isHighRiskAuditEvent } from "./audit-policy";
import { appendAuditHistory, clearAuditHistory, getAuditHistoryEvent, listAuditHistory } from "./audit-history";
import type {
  AuditContext,
  AuditListResponse,
  AuditLookup,
  AuditRecord,
  AuditRecordInput,
  AuditRecordResponse,
  ComplianceRuleResult,
  ComplianceSnapshot,
} from "./audit-types";

const complianceSnapshots = new Map<string, ComplianceSnapshot>();

function buildComplianceRules(input: AuditRecordInput): ComplianceRuleResult[] {
  return [
    {
      ruleId: "audit-linkage",
      name: "Audit Linkage",
      passed: Boolean(
        input.workspaceId ||
          input.quoteId ||
          input.approvalId ||
          input.deliveryId ||
          input.projectId ||
          input.packageId,
      ),
      message: "event linked to commercial workflow",
    },
    {
      ruleId: "approval-trace",
      name: "Approval Trace",
      passed: input.eventType.startsWith("approval_") ? Boolean(input.approvalId) : true,
      message: "approval events require approvalId",
    },
    {
      ruleId: "delivery-trace",
      name: "Delivery Trace",
      passed:
        input.eventType === "delivery_orchestrated" || input.eventType === "package_built"
          ? Boolean(input.quoteId || input.deliveryId || input.packageId)
          : true,
      message: "delivery events require quote/delivery/package linkage",
    },
  ];
}

function resolveComplianceStatus(rules: ComplianceRuleResult[]): ComplianceSnapshot["status"] {
  if (rules.every((rule) => rule.passed)) return "pass";
  if (rules.some((rule) => !rule.passed)) return "fail";
  return "warn";
}

export class AuditService {
  static recordEvent(input: AuditRecordInput): AuditRecordResponse {
    assertAuditLinkage(input);

    const record: AuditRecord = {
      auditId: `audit-${input.eventType}-${Date.now()}`,
      ...input,
      createdAt: Date.now(),
    };

    appendAuditHistory(record);

    let compliance: ComplianceSnapshot | undefined;
    if (isHighRiskAuditEvent(input.eventType)) {
      compliance = AuditService.buildComplianceSnapshot({
        workspaceId: input.workspaceId,
        quoteId: input.quoteId,
        approvalId: input.approvalId,
        packageId: input.packageId,
        deliveryId: input.deliveryId,
        projectId: input.projectId,
      }, input);
      complianceSnapshots.set(compliance.complianceId, compliance);
    }

    return { ok: true, event: record, compliance };
  }

  static listEvents(lookup: AuditLookup = {}): AuditListResponse {
    const events = listAuditHistory(lookup);
    const latestCompliance = [...complianceSnapshots.values()]
      .filter((snapshot) => {
        if (lookup.quoteId && snapshot.quoteId !== lookup.quoteId) return false;
        if (lookup.approvalId && snapshot.approvalId !== lookup.approvalId) return false;
        if (lookup.deliveryId && snapshot.deliveryId !== lookup.deliveryId) return false;
        if (lookup.workspaceId && snapshot.workspaceId !== lookup.workspaceId) return false;
        return true;
      })
      .sort((a, b) => b.generatedAt - a.generatedAt)[0];

    return { ok: true, events, compliance: latestCompliance };
  }

  static getEvent(auditId: string): AuditRecordResponse {
    const event = getAuditHistoryEvent(auditId);
    if (!event) throw new Error(`Audit event not found: ${auditId}`);
    return { ok: true, event };
  }

  static listByWorkspace(workspaceId: string): AuditListResponse {
    return AuditService.listEvents({ workspaceId });
  }

  static listByQuote(quoteId: string): AuditListResponse {
    return AuditService.listEvents({ quoteId });
  }

  static listByApproval(approvalId: string): AuditListResponse {
    return AuditService.listEvents({ approvalId });
  }

  static listByDelivery(deliveryId: string): AuditListResponse {
    return AuditService.listEvents({ deliveryId });
  }

  static buildComplianceSnapshot(
    context: AuditContext,
    source?: AuditRecordInput,
  ): ComplianceSnapshot {
    const rules = source ? buildComplianceRules(source) : [
      {
        ruleId: "context-linkage",
        name: "Context Linkage",
        passed: Boolean(context.quoteId || context.approvalId || context.deliveryId || context.workspaceId),
        message: "compliance snapshot linked to workflow context",
      },
    ];

    const snapshot: ComplianceSnapshot = {
      complianceId: `compliance-${context.quoteId ?? context.approvalId ?? Date.now()}`,
      workspaceId: context.workspaceId,
      quoteId: context.quoteId,
      approvalId: context.approvalId,
      packageId: context.packageId,
      deliveryId: context.deliveryId,
      status: resolveComplianceStatus(rules),
      rules,
      generatedAt: Date.now(),
    };

    complianceSnapshots.set(snapshot.complianceId, snapshot);
    return snapshot;
  }

  static clearAll(): void {
    clearAuditHistory();
    complianceSnapshots.clear();
  }
}
