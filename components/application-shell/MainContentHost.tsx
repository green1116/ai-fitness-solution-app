type MainContentHostProps = Readonly<{
  children: React.ReactNode;
}>;

export function MainContentHost({ children }: MainContentHostProps) {
  return (
    <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
      {children}
    </main>
  );
}
