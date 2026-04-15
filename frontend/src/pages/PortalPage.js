import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, History, UserCog, Plus, Clock, CheckCircle2, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const STATUS_MAP = {
  aguardando_confirmacao: { label: 'Aguardando', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  em_andamento: { label: 'Em Andamento', icon: Loader, color: 'bg-blue-100 text-blue-800' },
  concluido: { label: 'Concluido', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.aguardando_confirmacao;
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
          <span className="text-xs text-slate-400 uppercase tracking-wider">Equipamento</span>
          <p className="text-slate-700">{order.equipment_type}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Marca</span>
          <p className="text-slate-700">{order.brand}</p>
        </div>
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Servico</span>
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

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '', cep: user.cep || '', address: user.address || '', number: user.number || '', neighborhood: user.neighborhood || '', city: user.city || '', state: user.state || '' });
      API.get('/service-orders').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoadingOrders(false));
    }
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

  const activeOrders = orders.filter(o => o.status !== 'concluido' && o.status !== 'cancelado');
  const historyOrders = orders.filter(o => o.status === 'concluido' || o.status === 'cancelado');

  return (
    <div className="py-16 sm:py-24" data-testid="portal-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900" data-testid="portal-welcome">
                Ola, {user?.name || 'Cliente'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Gerencie suas ordens de servico e dados cadastrais.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/')}
                className="bg-red-600 text-white hover:bg-red-700 text-sm hidden sm:flex"
                data-testid="new-order-btn"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Novo Agendamento
              </Button>
              <Button
                variant="outline"
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm border-slate-200 hover:border-red-600 hover:text-red-600"
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
                <History className="w-4 h-4" /> Historico
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
                  <p className="text-slate-500 text-sm">Nenhuma ordem de servico ativa.</p>
                  <Button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 text-sm" data-testid="create-first-order">
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
                  <p className="text-slate-500 text-sm">Nenhum servico concluido ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="history-orders">
                  {historyOrders.map(o => <OrderCard key={o.os_number} order={o} />)}
                </div>
              )}
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
                    <Label className="text-sm text-slate-700">CEP</Label>
                    <Input value={profile.cep} onChange={e => setProfile(p => ({ ...p, cep: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-cep" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Numero</Label>
                    <Input value={profile.number} onChange={e => setProfile(p => ({ ...p, number: e.target.value }))} className="mt-1 border-slate-300" data-testid="profile-number" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Endereco</Label>
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
    </div>
  );
}
