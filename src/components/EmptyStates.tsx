import { Loader2 } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
      <p className="text-sm text-slate-400">Loading your transcriptions…</p>
    </div>
  );
}

export function NoSelection() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
        <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5M12 18.75a6 6 0 01-6-6v-1.5M12 18.75V12m0 0l-3-3m3 3l3-3" />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-700">Select a transcription</h3>
      <p className="max-w-xs text-sm text-slate-400">
        Choose a past recording from the sidebar to view its full transcript, or start a new recording.
      </p>
    </div>
  );
}

export function NoHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500">No saved transcriptions</p>
      <p className="mt-1 text-xs text-slate-400">Record your first speech to see it here.</p>
    </div>
  );
}
