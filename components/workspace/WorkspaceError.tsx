"use client";

type WorkspaceErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function WorkspaceError({ message, onRetry }: WorkspaceErrorProps) {
  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 px-6 py-8 text-center">
      <p className="text-sm text-red-200">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-red-800 px-4 py-2 text-sm text-red-100 hover:bg-red-900/30"
        >
          重试
        </button>
      ) : null}
    </div>
  );
}
