import { Mic, Pause, Play, Square, RotateCcw } from 'lucide-react';

interface Props {
  status: 'idle' | 'recording' | 'paused' | 'error';
  hasText: boolean;
  isSupported: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function RecordButton({
  status,
  hasText,
  isSupported,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: Props) {
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isActive = isRecording || isPaused;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main record button */}
      <div className="relative">
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />
            <span className="absolute inset-0 animate-pulse rounded-full bg-red-500/20" />
          </>
        )}
        <button
          type="button"
          disabled={!isSupported && status === 'error'}
          onClick={() => {
            if (isRecording) {
              onPause();
            } else if (isPaused) {
              onResume();
            } else {
              onStart();
            }
          }}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 shadow-red-500/30 scale-105'
              : isPaused
                ? 'bg-amber-500 shadow-amber-500/30'
                : 'bg-teal-600 shadow-teal-600/30 hover:scale-105 hover:bg-teal-700'
          }`}
          aria-label={isRecording ? 'Pause recording' : isPaused ? 'Resume recording' : 'Start recording'}
        >
          {isRecording ? (
            <Pause className="h-9 w-9 text-white" fill="white" />
          ) : isPaused ? (
            <Play className="h-9 w-9 text-white" fill="white" />
          ) : (
            <Mic className="h-9 w-9 text-white" />
          )}
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-3">
        {isActive && (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Square className="h-4 w-4" fill="currentColor" />
            Finish & Save
          </button>
        )}
        {hasText && !isActive && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
