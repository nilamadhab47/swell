import type { Metadata, Viewport } from 'next';
import { Rubik, Quicksand } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { JsonLd } from '@/components/json-ld';
import { site } from '@/lib/constants';
import { absoluteUrl } from '@/lib/seo';

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: '%s · Swell',
  },
  description: site.description,
  applicationName: site.name,
  keywords: ['quit smoking', 'smoking cravings', 'stop smoking', 'smoke-free', 'craving support', 'quit vaping'],
  authors: [{ name: 'Swell' }],
  creator: 'Swell',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: absoluteUrl('/') },
  category: 'health',
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 675, alt: 'Swell — beat the next craving' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/icon.png' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#eaf4f8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${quicksand.variable}`}>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <JsonLd />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
