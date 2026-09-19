import type { MetadataRoute } from 'next';
import { site } from '@/lib/constants';

const routes = ['/', '/how-it-works', '/quit-smoking', '/faq', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${site.url}${path === '/' ? '' : path}`,
    lastModified: new Date('2026-09-19'),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
