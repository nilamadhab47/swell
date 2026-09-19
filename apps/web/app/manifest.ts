import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Swell',
    short_name: 'Swell',
    description: 'Beat the next smoking craving in three minutes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#eaf4f8',
    theme_color: '#eaf4f8',
    icons: [
      { src: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { src: '/icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
  };
}
