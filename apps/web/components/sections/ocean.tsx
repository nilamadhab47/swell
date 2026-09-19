'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WAVE_PATH = 'M0 80 Q180 56 360 80 T720 80 T1080 80 T1440 80 V200 H0 Z';

function WaveLayer({
  fill,
  opacity,
  className,
  height,
}: {
  fill: string;
  opacity: number;
  className: string;
  height: number;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height }}>
      <div className={`flex h-full w-[200%] ${className}`}>
        {[0, 1].map((k) => (
          <svg
            key={k}
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            className="h-full w-1/2"
            style={{ opacity }}
            aria-hidden
          >
            <path d={WAVE_PATH} fill={fill} />
          </svg>
        ))}
      </div>
    </div>
  );
}

// Deterministic constellation of "cravings beaten".
const points = Array.from({ length: 26 }, (_, i) => {
  const x = 8 + ((i * 137) % 84);
  const y = 12 + ((i * 89) % 46);
  return { x, y, r: 2 + (i % 3), delay: (i % 7) * 0.5 };
});

export function Ocean() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.ocean-water', {
        yPercent: 45,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom 40%', scrub: 0.6 },
      });
      gsap.to('.ocean-glow', { opacity: 0.9, scale: 1.1, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="ocean" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aqua">Your ocean</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
        Your progress is becoming something you can see.
      </h2>
      <p className="mt-4 max-w-xl text-lg leading-8 text-mist">
        Days clear, money reclaimed, cravings beaten — they don’t live in a spreadsheet. They live in a tide that rises
        as you stay.
      </p>

      <div
        ref={root}
        className="relative mt-12 h-[420px] overflow-hidden rounded-swell border border-line bg-gradient-to-b from-canvas-top via-canvas to-raised shadow-soft"
      >
        {/* Sun glow */}
        <div className="ocean-glow pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-sunrise/40 opacity-60 blur-3xl" aria-hidden />

        {/* Constellation of beaten cravings */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {points.slice(0, 12).map((p, i) => {
            const next = points[i + 1];
            if (!next) return null;
            return (
              <line
                key={`l-${i}`}
                x1={`${p.x}%`}
                y1={`${p.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="var(--aqua-bright)"
                strokeOpacity="0.14"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        {points.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-aqua-bright shadow-[0_0_10px_var(--aqua-bright)] animate-twinkle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.r * 2,
              height: p.r * 2,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Rising animated water */}
        <div className="ocean-water absolute inset-x-0 bottom-0 h-[62%]">
          <WaveLayer fill="var(--aqua-bright)" opacity={0.18} height={220} className="animate-wave-slow" />
          <WaveLayer fill="var(--aqua)" opacity={0.28} height={180} className="animate-wave-mid" />
          <WaveLayer fill="var(--aqua)" opacity={0.5} height={130} className="animate-wave-fast" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-aqua/60 to-transparent" />
        </div>

        {/* Milestone markers */}
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-ink">
          {[
            { k: 'Day 1', v: 'First wave ridden' },
            { k: 'Day 3', v: 'Taste & smell return' },
            { k: 'Week 1', v: 'The tide is visible' },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl bg-raised/80 px-3 py-2 backdrop-blur">
              <p className="font-display text-sm font-bold text-coral">{m.k}</p>
              <p className="text-xs text-mist">{m.v}</p>
            </div>
          ))}
        </div>
        <p className="absolute right-5 top-5 rounded-pill bg-raised/80 px-3 py-1 text-xs font-medium text-ink/70 backdrop-blur">
          26 cravings beaten · illustrative
        </p>
      </div>
    </section>
  );
}
