/**
 * V48 SaaS Foundation — catalog seed
 */
import { prisma } from "../lib/prisma";
import { seedSaasFoundation } from "../lib/saas-foundation/seed/seed-saas-foundation";

async function main() {
  const result = await seedSaasFoundation(prisma, { mode: "catalog-only" });
  console.log(result.summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
