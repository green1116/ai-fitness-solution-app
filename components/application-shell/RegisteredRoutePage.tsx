type RegisteredRoutePageProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function RegisteredRoutePage({
  eyebrow,
  title,
  description,
}: RegisteredRoutePageProps) {
  return (
    <section
      className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center px-6 py-16"
      aria-labelledby="registered-route-title"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>
        <h1
          id="registered-route-title"
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>
    </section>
  );
}
