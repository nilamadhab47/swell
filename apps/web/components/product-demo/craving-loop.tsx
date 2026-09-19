'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneMockup } from '@/components/hero/phone-mockup';

const steps = [
  { title: 'A craving hits.', body: 'The urge arrives. You don’t argue with it — you open Swell.', src: '/screens/home.png' },
  { title: 'Give it three minutes.', body: 'Tap “Ride it out.” A calm timer starts and your hands get somewhere to go.', src: '/screens/home.png' },
  { title: 'Play the wave.', body: 'BlockStack is a tiny game with one job: occupy the peak of the craving.', src: '/screens/blockstack.png' },
  { title: 'You made it through.', body: 'The craving broke. That’s a win — counted, never judged.', src: '/screens/victory.png' },
  { title: '+1 on your progress.', body: 'Days clear, money back, a body already repairing itself. Receipts, not lectures.', src: '/screens/wins.png' },
];

export function CravingLoop() {
  const [step, setStep] = useState(0);

  return (
    <section id="demo" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aqua">The loop</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
        Don’t just read about Swell. Walk through a craving.
      </h2>
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
        <ol className="space-y-3">
          {steps.map((item, i) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={step === i}
                className={`w-full rounded-swell border px-5 py-4 text-left transition ${
                  step === i
                    ? 'border-aqua/40 bg-raised shadow-soft'
                    : 'border-line bg-raised/40 hover:bg-raised/70'
                }`}
              >
                <span className="font-display text-xs font-bold text-aqua">0{i + 1}</span>
                <p className="mt-1 text-lg font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-mist">{item.body}</p>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-center">
          <PhoneMockup src={steps[step].src} alt={`Swell — ${steps[step].title}`} />
          <Button className="mt-8" onClick={() => setStep((s) => (s + 1) % steps.length)}>
            {step === steps.length - 1 ? 'Start again' : 'Next moment'}
          </Button>
        </div>
      </div>
    </section>
  );
}
