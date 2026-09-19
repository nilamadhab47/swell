import type { ReactNode } from 'react';

export function LegalArticle({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="legal mx-auto max-w-3xl px-5 pb-24 pt-28">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">{kicker}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="legal-body mt-8 space-y-5 text-[17px] leading-8 text-mist [&_a]:text-aqua [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
