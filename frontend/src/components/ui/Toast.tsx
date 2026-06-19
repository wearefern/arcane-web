import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/cn';

type ToastTone = 'success' | 'error' | 'gold';
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

interface ToastCtx {
  toast: (t: { tone?: ToastTone; title: string; body?: string }) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastCtx['toast']>(({ tone = 'gold', title, body }) => {
    const id = ++seq;
    setItems((prev) => [...prev, { id, tone, title, body }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="toast-region" aria-live="polite" aria-atomic="false">
          {items.map((t) => (
            <div key={t.id} className={cn('toast', `toast--${t.tone}`)} role="status">
              {t.tone === 'success' ? <CheckCircle2 /> : t.tone === 'error' ? <AlertTriangle /> : <Info />}
              <div>
                <div className="toast__title">{t.title}</div>
                {t.body && <div className="toast__body">{t.body}</div>}
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook shares the private context with <ToastProvider>
export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { toast: () => {} };
  return ctx;
}
