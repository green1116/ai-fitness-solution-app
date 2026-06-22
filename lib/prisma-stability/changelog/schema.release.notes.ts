/**
 * Prisma Stability V3 — schema release notes
 */

import {
  generateSchemaChangelog,
  formatSchemaChangelog,
  type SchemaChangelog,
} from "./schema.changelog.generator";
import { loadLatestSnapshot } from "../snapshot/schema.snapshot.store";
import { readSchemaChangeAudits } from "../audit/schema.change.log";

export type SchemaReleaseNotes = {
  version: string;
  releasedAt: string;
  schemaHash: string;
  changelog: SchemaChangelog;
  recentAudits: number;
  markdown: string;
};

export function generateSchemaReleaseNotes(): SchemaReleaseNotes {
  const snapshot = loadLatestSnapshot();
  const changelog = generateSchemaChangelog();
  const audits = readSchemaChangeAudits(10);
  const schemaHash = snapshot?.schemaHash ?? "unknown";
  const version = `schema-${schemaHash.slice(0, 8)}`;

  const header = [
    `# Prisma Schema Release Notes`,
    ``,
    `**Version:** ${version}`,
    `**Schema Hash:** \`${schemaHash}\``,
    `**Released:** ${new Date().toISOString()}`,
    `**Recent Audits:** ${audits.length}`,
    ``,
  ].join("\n");

  const markdown = `${header}\n${formatSchemaChangelog(changelog)}`;

  return {
    version,
    releasedAt: new Date().toISOString(),
    schemaHash,
    changelog,
    recentAudits: audits.length,
    markdown,
  };
}
