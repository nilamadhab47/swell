'use client';

import { useEffect, useRef, useState } from 'react';

const beats = [
  { t: '00:00', label: 'Craving hits', note: 'The urge spikes. Loud, specific, now.' },
  { t: '01:00', label: 'You redirect', note: 'Hands and eyes move to the game, not the pack.' },
  { t: '02:00', label: 'The intensity shifts', note: 'The peak passes. You barely noticed.' },
  { t: '03:00', label: 'You made it through', note: 'The wave broke. One more that didn’t get you.' },
];

const INTERVAL = 2600;

export function ThreeMinutes() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !playing) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % beats.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const select = (i: number) => {
    setActive(i);
    setPlaying(false); // a manual choice pauses the auto show
  };

  return (
    <section className="border-y border-line bg-sunken/50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Most cravings feel bigger than they actually are.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-mist">
          The urge is loud. It is also brief. Swell is built around those three minutes — not a lifetime of willpower,
          and not a medical claim. Just a way through the next wave.
        </p>

        <div className="mt-12" onMouseEnter={() => setPlaying(false)} onFocusCapture={() => setPlaying(false)}>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aqua-bright to-coral transition-[width] duration-700 ease-out"
              style={{ width: `${((active + 1) / beats.length) * 100}%` }}
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {beats.map((beat, i) => (
              <button
                key={beat.t}
                type="button"
                onClick={() => select(i)}
                aria-pressed={active === i}
                className={`rounded-swell border p-5 text-left transition-all duration-500 ${
                  active === i
                    ? 'border-aqua/50 bg-raised shadow-soft sm:-translate-y-1'
                    : 'border-line bg-raised/40 opacity-70 hover:opacity-100'
                }`}
              >
                <p className="font-display text-sm font-bold text-aqua">{beat.t}</p>
                <p className="mt-2 font-semibold text-ink">{beat.label}</p>
                <p className="mt-1 text-sm leading-6 text-mist">{beat.note}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-hush">
            <div className="flex gap-1.5" aria-hidden>
              {beats.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    active === i ? 'w-6 bg-coral' : 'w-1.5 bg-line'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="font-medium text-aqua hover:text-ink"
            >
              {playing ? 'Pause' : 'Play the wave'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
