import type { Metadata } from 'next';
import { FaqJsonLd } from '@/components/json-ld';
import { Accordion } from '@/components/ui/accordion';
import { faqs } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description: 'What Swell is, how the 3-minute craving loop works, platforms, privacy, and what Swell is not.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-28">
      <FaqJsonLd />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">FAQ</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Questions we actually get asked.</h1>
      <p className="mt-4 text-lg leading-8 text-mist">
        Swell is a consumer app. These answers stay honest about that.
      </p>
      <div className="mt-10">
        <Accordion items={faqs} />
      </div>
    </main>
  );
}
