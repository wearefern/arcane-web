import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ScrollGlowSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode;
}

export function ScrollGlowSection({ children, className, ...rest }: ScrollGlowSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.22, rootMargin: '-4% 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={cn('cosmic-section', visible && 'is-visible', className)} {...rest}>
      <div className="cosmic-section__content">{children}</div>
    </section>
  );
}
