import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, Loader2 } from 'lucide-react';

import { BACKEND_URL } from '../lib/api';
const BACKEND = BACKEND_URL;

// ─────────────────────────────────────────────────────────────────
// Sentence detection helpers (defined outside the component so the
// useCallback that uses them doesn't need them as a dependency).
// ─────────────────────────────────────────────────────────────────
const drainSentences = (buffer, minLen = 12) => {
  // Returns { sentences: [...], rest: string }
  const out = [];
  const re = /([.!?…]|\n\n)/g;
  let lastIdx = 0;
  let m;
  while ((m = re.exec(buffer)) !== null) {
    const endIdx = m.index + m[0].length;
    const candidate = buffer.slice(lastIdx, endIdx).trim();
    if (candidate.length >= minLen) {
      out.push(candidate);
      lastIdx = endIdx;
    }
  }
  return { sentences: out, rest: buffer.slice(lastIdx) };
};

/**
 * Continuous voice conversation overlay (ChatGPT-Voice style).
 *
 * Latency strategy ("speak as soon as possible"):
 *   1. VAD with aggressive silence threshold (600ms) closes turn fast.
 *   2. Once user finishes speaking, audio goes to STT (Whisper).
 *   3. LLM stream is read token-by-token. As soon as a complete SENTENCE is
 *      formed (ends in . ! ? : … or two newlines, AND has at least 12 chars),
 *      it is dispatched to TTS in the background — the user hears the first
 *      sentence in ~1.5s while the rest of the answer is still being generated.
 *   4. TTS audio chunks are queued and played sequentially with no gap.
 *   5. Barge-in: any voice activity above threshold during 'speaking' aborts
 *      the LLM stream + cancels pending TTS + flushes the audio queue.
 *
 * pt-BR quality: TTS uses tts-1-hd / nova; the system prompt at the API side
 * already enforces pt-BR. Markdown / emojis are stripped on the backend
 * (_sanitize_tts_text) before TTS so we never read literal "asterisco" etc.
 */
export default function VoiceMode({ open, onClose, onTranscript, buildPayloadMessages, sessionId }) {
  const [state, setState] = useState('idle'); // idle | listening | thinking | speaking | error
  const [userPreview, setUserPreview] = useState('');
  const [aiPreview, setAiPreview] = useState('');
  const [level, setLevel] = useState(0);

  // Mic / VAD refs
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const rafRef = useRef(null);
  const recordingRef = useRef(false);
  const speakingStartedAtRef = useRef(0);
  const lastSpeechAtRef = useRef(0);

  // Playback queue for incremental TTS chunks
  const audioElRef = useRef(null);
  const playQueueRef = useRef([]); // [{ url, blob }]
  const ttsAbortsRef = useRef([]); // AbortControllers for in-flight TTS calls
  const turnTokenRef = useRef(0); // increments on barge-in / new turn to invalidate stale TTS

  // LLM stream abort
  const llmAbortRef = useRef(null);
  const stateRef = useRef('idle');

  // VAD tuning
  const RMS_THRESHOLD = 0.016;       // voice presence (slightly lower → catches softer speech)
  const SILENCE_HANG_MS = 600;       // tighter end-of-turn (was 850ms)
  const MIN_SPEECH_MS = 350;
  const BARGE_IN_MIN_MS = 220;       // faster barge-in

  const setSt = useCallback((s) => { stateRef.current = s; setState(s); }, []);

  // ─────────────────────────────────────────────────────────────────
  // Audio queue helpers
  // ─────────────────────────────────────────────────────────────────
  const flushAudioQueue = useCallback(() => {
    if (audioElRef.current) {
      try { audioElRef.current.pause(); } catch { /* */ }
      try { audioElRef.current.src = ''; } catch { /* */ }
      audioElRef.current = null;
    }
    for (const item of playQueueRef.current) {
      try { URL.revokeObjectURL(item.url); } catch { /* */ }
    }
    playQueueRef.current = [];
  }, []);

  const cancelPendingTTS = useCallback(() => {
    for (const ctrl of ttsAbortsRef.current) {
      try { ctrl.abort(); } catch { /* */ }
    }
    ttsAbortsRef.current = [];
  }, []);

  // Plays the next item in the queue, recursively. Resolves when queue empty.
  const playQueueNow = useCallback(() => {
    return new Promise((resolve) => {
      const playNext = () => {
        const item = playQueueRef.current.shift();
        if (!item) { resolve(); return; }
        const el = new Audio(item.url);
        audioElRef.current = el;
        el.onended = () => {
          try { URL.revokeObjectURL(item.url); } catch { /* */ }
          audioElRef.current = null;
          playNext();
        };
        el.onerror = () => {
          try { URL.revokeObjectURL(item.url); } catch { /* */ }
          audioElRef.current = null;
          playNext();
        };
        el.play().catch(() => playNext());
      };
      playNext();
    });
  }, []);

  // Fetch TTS for a given sentence, push into the play queue.
  // Token guards stale callbacks (e.g. from a turn we already barge-in'd).
  const queueTTS = useCallback(async (text, token) => {
    const sanitized = (text || '').trim();
    if (sanitized.length < 2) return;
    const ctrl = new AbortController();
    ttsAbortsRef.current.push(ctrl);
    try {
      const res = await fetch(`${BACKEND}/api/chat/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sanitized.slice(0, 1500), voice: 'nova', speed: 1.0 }),
        credentials: 'include',
        signal: ctrl.signal,
      });
      if (token !== turnTokenRef.current) return;
      if (!res.ok) return;
      const ab = await res.arrayBuffer();
      if (token !== turnTokenRef.current) return;
      const blob = new Blob([ab], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      playQueueRef.current.push({ url, blob });
      // If nothing is currently playing, kick off playback immediately.
      if (!audioElRef.current && stateRef.current !== 'listening') {
        playQueueNow();
      }
    } catch { /* aborted or transient error */ }
  }, [playQueueNow]);

  // ─────────────────────────────────────────────────────────────────
  // Cleanup / lifecycle
  // ─────────────────────────────────────────────────────────────────
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
    flushAudioQueue();
    cancelPendingTTS();
    if (llmAbortRef.current) {
      try { llmAbortRef.current.abort(); } catch { /* */ }
      llmAbortRef.current = null;
    }
  }, [flushAudioQueue, cancelPendingTTS]);

  const closeAll = useCallback(() => {
    cleanup();
    setSt('idle');
    setUserPreview('');
    setAiPreview('');
    setLevel(0);
    onClose?.();
  }, [cleanup, onClose, setSt]);

  // ─────────────────────────────────────────────────────────────────
  // Recording segments
  // ─────────────────────────────────────────────────────────────────
  const startNewSegment = useCallback(() => {
    if (!streamRef.current) return;
    try {
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const rec = mime ? new MediaRecorder(streamRef.current, { mimeType: mime }) : new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data); };
      rec.start(200); // 200ms timeslice → faster final stop()
      mediaRecorderRef.current = rec;
      recordingRef.current = true;
      speakingStartedAtRef.current = 0;
      lastSpeechAtRef.current = 0;
    } catch (e) {
      console.error('rec start err', e);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Sentence-aware streaming TTS while LLM is still generating
  // ─────────────────────────────────────────────────────────────────
  // Use the module-level drainSentences helper (defined above the component).

  const processTurn = useCallback(async () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    setSt('thinking');
    // Bump token: any TTS started before this turn becomes invalid.
    turnTokenRef.current += 1;
    const myToken = turnTokenRef.current;

    try {
      // Stop recorder, await dataavailable
      await new Promise((resolve) => {
        rec.onstop = resolve;
        try { rec.stop(); } catch { resolve(); }
      });
      const blob = new Blob(audioChunksRef.current, { type: rec.mimeType || 'audio/webm' });
      if (blob.size < 1500) {
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
      if (myToken !== turnTokenRef.current) return; // barge-in already happened
      if (!userText) {
        setSt('listening');
        startNewSegment();
        return;
      }
      setUserPreview(userText);
      setAiPreview('');

      // 2) LLM stream + per-sentence TTS dispatch
      llmAbortRef.current = new AbortController();
      const hist = (buildPayloadMessages?.() || []);
      hist.push({ role: 'user', content: userText });

      const sRes = await fetch(`${BACKEND}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: hist, session_id: sessionId || null }),
        credentials: 'include',
        signal: llmAbortRef.current.signal,
      });
      if (!sRes.ok || !sRes.body) throw new Error('stream falhou');

      // Switch to 'speaking' as soon as the first sentence is queued so the
      // VAD treats new voice activity as barge-in (not as new turn).
      let switchedToSpeaking = false;

      const reader = sRes.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let raw = '';
      let full = '';
      let pending = ''; // text not yet sent to TTS

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const lines = raw.split('\n\n');
        raw = lines.pop();
        for (const l of lines) {
          const t = l.trim();
          if (!t.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(t.slice(5).trim());
            if (ev.type === 'delta') {
              full += ev.content;
              pending += ev.content;
              setAiPreview(full);
              const { sentences, rest } = drainSentences(pending);
              if (sentences.length) {
                for (const s of sentences) {
                  if (myToken !== turnTokenRef.current) return;
                  if (!switchedToSpeaking) { setSt('speaking'); switchedToSpeaking = true; }
                  // Fire-and-forget TTS dispatch; queueTTS handles ordering.
                  queueTTS(s, myToken);
                }
                pending = rest;
              }
            } else if (ev.type === 'done') {
              full = ev.content || full;
            }
          } catch { /* ignore */ }
        }
      }
      // Flush remaining pending text (no terminator) as last sentence.
      const tail = pending.trim();
      if (tail.length >= 2 && myToken === turnTokenRef.current) {
        if (!switchedToSpeaking) { setSt('speaking'); switchedToSpeaking = true; }
        queueTTS(tail, myToken);
      }

      // Deliver full transcript to parent
      onTranscript?.(userText, full);

      // Wait for the audio queue to fully drain before going back to listen.
      // (queueTTS already triggers playback as soon as first chunk lands)
      while (myToken === turnTokenRef.current && (audioElRef.current || playQueueRef.current.length > 0 || ttsAbortsRef.current.some(c => !c.signal.aborted))) {
        if (!audioElRef.current && playQueueRef.current.length > 0) {
          await playQueueNow();
        } else {
          await new Promise(r => setTimeout(r, 120));
        }
      }
      if (myToken !== turnTokenRef.current) return;

      setUserPreview('');
      setAiPreview('');
      setSt('listening');
      startNewSegment();
    } catch (e) {
      if (e.name === 'AbortError') {
        setSt('listening');
        setAiPreview('');
        startNewSegment();
      } else {
        console.error('turn err', e);
        setSt('error');
        setTimeout(() => {
          setSt('listening');
          startNewSegment();
        }, 1000);
      }
    }
  }, [buildPayloadMessages, sessionId, onTranscript, queueTTS, playQueueNow, setSt, startNewSegment]);

  // Barge-in: invalidate token, abort everything, restart listening.
  const bargeIn = useCallback(() => {
    turnTokenRef.current += 1; // invalidate all in-flight TTS
    flushAudioQueue();
    cancelPendingTTS();
    if (llmAbortRef.current) {
      try { llmAbortRef.current.abort(); } catch { /* */ }
      llmAbortRef.current = null;
    }
    setSt('listening');
    setAiPreview('');
    startNewSegment();
  }, [flushAudioQueue, cancelPendingTTS, setSt, startNewSegment]);

  // RAF VAD loop
  const tick = useCallback(() => {
    const a = analyserRef.current;
    if (!a) { rafRef.current = requestAnimationFrame(tick); return; }
    const buf = new Uint8Array(a.fftSize);
    a.getByteTimeDomainData(buf);
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
        if (now - lastSpeechAtRef.current > SILENCE_HANG_MS) {
          const duration = lastSpeechAtRef.current - speakingStartedAtRef.current;
          if (duration > MIN_SPEECH_MS) {
            processTurn();
            return;
          } else {
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
