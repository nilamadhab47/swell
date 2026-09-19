'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { nav } from '@/lib/constants';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-line bg-canvas/75 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.5rem]">
        <Link href="/" className="font-display text-2xl font-bold text-coral" aria-label="Swell home">
          Swell
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-mist md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link href="#download" className={buttonVariants({ size: 'sm' })}>
            Get Swell
          </Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line bg-raised text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-canvas px-5 py-6 md:hidden">
          <nav className="flex flex-col gap-2 text-lg" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 hover:bg-sunken"
              >
                {item.label}
              </Link>
            ))}
            <Link href="#download" className={cn(buttonVariants(), 'mt-3')} onClick={() => setOpen(false)}>
              Get Swell
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
