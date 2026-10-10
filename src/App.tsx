import { useCallback, useEffect, useState } from 'react';
import {
  AudioLines,
  AlertCircle,
  Copy,
  Check,
  Download,
  Clock,
  Type,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

import { supabase, type Transcription } from '@/lib/supabase';
import { useSpeechRecorder } from '@/hooks/useSpeechRecorder';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RecordButton } from '@/components/RecordButton';
import { HistoryItem } from '@/components/HistoryItem';
import { TranscriptionViewer } from '@/components/TranscriptionViewer';
import { SaveDialog } from '@/components/SaveDialog';
import { EmptyState, NoSelection, NoHistory } from '@/components/EmptyStates';
import { formatDuration, countWords, formatRelativeTime } from '@/lib/format';

export default function App() {
  const [language, setLanguage] = useState('en-US');
  const [history, setHistory] = useState<Transcription[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedLive, setCopiedLive] = useState(false);

  const recorder = useSpeechRecorder(language);
  const {
    status,
    finalText,
    interimText,
    errorMessage,
    elapsedSeconds,
    isSupported,
    start,
    pause,
    resume,
    stop,
    reset,
  } = recorder;

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load history:', error);
    }
    setHistory(data ?? []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const selected = history.find((h) => h.id === selectedId) ?? null;
  const liveWords = countWords(finalText);
  const hasLiveText = finalText.trim().length > 0;
  const showLivePanel = status !== 'idle' || hasLiveText;

  const handleStop = () => {
    stop();
    if (finalText.trim()) {
      setShowSaveDialog(true);
    }
  };

  const handleSave = async (title: string) => {
    const { data, error } = await supabase
      .from('transcriptions')
      .insert({
        title,
        content: finalText,
        language,
        duration_seconds: elapsedSeconds,
        word_count: liveWords,
      })
      .select()
      .single();

    if (error) {
      console.error('Save failed:', error);
      return;
    }

    setShowSaveDialog(false);
    reset();
    await fetchHistory();
    if (data) {
      setSelectedId(data.id);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('transcriptions').delete().eq('id', id);
    if (error) {
      console.error('Delete failed:', error);
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
    }
    await fetchHistory();
  };

  const handleCopyLive = () => {
    navigator.clipboard.writeText(finalText);
    setCopiedLive(true);
    setTimeout(() => setCopiedLive(false), 2000);
  };

  const handleDownloadLive = () => {
    const blob = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* Top bar */}
      <header className="z-40 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-600/20">
            <AudioLines className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">VoiceScribe</h1>
            <p className="hidden text-xs text-slate-400 sm:block">Speech-to-text transcription</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={status === 'recording'}
          />
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-all hover:bg-slate-50"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="flex w-72 flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:w-80">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">History</h2>
              {history.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {history.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {loadingHistory ? (
                <EmptyState />
              ) : history.length === 0 ? (
                <NoHistory />
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      isActive={selectedId === item.id}
                      onSelect={() => setSelectedId(item.id)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {showLivePanel ? (
            /* Live transcription view */
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Recording status bar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-2 text-sm font-medium ${
                      status === 'recording'
                        ? 'text-red-600'
                        : status === 'paused'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {status === 'recording' && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                      </span>
                    )}
                    {status === 'recording'
                      ? 'Recording…'
                      : status === 'paused'
                        ? 'Paused'
                        : 'Recording complete'}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(elapsedSeconds)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Type className="h-3.5 w-3.5" />
                    {liveWords} words
                  </span>
                </div>

                {hasLiveText && status === 'idle' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLive}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      {copiedLive ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedLive ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadLive}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                )}
              </div>

              {/* Transcript area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
                <div className="mx-auto max-w-3xl">
                  {finalText || interimText ? (
                    <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
                      <span>{finalText}</span>
                      <span className="text-slate-400">{interimText}</span>
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <p className="text-base text-slate-400">
                        {status === 'recording'
                          ? 'Listening… start speaking and your words will appear here.'
                          : 'Press the microphone to begin recording.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Record controls */}
              <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-6">
                {errorMessage && (
                  <div className="mx-auto mb-4 flex max-w-2xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="flex justify-center">
                  <RecordButton
                    status={status}
                    hasText={hasLiveText}
                    isSupported={isSupported}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onStop={handleStop}
                    onReset={reset}
                  />
                </div>
              </div>
            </div>
          ) : selected ? (
            /* Saved transcription viewer */
            <div className="flex flex-1 flex-col overflow-hidden bg-white">
              <TranscriptionViewer item={selected} />
              <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-6">
                {errorMessage && (
                  <div className="mx-auto mb-4 flex max-w-2xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="flex justify-center">
                  <RecordButton
                    status={status}
                    hasText={hasLiveText}
                    isSupported={isSupported}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onStop={handleStop}
                    onReset={reset}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Welcome / idle view */
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
                <div className="mb-8 max-w-2xl text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-2xl shadow-teal-600/30">
                    <AudioLines className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-800">
                    Speak. We'll write.
                  </h2>
                  <p className="text-base text-slate-500">
                    Record your voice and get real-time transcription in 16 languages.
                    Save sessions, search through past transcripts, and export with one click.
                  </p>
                </div>

                {/* Feature pills */}
                <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                  {[
                    { icon: 'real-time', label: 'Real-time transcription' },
                    { icon: 'languages', label: '16 languages' },
                    { icon: 'export', label: 'Export to .txt' },
                    { icon: 'save', label: 'Auto-save history' },
                  ].map((f) => (
                    <span
                      key={f.label}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom controls */}
              <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-6">
                {errorMessage && (
                  <div className="mx-auto mb-4 flex max-w-2xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="flex justify-center">
                  <RecordButton
                    status={status}
                    hasText={hasLiveText}
                    isSupported={isSupported}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onStop={handleStop}
                    onReset={reset}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <SaveDialog
        open={showSaveDialog}
        defaultTitle={`Recording — ${formatRelativeTime(new Date().toISOString())}`}
        durationSeconds={elapsedSeconds}
        onSave={handleSave}
        onCancel={() => setShowSaveDialog(false)}
      />
    </div>
  );
}
