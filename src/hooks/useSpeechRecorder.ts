import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSpeechRecognition,
  type ISpeechRecognition,
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent,
} from '@/lib/speech-recognition';

type RecorderStatus = 'idle' | 'recording' | 'paused' | 'error';

export function useSpeechRecorder(lang: string) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTextRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldRunRef = useRef(false);

  const isSupported = getSpeechRecognition() !== null;

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const cleanup = useCallback(() => {
    stopTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    }
    shouldRunRef.current = false;
  }, []);

  const buildRecognition = useCallback((): ISpeechRecognition | null => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return null;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript;
          setFinalText(finalTextRef.current);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser settings.');
        setStatus('error');
        shouldRunRef.current = false;
        stopTimer();
      } else {
        setErrorMessage(`Speech recognition error: ${event.error}`);
        setStatus('error');
        shouldRunRef.current = false;
        stopTimer();
      }
    };

    rec.onend = () => {
      if (shouldRunRef.current) {
        // Browser stopped listening (timeout) — restart if we still want to record
        try {
          rec.start();
        } catch {
          /* will retry on next event */
        }
      }
    };

    return rec;
  }, [lang]);

  const start = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
      setStatus('error');
      return;
    }
    setErrorMessage('');
    setInterimText('');
    if (finalTextRef.current === '') {
      setFinalText('');
      setElapsedSeconds(0);
    }
    shouldRunRef.current = true;
    const rec = buildRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    try {
      rec.start();
      setStatus('recording');
      startTimer();
    } catch {
      setErrorMessage('Failed to start recording. Please try again.');
      setStatus('error');
    }
  }, [buildRecognition, isSupported]);

  const pause = useCallback(() => {
    shouldRunRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* noop */
      }
    }
    stopTimer();
    setInterimText('');
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    setErrorMessage('');
    shouldRunRef.current = true;
    const rec = buildRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    try {
      rec.start();
      setStatus('recording');
      startTimer();
    } catch {
      setErrorMessage('Failed to resume recording.');
      setStatus('error');
    }
  }, [buildRecognition]);

  const stop = useCallback(() => {
    shouldRunRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* noop */
      }
    }
    stopTimer();
    setInterimText('');
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    cleanup();
    shouldRunRef.current = false;
    finalTextRef.current = '';
    setFinalText('');
    setInterimText('');
    setElapsedSeconds(0);
    setErrorMessage('');
    setStatus('idle');
  }, [cleanup]);

  // Rebuild recognition when language changes during pause/idle
  useEffect(() => {
    if (status === 'recording') {
      shouldRunRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* noop */
        }
      }
      stopTimer();
      setInterimText('');
      finalTextRef.current = '';
      setFinalText('');
      setElapsedSeconds(0);
      const rec = buildRecognition();
      if (rec) {
        recognitionRef.current = rec;
        shouldRunRef.current = true;
        try {
          rec.start();
          startTimer();
        } catch {
          /* noop */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
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
  };
}
