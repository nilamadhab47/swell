import { site } from '@/lib/constants';
import { StoreButtons } from './store-buttons';

export function FinalCta() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-swell border border-line bg-gradient-to-br from-canvas-top via-raised to-canvas-warm px-8 py-16 text-center shadow-soft">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aqua-bright/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-coral/15 blur-3xl" aria-hidden />
        <h2 className="relative text-4xl font-bold tracking-tight md:text-5xl">Get through the next one.</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg text-mist">
          Swell is on Google Play. Open it when the craving hits, play for three minutes, and let the wave pass.
        </p>
        <div className="relative mt-8">
          <StoreButtons />
        </div>
        <p className="relative mt-6 text-sm text-hush">
          {site.appStoreUrl ? 'Also on the App Store.' : 'Coming to iOS next.'} Questions? Email {site.email}.
        </p>
      </div>
    </section>
  );
}
