CREATE INDEX IF NOT EXISTS "Lead_email_createdAt_idx"
ON "Lead"("email", "createdAt");

CREATE INDEX IF NOT EXISTS "Lead_planId_createdAt_idx"
ON "Lead"("planId", "createdAt");

CREATE INDEX IF NOT EXISTS "Lead_status_idx"
ON "Lead"("status");
