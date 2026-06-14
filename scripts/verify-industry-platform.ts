/**
 * V30 Industry Platform Foundation — Phase 2 Identity Layer verification
 */
import {
  buildIndustryIdentityContext,
  CANONICAL_INDUSTRY_IDENTITY_QUERY,
  INDUSTRY_PLATFORM_TAG,
  INDUSTRY_PLATFORM_VERSION,
  validateIndustryPlatform,
  validateOrganizationRegistry,
  validateMemberRegistry,
  validateRoleRegistry,
  validatePermissionRegistry,
  validateIdentityContextRegistry,
  validateIndustryIdentityContext,
} from "../lib/industry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOrganizationRegistry() {
  const result = validateOrganizationRegistry();
  assert(result.valid, "organization registry valid");
  assert(result.count >= 10, "organization count");
  console.log("✓ organization registry");
  console.log(" ", result.summary);
}

function testMemberRegistry() {
  const result = validateMemberRegistry();
  assert(result.valid, "member registry valid");
  assert(result.count >= 8, "member count");
  console.log("✓ member registry");
  console.log(" ", result.summary);
}

function testRoleRegistry() {
  const result = validateRoleRegistry();
  assert(result.valid, "role registry valid");
  assert(result.count >= 7, "role count");
  console.log("✓ role registry");
  console.log(" ", result.summary);
}

function testPermissionRegistry() {
  const result = validatePermissionRegistry();
  assert(result.valid, "permission registry valid");
  assert(result.count >= 8, "permission count");
  console.log("✓ permission registry");
  console.log(" ", result.summary);
}

function testIdentityContext() {
  const result = validateIdentityContextRegistry();
  assert(result.valid, "identity context registry valid");

  const canonical = buildIndustryIdentityContext(CANONICAL_INDUSTRY_IDENTITY_QUERY);
  assert(canonical !== null, "canonical identity context exists");
  assert(validateIndustryIdentityContext(canonical!), "canonical identity context valid");
  assert(canonical!.roles.length > 0, "canonical roles resolved");
  assert(canonical!.permissions.length > 0, "canonical permissions resolved");

  console.log("✓ identity context");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical!.contextId} roles=${canonical!.roles.length} permissions=${canonical!.permissions.length}`,
  );
}

function testIndustryPlatform() {
  const validation = validateIndustryPlatform();
  assert(validation.valid, "industry platform validation");
  assert(INDUSTRY_PLATFORM_VERSION === "v30-industry-platform-2", "platform version");
  assert(INDUSTRY_PLATFORM_TAG === "v30-industry-identity-layer", "platform tag");

  console.log("✓ industry platform validation");
  console.log(
    " ",
    `org=${validation.organizationRegistry.valid} member=${validation.memberRegistry.valid} role=${validation.roleRegistry.valid} permission=${validation.permissionRegistry.valid} context=${validation.identityContext.valid}`,
  );
}

testOrganizationRegistry();
testMemberRegistry();
testRoleRegistry();
testPermissionRegistry();
testIdentityContext();
testIndustryPlatform();
console.log("INDUSTRY PLATFORM VERIFY PASS");
