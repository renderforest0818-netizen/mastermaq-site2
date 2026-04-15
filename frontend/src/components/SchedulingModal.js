import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, CheckCircle2, Wrench, Settings, Info } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/api';

const BRANDS = ["Panasonic", "Liebherr", "Bertazzoni", "Hisense", "Samsung", "LG", "Brastemp", "Electrolux", "Bosch", "Consul", "Midea", "Philco"];
const INSTALLATION_DISABLED = ["geladeiras", "ar-condicionado-portatil", "lava-e-seca", "lavadoras"];

const STEPS = ['brand', 'service', 'form', 'confirm'];

export default function SchedulingModal({ open, onClose, equipment }) {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [formData, setFormData] = useState({ model: '', serial_number: '', warranty_status: 'fora_garantia', defect_description: '' });
  const [osData, setOsData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isInstallDisabled = equipment ? INSTALLATION_DISABLED.includes(equipment.id) : false;

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
      toast.success('Ordem de servico criada com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar ordem de servico');
    } finally {
      setSubmitting(false);
    }
  };

  const selectService = (type) => {
    setServiceType(type);
    if (type === 'conserto') {
      setStep(2);
    } else {
      // Installation - submit directly
      setServiceType(type);
      setSubmitting(true);
      API.post('/service-orders', {
        equipment_type: equipment?.id || '',
        brand,
        service_type: type,
      }).then(({ data }) => {
        setOsData(data);
        setStep(3);
        toast.success('Ordem de servico criada com sucesso!');
      }).catch(() => {
        toast.error('Erro ao criar ordem de servico');
      }).finally(() => setSubmitting(false));
    }
  };

  if (!equipment) return null;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="scheduling-modal">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-slate-900" data-testid="modal-title">
              {step === 3 ? 'Solicitacao Confirmada' : `Agendar - ${equipment.name}`}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {step === 0 && 'Selecione a marca do equipamento'}
              {step === 1 && 'Selecione o tipo de servico'}
              {step === 2 && 'Preencha os dados do equipamento'}
              {step === 3 && 'Sua ordem de servico foi criada'}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          {step < 3 && (
            <div className="flex gap-1 mb-2" data-testid="modal-progress">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 flex-1 transition-colors ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          )}

          {/* Step 0: Brand Selection */}
          {step === 0 && (
            <div className="grid grid-cols-3 gap-2" data-testid="brand-selection">
              {BRANDS.map(b => (
                <button
                  key={b}
                  onClick={() => { setBrand(b); setStep(1); }}
                  className={`p-3 border text-sm font-medium transition-all hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 ${brand === b ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-700'}`}
                  data-testid={`brand-${b.toLowerCase()}`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="flex flex-col gap-3" data-testid="service-type-selection">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      disabled={isInstallDisabled}
                      onClick={() => selectService('instalacao')}
                      className="w-full h-16 justify-start gap-3 text-left border-slate-200 hover:border-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid="service-instalacao"
                    >
                      <Settings className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Instalacao</p>
                        <p className="text-xs text-slate-500">Instalacao profissional do equipamento</p>
                      </div>
                      {isInstallDisabled && <Info className="w-4 h-4 text-slate-400 ml-auto" />}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isInstallDisabled && (
                  <TooltipContent>
                    <p>Instalacao nao disponivel para este equipamento</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Button
                variant="outline"
                onClick={() => selectService('conserto')}
                className="w-full h-16 justify-start gap-3 text-left border-slate-200 hover:border-red-600"
                data-testid="service-conserto"
              >
                <Wrench className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Conserto</p>
                  <p className="text-xs text-slate-500">Diagnostico e reparo do equipamento</p>
                </div>
              </Button>

              <Button variant="ghost" onClick={() => setStep(0)} className="mt-2 text-sm text-slate-500" data-testid="back-to-brand">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </div>
          )}

          {/* Step 2: Repair Form */}
          {step === 2 && (
            <div className="flex flex-col gap-4" data-testid="repair-form">
              <div>
                <Label className="text-sm text-slate-700">Modelo (opcional)</Label>
                <Input
                  placeholder="Ex: RF49A5202S9"
                  value={formData.model}
                  onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                  className="mt-1 border-slate-300 focus:ring-blue-600"
                  data-testid="input-model"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Numero de Serie</Label>
                <Input
                  placeholder="Numero de serie do equipamento"
                  value={formData.serial_number}
                  onChange={e => setFormData(p => ({ ...p, serial_number: e.target.value }))}
                  className="mt-1 border-slate-300 focus:ring-blue-600"
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
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dentro_garantia" id="w-in" data-testid="warranty-in" />
                    <Label htmlFor="w-in" className="text-sm text-slate-700 cursor-pointer">Dentro da garantia</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fora_garantia" id="w-out" data-testid="warranty-out" />
                    <Label htmlFor="w-out" className="text-sm text-slate-700 cursor-pointer">Fora da garantia</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="text-sm text-slate-700">Defeito Relatado</Label>
                <Textarea
                  placeholder="Descreva o problema que o equipamento apresenta..."
                  value={formData.defect_description}
                  onChange={e => setFormData(p => ({ ...p, defect_description: e.target.value }))}
                  className="mt-1 min-h-[80px] border-slate-300 focus:ring-blue-600"
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
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 text-sm"
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
              <p className="text-sm text-slate-500 mb-6">Sua ordem de servico foi criada com sucesso.</p>

              <div className="bg-slate-50 border border-slate-200 p-4 text-left space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Numero da OS</span>
                  <span className="font-mono font-semibold text-blue-600" data-testid="os-number">{osData.os_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Equipamento</span>
                  <span className="text-sm text-slate-700">{equipment?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Marca</span>
                  <span className="text-sm text-slate-700">{brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 font-medium">Aguardando confirmacao</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taxa de Visita</span>
                  <span className="text-sm text-slate-700">{osData.visit_fee}</span>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full bg-blue-600 text-white hover:bg-blue-700" data-testid="close-confirmation">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
