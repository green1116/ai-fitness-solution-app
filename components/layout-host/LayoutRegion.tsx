type LayoutRegionProps = Readonly<{
  name: string;
  children?: React.ReactNode;
}>;

export function LayoutRegion({ name, children }: LayoutRegionProps) {
  return (
    <section
      data-layout-region={name}
      className="min-w-0"
      aria-label={name}
    >
      {children}
    </section>
  );
}
