import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
const variants = cva(
  'inline-flex items-center justify-between gap-6 min-h-11 px-5 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--paper)]',
        outline: 'border border-[var(--line)] hover:border-[var(--gold)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}
export function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={twMerge(
        clsx(
          variants({ variant, className }),
          variant === 'outline' ? 'outline-button' : 'gold-button',
        ),
      )}
      {...props}
    />
  );
}
