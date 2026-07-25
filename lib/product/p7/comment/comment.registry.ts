/**
 * Product P7 — Comment registry
 */

import { COMMENT_KINDS } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  CollaborationComment,
  CommentKind,
  CreateCommentInput,
} from "./comment.types";

const comments = new Map<string, CollaborationComment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneComment(comment: CollaborationComment): CollaborationComment {
  return { ...comment, metadata: { ...comment.metadata } };
}

export function createComment(input: CreateCommentInput): CollaborationComment {
  const collaborationId = input.collaborationId.trim();
  const author = input.author.trim();
  const body = input.body.trim();
  if (!collaborationId) throw new Error("comment.collaborationId is required");
  if (!author) throw new Error("comment.author is required");
  if (!body) throw new Error("comment.body is required");
  if (!(COMMENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid comment kind: ${input.kind}`);
  }
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7cmt");
  if (comments.has(id)) {
    throw new Error(`comment already exists: ${id}`);
  }

  const comment: CollaborationComment = {
    id,
    collaborationId,
    kind: input.kind,
    author,
    body,
    detail: `kind=${input.kind} author=${author}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  comments.set(id, comment);
  return cloneComment(comment);
}

export function getComment(id: string): CollaborationComment | undefined {
  const comment = comments.get(id.trim());
  return comment ? cloneComment(comment) : undefined;
}

export function listComments(filter?: {
  collaborationId?: string;
  kind?: CommentKind;
}): CollaborationComment[] {
  let result = [...comments.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((c) => c.collaborationId === cid);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneComment);
}

export function clearComments(): void {
  comments.clear();
}
