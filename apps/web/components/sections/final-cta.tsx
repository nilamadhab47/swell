import { site } from '@/lib/constants';
import { buttonVariants } from '@/components/ui/button';

export function FinalCta() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-swell border border-line bg-gradient-to-br from-canvas-top via-raised to-canvas-warm px-8 py-16 text-center shadow-soft">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aqua-bright/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-coral/15 blur-3xl" aria-hidden />
        <h2 className="relative text-4xl font-bold tracking-tight md:text-5xl">Get through the next one.</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg text-mist">
          Swell is coming to iOS and Android. Leave the craving with something better to do.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a href={site.appStoreUrl} className={buttonVariants({ size: 'lg' })}>
            App Store
          </a>
          <a href={site.playStoreUrl} className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
            Google Play
          </a>
        </div>
        <p className="relative mt-6 text-sm text-hush">
          Store links are placeholders until the first public build. Email {site.email} for early access.
        </p>
      </div>
    </section>
  );
}
