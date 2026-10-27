export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-gradient-navy px-4 py-10 text-navy-foreground md:py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-extrabold uppercase md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-navy-foreground/70 md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
