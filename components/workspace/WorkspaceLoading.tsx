export function WorkspaceLoading({ message = "加载中…" }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="animate-pulse text-sm text-zinc-400">{message}</p>
    </div>
  );
}
