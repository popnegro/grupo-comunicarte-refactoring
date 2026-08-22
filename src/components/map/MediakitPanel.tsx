import { useState, useEffect, FormEvent } from 'react';
import { X, CheckCircle2, Image as ImageIcon, Loader2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { InventoryItem, isMobileRoute } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Textarea, Label } from '../ui/Input';
import { useSelection } from '../../context/SelectionContext';
import { recordNewLead } from '../../lib/dashboard-store';

interface MediakitPanelProps {
  selectedItems: InventoryItem[];
  onClose: () => void;
  onGoToInventory: () => void;
}

type SubmissionState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export function MediakitPanel({ selectedItems, onClose, onGoToInventory }: MediakitPanelProps) {
  const { removeSelected, clearSelection } = useSelection();

  // Robust Body Scroll Lock (H-02)
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // UI state for list collapse when > 3 items
  const [isListExpanded, setIsListExpanded] = useState(false);

  // Status & Network State
  const [submissionState, setSubmissionState] = useState<SubmissionState>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [requestId, setRequestId] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Ingresá tu nombre completo.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Ingresá un correo electrónico corporativo válido.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (submissionState === 'LOADING') return;

    if (!validateForm()) {
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage('Debes seleccionar al menos un soporte antes de enviar la solicitud.');
      setSubmissionState('ERROR');
      return;
    }

    setSubmissionState('LOADING');
    setErrorMessage('');

    try {
      const response = await fetch('/api/mediakit/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead: {
            name: name.trim(),
            company: company.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
          },
          selectedIds: selectedItems.map((item) => item.canonical_id),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status === 'error' || data?.status === 'availability_conflict') {
        const message =
          data?.message ||
          (data?.status === 'availability_conflict'
            ? 'Uno o más soportes seleccionados ya no están disponibles para reserva inmediata.'
            : 'No pudimos enviar tu solicitud. Verifica tu conexión e intenta nuevamente.');
        setErrorMessage(message);
        setSubmissionState('ERROR');
        return;
      }

      const finalReqId = data?.requestId || `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setRequestId(finalReqId);
      setSubmissionState('SUCCESS');

      // Record lead in dashboard store for seamless demo experience
      try {
        const uniquePlazas = Array.from(new Set(selectedItems.map((s) => (s.ciudad === 'mendoza' ? 'Mendoza' : 'Buenos Aires'))));
        recordNewLead({
          requestId: finalReqId,
          clientName: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          supportIds: selectedItems.map((s) => s.canonical_id),
          supportNames: selectedItems.map((s) => s.name),
          plazas: uniquePlazas,
        });
      } catch {
        // ignore
      }
    } catch (err) {
      setErrorMessage('No pudimos enviar tu solicitud. Verifica tu conexión e intenta nuevamente.');
      setSubmissionState('ERROR');
    }
  };

  const handleFinish = () => {
    clearSelection();
    onClose();
  };

  const isLoading = submissionState === 'LOADING';

  // Group items by Plaza for clean summary display when > 3
  const mendozaCount = selectedItems.filter((i) => i.ciudad === 'mendoza').length;
  const bueCount = selectedItems.filter((i) => i.ciudad === 'buenos-aires').length;

  return (
    <>
      {/* Mobile backdrop for scroll and click containment */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-[1400] md:hidden transition-opacity"
        onClick={submissionState === 'SUCCESS' ? handleFinish : onClose}
        aria-hidden="true"
      />

      <div
        className="fixed md:absolute bottom-0 left-0 right-0 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-[440px] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl z-[1500] md:border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mediakit-modal-title"
      >
        {/* Header */}
        <div className="p-4 bg-white md:bg-gray-50 flex justify-between items-center border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span id="mediakit-modal-title" className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Solicitud de Media Kit
            </span>
            {selectedItems.length > 0 && submissionState !== 'SUCCESS' && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {selectedItems.length}
              </span>
            )}
          </div>
          <button
            onClick={submissionState === 'SUCCESS' ? handleFinish : onClose}
            className="p-1.5 bg-gray-50 md:bg-white rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shadow-sm"
            aria-label="Cerrar panel de Media Kit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 md:p-6 overflow-y-auto overscroll-contain">
        {submissionState === 'SUCCESS' ? (
          /* SUCCESS STATE */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <h3 className="text-xl font-bold mb-1 text-gray-900">Solicitud recibida</h3>

            {requestId && (
              <div className="my-2.5 inline-block bg-gray-100 text-gray-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-gray-200">
                Código: {requestId}
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              Registramos tu pedido para{' '}
              <span className="font-semibold text-gray-900">
                {selectedItems.length} {selectedItems.length === 1 ? 'soporte' : 'soportes'}
              </span>
              . Te enviaremos el Media Kit consolidado a <span className="font-semibold text-gray-900">{email}</span> a la brevedad.
            </p>

            <div className="w-full bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-left mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Soportes incluidos
              </span>
              <ul className="space-y-1.5 text-xs text-gray-700 max-h-32 overflow-y-auto">
                {selectedItems.map((item) => (
                  <li key={item.canonical_id} className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleFinish} className="w-full">
              Volver al inventario
            </Button>
          </div>
        ) : selectedItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <ImageIcon className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Todavía no seleccionaste soportes</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Elegí uno o más soportes disponibles en el mapa para solicitar su Media Kit oficial.
            </p>
            <Button onClick={onGoToInventory}>Ir al inventario</Button>
          </div>
        ) : (
          /* ACTIVE / FORM STATE */
          <>
            {/* Selected Supports Section */}
            <div className="mb-5 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700">
                    {selectedItems.length === 1 ? '1 soporte seleccionado' : `${selectedItems.length} soportes seleccionados`}
                  </span>
                  {selectedItems.length > 3 && (
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                      {mendozaCount > 0 && <span>Mendoza ({mendozaCount})</span>}
                      {mendozaCount > 0 && bueCount > 0 && <span>·</span>}
                      {bueCount > 0 && <span>Buenos Aires ({bueCount})</span>}
                    </div>
                  )}
                </div>

                {selectedItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setIsListExpanded(!isListExpanded)}
                    className="text-xs text-gray-600 hover:text-black font-semibold flex items-center gap-1 p-1 rounded-md hover:bg-gray-200/50 transition-colors"
                  >
                    {isListExpanded ? (
                      <>
                        <span>Ocultar</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Ver lista</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Items List: Rendered directly if <= 3, or when expanded if > 3 */}
              {(selectedItems.length <= 3 || isListExpanded) && (
                <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.canonical_id}
                      className="flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{item.name}</span>
                        <Badge variant="neutral" className="text-[9px] uppercase px-1.5 py-0">
                          {isMobileRoute(item) ? 'móvil' : item.tipo_soporte}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelected(item.canonical_id)}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors shrink-0 disabled:opacity-50"
                        aria-label={`Quitar ${item.name} de la selección`}
                        title="Quitar soporte"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ERROR BANNER */}
            {submissionState === 'ERROR' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Lead Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <Label htmlFor="mk-name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mk-name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationErrors.name) {
                      setValidationErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  disabled={isLoading}
                  required
                  placeholder="Tu nombre y apellido"
                  className={validationErrors.name ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mk-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mk-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  disabled={isLoading}
                  required
                  placeholder="nombre@empresa.com"
                  className={validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mk-company">Empresa (Opcional)</Label>
                  <Input
                    id="mk-company"
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                    placeholder="Tu empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="mk-phone">Teléfono (Opcional)</Label>
                  <Input
                    id="mk-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    placeholder="+54 9..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mk-message">Observaciones (Opcional)</Label>
                <Textarea
                  id="mk-message"
                  name="message"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Fechas estimadas o requerimientos especiales"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando solicitud...
                  </span>
                ) : submissionState === 'ERROR' ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reintentar envío ({selectedItems.length})
                  </span>
                ) : (
                  `Enviar solicitud (${selectedItems.length})`
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  </>
  );
}
