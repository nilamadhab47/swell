import type { Metadata } from 'next';
import { site } from './constants';

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString();
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website',
      images: [{ url: absoluteUrl('/og.png'), width: 1200, height: 675, alt: 'Swell — beat the next craving' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/og.png')],
    },
  };
}
