import { useEffect, useRef, useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  defaultTitle: string;
  durationSeconds: number;
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
}

export function SaveDialog({ open, defaultTitle, durationSeconds, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultTitle]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(title.trim() || defaultTitle);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
              <Save className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Save Transcription</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-600">Title</label>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancel();
          }}
          className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          placeholder="Untitled transcription"
        />

        <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Duration: {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
