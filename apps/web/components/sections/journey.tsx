'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneMockup } from '@/components/hero/phone-mockup';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    n: '01',
    kicker: 'Home',
    title: 'It starts with an urge.',
    copy: 'Open Swell and the whole screen is one calm invitation: feeling the pull? Tap here and ride it out.',
    src: '/screens/home.png',
  },
  {
    n: '02',
    kicker: 'Play',
    title: 'Do something with the craving.',
    copy: 'BlockStack is a three-minute game for your hands and your head. When it ends, so has the urge.',
    src: '/screens/blockstack.png',
  },
  {
    n: '03',
    kicker: 'Victory',
    title: 'You stayed.',
    copy: 'No confetti-for-everything. Just an honest count of the cravings that didn’t win — tied to your reason.',
    src: '/screens/victory.png',
  },
  {
    n: '04',
    kicker: 'Wins',
    title: 'Proof you’re winning — not guilt.',
    copy: 'Days clear, money that’s yours again, a body already repairing itself. Receipts you can feel.',
    src: '/screens/wins.png',
  },
  {
    n: '05',
    kicker: 'You',
    title: 'A quiet place, kept private.',
    copy: 'Your why, your numbers, your last note. Nothing here is medical. It’s just you, keeping score.',
    src: '/screens/you.png',
  },
];

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.journey-scene').forEach((el) => {
        gsap.from(el, {
          y: 44,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={root} className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aqua">Inside the app</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">The craving, interrupted.</h2>
      <div className="mt-16 space-y-20 md:space-y-28">
        {scenes.map((scene, i) => (
          <article
            key={scene.n}
            className={`journey-scene grid items-center gap-10 md:grid-cols-2 ${
              i % 2 ? 'md:[&>div:first-child]:order-2' : ''
            }`}
          >
            <div>
              <span className="font-display text-sm font-bold text-hush">{scene.n}</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-aqua">{scene.kicker}</p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-ink">{scene.title}</h3>
              <p className="mt-3 max-w-md text-lg leading-8 text-mist">{scene.copy}</p>
            </div>
            <div className="flex justify-center">
              <PhoneMockup src={scene.src} alt={`Swell ${scene.kicker} screen`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
