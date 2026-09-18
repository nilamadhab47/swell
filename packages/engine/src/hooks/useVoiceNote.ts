import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export type VoiceState = 'idle' | 'recording' | 'transcribing';

const MOCK_TRANSCRIPT =
  'After lunch, stressed at work. (Mock transcript — ElevenLabs later.)';

export function useVoiceNote() {
  const [state, setState] = useState<VoiceState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const stopTick = useCallback(() => {
    clearTick();
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    tickRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 100);
  }, []);

  const start = useCallback(async () => {
    if (state !== 'idle') return;
    setUri(null);
    startTick();
    setState('recording');

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
    } catch {
      // Simulator / denied mic: keep the UI timer running as a mock take.
      recordingRef.current = null;
    }
  }, [state, startTick]);

  const stop = useCallback(async (): Promise<string> => {
    stopTick();
    setState('transcribing');

    let recordedUri: string | null = null;
    try {
      const rec = recordingRef.current;
      if (rec) {
        await rec.stopAndUnloadAsync();
        recordedUri = rec.getURI();
        recordingRef.current = null;
      }
    } catch {
      recordedUri = null;
    }

    setUri(recordedUri);

    await new Promise((resolve) => setTimeout(resolve, 900));
    setState('idle');
    return MOCK_TRANSCRIPT;
  }, [stopTick]);

  useEffect(() => {
    return () => {
      clearTick();
      const rec = recordingRef.current;
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  return { state, elapsedMs, uri, start, stop };
}

export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
