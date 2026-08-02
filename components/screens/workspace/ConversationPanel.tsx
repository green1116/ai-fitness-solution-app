"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  FEAT_40_ACTION_ID,
  FEAT_40_COMMAND,
  FEAT_40_ID,
  FEAT_40_INT_ID,
  runWorkspaceInteractCommand,
} from "@/lib/frontend/workspace-interact-command";

type ConversationPanelProps = Readonly<{
  projectId?: string;
}>;

/**
 * CMP-CONV-PANEL — SCR-04 conversation zone.
 * FEAT-40: interacts through existing WorkspaceInteract binding (HTTP/NEAREST).
 * Guided work surface only; does not own prompts, models, or agents.
 */
export function ConversationPanel({ projectId = "" }: ConversationPanelProps) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progressUpdated, setProgressUpdated] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await runWorkspaceInteractCommand({ message, projectId });
        setProgressUpdated(true);
      } catch (err) {
        setProgressUpdated(false);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to continue workspace interaction",
        );
      }
    });
  }

  return (
    <div
      data-cmp="CMP-CONV-PANEL"
      data-feat={FEAT_40_ID}
      data-int-id={FEAT_40_INT_ID}
      data-action-id={FEAT_40_ACTION_ID}
      data-command={FEAT_40_COMMAND}
      data-navigation-only="false"
      data-local-only="false"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Conversation
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        Guided AI work
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Continue the current task with AI guidance in this workspace.
      </p>

      <form
        className="mt-6"
        onSubmit={onSubmit}
        data-feat={FEAT_40_ID}
        data-action-id={FEAT_40_ACTION_ID}
        data-command={FEAT_40_COMMAND}
        data-ac="AC-GP01-06"
      >
        <label className="block text-sm text-slate-700">
          Message
          <textarea
            name="workspaceMessage"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1.5 w-full resize-y border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
            placeholder="Describe what you need help with…"
            autoComplete="off"
            required
          />
        </label>

        <div className="mt-4">
          <button
            type="submit"
            disabled={pending}
            data-feat={FEAT_40_ID}
            data-int-id={FEAT_40_INT_ID}
            data-action-id={FEAT_40_ACTION_ID}
            data-command={FEAT_40_COMMAND}
            data-ac="AC-GP01-06"
            className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Updating workspace…" : "Continue guided work"}
          </button>
        </div>
      </form>

      {pending ? (
        <p className="mt-3 text-sm text-slate-500" data-meta="loading">
          Updating task progress…
        </p>
      ) : null}

      {progressUpdated ? (
        <p
          className="mt-3 text-sm text-emerald-700"
          data-meta="success"
          data-task-progress="updated"
        >
          Task progress updated in workspace
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
