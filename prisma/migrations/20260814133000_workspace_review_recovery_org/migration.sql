DELETE FROM "workspace_review_recovery";

ALTER TABLE "workspace_review_recovery" ADD COLUMN "organizationId" TEXT NOT NULL;

DROP INDEX "workspace_review_recovery_surfaceItemId_key";

CREATE UNIQUE INDEX "workspace_review_recovery_organizationId_surfaceItemId_key" ON "workspace_review_recovery"("organizationId", "surfaceItemId");

CREATE INDEX "workspace_review_recovery_organizationId_idx" ON "workspace_review_recovery"("organizationId");
