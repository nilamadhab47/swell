export function Proof() {
  const stats = [
    { n: '3:00', label: 'Minutes to ride out a craving' },
    { n: '0', label: 'Lectures when you open the app' },
    { n: '1', label: 'Craving at a time — that’s the unit' },
  ];

  return (
    <section className="border-y border-line bg-sunken/50 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-swell border border-line bg-raised p-8 text-center shadow-soft">
            <p className="font-display text-5xl font-bold text-coral">{s.n}</p>
            <p className="mt-2 text-mist">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-5 text-center text-sm text-hush">
        Product principles, not user reviews. We don’t invent testimonials.
      </p>
    </section>
  );
}
