import { LANGUAGES } from '@/lib/languages';
import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = LANGUAGES.find((l) => l.code === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Globe className="h-4 w-4 text-slate-400" />
        <span>{selected?.label ?? value}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                lang.code === value ? 'bg-teal-50 font-medium text-teal-700' : 'text-slate-600'
              }`}
            >
              <span className="flex h-6 w-8 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
                {lang.flag}
              </span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
