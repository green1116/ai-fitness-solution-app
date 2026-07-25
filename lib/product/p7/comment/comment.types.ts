/**
 * Product P7 — Comment types
 */

import type { COMMENT_KINDS } from "../collaboration/collaboration.constants";

export type CommentKind = (typeof COMMENT_KINDS)[number];
export type CommentMetadata = Record<string, unknown>;

export type CollaborationComment = {
  id: string;
  collaborationId: string;
  kind: CommentKind;
  author: string;
  body: string;
  detail: string;
  metadata: CommentMetadata;
  createdAt: string;
};

export type CreateCommentInput = {
  id?: string;
  collaborationId: string;
  kind: CommentKind;
  author: string;
  body: string;
  metadata?: CommentMetadata;
};
