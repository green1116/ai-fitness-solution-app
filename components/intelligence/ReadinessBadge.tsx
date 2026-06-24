export function ReadinessBadge({ score, label }: { score: number; label?: string }) {
  const tone =
    score >= 80
      ? "bg-violet-950 text-violet-300 ring-violet-800"
      : score >= 50
        ? "bg-amber-950 text-amber-300 ring-amber-800"
        : "bg-zinc-900 text-zinc-400 ring-zinc-700";

  return (
    <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ${tone}`}>
      {label ? `${label} ` : ""}
      {score}%
    </span>
  );
}
