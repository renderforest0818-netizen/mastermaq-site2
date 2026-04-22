import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, CheckCircle2, Wrench, Settings, Info, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/api';

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
const INSTALLATION_DISABLED = ["geladeiras", "ar-condicionado-portátil", "lava-e-seca", "lavadoras"];

export default function SchedulingModal({ open, onClose, equipment }) {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [formData, setFormData] = useState({ model: '', serial_number: '', warranty_status: 'fora_garantia', defect_description: '' });
  const [osData, setOsData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isInstallDisabled = equipment ? INSTALLATION_DISABLED.includes(equipment.id) : false;
  const isAuthorizedBrand = AUTHORIZED_BRANDS.includes(brand);

  const reset = useCallback(() => {
    setStep(0);
    setBrand('');
    setServiceType('');
    setFormData({ model: '', serial_number: '', warranty_status: 'fora_garantia', defect_description: '' });
    setOsData(null);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        equipment_type: equipment?.id || '',
        brand,
        service_type: serviceType,
        model: formData.model,
        serial_number: formData.serial_number,
        warranty_status: formData.warranty_status,
        defect_description: formData.defect_description,
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
    if (type === 'conserto') {
      setStep(2);
    } else {
      setSubmitting(true);
      API.post('/service-orders', {
        equipment_type: equipment?.id || '',
        brand,
        service_type: type,
      }).then(({ data }) => {
        setOsData(data);
        setStep(3);
        toast.success('Ordem de serviço criada com sucesso!');
      }).catch(() => {
        toast.error('Erro ao criar ordem de serviço');
      }).finally(() => setSubmitting(false));
    }
  };

  if (!equipment) return null;

  const stepLabels = ['Marca', 'Serviço', 'Detalhes', 'Confirmação'];

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0" data-testid="scheduling-modal">
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
                  <Label className="text-sm text-slate-700">Modelo</Label>
                  <Input
                    placeholder="Ex: RF49A5202S9"
                    value={formData.model}
                    onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                    className="mt-1.5 border-slate-300"
                    data-testid="input-model"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-700">Número de Serie</Label>
                  <Input
                    placeholder="Número de serie do produto"
                    value={formData.serial_number}
                    onChange={e => setFormData(p => ({ ...p, serial_number: e.target.value }))}
                    className="mt-1.5 border-slate-300"
                    data-testid="input-serial"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-700 mb-2 block">Garantia</Label>
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
                          <p>Disponivel apenas para marcas autorizadas</p>
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
                  <Label className="text-sm text-slate-700">Defeito Relatado</Label>
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
                    {submitting ? 'Enviando...' : 'Solicitar Conserto'}
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
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 font-medium">Aguardando confirmação</span>
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
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
