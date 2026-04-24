import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, History, UserCog, Plus, Clock, CheckCircle2, Loader, AlertCircle, MessageCircle, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import SchedulingModal from '@/components/SchedulingModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const STATUS_MAP = {
  "Aguardando Análise A.T":  { label: 'Aguardando Análise A.T',  icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  "Aberta Call-Center":     { label: 'Aberta Call-Center',     icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  aguardando_confirmacao:   { label: 'Aguardando Análise A.T', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  em_andamento:             { label: 'Em Andamento',           icon: Loader, color: 'bg-blue-100 text-blue-800' },
  "Em Andamento":           { label: 'Em Andamento',           icon: Loader, color: 'bg-blue-100 text-blue-800' },
  concluido:                { label: 'Concluído',              icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  "Concluído":              { label: 'Concluído',              icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  cancelado:                { label: 'Cancelado',              icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  "Cancelado":              { label: 'Cancelado',              icon: AlertCircle, color: 'bg-red-100 text-red-800' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status || 'Aguardando Análise A.T', icon: Clock, color: 'bg-yellow-100 text-yellow-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${s.color}`} data-testid={`status-${status}`}>
      <s.icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

function OrderCard({ order }) {
  return (
    <div className="bg-white border border-slate-200 p-5 hover:shadow-md transition-shadow" data-testid={`order-${order.os_number}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-sm font-semibold text-blue-600">{order.os_number}</span>
        <StatusBadge status={order.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Produto</span>
          <p className="text-slate-700">{order.equipment_type}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Marca</span>
          <p className="text-slate-700">{order.brand}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Serviço</span>
          <p className="text-slate-700 capitalize">{order.service_type}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Data</span>
          <p className="text-slate-700">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      {order.defect_description && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Defeito</span>
          <p className="text-sm text-slate-600 mt-0.5">{order.defect_description}</p>
        </div>
      )}
    </div>
  );
}

export default function PortalPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || '', phone: user.phone || '', cep: user.cep || '', address: user.address || '', number: user.number || '', neighborhood: user.neighborhood || '', city: user.city || '', state: user.state || '' });
    let cancelled = false;
    const refreshOrders = () => {
      API.get('/service-orders')
        .then(({ data }) => { if (!cancelled) setOrders(data); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoadingOrders(false); });
    };
    // Initial load + periodic polling so that status updates pushed by the
    // external system (via the /external/webhook/status endpoint) become
    // visible without the user having to refresh the page.
    refreshOrders();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') refreshOrders();
    }, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') refreshOrders(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const formatCep = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  const lookupCep = async (cep) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const { data } = await API.get(`/cep/${clean}`);
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      setProfile(p => ({
        ...p,
        address: data.logradouro || p.address,
        neighborhood: data.bairro || p.neighborhood,
        city: data.localidade || p.city,
        state: data.uf || p.state,
      }));
      toast.success('Endereço preenchido');
    } catch {
      toast.error('Não foi possivel buscar o CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const onCepChange = (v) => {
    const formatted = formatCep(v);
    setProfile(p => ({ ...p, cep: formatted }));
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) lookupCep(formatted);
  };

  const activeOrders = orders.filter(o => o.status !== 'concluido' && o.status !== 'cancelado');
  const historyOrders = orders.filter(o => o.status === 'concluido' || o.status === 'cancelado');

  return (
    <div className="py-16 sm:py-24" data-testid="portal-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900" data-testid="portal-welcome">
                Olá, {user?.name || 'Cliente'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Gerencie suas ordens de serviço e dados cadastrais.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-red-600 text-white hover:bg-red-700 text-sm hidden sm:flex"
                data-testid="new-order-btn"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Novo Agendamento
              </Button>
              <Button
                variant="outline"
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm border-slate-200 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                data-testid="portal-logout-btn"
              >
                Sair
              </Button>
            </div>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="w-full sm:w-auto bg-slate-100 p-1" data-testid="portal-tabs">
              <TabsTrigger value="orders" className="text-sm gap-1.5" data-testid="tab-orders">
                <ClipboardList className="w-4 h-4" /> Minhas OS
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm gap-1.5" data-testid="tab-history">
                <History className="w-4 h-4" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="chats" className="text-sm gap-1.5" data-testid="tab-chats">
                <MessageCircle className="w-4 h-4" /> Conversas
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-sm gap-1.5" data-testid="tab-profile">
                <UserCog className="w-4 h-4" /> Perfil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              {loadingOrders ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-200">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Nenhuma ordem de serviço ativa.</p>
                  <Button onClick={() => setModalOpen(true)} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 text-sm" data-testid="create-first-order">
                    Agendar Agora
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="active-orders">
                  {activeOrders.map(o => <OrderCard key={o.os_number} order={o} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {historyOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-200">
                  <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Nenhum serviço concluido ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="history-orders">
                  {historyOrders.map(o => <OrderCard key={o.os_number} order={o} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chats" className="mt-6">
              <ChatsTab />
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <form onSubmit={handleProfileSave} className="bg-white border border-slate-200 p-8 max-w-lg space-y-4" data-testid="profile-form">
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Dados Cadastrais</h3>
                <div>
                  <Label className="text-sm text-slate-700">Nome</Label>
                  <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-name" />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Telefone</Label>
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-phone" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-700">CEP {cepLoading && <span className="text-xs text-blue-600 ml-1">buscando...</span>}</Label>
                    <Input
                      value={profile.cep || ''}
                      onChange={e => onCepChange(e.target.value)}
                      onBlur={e => lookupCep(e.target.value)}
                      maxLength={9}
                      inputMode="numeric"
                      placeholder="00000-000"
                      className="mt-1 border-slate-300"
                      data-testid="profile-cep"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Número</Label>
                    <Input value={profile.number} onChange={e => setProfile(p => ({ ...p, number: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-number" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Endereço</Label>
                  <Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-address" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-slate-700">Bairro</Label>
                    <Input value={profile.neighborhood} onChange={e => setProfile(p => ({ ...p, neighborhood: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-neighborhood" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Cidade</Label>
                    <Input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-city" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Estado</Label>
                    <Input value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-state" />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700 py-2.5 h-auto" data-testid="profile-save">
                  {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <SchedulingModal open={modalOpen} onClose={() => { setModalOpen(false); API.get('/service-orders').then(({ data }) => setOrders(data)).catch(() => {}); }} equipment={modalOpen ? { id: 'geladeiras', name: 'Geladeiras', icon: 'Snowflake' } : null} />
    </div>
  );
}

// ── Chats Tab (histórico de conversas com a Mi) ─────────────────────
function ChatsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/chat/sessions');
      // Filter out empty sessions (title === "Nova conversa" without messages is still listed; ok)
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const openSession = async (s) => {
    setSelectedId(s.id);
    setSelectedTitle(s.title);
    setLoadingMsgs(true);
    setSelectedMsgs([]);
    try {
      const { data } = await API.get(`/chat/sessions/${s.id}`);
      setSelectedMsgs(data.messages || []);
    } catch {
      toast.error('Erro ao carregar conversa');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Excluir esta conversa?')) return;
    try {
      await API.delete(`/chat/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (selectedId === id) { setSelectedId(null); setSelectedMsgs([]); }
      toast.success('Conversa excluída');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const today = new Date();
      const isSameDay = d.toDateString() === today.toDateString();
      if (isSameDay) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch { return ''; }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 border border-slate-200" data-testid="chats-empty">
        <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Você ainda não conversou com a Mi.</p>
        <p className="text-slate-400 text-xs mt-1">Clique no ícone <span className="inline-block w-4 h-4 align-middle">✦</span> no canto inferior direito para começar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[480px]" data-testid="chats-tab">
      {/* Sessions list */}
      <div className={`${selectedId ? 'hidden md:block' : ''} bg-white border border-slate-200 overflow-hidden`}>
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm text-slate-900">Suas conversas</h3>
          <span className="text-xs text-slate-400">{sessions.length}</span>
        </div>
        <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => openSession(s)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-2 group ${selectedId === s.id ? 'bg-blue-50' : ''}`}
              data-testid={`chat-session-${s.id}`}
            >
              <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedId === s.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{s.title || 'Nova conversa'}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(s.updated_at || s.created_at)}</div>
              </div>
              <span
                onClick={(e) => deleteSession(e, s.id)}
                role="button"
                tabIndex={0}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 flex-shrink-0"
                data-testid={`chat-delete-${s.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages view */}
      <div className={`${selectedId ? '' : 'hidden md:flex'} bg-white border border-slate-200 flex flex-col min-h-[480px]`}>
        {selectedId ? (
          <>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-sm text-slate-900 truncate">{selectedTitle || 'Conversa'}</div>
                <div className="text-[11px] text-slate-400">{selectedMsgs.length} mensagens</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white" data-testid="chat-messages-view">
              {loadingMsgs ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : selectedMsgs.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">Conversa vazia.</p>
              ) : selectedMsgs.map((m, i) => (
                <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%]`}>
                    {m.role === 'user' && m.image && (
                      <img src={m.image} alt="anexo" className="mb-1 max-h-40 rounded border border-slate-200 block ml-auto" />
                    )}
                    <div
                      className={m.role === 'user'
                        ? 'bg-slate-900 text-white text-sm px-3.5 py-2.5 leading-relaxed'
                        : 'bg-blue-50 text-blue-900 text-sm px-3.5 py-2.5 leading-relaxed'}
                      style={{ borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', wordBreak: 'break-word' }}
                    >
                      {m.role === 'assistant' ? (
                        <div className="mi-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || ''}</ReactMarkdown></div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content || (m.image ? '_(imagem)_' : '')}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400 p-8">
            Selecione uma conversa ao lado para ver as mensagens.
          </div>
        )}
      </div>
    </div>
  );
}

