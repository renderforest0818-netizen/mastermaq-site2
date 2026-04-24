import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, Loader2 } from 'lucide-react';

import { BACKEND_URL } from '../lib/api';
const BACKEND = BACKEND_URL;

/**
 * Continuous voice conversation overlay with VAD + STT + TTS + barge-in.
 * - Listens continuously when user is not speaking and model is not playing.
 * - Detects speech start/stop using RMS energy threshold.
 * - When user stops, sends captured audio to /api/chat/stt -> /api/chat/stream -> /api/chat/tts.
 * - Barge-in: if user speaks while TTS is playing, aborts audio + cancels in-flight stream.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onTranscript: (userText, assistantText) => void — called once user+assistant finish
 *   buildPayloadMessages: () => Array<{role, content}>  — full history for stream API
 *   sessionId: string | null
 */
export default function VoiceMode({ open, onClose, onTranscript, buildPayloadMessages, sessionId }) {
  const [state, setState] = useState('idle'); // idle | listening | thinking | speaking | error
  const [userPreview, setUserPreview] = useState('');
  const [aiPreview, setAiPreview] = useState('');
  const [level, setLevel] = useState(0);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const rafRef = useRef(null);

  const recordingRef = useRef(false);
  const speakingStartedAtRef = useRef(0);
  const lastSpeechAtRef = useRef(0);
  const audioElRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const stateRef = useRef('idle');

  // Thresholds / timings
  const RMS_THRESHOLD = 0.018; // voice presence
  const SILENCE_HANG_MS = 850; // how long silence before end-of-turn
  const MIN_SPEECH_MS = 400; // ignore very short blips
  const BARGE_IN_MIN_MS = 250; // require ~250ms of voice to trigger barge-in

  const setSt = useCallback((s) => { stateRef.current = s; setState(s); }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { mediaRecorderRef.current?.stop(); } catch { /* */ }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    recordingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    try { audioCtxRef.current?.close(); } catch { /* */ }
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (audioElRef.current) {
      try { audioElRef.current.pause(); } catch { /* */ }
      audioElRef.current.src = '';
      audioElRef.current = null;
    }
    if (abortCtrlRef.current) {
      try { abortCtrlRef.current.abort(); } catch { /* */ }
      abortCtrlRef.current = null;
    }
  }, []);

  const closeAll = useCallback(() => {
    cleanup();
    setSt('idle');
    setUserPreview('');
    setAiPreview('');
    setLevel(0);
    onClose?.();
  }, [cleanup, onClose, setSt]);

  // Start a new recording segment (MediaRecorder reset + fresh chunks)
  const startNewSegment = useCallback(() => {
    if (!streamRef.current) return;
    try {
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const rec = mime ? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data); };
      rec.start();
      mediaRecorderRef.current = rec;
      recordingRef.current = true;
      speakingStartedAtRef.current = 0;
      lastSpeechAtRef.current = 0;
    } catch (e) {
      console.error('rec start err', e);
    }
  }, []);

  // Send the captured audio through STT -> LLM stream -> TTS
  const processTurn = useCallback(async () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    setSt('thinking');
    try {
      // Stop and await dataavailable
      await new Promise((resolve) => {
        rec.onstop = resolve;
        try { rec.stop(); } catch { resolve(); }
      });
      const blob = new Blob(audioChunksRef.current, { type: rec.mimeType || 'audio/webm' });
      if (blob.size < 1500) {
        // Too small; go back to listening
        setSt('listening');
        startNewSegment();
        return;
      }
      // 1) STT
      const sttForm = new FormData();
      sttForm.append('audio', blob, 'audio.webm');
      const sttRes = await fetch(`${BACKEND}/api/chat/stt`, { method: 'POST', body: sttForm, credentials: 'include' });
      if (!sttRes.ok) throw new Error('STT falhou');
      const sttData = await sttRes.json();
      const userText = (sttData.text || '').trim();
      if (!userText) {
        setSt('listening');
        startNewSegment();
        return;
      }
      setUserPreview(userText);
      setAiPreview('');

      // 2) LLM stream (full response, simpler for TTS)
      abortCtrlRef.current = new AbortController();
      const hist = (buildPayloadMessages?.() || []);
      hist.push({ role: 'user', content: userText });
      const sRes = await fetch(`${BACKEND}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: hist, session_id: sessionId || null }),
        credentials: 'include',
        signal: abortCtrlRef.current.signal,
      });
      if (!sRes.ok || !sRes.body) throw new Error('stream falhou');
      const reader = sRes.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop();
        for (const l of lines) {
          const t = l.trim();
          if (!t.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(t.slice(5).trim());
            if (ev.type === 'delta') { full += ev.content; setAiPreview(full); }
            else if (ev.type === 'done') full = ev.content || full;
          } catch { /* ignore */ }
        }
      }

      // 3) Deliver transcript back to parent (adds to chat log + persist)
      onTranscript?.(userText, full);

      // 4) TTS
      setSt('speaking');
      const ttsRes = await fetch(`${BACKEND}/api/chat/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: full.slice(0, 4000), voice: 'nova', speed: 1.0 }),
        credentials: 'include',
        signal: abortCtrlRef.current.signal,
      });
      if (!ttsRes.ok) throw new Error('TTS falhou');
      const ab = await ttsRes.arrayBuffer();
      const audioBlob = new Blob([ab], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      const el = new Audio(url);
      audioElRef.current = el;
      await new Promise((resolve) => {
        el.onended = resolve;
        el.onerror = resolve;
        el.play().catch(resolve);
      });
      try { URL.revokeObjectURL(url); } catch { /* */ }
      audioElRef.current = null;

      // Back to listening
      setUserPreview('');
      setAiPreview('');
      setSt('listening');
      startNewSegment();
    } catch (e) {
      if (e.name === 'AbortError') {
        // Barge-in: user spoke; just recycle to listening
        setSt('listening');
        setAiPreview('');
        startNewSegment();
      } else {
        console.error('turn err', e);
        setSt('error');
        setTimeout(() => {
          setSt('listening');
          startNewSegment();
        }, 1200);
      }
    }
  }, [buildPayloadMessages, sessionId, onTranscript, setSt, startNewSegment]);

  // Barge-in: when user speaks while model is speaking, stop audio + abort stream.
  const bargeIn = useCallback(() => {
    if (audioElRef.current) {
      try { audioElRef.current.pause(); audioElRef.current.src = ''; } catch { /* */ }
      audioElRef.current = null;
    }
    if (abortCtrlRef.current) {
      try { abortCtrlRef.current.abort(); } catch { /* */ }
      abortCtrlRef.current = null;
    }
    setSt('listening');
    startNewSegment();
  }, [setSt, startNewSegment]);

  // RAF loop for VAD and barge-in detection
  const tick = useCallback(() => {
    const a = analyserRef.current;
    if (!a) { rafRef.current = requestAnimationFrame(tick); return; }
    const buf = new Uint8Array(a.fftSize);
    a.getByteTimeDomainData(buf);
    // Compute RMS in [0..1]
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buf.length);
    setLevel(Math.min(1, rms * 4));
    const now = performance.now();
    const s = stateRef.current;

    // Barge-in detection while speaking
    if (s === 'speaking' && rms > RMS_THRESHOLD) {
      if (!speakingStartedAtRef.current) speakingStartedAtRef.current = now;
      if (now - speakingStartedAtRef.current > BARGE_IN_MIN_MS) {
        bargeIn();
      }
    }

    // Normal VAD during listening
    if (s === 'listening' && recordingRef.current) {
      if (rms > RMS_THRESHOLD) {
        if (!speakingStartedAtRef.current) speakingStartedAtRef.current = now;
        lastSpeechAtRef.current = now;
      } else if (speakingStartedAtRef.current) {
        // silence after some voice
        if (now - lastSpeechAtRef.current > SILENCE_HANG_MS) {
          const duration = lastSpeechAtRef.current - speakingStartedAtRef.current;
          if (duration > MIN_SPEECH_MS) {
            // Cut turn
            processTurn();
            return; // stop tick; processTurn will restart recording and loop
          } else {
            // Reset
            speakingStartedAtRef.current = 0;
            lastSpeechAtRef.current = 0;
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [bargeIn, processTurn]);

  // Start mic on open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const an = ctx.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0.4;
        src.connect(an);
        analyserRef.current = an;
        setSt('listening');
        startNewSegment();
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setSt('error');
      }
    })();
    return () => { cancelled = true; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const stateLabel = {
    listening: 'Ouvindo...',
    thinking: 'Processando...',
    speaking: 'Respondendo...',
    error: 'Erro no microfone',
    idle: 'Preparando...',
  }[state] || 'Preparando...';

  const levelPct = Math.round(level * 100);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white" data-testid="mi-voice-overlay">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/15 border border-white/30">
            <img src="/images/assets/mi-avatar.webp" alt="Mi" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div>
            <div className="font-heading font-semibold text-sm">Voz com a Mi</div>
            <div className="text-[11px] text-blue-100">{stateLabel}</div>
          </div>
        </div>
        <button
          onClick={closeAll}
          className="w-8 h-8 hover:bg-white/15 flex items-center justify-center rounded-md transition-colors"
          aria-label="Fechar modo voz"
          data-testid="mi-voice-close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: visualization + transcripts */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center bg-white gap-6">
        {/* Pulsing orb */}
        <div className="relative w-40 h-40 flex items-center justify-center" data-testid="mi-voice-orb">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-150 ${state === 'speaking' ? 'bg-blue-500/30' : 'bg-blue-500/15'}`}
            style={{
              transform: `scale(${1 + level * 0.6})`,
              filter: 'blur(16px)',
            }}
          />
          <div
            className={`absolute inset-4 rounded-full transition-all duration-150 ${state === 'speaking' ? 'bg-blue-600' : 'bg-blue-500'}`}
            style={{ transform: `scale(${0.9 + level * 0.3})` }}
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
            <img src="/images/assets/mi-avatar.webp" alt="Mi" className="w-full h-full object-cover" draggable={false} />
          </div>
        </div>

        {/* Level bar (thin) */}
        <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-75" style={{ width: `${levelPct}%` }} />
        </div>

        {/* Transcripts */}
        <div className="w-full max-w-[340px] min-h-[88px] space-y-2 text-sm">
          {userPreview && (
            <div className="text-slate-900 line-clamp-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-0.5">Você disse</span>
              "{userPreview}"
            </div>
          )}
          {aiPreview && (
            <div className="text-blue-900 line-clamp-4 italic">
              <span className="text-[10px] uppercase tracking-widest text-blue-400 block mb-0.5 not-italic">Mi</span>
              {aiPreview}
            </div>
          )}
          {!userPreview && !aiPreview && (
            <p className="text-xs text-slate-400">Fale normalmente. A Mi responde quando você faz uma pausa.</p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-slate-200 bg-white p-3 flex items-center justify-center gap-3">
        {state === 'thinking' ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Transcrevendo e pensando...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Mic className={`w-4 h-4 ${state === 'listening' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>{state === 'speaking' ? 'Fale para interromper' : 'Fale quando quiser'}</span>
          </div>
        )}
        <button
          onClick={closeAll}
          className="ml-auto text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
          data-testid="mi-voice-stop"
        >
          Encerrar
        </button>
      </div>
    </div>
  );
}
