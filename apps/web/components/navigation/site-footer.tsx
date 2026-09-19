import Link from 'next/link';
import { site } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sunken/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-bold text-coral">Swell</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-mist">
            A craving doesn’t last forever. You just need to get through the next few minutes.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hush">Product</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li><Link href="/how-it-works" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/#why" className="hover:text-ink">Why Swell</Link></li>
            <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hush">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li><a href={`mailto:${site.email}`} className="hover:text-ink">Contact</a></li>
            <li><Link href="/quit-smoking" className="hover:text-ink">Quit smoking</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hush">Legal &amp; download</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li><Link href="/privacy" className="hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
            <li><a href={site.appStoreUrl} className="hover:text-ink">App Store</a></li>
            <li><a href={site.playStoreUrl} className="hover:text-ink">Google Play</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line px-5 py-6 text-xs text-hush md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Swell. Not a medical treatment.</p>
        <p>Made for the next three minutes.</p>
      </div>
    </footer>
  );
}
