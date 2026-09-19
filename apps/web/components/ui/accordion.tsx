'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-swell border border-line bg-raised shadow-soft">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg font-semibold text-ink"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-aqua transition-transform', isOpen && 'rotate-180')} />
              </button>
            </h3>
            <div hidden={!isOpen} className="px-6 pb-6 text-[15px] leading-7 text-mist">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
