import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'gold' | 'ghost' | 'quiet' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/** Compose button classes — handy for React Router <Link className={buttonClass(...)}>. */
export function buttonClass(variant: Variant = 'ghost', size: Size = 'md', extra?: string): string {
  return cn(
    'btn',
    `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    size === 'lg' && 'btn--lg',
    extra,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  pill?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  block,
  pill,
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClass(variant, size), block && 'btn--block', pill && 'btn--pill', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden />}
      {children}
    </button>
  );
}
