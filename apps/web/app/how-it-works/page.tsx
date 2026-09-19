import type { Metadata } from 'next';
import { Journey } from '@/components/sections/journey';
import { CravingLoop } from '@/components/product-demo/craving-loop';
import { FinalCta } from '@/components/sections/final-cta';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'How Swell works',
  description:
    'A craving hits, you give it three minutes, you play, you win. See how Swell helps you ride out smoking and vaping urges.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  return (
    <main className="pt-12">
      <div className="mx-auto max-w-6xl px-5 pt-16">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          How Swell works
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-mist">
          The product is a loop, not a program. Open it when the urge arrives. Leave when the wave breaks.
        </p>
      </div>
      <CravingLoop />
      <Journey />
      <FinalCta />
    </main>
  );
}
