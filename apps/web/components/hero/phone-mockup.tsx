'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function PhoneMockup({
  src = '/screens/home.png',
  alt = 'Swell app home screen showing days clear and the ride-it-out button',
  className,
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn('relative mx-auto w-[248px] sm:w-[280px]', className)}>
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-aqua-bright/20 blur-3xl" />
      <div className="rounded-[2.6rem] border border-white/70 bg-white p-2.5 shadow-swell ring-1 ring-black/5">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-canvas">
          <Image src={src} alt={alt} fill sizes="280px" className="object-cover" priority={priority} />
        </div>
      </div>
    </div>
  );
}
