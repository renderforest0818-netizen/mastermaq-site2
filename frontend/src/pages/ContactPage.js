import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Preencha todos os campos obrigatorios'); return; }
    setLoading(true);
    try {
      await API.post('/contact', form);
      setSent(true);
      toast.success('Mensagem enviada com sucesso!');
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page">
      {/* Header */}
      <section className="py-24 sm:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Fale Conosco</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">Entre em Contato</h1>
            <p className="text-base text-slate-300 max-w-lg">Estamos prontos para ajudar. Entre em contato conosco por qualquer canal.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-8">Informacoes de Contato</h2>
              <div className="space-y-6 mb-10">
                {[
                  { icon: Phone, label: "Telefone", value: "(31) 3422-5293", href: "tel:+553134225293" },
                  { icon: Mail, label: "E-mail", value: "mastermaqassistencia@gmail.com", href: "mailto:mastermaqassistencia@gmail.com" },
                  { icon: MapPin, label: "Endereco", value: "R. Descalvado, 636A - Renascenca, BH/MG" },
                  { icon: Clock, label: "Horario", value: "Seg-Sex: 8h-18h | Sab: 8h-12h" },
                ].map(c => (
                  <div key={c.label} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-sm text-slate-700 hover:text-blue-600 transition-colors">{c.value}</a>
                      ) : (
                        <p className="text-sm text-slate-700">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Maps */}
              <div className="w-full h-64 border border-slate-200 overflow-hidden" data-testid="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.8!2d-43.95!3d-19.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa69a71909c0d7f%3A0xad207904465d2acf!2sConserto%20de%20Geladeiras%20BH-%20Servi%C3%A7o%20Autorizado!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localizacao Mastermaq"
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              {sent ? (
                <div className="bg-green-50 border border-green-200 p-12 text-center" data-testid="contact-success">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-sm text-slate-500">Retornaremos em breve. Obrigado pelo contato.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                  <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Envie uma Mensagem</h2>
                  <div>
                    <Label className="text-sm text-slate-700">Nome *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 border-slate-300" placeholder="Seu nome completo" data-testid="contact-name" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">E-mail *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1 border-slate-300" placeholder="seu@email.com" data-testid="contact-email" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Telefone</Label>
                    <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1 border-slate-300" placeholder="(31) 9 9999-9999" data-testid="contact-phone" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-700">Mensagem *</Label>
                    <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="mt-1 min-h-[120px] border-slate-300" placeholder="Como podemos ajudar?" data-testid="contact-message" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-red-600 text-white hover:bg-red-700 py-3 h-auto" data-testid="contact-submit">
                    {loading ? 'Enviando...' : <>Enviar Mensagem <Send className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
