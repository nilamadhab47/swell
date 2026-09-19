import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-pill font-display text-[15px] font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        coral:
          'bg-coral text-white shadow-[0_16px_34px_-16px_rgba(240,74,47,0.85)] hover:bg-coral-pressed hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'border border-line bg-raised text-ink shadow-soft hover:border-aqua/40 hover:-translate-y-0.5',
        aqua: 'bg-aqua text-white hover:opacity-90 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-12 px-6',
        lg: 'h-14 px-8 text-base',
        sm: 'h-10 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'coral', size: 'default' },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
