import { faqs, site } from '@/lib/constants';
import { absoluteUrl } from '@/lib/seo';

export function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
      description: site.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      email: site.email,
      logo: absoluteUrl('/icon.png'),
      sameAs: [site.playStoreUrl],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: site.listingName,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Android',
      description: site.description,
      url: site.url,
      downloadUrl: site.playStoreUrl,
      installUrl: site.playStoreUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function FaqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
