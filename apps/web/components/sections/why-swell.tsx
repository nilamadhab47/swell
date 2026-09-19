const ideas = [
  {
    title: 'When the craving hits',
    copy: 'You need an action, not another lecture. Swell is something to do with the urge.',
    accent: 'from-coral/15 to-transparent',
  },
  {
    title: 'Small wins compound',
    copy: 'Every craving beaten becomes part of the journey. Days clear are a side effect.',
    accent: 'from-aqua-bright/15 to-transparent',
  },
  {
    title: 'Progress should feel visible',
    copy: 'Your ocean evolves. Milestones, money, body time — all of it has a face.',
    accent: 'from-sunrise/20 to-transparent',
  },
  {
    title: 'No shame',
    copy: 'A difficult moment doesn’t make you a failure. We count the ones you rode out.',
    accent: 'from-mint/15 to-transparent',
  },
];

export function WhySwell() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aqua">Why Swell</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
        Built for the moment, not the lecture.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {ideas.map((idea) => (
          <article
            key={idea.title}
            className={`rounded-swell border border-line bg-gradient-to-br ${idea.accent} bg-raised p-8 shadow-soft`}
          >
            <h3 className="text-2xl font-bold text-ink">{idea.title}</h3>
            <p className="mt-3 text-lg leading-8 text-mist">{idea.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
