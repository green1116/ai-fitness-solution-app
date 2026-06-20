import { existsSync, readFileSync } from "fs";
import { join } from "path";

const PORTS_ROOT = join(process.cwd(), "lib", "quote-runtime", "ports");

export function assertPersistencePortContract(): boolean {
  const path = join(PORTS_ROOT, "quote-persistence.port.ts");
  const content = readFileSync(path, "utf8");
  return (
    content.includes("interface QuotePersistencePort") &&
    content.includes("loadQuoteSnapshot") &&
    content.includes("WorkspaceQuoteRuntimeSnapshot")
  );
}

export function assertApiPortContract(): boolean {
  const path = join(PORTS_ROOT, "quote-api-exposure.port.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteApiExposurePort") && content.includes("getQuoteSurface");
}

export function assertCommercialPortContract(): boolean {
  const path = join(PORTS_ROOT, "quote-commercial.port.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("interface QuoteCommercialPort") && content.includes("getQuoteEligibility");
}

export function assertPortRegistryContract(): boolean {
  const path = join(PORTS_ROOT, "quote-port-registry.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("createQuotePortRegistry") && content.includes("QuotePortRegistry");
}

export function assertPortTypesContract(): boolean {
  const path = join(PORTS_ROOT, "quote-port-types.ts");
  const content = readFileSync(path, "utf8");
  return content.includes("QuotePortRegistry") && content.includes("QuotePersistencePort");
}

export function assertPortDefinitionInterfaceOnly(): boolean {
  const definitionFiles = [
    join(PORTS_ROOT, "quote-persistence.port.ts"),
    join(PORTS_ROOT, "quote-api-exposure.port.ts"),
    join(PORTS_ROOT, "quote-commercial.port.ts"),
  ];
  return definitionFiles.every((file) => {
    const content = readFileSync(file, "utf8");
    return (
      existsSync(file) &&
      content.includes("export interface") &&
      !/\bclass\s+/.test(content) &&
      !/export function/.test(content)
    );
  });
}

export function validateQuotePorts(): { valid: boolean; summary: string } {
  const valid =
    existsSync(join(PORTS_ROOT, "quote-persistence.port.ts")) &&
    existsSync(join(PORTS_ROOT, "quote-api-exposure.port.ts")) &&
    existsSync(join(PORTS_ROOT, "quote-commercial.port.ts")) &&
    assertPersistencePortContract() &&
    assertApiPortContract() &&
    assertCommercialPortContract() &&
    assertPortRegistryContract() &&
    assertPortTypesContract() &&
    assertPortDefinitionInterfaceOnly();

  return {
    valid,
    summary: [
      `persistencePort=${assertPersistencePortContract()}`,
      `apiPort=${assertApiPortContract()}`,
      `commercialPort=${assertCommercialPortContract()}`,
      `interfaceOnly=${assertPortDefinitionInterfaceOnly()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
