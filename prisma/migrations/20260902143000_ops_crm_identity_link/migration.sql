-- WP-RUNTIME-OPS-CRM-IDENTITY-PERSIST-1 — explicit Ops ↔ CRM identity links

CREATE TABLE "ops_crm_identity_link" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "opsCustomerId" TEXT NOT NULL,
    "crmCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ops_crm_identity_link_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ops_crm_identity_link_organizationId_opsCustomerId_key" ON "ops_crm_identity_link"("organizationId", "opsCustomerId");

CREATE INDEX "ops_crm_identity_link_organizationId_idx" ON "ops_crm_identity_link"("organizationId");

CREATE INDEX "ops_crm_identity_link_crmCustomerId_idx" ON "ops_crm_identity_link"("crmCustomerId");

ALTER TABLE "ops_crm_identity_link" ADD CONSTRAINT "ops_crm_identity_link_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ops_crm_identity_link" ADD CONSTRAINT "ops_crm_identity_link_crmCustomerId_fkey" FOREIGN KEY ("crmCustomerId") REFERENCES "crm_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
