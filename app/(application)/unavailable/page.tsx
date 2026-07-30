import Link from "next/link";

export default function UnavailablePage() {
  return (
    <section
      className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center px-6 py-16"
      aria-labelledby="unavailable-title"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          System
        </p>
        <h1
          id="unavailable-title"
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Temporarily Unavailable
        </h1>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          <Link
            href="/unavailable"
            className="text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Retry
          </Link>
          <Link
            href="/"
            className="text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
