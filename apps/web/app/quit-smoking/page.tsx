import type { Metadata } from 'next';
import Link from 'next/link';
import { FinalCta } from '@/components/sections/final-cta';
import { pageMetadata } from '@/lib/seo';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = pageMetadata({
  title: 'Quit smoking, one craving at a time',
  description:
    'Quitting smoking is a series of cravings you get through. Swell is a 3-minute interruption for the urge in front of you — not a medical treatment.',
  path: '/quit-smoking',
});

export default function QuitSmokingPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-8 pt-28">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">Quit smoking</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">You don’t quit smoking once. You quit the next craving.</h1>
      <div className="mt-8 space-y-5 text-lg leading-8 text-mist">
        <p>
          Most people experience a cigarette or vape urge as a wall. It is usually a wave: it rises, it peaks, it
          falls. The hard part is having something to do with your hands for those few minutes.
        </p>
        <p>
          Swell is built for that window. It is not a clinic, not nicotine replacement, and not a promise that
          quitting will be easy. It is a calm game and a private score of the cravings that didn’t get you.
        </p>
        <p>
          If you want clinical support, talk to a qualified clinician or an approved cessation program. Swell can
          sit beside that — as the thing you open when the urge is already here.
        </p>
      </div>
      <Link href="/how-it-works" className={`${buttonVariants({ variant: 'ghost' })} mt-8`}>
        See the 3-minute loop
      </Link>
      <div className="mt-16">
        <FinalCta />
      </div>
    </main>
  );
}
