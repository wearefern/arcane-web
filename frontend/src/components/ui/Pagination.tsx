import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  const items: (number | '…')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push('…');
    items.push(p);
  });

  return (
    <nav className="pager" aria-label="Pagination">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`g${i}`} className="meta" style={{ paddingInline: 4 }}>
            …
          </span>
        ) : (
          <button
            key={it}
            className={cn(it === page && 'is-active')}
            aria-current={it === page ? 'page' : undefined}
            onClick={() => onChange(it)}
          >
            {it}
          </button>
        ),
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
