/**
 * CMP-CONV-PANEL — SCR-04 conversation zone.
 * Guided work surface only; does not own prompts, models, or agents.
 */
export function ConversationPanel() {
  return (
    <div data-cmp="CMP-CONV-PANEL" data-int-id="INT-WS-CONVERSE" data-action-id="ACT-04-01">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Conversation
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        Guided AI work
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Continue the current task with AI guidance in this workspace.
      </p>
      <label className="mt-6 block text-sm text-slate-700">
        Message
        <textarea
          name="workspaceMessage"
          rows={5}
          className="mt-1.5 w-full resize-y border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
          placeholder="Describe what you need help with…"
          autoComplete="off"
        />
      </label>
    </div>
  );
}
