import { site } from '@/lib/constants';
import { buttonVariants } from '@/components/ui/button';

export function StoreButtons({
  align = 'center',
  size = 'lg',
}: {
  align?: 'start' | 'center';
  size?: 'lg' | 'sm' | 'default';
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
      <a
        href={site.playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ size })}
      >
        Get it on Google Play
      </a>
      {site.appStoreUrl ? (
        <a
          href={site.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'ghost', size })}
        >
          App Store
        </a>
      ) : null}
    </div>
  );
}
