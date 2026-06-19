import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
  ReactElement,
} from 'react';
import { useId, isValidElement, cloneElement } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ---- Field wrapper: label + control + helper/error ------------------- */
export function Field({
  label,
  required,
  optional,
  helper,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  optional?: boolean;
  helper?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  // Associate the label with its control automatically. If the caller didn't
  // pass htmlFor and the child has no id, generate one and inject it — so every
  // Field+Input pairing is programmatically labelled without boilerplate.
  const autoId = useId();
  const childId = isValidElement(children) ? (children.props as { id?: string }).id : undefined;
  const controlId = htmlFor ?? childId ?? autoId;
  const feedbackId = `${controlId}-feedback`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{
        id?: string;
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
      }>, {
        ...(!childId ? { id: controlId } : {}),
        ...(error ? { 'aria-invalid': true } : {}),
        ...((error || helper) ? { 'aria-describedby': feedbackId } : {}),
      })
    : children;

  return (
    <div className={cn('field', error && 'field--error', className)}>
      {label && (
        <label className="label" htmlFor={controlId}>
          {label}
          {required && <span className="req" aria-hidden>*</span>}
          {optional && <span className="opt">Optional</span>}
        </label>
      )}
      {control}
      {error ? (
        <span className="error-text" id={feedbackId} role="alert">
          <AlertCircle size={13} /> {error}
        </span>
      ) : (
        helper && <span className="helper" id={feedbackId}>{helper}</span>
      )}
    </div>
  );
}

/* ---- Text input ------------------------------------------------------ */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}
export function Input({ icon, className, ...rest }: InputProps) {
  if (icon) {
    return (
      <span className="input-affix">
        {icon}
        <input className={cn('input', className)} {...rest} />
      </span>
    );
  }
  return <input className={cn('input', className)} {...rest} />;
}

/* ---- Textarea -------------------------------------------------------- */
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('textarea', className)} {...rest} />;
}

/* ---- Select ---------------------------------------------------------- */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <span className="select-wrap">
      <select className={cn('select', className)} {...rest}>
        {children}
      </select>
      <ChevronDown aria-hidden />
    </span>
  );
}

/* ---- Checkbox -------------------------------------------------------- */
export function Checkbox({
  label,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label className={cn('check', className)} htmlFor={inputId}>
      <input type="checkbox" id={inputId} {...rest} />
      <span className="check__box" aria-hidden>
        <Check strokeWidth={3} />
      </span>
      <span>{label}</span>
    </label>
  );
}

/* ---- Switch ---------------------------------------------------------- */
export function Switch({
  label,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label className={cn('switch', className)} htmlFor={inputId}>
      <input type="checkbox" role="switch" id={inputId} {...rest} />
      <span className="switch__track" aria-hidden />
      {label && <span className="meta" style={{ color: 'var(--text-2)' }}>{label}</span>}
    </label>
  );
}
