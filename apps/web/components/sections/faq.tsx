import { Accordion } from '@/components/ui/accordion';
import { faqs } from '@/lib/constants';
import Link from 'next/link';

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aqua">FAQ</p>
      <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Straight answers.</h2>
      <div className="mt-10">
        <Accordion items={faqs.slice(0, 5)} />
      </div>
      <p className="mt-6 text-sm text-hush">
        More on the{' '}
        <Link href="/faq" className="font-medium text-aqua underline underline-offset-2">
          full FAQ page
        </Link>
        .
      </p>
    </section>
  );
}
