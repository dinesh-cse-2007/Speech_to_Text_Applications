import { Check, Clock, Copy, Download, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { getLanguageLabel } from '@/lib/languages';
import { countWords, formatDateFull, formatDuration } from '@/lib/format';
import type { Transcription } from '@/lib/supabase';

interface Props {
  item: Transcription;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function HistoryItem({ item, isActive, onSelect, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const words = countWords(item.content);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete();
  };

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
        isActive
          ? 'border-teal-500 bg-teal-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
          <h3 className="truncate text-sm font-semibold text-slate-800">{item.title}</h3>
        </div>
        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {getLanguageLabel(item.language).split(' ')[0]}
        </span>
      </div>

      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {item.content || '(empty transcript)'}
      </p>

      <div className="mb-3 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(item.duration_seconds)}
        </span>
        <span>{words} words</span>
        <span>{formatDateFull(item.created_at)}</span>
      </div>

      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          <Download className="h-3 w-3" />
          .txt
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            confirmDelete
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Trash2 className="h-3 w-3" />
          {confirmDelete ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
