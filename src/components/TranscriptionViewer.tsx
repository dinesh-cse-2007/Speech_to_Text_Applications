import { useState } from 'react';
import { Copy, Check, Download, Clock, Type } from 'lucide-react';
import { formatDuration, countWords, formatDateFull } from '@/lib/format';
import { getLanguageLabel } from '@/lib/languages';
import type { Transcription } from '@/lib/supabase';

interface Props {
  item: Transcription;
}

export function TranscriptionViewer({ item }: Props) {
  const [copied, setCopied] = useState(false);
  const words = countWords(item.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 px-8 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-xl font-bold text-slate-800">{item.title}</h2>
            <p className="text-sm text-slate-400">{formatDateFull(item.created_at)}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="h-4 w-4 text-slate-400" />
            {formatDuration(item.duration_seconds)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Type className="h-4 w-4 text-slate-400" />
            {words} words
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {getLanguageLabel(item.language)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {item.content ? (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">{item.content}</p>
        ) : (
          <p className="text-sm italic text-slate-400">No transcript content was captured.</p>
        )}
      </div>
    </div>
  );
}
