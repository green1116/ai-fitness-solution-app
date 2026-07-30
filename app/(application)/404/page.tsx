import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section
      className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center px-6 py-16"
      aria-labelledby="not-found-title"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Not Found
        </h1>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
