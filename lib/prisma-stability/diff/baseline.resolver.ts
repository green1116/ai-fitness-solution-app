/**
 * Prisma Stability V2 — baseline schema resolver
 */

import fs from "node:fs";
import { execSync } from "node:child_process";
import { defaultSchemaPath, readSchemaFile } from "../core/schema.parser";

export type SchemaDiffPair = {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
};

function tryGitShow(ref: string): string | null {
  try {
    return execSync(`git show ${ref}:prisma/schema.prisma`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").trim();
}

/**
 * Resolves before/after schema pair for diff:
 * 1. PRISMA_SCHEMA_BASELINE file path
 * 2. Uncommitted changes vs HEAD
 * 3. HEAD vs HEAD~1 (deploy / committed diff)
 * 4. Self (no changes)
 */
export function resolveSchemaDiffPair(): SchemaDiffPair {
  const afterPath = defaultSchemaPath();
  const after = readSchemaFile(afterPath);
  const afterLabel = afterPath;

  const envBaseline = process.env.PRISMA_SCHEMA_BASELINE?.trim();
  if (envBaseline && fs.existsSync(envBaseline)) {
    return {
      before: fs.readFileSync(envBaseline, "utf8"),
      after,
      beforeLabel: envBaseline,
      afterLabel,
    };
  }

  const head = tryGitShow("HEAD");
  if (head && normalize(head) !== normalize(after)) {
    return { before: head, after, beforeLabel: "git:HEAD", afterLabel };
  }

  const parent = tryGitShow("HEAD~1");
  if (parent && normalize(parent) !== normalize(after)) {
    return { before: parent, after, beforeLabel: "git:HEAD~1", afterLabel };
  }

  return { before: after, after, beforeLabel: "self", afterLabel };
}
