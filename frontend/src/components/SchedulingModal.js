import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, CheckCircle2, Wrench, Settings, Info, Check, Lock, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { savePendingSchedule, clearPendingSchedule } from '@/lib/pendingSchedule';

const BRANDS = [
  { name: "HQ", logo: "/images/assets/hq-logo.png" },
  { name: "Panasonic", logo: "/images/assets/panasonic-logo.png" },
  { name: "Liebherr", logo: "/images/assets/liebherr-logo.png" },
  { name: "Bertazzoni", logo: "/images/assets/bertazzoni-logo.png" },
  { name: "Hisense", logo: "/images/assets/hisense-logo.png" },
  { name: "Samsung", logo: "/images/assets/samsung-logo.png" },
  { name: "LG", logo: "/images/assets/LG-logo.png" },
  { name: "Brastemp", logo: "/images/assets/brastemp-logo.png" },
  { name: "Electrolux", logo: "/images/assets/electrolux-logo.png" },
  { name: "Bosch", logo: "/images/assets/Bosch-Logo.png" },
  { name: "Consul", logo: "/images/assets/consul-logo.png" },
  { name: "Midea", logo: "/images/assets/midea-logo.svg" },
  { name: "Philco", logo: "/images/assets/Philco-logo.png" },
  { name: "Franke", logo: "/images/assets/franke-logo.png" },
  { name: "Gorenje", logo: "/images/assets/gorenje-logo.png" },
  { name: "Lofra", logo: "/images/assets/lofra-logo.png" },
];

const AUTHORIZED_BRANDS = ["HQ", "Franke", "Hisense", "Gorenje", "Bertazzoni", "Lofra", "Panasonic", "Liebherr"];
// Authorized for service, but CANNOT accept warranty cases per business rules.
const WARRANTY_BLOCKED_BRANDS = new Set(["Bertazzoni", "Lofra", "Panasonic"]);
const INSTALLATION_DISABLED = ["geladeiras", "ar-condicionado-portátil", "lava-e-seca", "lavadoras"];

export default function SchedulingModal({ open, onClose, equipment }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [formData, setFormData] = useState({ model: '', serial_number: '', warranty_status: 'fora_garantia', defect_description: '' });
  const [osData, setOsData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isInstallDisabled = equipment ? INSTALLATION_DISABLED.includes(equipment.id) : false;
  const isAuthorizedBrand = AUTHORIZED_BRANDS.includes(brand) && !WARRANTY_BLOCKED_BRANDS.has(brand);

  const reset = useCallback(() => {
    setStep(0);
    setBrand('');
    setServiceType('');
    setFormData({ model: '', serial_number: '', warranty_status: '', defect_description: '' });
    setOsData(null);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    // Validation: required fields
    if (!equipment?.id) { toast.error('Selecione um equipamento'); return; }
    if (!brand) { toast.error('Selecione uma marca'); return; }
    if (!serviceType) { toast.error('Selecione o tipo de serviço'); return; }
    if (!formData.model.trim()) { toast.error('Informe o modelo do equipamento'); return; }
    if (!formData.defect_description.trim()) { toast.error('Descreva o defeito apresentado'); return; }
    if (!formData.warranty_status) { toast.error('Informe se está dentro ou fora da garantia'); return; }
    if (formData.warranty_status === 'dentro_garantia' && !formData.serial_number.trim()) {
      toast.error('Número de série é obrigatório para equipamentos dentro da garantia');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        equipment_type: equipment?.id || '',
        brand,
        service_type: serviceType,
        model: formData.model.trim(),
        serial_number: formData.serial_number.trim(),
        warranty_status: formData.warranty_status,
        defect_description: formData.defect_description.trim(),
      };
      const { data } = await API.post('/service-orders', payload);
      setOsData(data);
      setStep(3);
      toast.success('Ordem de serviço criada com sucesso!');
    } catch {
      toast.error('Erro ao criar ordem de serviço');
    } finally {
      setSubmitting(false);
    }
  };

  const selectService = (type) => {
    setServiceType(type);
    setStep(2);
  };

  if (!equipment) return null;

  const stepLabels = ['Marca', 'Serviço', 'Detalhes', 'Confirmação'];
  // Gate: if visitor is not logged in, require login/register BEFORE collecting
  // any form data (name, phone, defect, etc.). Once authenticated, the profile
  // on the user record is used to populate the external OS payload, so asking
  // before is both better UX and avoids losing input on redirect.
  const needsAuth = !user && step < 3;
  // Secondary gate: logged-in user but profile incomplete (no phone or no
  // name). The external Mastermaq Systems API refuses payloads without
  // phone1, so we must force profile completion before allowing the OS to
  // be created.
  const phoneDigits = user ? ((user.phone || '').replace(/\D/g, '')) : '';
  const needsProfile = !!user && step < 3 && (phoneDigits.length < 10 || !(user.name || '').trim());

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0" data-testid="scheduling-modal">
          {needsAuth ? (
            <div className="p-6 sm:p-8 space-y-5 text-center" data-testid="modal-auth-gate">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="font-heading text-xl text-slate-900">Entre para agendar</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                  Para abrir sua ordem de serviço precisamos saber quem você é. Em poucos cliques você cria sua conta e já agenda a visita do técnico.
                </DialogDescription>
              </div>
              <ul className="text-left text-[13px] text-slate-600 space-y-1.5 max-w-xs mx-auto">
                <li className="flex gap-2"><Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> Acompanhe sua OS em tempo real</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> Histórico de atendimentos</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /> Chat com a Mi 24/7</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => { savePendingSchedule({ source: 'modal', equipment }); handleClose(); }}
                  className="flex-1"
                  data-testid="auth-gate-login"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
                    <LogIn className="w-4 h-4 mr-1.5" /> Entrar
                  </Button>
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => { savePendingSchedule({ source: 'modal', equipment }); handleClose(); }}
                  className="flex-1"
                  data-testid="auth-gate-register"
                >
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 h-10">
                    <UserPlus className="w-4 h-4 mr-1.5" /> Criar conta
                  </Button>
                </Link>
              </div>
              <p className="text-[11px] text-slate-400">Leva menos de 1 minuto. Depois você volta pra cá.</p>
            </div>
          ) : needsProfile ? (
            <div className="p-6 sm:p-8 space-y-5 text-center" data-testid="modal-needs-profile">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <Info className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="font-heading text-xl text-slate-900">Complete seu perfil</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                  Para abrir sua ordem de serviço precisamos do seu <strong>nome completo</strong> e <strong>telefone com DDD</strong>. É como nosso atendente vai te chamar e como a equipe confirma a visita técnica.
                </DialogDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={handleClose} variant="outline" className="flex-1 h-10" data-testid="profile-gate-cancel">
                  Cancelar
                </Button>
                <Link to="/minha-conta" onClick={() => { savePendingSchedule({ source: 'modal', equipment }); handleClose(); }} className="flex-1" data-testid="profile-gate-complete">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
                    Completar perfil <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
          <>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-slate-900" data-testid="modal-title">
                {step === 3 ? 'Solicitacao Confirmada' : `Agendar - ${equipment.name}`}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                {step === 0 && 'Selecione a marca do produto'}
                {step === 1 && 'Selecione o tipo de serviço'}
                {step === 2 && 'Preencha os dados do produto'}
                {step === 3 && 'Sua ordem de serviço foi criada'}
              </DialogDescription>
            </DialogHeader>

            {step < 3 && (
              <div className="flex items-center gap-2 mt-4" data-testid="modal-progress">
                {stepLabels.slice(0, 3).map((label, i) => (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-1.5 ${i <= step ? 'text-blue-600' : 'text-slate-300'}`}>
                      <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-colors ${
                        i < step ? 'bg-blue-600 text-white' : i === step ? 'border-2 border-blue-600 text-blue-600' : 'border border-slate-200 text-slate-400'
                      }`}>
                        {i < step ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="text-[10px] font-medium hidden sm:inline">{label}</span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* Step 0: Brand Selection */}
            {step === 0 && (
              <div className="grid grid-cols-3 gap-3" data-testid="brand-selection">
                {BRANDS.map(b => (
                  <button
                    key={b.name}
                    onClick={() => { setBrand(b.name); setStep(1); }}
                    className={`relative p-4 border flex flex-col items-center gap-2 transition-all duration-200 group hover:border-slate-400 hover:shadow-md ${
                      brand === b.name ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    data-testid={`brand-${b.name.toLowerCase()}`}
                  >
                    {brand === b.name && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-slate-900 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="h-10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300">
                      <img src={b.logo} alt={b.name} className="max-h-[32px] max-w-[80px] object-contain" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-700">{b.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Service Type — limpo, sem cores fortes */}
            {step === 1 && (
              <div className="flex flex-col gap-3" data-testid="service-type-selection">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <button
                        disabled={isInstallDisabled}
                        onClick={() => !isInstallDisabled && selectService('instalação')}
                        className={`w-full p-5 border flex items-center gap-4 text-left transition-all duration-200 ${
                          isInstallDisabled
                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-slate-400 hover:shadow-md cursor-pointer'
                        }`}
                        data-testid="service-instalação"
                      >
                        <div className={`w-12 h-12 flex items-center justify-center border ${isInstallDisabled ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                          <Settings className={`w-5 h-5 ${isInstallDisabled ? 'text-slate-300' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-sm text-slate-900">Instalação</p>
                          <p className="text-xs text-slate-500">Instalação profissional do produto</p>
                        </div>
                        {isInstallDisabled && <Info className="w-4 h-4 text-slate-300" />}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {isInstallDisabled && (
                    <TooltipContent>
                      <p>Instalação não disponivel para este produto</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                <button
                  onClick={() => selectService('conserto')}
                  className="w-full p-5 border border-slate-200 flex items-center gap-4 text-left hover:border-slate-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                  data-testid="service-conserto"
                >
                  <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-slate-900">Conserto</p>
                    <p className="text-xs text-slate-500">Diagnostico e reparo do produto</p>
                  </div>
                </button>

                <Button variant="ghost" onClick={() => setStep(0)} className="mt-2 text-sm text-slate-500" data-testid="back-to-brand">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
              </div>
            )}

            {/* Step 2: Repair Form — com bloqueio de garantia para não-autorizadas */}
            {step === 2 && (
              <div className="flex flex-col gap-4" data-testid="repair-form">
                <div>
                  <Label className="text-sm text-slate-700 flex items-center gap-1.5">
                    Modelo <span className="text-red-500">*</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors" aria-label="O que é Modelo?" data-testid="tooltip-model">
                          <Info className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                        <p className="font-semibold mb-1">O que é o modelo?</p>
                        <p>Código que identifica a versão exata do produto (ex: <em>RF49A5202S9</em>).</p>
                        <p className="mt-1.5 font-semibold">Onde encontrar:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Geladeira/Freezer: etiqueta dentro do compartimento refrigerador (lateral ou teto)</li>
                          <li>Lavadora/Lava e Seca: borda da porta ou traseira</li>
                          <li>Ar-condicionado: etiqueta lateral da evaporadora e na condensadora</li>
                          <li>VRF/Coifa: etiqueta frontal ou manual</li>
                          <li>Também aparece no manual ou nota fiscal</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    placeholder="Ex: RF49A5202S9"
                    value={formData.model}
                    onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                    className="mt-1.5 border-slate-300"
                    data-testid="input-model"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-700 flex items-center gap-1.5">
                    Número de Série {formData.warranty_status === 'dentro_garantia' && <span className="text-red-500">*</span>}
                    {formData.warranty_status !== 'dentro_garantia' && <span className="text-[11px] text-slate-400 font-normal">(opcional)</span>}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors" aria-label="O que é Número de Série?" data-testid="tooltip-serial">
                          <Info className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                        <p className="font-semibold mb-1">O que é o número de série?</p>
                        <p>Código único de cada unidade (não confundir com modelo). Geralmente começa com letras/números tipo <em>SN: A1B2C3</em>.</p>
                        <p className="mt-1.5 font-semibold">Onde encontrar:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Na mesma etiqueta do modelo, campo "Serial" ou "S/N"</li>
                          <li>Geladeira: dentro do compartimento, na etiqueta prateada</li>
                          <li>Ar-condicionado: etiqueta externa (condensadora) costuma ter bem visível</li>
                          <li>Lavadoras/Coifa: atrás do produto ou no manual</li>
                          <li>Também consta na nota fiscal</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    placeholder="Ex: SN-A1B2C3D4"
                    value={formData.serial_number}
                    onChange={e => setFormData(p => ({ ...p, serial_number: e.target.value }))}
                    className="mt-1.5 border-slate-300"
                    data-testid="input-serial"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-700 mb-2 flex items-center gap-1.5">
                    Garantia <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.warranty_status}
                    onValueChange={v => setFormData(p => ({ ...p, warranty_status: v }))}
                    className="flex gap-4"
                    data-testid="warranty-radio"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-2 ${!isAuthorizedBrand ? 'opacity-50' : ''}`}>
                          <RadioGroupItem
                            value="dentro_garantia"
                            id="w-in"
                            disabled={!isAuthorizedBrand}
                            data-testid="warranty-in"
                          />
                          <Label htmlFor="w-in" className={`text-sm cursor-pointer flex items-center gap-1 ${!isAuthorizedBrand ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}>
                            Dentro da garantia
                            {!isAuthorizedBrand && <Lock className="w-3 h-3 text-slate-400" />}
                          </Label>
                        </div>
                      </TooltipTrigger>
                      {!isAuthorizedBrand && (
                        <TooltipContent>
                          <p>{WARRANTY_BLOCKED_BRANDS.has(brand)
                            ? `${brand}: não aceitamos atendimentos em garantia para esta marca. Siga como "Fora da garantia".`
                            : 'Disponível apenas para marcas autorizadas'}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="fora_garantia" id="w-out" data-testid="warranty-out" />
                      <Label htmlFor="w-out" className="text-sm text-slate-700 cursor-pointer">Fora da garantia</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm text-slate-700 flex items-center gap-1.5">
                    Defeito Relatado <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Descreva o problema que o produto apresenta..."
                    value={formData.defect_description}
                    onChange={e => setFormData(p => ({ ...p, defect_description: e.target.value }))}
                    className="mt-1.5 min-h-[80px] border-slate-300"
                    data-testid="input-defect"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-sm text-slate-500" data-testid="back-to-service">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-slate-900 text-white hover:bg-slate-800 text-sm"
                    data-testid="submit-repair"
                  >
                    {submitting ? 'Enviando...' : (serviceType === 'instalacao' ? 'Solicitar Instalação' : 'Solicitar Conserto')}
                    {!submitting && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && osData && (
              <div className="text-center py-4" data-testid="os-confirmation">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-heading font-semibold text-lg text-slate-900 mb-1">Solicitacao Recebida!</p>
                <p className="text-sm text-slate-500 mb-2">Sua ordem de serviço foi criada com sucesso.</p>
                <p className="text-xs text-slate-400 mb-6">Em breve, um atendente entrara em contato para confirmar a visita do técnico.</p>

                <div className="bg-slate-50 border border-slate-200 p-4 text-left space-y-2.5 mb-5">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Número da OS</span>
                    <span className="font-mono font-semibold text-blue-600" data-testid="os-number">{osData.os_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Produto</span>
                    <span className="text-sm text-slate-700">{equipment?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Marca</span>
                    <span className="text-sm text-slate-700">{brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 font-medium">Aguardando Análise A.T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taxa de Visita</span>
                    <span className="text-sm text-slate-700">{osData.visit_fee}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleClose} variant="outline" className="flex-1 border-slate-200 text-sm" data-testid="close-confirmation">
                    Fechar
                  </Button>
                  <a href="/minha-conta" className="flex-1">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm">
                      Acompanhar OS
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
          </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
