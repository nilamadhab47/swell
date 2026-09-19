'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function OceanBackdrop() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.blob-a', { y: 26, x: 12, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.blob-b', { y: -22, x: -10, duration: 11, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.blob-c', { scale: 1.08, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }, root);
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      gsap.to(root.current, { x, y, duration: 1.4, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-canvas-top via-canvas to-canvas-warm" />
      <div ref={root} className="absolute inset-0">
        <div className="blob-a absolute -left-24 top-10 h-[380px] w-[380px] rounded-full bg-aqua-bright/25 blur-[90px]" />
        <div className="blob-b absolute right-[-60px] top-24 h-[420px] w-[420px] rounded-full bg-coral/15 blur-[100px]" />
        <div className="blob-c absolute bottom-[-120px] left-1/3 h-[360px] w-[360px] rounded-full bg-sunrise/20 blur-[100px]" />
      </div>
    </div>
  );
}
