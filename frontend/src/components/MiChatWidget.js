import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, X, Send, Minus, Copy, RefreshCw, Square, Trash2, Check, Paperclip, Mic, MicOff, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { toast } from 'sonner';

const STORAGE_KEY = 'mi_chat_messages_v1';
const BACKEND = process.env.REACT_APP_BACKEND_URL;

const DEFAULT_GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: 'Oi! Eu sou a **Mi**, assistente virtual da Mastermaq. Posso te ajudar com agendamento de visita técnica, marcas atendidas, horários ou tirar dúvidas sobre nossos serviços. Como posso te ajudar?',
  timestamp: new Date().toISOString(),
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch { /* ignore */ }
  return null;
}

function saveLocal(messages) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch { /* ignore */ }
}

function uid() { return Math.random().toString(36).slice(2, 11); }

export default function MiChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState(() => loadLocal() || [DEFAULT_GREETING]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null); // server session for logged-in users
  const [copiedId, setCopiedId] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null); // { data_url, name }
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // msgId -> "up"|"down"
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const shouldAutoScroll = useRef(true);

  // Persist to localStorage when messages change (for everyone)
  useEffect(() => { saveLocal(messages); }, [messages]);

  // Create or reuse server session for logged-in users
  useEffect(() => {
    if (!open || !user) return;
    if (sessionId) return;
    API.post('/chat/sessions', { title: 'Nova conversa' })
      .then(({ data }) => setSessionId(data.id))
      .catch(() => { /* ignore */ });
  }, [open, user, sessionId]);

  // Load equipment/brand lists once on first open (for inline schedule widget)
  useEffect(() => {
    if (!open || equipmentTypes.length) return;
    API.get('/equipment/types').then(({ data }) => setEquipmentTypes(data || [])).catch(() => {});
    API.get('/equipment/brands').then(({ data }) => setBrands(data || [])).catch(() => {});
  }, [open, equipmentTypes.length]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    if (shouldAutoScroll.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    shouldAutoScroll.current = nearBottom;
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  // Auto-expand textarea
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const stopStream = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStreaming(false);
  };

  const sendMessage = async (text, { isRegenerate = false } = {}) => {
    const content = (text || '').trim();
    if (!content && !isRegenerate && !attachedImage) return;
    if (streaming) return;

    const imageToSend = attachedImage?.data_url || null;

    let baseMessages = messages;
    if (!isRegenerate) {
      const userMsg = {
        id: uid(), role: 'user', content, timestamp: new Date().toISOString(),
        ...(imageToSend ? { image: imageToSend } : {}),
      };
      baseMessages = [...messages, userMsg];
      setMessages(baseMessages);
      setInput('');
      setAttachedImage(null);
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } else {
      // Remove last assistant message for regeneration
      const lastAssistantIdx = [...baseMessages].reverse().findIndex(m => m.role === 'assistant');
      if (lastAssistantIdx !== -1) {
        baseMessages = baseMessages.slice(0, baseMessages.length - 1 - lastAssistantIdx);
        setMessages(baseMessages);
      }
    }

    shouldAutoScroll.current = true;
    const assistantId = uid();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString(), streaming: true }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = {
        messages: baseMessages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .filter(m => m.id !== 'greeting')
          .map(m => {
            const o = { role: m.role, content: m.content };
            if (m.image) o.image = m.image;
            return o;
          }),
        session_id: user && sessionId ? sessionId : null,
      };
      const res = await fetch(`${BACKEND}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(trimmed.slice(5).trim());
            if (ev.type === 'delta') {
              acc += ev.content;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc } : m));
            } else if (ev.type === 'done') {
              acc = ev.content || acc;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc, streaming: false } : m));
            } else if (ev.type === 'suggest_schedule') {
              // Inject a widget message right after assistant message
              const widgetId = uid();
              setMessages(prev => {
                const already = prev.some(m => m.role === 'widget');
                if (already) return prev; // avoid duplicates
                return [...prev, {
                  id: widgetId, role: 'widget', widget: 'schedule',
                  equipment: ev.equipment || '', brand: ev.brand || '',
                  timestamp: new Date().toISOString(),
                }];
              });
            } else if (ev.type === 'error') {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Desculpe, tive um erro ao responder. Tente novamente em instantes.', streaming: false, error: true } : m));
            }
          } catch { /* ignore parse errors */ }
        }
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m));
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false, content: m.content || '_Resposta interrompida_' } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false, content: 'Desculpe, não consegui conectar ao servidor. Verifique sua conexão.', error: true } : m));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([DEFAULT_GREETING]);
    setSessionId(null);
    if (user) {
      API.post('/chat/sessions', { title: 'Nova conversa' })
        .then(({ data }) => setSessionId(data.id))
        .catch(() => {});
    }
  };

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const regenerate = () => {
    // Find last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    sendMessage(null, { isRegenerate: true });
  };

  // -------- Upload image --------
  const onPickFile = () => fileInputRef.current?.click();

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset to allow re-pick same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (limite 5MB).');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${BACKEND}/api/chat/upload`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAttachedImage({ data_url: data.data_url, name: file.name });
    } catch (err) {
      toast.error('Falha no upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => setAttachedImage(null);

  // -------- Voice recording (STT) --------
  const startRecording = async () => {
    if (recording || transcribing || streaming) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Seu navegador nao suporta gravacao de audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      audioChunksRef.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data); };
      rec.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: rec.mimeType || 'audio/webm' });
        audioStreamRef.current?.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
        if (blob.size < 1000) {
          toast.error('Audio muito curto.');
          return;
        }
        setTranscribing(true);
        try {
          const fd = new FormData();
          fd.append('audio', blob, 'audio.webm');
          const res = await fetch(`${BACKEND}/api/chat/stt`, { method: 'POST', body: fd, credentials: 'include' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const text = (data.text || '').trim();
          if (!text) {
            toast.error('Nao consegui entender. Tente novamente.');
          } else {
            setInput(prev => prev ? (prev + ' ' + text) : text);
            setTimeout(() => { if (inputRef.current) { inputRef.current.focus(); autoResize(inputRef.current); } }, 50);
          }
        } catch {
          toast.error('Falha na transcricao.');
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      setRecording(true);
    } catch {
      toast.error('Permissao de microfone negada.');
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    setRecording(false);
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
  };

  // -------- Feedback 👍👎 --------
  const sendFeedback = async (msg, rating) => {
    if (feedbackGiven[msg.id]) return;
    setFeedbackGiven(prev => ({ ...prev, [msg.id]: rating }));
    // Find user message right before this assistant message
    const idx = messages.findIndex(m => m.id === msg.id);
    const userBefore = idx > 0 ? [...messages.slice(0, idx)].reverse().find(m => m.role === 'user') : null;
    try {
      await fetch(`${BACKEND}/api/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          session_id: sessionId || null,
          message_idx: idx,
          rating,
          user_text: userBefore?.content || '',
          assistant_text: msg.content || '',
        }),
      });
      toast.success(rating === 'up' ? 'Obrigada pelo feedback!' : 'Obrigada, vamos melhorar.');
    } catch {
      // silent
    }
  };

  // -------- Inline scheduling (creates OS from within chat) --------
  const submitScheduleFromChat = async (widgetId, data) => {
    // data: { equipment, brand, service_type, warranty_status, defect_description, model }
    if (!user) {
      // Replace widget with info message
      setMessages(prev => prev.map(m => m.id === widgetId ? { ...m, widget: 'need-login' } : m));
      return { ok: false, needLogin: true };
    }
    try {
      const { data: os } = await API.post('/service-orders', {
        equipment_type: data.equipment,
        brand: data.brand,
        service_type: data.service_type || 'conserto',
        model: data.model || '',
        serial_number: '',
        warranty_status: data.warranty_status || 'fora',
        defect_description: data.defect_description || '',
      });
      // Replace the widget with a "done" state and append a success bubble from Mi
      setMessages(prev => prev
        .map(m => m.id === widgetId ? { ...m, widget: 'done', os: os.os_number } : m)
        .concat([{
          id: uid(),
          role: 'assistant',
          content: `Pronto! Criei sua OS **${os.os_number}** com status **${os.status || 'aguardando confirmação'}**. Nossa equipe vai entrar em contato pelo telefone cadastrado. Você pode acompanhar pelo [seu portal](/minha-conta).`,
          timestamp: new Date().toISOString(),
        }])
      );
      return { ok: true, os };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Erro ao criar OS';
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar OS');
      return { ok: false };
    }
  };

  const dismissWidget = (widgetId) => {
    setMessages(prev => prev.filter(m => m.id !== widgetId));
  };

  // -------- UI --------
  const fabOpen = open && !minimized;

  return (
    <>
      {/* Floating FAB */}
      {!fabOpen && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center group mi-fab"
          style={{ borderRadius: '14px' }}
          aria-label="Abrir chat Mi"
          data-testid="mi-fab"
        >
          <Sparkles className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12 mi-sparkle" />
          {minimized && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}

      {/* Chat modal */}
      {fabOpen && (
        <div
          className="fixed z-[60] bg-white border border-slate-200 shadow-2xl flex flex-col mi-chat-modal"
          style={{
            bottom: '24px',
            right: '24px',
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 48px))',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
          data-testid="mi-chat-modal"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 mi-sparkle" />
              </div>
              <div>
                <div className="font-heading font-semibold text-sm leading-tight" style={{ letterSpacing: '0.02em' }}>Mi</div>
                <div className="text-[11px] text-blue-100 leading-tight">Assistente Mastermaq</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearConversation}
                className="w-8 h-8 hover:bg-white/15 flex items-center justify-center rounded-md transition-colors"
                aria-label="Nova conversa"
                title="Nova conversa"
                data-testid="mi-clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMinimized(true)}
                className="w-8 h-8 hover:bg-white/15 flex items-center justify-center rounded-md transition-colors"
                aria-label="Minimizar"
                data-testid="mi-minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setOpen(false); setMinimized(false); }}
                className="w-8 h-8 hover:bg-white/15 flex items-center justify-center rounded-md transition-colors"
                aria-label="Fechar"
                data-testid="mi-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto px-4 py-4 bg-white space-y-3 mi-scroll"
            data-testid="mi-messages"
          >
            {messages.map((m) => {
              if (m.role === 'widget') {
                return (
                  <ScheduleCard
                    key={m.id}
                    widget={m}
                    equipmentTypes={equipmentTypes}
                    brands={brands}
                    loggedIn={!!user}
                    onSubmit={(data) => submitScheduleFromChat(m.id, data)}
                    onDismiss={() => dismissWidget(m.id)}
                  />
                );
              }
              return (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  copied={copiedId === m.id}
                  onCopy={() => copyMessage(m.id, m.content)}
                  feedback={feedbackGiven[m.id]}
                  onFeedback={(r) => sendFeedback(m, r)}
                />
              );
            })}
            {streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
              <div className="flex items-start gap-2 mi-msg-enter">
                <div className="px-3 py-2 bg-blue-50 text-blue-900 text-sm" style={{ borderRadius: '12px 12px 12px 2px' }}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Actions row */}
          {!streaming && messages.length > 1 && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="px-3 py-1.5 border-t border-slate-100 flex items-center gap-1 bg-slate-50">
              <button
                onClick={regenerate}
                className="text-[11px] text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 px-2 py-1 hover:bg-white rounded transition-colors"
                data-testid="mi-regenerate"
              >
                <RefreshCw className="w-3 h-3" /> Regenerar
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            {/* Attached image preview */}
            {attachedImage && (
              <div className="mb-2 relative inline-block">
                <img src={attachedImage.data_url} alt="anexo" className="h-14 w-14 object-cover rounded border border-slate-200" />
                <button
                  onClick={removeAttachment}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Remover imagem"
                  data-testid="mi-attachment-remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelected}
                className="hidden"
                data-testid="mi-file-input"
              />
              <button
                type="button"
                onClick={onPickFile}
                disabled={streaming || uploading || recording || transcribing}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: '8px' }}
                aria-label="Anexar imagem"
                title="Anexar imagem"
                data-testid="mi-attach"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                disabled={streaming || uploading || transcribing}
                className={`w-9 h-9 flex-shrink-0 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${recording ? 'bg-red-600 text-white hover:bg-red-700 mi-recording' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'}`}
                style={{ borderRadius: '8px' }}
                aria-label={recording ? 'Parar gravacao' : 'Gravar audio'}
                title={recording ? 'Parar gravacao' : 'Falar com a Mi'}
                data-testid="mi-mic"
              >
                {transcribing ? <RefreshCw className="w-4 h-4 animate-spin" /> : (recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />)}
              </button>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
                onKeyDown={handleKeyDown}
                placeholder={recording ? 'Gravando audio...' : (transcribing ? 'Transcrevendo...' : 'Digite sua mensagem...')}
                className="flex-1 resize-none border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm px-3 py-2 placeholder:text-slate-400"
                style={{ borderRadius: '10px', maxHeight: '120px', lineHeight: '1.4' }}
                disabled={streaming || recording || transcribing}
                data-testid="mi-input"
              />
              {streaming ? (
                <button
                  onClick={stopStream}
                  className="w-10 h-10 flex-shrink-0 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
                  style={{ borderRadius: '10px' }}
                  aria-label="Parar"
                  data-testid="mi-stop"
                >
                  <Square className="w-4 h-4" fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() && !attachedImage}
                  className="w-10 h-10 flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                  style={{ borderRadius: '10px' }}
                  aria-label="Enviar"
                  data-testid="mi-send"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 px-1">
              Mi pode cometer erros. Para agendar, use o botão "Agendar Visita Técnica".
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ msg, copied, onCopy, feedback, onFeedback }) {
  const isUser = msg.role === 'user';
  const isAssistant = msg.role === 'assistant';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mi-msg-enter`}>
      <div className={`max-w-[85%] group relative ${isUser ? 'order-2' : ''}`}>
        {/* User image attachment preview */}
        {isUser && msg.image && (
          <img
            src={msg.image}
            alt="anexo"
            className="mb-1 max-h-44 w-auto rounded border border-slate-200 block ml-auto"
            style={{ maxWidth: '100%' }}
          />
        )}
        <div
          className={
            isUser
              ? 'bg-slate-900 text-white text-sm px-3.5 py-2.5 leading-relaxed'
              : (msg.error
                ? 'bg-red-50 text-red-900 text-sm px-3.5 py-2.5 leading-relaxed border border-red-200'
                : 'bg-blue-50 text-blue-900 text-sm px-3.5 py-2.5 leading-relaxed')
          }
          style={{
            borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            wordBreak: 'break-word',
          }}
        >
          {isAssistant ? (
            <div className="mi-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content || '\u200b'}
              </ReactMarkdown>
              {msg.streaming && <span className="mi-cursor">▋</span>}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{msg.content || (msg.image ? '_(imagem)_' : '')}</div>
          )}
        </div>
        {isAssistant && !msg.streaming && msg.content && msg.id !== 'greeting' && (
          <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => onFeedback?.('up')}
              disabled={!!feedback}
              className={`bg-white border border-slate-200 p-1 shadow-sm transition-colors ${feedback === 'up' ? 'text-green-600 border-green-400' : 'text-slate-500 hover:text-green-600'}`}
              style={{ borderRadius: '6px' }}
              aria-label="Resposta util"
              data-testid="mi-feedback-up"
              title="Resposta util"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onFeedback?.('down')}
              disabled={!!feedback}
              className={`bg-white border border-slate-200 p-1 shadow-sm transition-colors ${feedback === 'down' ? 'text-red-600 border-red-400' : 'text-slate-500 hover:text-red-600'}`}
              style={{ borderRadius: '6px' }}
              aria-label="Resposta ruim"
              data-testid="mi-feedback-down"
              title="Resposta ruim"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
            <button
              onClick={onCopy}
              className="bg-white border border-slate-200 text-slate-500 hover:text-blue-600 p-1 shadow-sm"
              style={{ borderRadius: '6px' }}
              aria-label="Copiar"
              data-testid="mi-copy"
              title="Copiar"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="digitando">
      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mi-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mi-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mi-dot" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

const AUTHORIZED_BRANDS_SET = new Set(["HQ", "Franke", "Hisense", "Gorenje", "Bertazzoni", "Lofra", "Panasonic", "Liebherr"]);

function ScheduleCard({ widget, equipmentTypes, brands, loggedIn, onSubmit, onDismiss }) {
  const [equipment, setEquipment] = useState(widget.equipment || '');
  const [brand, setBrand] = useState(widget.brand || '');
  const [serviceType, setServiceType] = useState('conserto');
  const [warranty, setWarranty] = useState('fora');
  const [defect, setDefect] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const NO_INSTALL = new Set(['geladeiras', 'ar-condicionado-portatil', 'lava-e-seca', 'lavadoras']);
  const canInstall = equipment && !NO_INSTALL.has(equipment);
  const canWarranty = brand && AUTHORIZED_BRANDS_SET.has(brand);

  // Done state
  if (widget.widget === 'done') {
    return (
      <div className="flex justify-start mi-msg-enter">
        <div className="max-w-[92%] bg-green-50 border border-green-200 text-green-900 text-sm px-4 py-3" style={{ borderRadius: '12px 12px 12px 2px' }}>
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-green-600" />
            OS <span className="font-mono font-semibold">{widget.os}</span> criada
          </div>
        </div>
      </div>
    );
  }

  // Need login state
  if (widget.widget === 'need-login') {
    return (
      <div className="flex justify-start mi-msg-enter">
        <div className="max-w-[92%] bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 space-y-2" style={{ borderRadius: '12px 12px 12px 2px' }}>
          <div className="font-medium">Quase lá! Preciso te conhecer para criar a OS.</div>
          <div className="text-[12px] text-amber-800/80">Faça login ou cadastre-se rapidinho e volta aqui para finalizar.</div>
          <div className="flex gap-2 pt-1">
            <a href="/login" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 transition-colors" style={{ borderRadius: '8px' }} data-testid="widget-login">Entrar</a>
            <a href="/cadastro" className="flex-1 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs py-1.5 px-3 transition-colors" style={{ borderRadius: '8px' }} data-testid="widget-register">Criar conta</a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!equipment || !brand) return;
    setSubmitting(true);
    await onSubmit({
      equipment, brand,
      service_type: serviceType,
      warranty_status: warranty,
      defect_description: defect.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div className="flex justify-start mi-msg-enter" data-testid="mi-schedule-card">
      <div className="max-w-[92%] bg-white border border-blue-200 shadow-sm text-slate-900 text-sm px-4 py-3 space-y-2.5" style={{ borderRadius: '12px 12px 12px 2px' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center" style={{ borderRadius: '6px' }}>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="font-heading font-semibold text-sm text-slate-900 leading-tight">Pré-agendamento rápido</div>
        </div>
        <p className="text-[12px] text-slate-500 leading-snug">Me conte o básico e eu já abro a OS pra você.</p>

        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Equipamento</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full border border-slate-300 focus:border-blue-500 outline-none text-sm py-1.5 px-2 bg-white"
              style={{ borderRadius: '6px' }}
              data-testid="widget-equipment"
            >
              <option value="">Selecione...</option>
              {(equipmentTypes || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Marca</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-slate-300 focus:border-blue-500 outline-none text-sm py-1.5 px-2 bg-white"
              style={{ borderRadius: '6px' }}
              data-testid="widget-brand"
            >
              <option value="">Selecione...</option>
              {(brands || []).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Serviço</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 outline-none text-sm py-1.5 px-2 bg-white"
                style={{ borderRadius: '6px' }}
                data-testid="widget-service-type"
              >
                <option value="conserto">Conserto</option>
                <option value="instalacao" disabled={!canInstall}>Instalação{!canInstall && ' (N/D)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Garantia</label>
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 outline-none text-sm py-1.5 px-2 bg-white"
                style={{ borderRadius: '6px' }}
                data-testid="widget-warranty"
              >
                <option value="fora">Fora da garantia</option>
                <option value="dentro" disabled={!canWarranty}>Dentro{!canWarranty && ' (marca não autorizada)'}</option>
                <option value="nao-sei">Não sei</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Defeito (opcional)</label>
            <textarea
              rows={2}
              value={defect}
              onChange={(e) => setDefect(e.target.value)}
              placeholder="Ex.: não está gelando, faz barulho..."
              className="w-full border border-slate-300 focus:border-blue-500 outline-none text-sm py-1.5 px-2 resize-none"
              style={{ borderRadius: '6px' }}
              data-testid="widget-defect"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onDismiss}
            className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5"
            data-testid="widget-dismiss"
          >
            Agora não
          </button>
          <button
            onClick={handleSubmit}
            disabled={!equipment || !brand || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-medium py-1.5 px-3 transition-colors inline-flex items-center justify-center gap-1.5"
            style={{ borderRadius: '6px' }}
            data-testid="widget-submit"
          >
            {submitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            {loggedIn ? (submitting ? 'Criando OS...' : 'Criar OS') : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

