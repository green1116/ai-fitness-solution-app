-- V50 Production Persistence — P1 Schema Foundation
-- Tag: v50-production-persistence-p1
-- Create-only migration (Workspace / Quote / Workflow / History / Event)

CREATE TABLE "saas_product_workspace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_product_workspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_product_quote" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_product_quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_product_workflow_instance" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "quoteId" TEXT,
    "workflowType" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_product_workflow_instance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_product_workflow_history" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "actor" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_product_workflow_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saas_product_workflow_event" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "fromState" TEXT,
    "toState" TEXT,
    "actor" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_product_workflow_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "saas_product_workspace_tenantId_idx" ON "saas_product_workspace"("tenantId");

CREATE INDEX "saas_product_quote_workspaceId_idx" ON "saas_product_quote"("workspaceId");
CREATE INDEX "saas_product_quote_tenantId_idx" ON "saas_product_quote"("tenantId");

CREATE INDEX "saas_product_workflow_instance_workspaceId_idx" ON "saas_product_workflow_instance"("workspaceId");
CREATE INDEX "saas_product_workflow_instance_quoteId_idx" ON "saas_product_workflow_instance"("quoteId");
CREATE INDEX "saas_product_workflow_instance_workflowType_idx" ON "saas_product_workflow_instance"("workflowType");

CREATE INDEX "saas_product_workflow_history_workflowId_idx" ON "saas_product_workflow_history"("workflowId");

CREATE INDEX "saas_product_workflow_event_workflowId_idx" ON "saas_product_workflow_event"("workflowId");
CREATE INDEX "saas_product_workflow_event_eventType_idx" ON "saas_product_workflow_event"("eventType");

ALTER TABLE "saas_product_quote" ADD CONSTRAINT "saas_product_quote_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "saas_product_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saas_product_workflow_instance" ADD CONSTRAINT "saas_product_workflow_instance_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "saas_product_workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saas_product_workflow_instance" ADD CONSTRAINT "saas_product_workflow_instance_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "saas_product_quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "saas_product_workflow_history" ADD CONSTRAINT "saas_product_workflow_history_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "saas_product_workflow_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saas_product_workflow_event" ADD CONSTRAINT "saas_product_workflow_event_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "saas_product_workflow_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
