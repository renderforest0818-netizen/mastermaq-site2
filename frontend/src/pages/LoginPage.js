import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, formatApiError } from '@/contexts/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/minha-conta');
    } catch (err) {
      const msg = formatApiError(err.response?.data?.detail) || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4" data-testid="login-page">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-48 mx-auto mb-4">
            <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="w-full h-auto" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 mb-1">Entrar na sua conta</h1>
          <p className="text-sm text-slate-500">Acesse o portal do cliente Mastermaq</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 space-y-5" data-testid="login-form">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3" data-testid="login-error">{error}</div>}
          <div>
            <Label className="text-sm text-slate-700">E-mail</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 border-slate-300" placeholder="seu@email.com" data-testid="login-email" />
          </div>
          <div>
            <Label className="text-sm text-slate-700">Senha</Label>
            <div className="relative mt-1">
              <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="border-slate-300 pr-10" placeholder="Sua senha" data-testid="login-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 h-auto" data-testid="login-submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Não tem conta? <Link to="/cadastro" className="text-blue-600 hover:text-blue-800 font-medium" data-testid="register-link">Cadastre-se</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
