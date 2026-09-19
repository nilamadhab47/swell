const DEFAULT_SITE_URL = 'https://useswell.site';

/** Treat unset or blank env values as missing (Vercel often sets empty strings). */
function envOrDefault(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export const site = {
  name: 'Swell',
  tagline: 'Three minutes. Then it’s gone.',
  title: 'Swell — Beat Smoking Cravings, One at a Time',
  description:
    'Swell helps you quit smoking or vaping by riding out the next craving. A calm 3-minute game. No lectures. Just a score of the ones that didn’t get you.',
  url: envOrDefault(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL),
  email: 'nilamadhab47@gmail.com',
  appStoreUrl: envOrDefault(process.env.NEXT_PUBLIC_APP_STORE_URL, '#download'),
  playStoreUrl: envOrDefault(process.env.NEXT_PUBLIC_PLAY_STORE_URL, '#download'),
};

export const nav = [
  { href: '/#how', label: 'How it works' },
  { href: '/#why', label: 'Why Swell' },
  { href: '/#ocean', label: 'Progress' },
  { href: '/faq', label: 'FAQ' },
];

export const faqs = [
  {
    q: 'What is Swell?',
    a: 'Swell is a calm app for riding out smoking or vaping cravings. When the urge hits, you open Swell, play a three-minute game, and we keep score of the ones that didn’t get you.',
  },
  {
    q: 'How does the 3-minute craving experience work?',
    a: 'Most urges swell, peak, and fall in a few minutes. Swell gives your hands and head something to do until that wave breaks. It is an interruption, not a lecture.',
  },
  {
    q: 'Is Swell a medical treatment?',
    a: 'No. Swell is a consumer wellness app. It is not a doctor, clinic, or medical device, and it does not diagnose, treat, or cure nicotine dependence. If you need clinical help, talk to a qualified clinician.',
  },
  {
    q: 'Do I need to quit immediately?',
    a: 'No. You only have to get through the craving in front of you. Days clear are a side effect of those small wins, not a test you pass on day one.',
  },
  {
    q: 'Does Swell track my progress?',
    a: 'Yes — privately. Days clear, money reclaimed, and cravings beaten live on your account. Notes and voice reflections are optional.',
  },
  {
    q: 'Is Swell free?',
    a: 'The core loop — open, play, win — is free. We may add optional paid depth later. We will not paywall the moment a craving hits.',
  },
  {
    q: 'What platforms does Swell support?',
    a: 'iOS and Android. App Store and Play Store links will live here as soon as the first build is submitted.',
  },
];
