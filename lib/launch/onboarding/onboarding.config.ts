/**
 * Launch P2 — Customer Configuration
 */

import { getOnboardingProfile } from "./onboarding.profile";
import type {
  CustomerConfiguration,
  SetCustomerConfigurationInput,
} from "./onboarding.types";

const configurations = new Map<string, CustomerConfiguration>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function configKey(onboardingProfileId: string, key: string): string {
  return `${onboardingProfileId}:${key}`;
}

function cloneConfig(config: CustomerConfiguration): CustomerConfiguration {
  return { ...config, metadata: { ...config.metadata } };
}

export function setCustomerConfiguration(
  input: SetCustomerConfigurationInput,
): CustomerConfiguration {
  const onboardingProfileId = input.onboardingProfileId.trim();
  const key = input.key.trim();
  if (!key) throw new Error("config.key is required");
  if (!getOnboardingProfile(onboardingProfileId)) {
    throw new Error(`onboarding profile not found: ${onboardingProfileId}`);
  }

  const mapKey = configKey(onboardingProfileId, key);
  const existing = configurations.get(mapKey);
  const config: CustomerConfiguration = {
    id: existing?.id ?? input.id?.trim() ?? createId("custcfg"),
    onboardingProfileId,
    key,
    value: input.value,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  configurations.set(mapKey, config);
  return cloneConfig(config);
}

export function getCustomerConfiguration(input: {
  onboardingProfileId: string;
  key: string;
}): CustomerConfiguration | undefined {
  const config = configurations.get(
    configKey(input.onboardingProfileId.trim(), input.key.trim()),
  );
  return config ? cloneConfig(config) : undefined;
}

export function listCustomerConfigurations(filter?: {
  onboardingProfileId?: string;
}): CustomerConfiguration[] {
  let result = [...configurations.values()];
  if (filter?.onboardingProfileId) {
    const oid = filter.onboardingProfileId.trim();
    result = result.filter((c) => c.onboardingProfileId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConfig);
}

export function clearCustomerConfigurations(): void {
  configurations.clear();
}
