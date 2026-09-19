'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { buttonVariants } from '@/components/ui/button';
import { PhoneMockup } from './phone-mockup';
import { OceanBackdrop } from './ocean-backdrop';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-kicker', { y: 18, opacity: 0, duration: 0.6 })
        .from('.hero-title span', { y: 34, opacity: 0, stagger: 0.09, duration: 0.7 }, '-=0.2')
        .from('.hero-copy', { y: 18, opacity: 0, duration: 0.6 }, '-=0.35')
        .from('.hero-cta', { y: 14, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.hero-trust', { opacity: 0, duration: 0.6 }, '-=0.2')
        .from('.hero-phone', { y: 50, opacity: 0, duration: 0.9 }, '-=0.6');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden pt-28 md:pt-36">
      <OceanBackdrop />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 lg:grid-cols-[1.08fr_0.92fr] lg:pb-28">
        <div>
          <p className="hero-kicker inline-flex items-center gap-2 rounded-pill border border-line bg-raised/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-aqua backdrop-blur">
            Quit smoking, one craving at a time
          </p>
          <h1 className="hero-title mt-6 text-[2.7rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">
            <span className="block">You don’t have to</span>
            <span className="block">beat smoking today.</span>
            <span className="mt-3 block text-coral">Just beat the next craving.</span>
          </h1>
          <p className="hero-copy mt-6 max-w-xl text-lg leading-8 text-mist">
            When the urge hits, Swell hands you three minutes of something to do. Play a calm game, watch the wave
            break, and keep score of the cravings that didn’t get you.
          </p>
          <div className="hero-cta mt-8 flex flex-wrap gap-3">
            <Link href="#download" className={buttonVariants({ size: 'lg' })}>
              Get Swell
            </Link>
            <Link href="#demo" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              See how it works
            </Link>
          </div>
          <p className="hero-trust mt-5 text-sm text-hush">Free to start · iOS &amp; Android · Not a medical treatment</p>
        </div>
        <div className="hero-phone">
          <PhoneMockup priority />
        </div>
      </div>
    </section>
  );
}
