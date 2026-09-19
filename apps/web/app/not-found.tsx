import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 pt-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">404</p>
      <h1 className="mt-3 text-4xl font-semibold">This page drifted out.</h1>
      <p className="mt-4 text-mist">The wave you’re looking for isn’t here. Head back to Swell.</p>
      <Link href="/" className={`${buttonVariants()} mx-auto mt-8 w-fit`}>
        Back home
      </Link>
    </main>
  );
}
