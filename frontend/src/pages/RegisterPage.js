import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, formatApiError } from '@/contexts/AuthContext';
import API from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', phone: '', cep: '', address: '', number: '', neighborhood: '', city: '', state: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const goStep2 = () => {
    setError('');
    if (!form.email || !form.password || !form.confirmPassword) { setError('Preencha todos os campos'); return; }
    if (form.password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { setError('Senhas não conferem'); return; }
    setStep(2);
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
      setForm(p => ({
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
    set('cep', formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) lookupCep(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name) { setError('Preencha seu nome'); return; }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        cep: form.cep,
        address: form.address,
        number: form.number,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
      });
      toast.success('Conta criada com sucesso!');
      navigate('/minha-conta');
    } catch (err) {
      const msg = formatApiError(err.response?.data?.detail) || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4" data-testid="register-page">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-48 mx-auto mb-4">
            <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="w-full h-auto" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 mb-1">Criar sua conta</h1>
          <p className="text-sm text-slate-500">Etapa {step} de 2</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          <div className={`h-1 flex-1 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>

        <div className="bg-white border border-slate-200 p-8" data-testid="register-form">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-5" data-testid="register-error">{error}</div>}

          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <Label className="text-sm text-slate-700">E-mail</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-1 border-slate-300" placeholder="seu@email.com" data-testid="register-email" />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Senha</Label>
                <div className="relative mt-1">
                  <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="border-slate-300 pr-10" placeholder="Mínimo 6 caracteres" data-testid="register-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-700">Confirmar Senha</Label>
                <Input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="mt-1 border-slate-300" placeholder="Repita a senha" data-testid="register-confirm" />
              </div>
              <Button onClick={goStep2} className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 h-auto" data-testid="register-next">
                Avancar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-sm text-slate-500">
                Ja tem conta? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Entrar</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm text-slate-700">Nome Completo *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 border-slate-300" placeholder="Seu nome completo" data-testid="register-name" />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Telefone</Label>
                <Input value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))} className="mt-1 border-slate-300" placeholder="(31) 9 9999-9999" data-testid="register-phone" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-slate-700">CEP {cepLoading && <span className="text-xs text-blue-600 ml-1">buscando...</span>}</Label>
                  <Input
                    value={form.cep}
                    onChange={e => onCepChange(e.target.value)}
                    onBlur={e => lookupCep(e.target.value)}
                    maxLength={9}
                    inputMode="numeric"
                    className="mt-1 border-slate-300"
                    placeholder="00000-000"
                    data-testid="register-cep"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Número</Label>
                  <Input value={form.number} onChange={e => set('number', e.target.value)} className="mt-1 border-slate-300" placeholder="123" data-testid="register-number" />
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-700">Endereço</Label>
                <Input value={form.address} onChange={e => set('address', e.target.value)} className="mt-1 border-slate-300" placeholder="Rua, Avenida..." data-testid="register-address" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-slate-700">Bairro</Label>
                  <Input value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className="mt-1 border-slate-300" data-testid="register-neighborhood" />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Cidade</Label>
                  <Input value={form.city} onChange={e => set('city', e.target.value)} className="mt-1 border-slate-300" data-testid="register-city" />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Estado</Label>
                  <Input value={form.state} onChange={e => set('state', e.target.value)} className="mt-1 border-slate-300" data-testid="register-state" />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-sm text-slate-500" data-testid="register-back">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3 h-auto" data-testid="register-submit">
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
