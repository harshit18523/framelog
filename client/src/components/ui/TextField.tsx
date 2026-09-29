import React, { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  prefix?: string;
  trailing?: React.ReactNode;
  labelAction?: React.ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
{ label, error, hint, prefix, trailing, labelAction, className, id, ...rest },
ref)
{
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={inputId} className="text-[13px] font-medium text-fg-muted">
          {label}
        </label>
        {labelAction}
      </div>
      <div
        className={twMerge(
          'flex h-12 items-center rounded-xl bg-white/[0.04] ring-1 ring-inset transition-[box-shadow,background-color] duration-150 focus-within:bg-white/[0.06]',
          error ? 'ring-red-400/60' : 'ring-line-strong focus-within:ring-gold/60'
        )}>
        
        {prefix && <span className="select-none pl-4 text-[15px] text-fg-faint">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={twMerge(
            'h-full min-w-0 flex-1 bg-transparent text-[15px] text-fg placeholder:text-fg-faint focus:outline-none',
            prefix ? 'pl-0.5 pr-4' : 'px-4'
          )}
          {...rest} />
        
        {trailing && <div className="pr-2">{trailing}</div>}
      </div>
      {error ?
      <p id={`${inputId}-error`} className="mt-2 text-[13px] text-red-300">
          {error}
        </p> :
      hint ?
      <div id={`${inputId}-hint`} className="mt-2 text-[13px] text-fg-subtle">
          {hint}
        </div> :
      null}
    </div>);

});