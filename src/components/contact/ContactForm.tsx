import { FormEvent, useState } from 'react';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useSelection } from '../../context/SelectionContext';
import { Input, Textarea, Label } from '../ui/Input';
import { Button } from '../ui/Button';
import { recordNewLead } from '../../lib/dashboard-store';
import { downloadMediaKitPdf, MediaKitLead, MediaKitSupport } from '../../lib/mediaKitPdf';

export function ContactForm({ isMediaKit = false }: { isMediaKit?: boolean }) {
  const { selectedIds, selectedCount, clearSelection } = useSelection();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestId, setRequestId] = useState('');
  const [submittedLead, setSubmittedLead] = useState<MediaKitLead | null>(null);
  const [submittedSupports, setSubmittedSupports] = useState<MediaKitSupport[]>([]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const selectedSupportIds = Array.from(selectedIds);

    if (normalizedName.length < 2 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Completá tu nombre y un email válido.');
      return;
    }

    if (isMediaKit && selectedSupportIds.length === 0) {
      setError('Seleccioná al menos un soporte antes de solicitar el Media Kit.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mediakit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: {
            name: normalizedName,
            company: company.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            message: message.trim(),
          },
          selectedIds: selectedSupportIds,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.status === 'error' || data?.status === 'availability_conflict') {
        throw new Error(data?.message || 'No pudimos enviar tu solicitud. Intentá nuevamente.');
      }

      const newRequestId = data?.requestId || `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
      const leadPayload: MediaKitLead = {
        name: normalizedName,
        email: normalizedEmail,
        company: company.trim(),
        phone: phone.trim(),
      };

      let supportPayload: MediaKitSupport[] = selectedSupportIds.map((id) => ({
        canonical_id: id,
        name: id,
        ciudad: 'Mendoza / Buenos Aires',
        tipo_soporte: 'Soporte publicitario',
      }));

      if (isMediaKit && selectedSupportIds.length > 0) {
        try {
          const supportsResponse = await fetch('/api/supports');
          const supportsData = await supportsResponse.json().catch(() => null);
          if (supportsResponse.ok && supportsData?.status === 'success') {
            const selected = new Set(selectedSupportIds);
            supportPayload = (supportsData.data || [])
              .filter((support: MediaKitSupport) => selected.has(support.canonical_id))
              .map((support: MediaKitSupport) => ({
                canonical_id: support.canonical_id,
                name: support.name,
                ciudad: support.ciudad,
                tipo_soporte: support.tipo_soporte,
                address: support.address,
                description: support.description,
                characteristics: support.characteristics,
              }));
          }
        } catch {
          // Keep the IDs as a safe fallback; the request is already persisted.
        }
      }

      recordNewLead({
        requestId: newRequestId,
        clientName: normalizedName,
        company: company.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        message: message.trim(),
        supportIds: selectedSupportIds,
        supportNames: supportPayload.map((support) => support.name),
        plazas: supportPayload.map((support) => support.ciudad),
      });

      setRequestId(newRequestId);
      setSubmittedLead(leadPayload);
      setSubmittedSupports(supportPayload);
      setSuccess(isMediaKit ? 'Solicitud de Media Kit recibida.' : 'Recibimos tu consulta.');
      if (isMediaKit) clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar tu solicitud. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 md:p-8">
        <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-gray-950">Listo</h2>
        <p className="mt-2 text-sm text-gray-600">{success}</p>
        {isMediaKit && submittedLead && (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-white/80 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Solicitud</p>
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{requestId}</p>
            <p className="mt-2 text-sm text-gray-600">
              {submittedSupports.length} {submittedSupports.length === 1 ? 'soporte incorporado' : 'soportes incorporados'} al documento.
            </p>
            <Button
              type="button"
              onClick={() => downloadMediaKitPdf(submittedLead, submittedSupports, requestId)}
              className="mt-4 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Descargar Media Kit PDF
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 md:p-8 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{isMediaKit ? 'Media Kit' : 'Contacto'}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{isMediaKit ? 'Solicitá tu Media Kit' : 'Contanos qué necesitás'}</h2>
        {isMediaKit && <p className="mt-2 text-sm text-gray-500">{selectedCount} {selectedCount === 1 ? 'soporte seleccionado' : 'soportes seleccionados'}.</p>}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="contact-name">Nombre completo *</Label><Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu nombre y apellido" /></div>
        <div><Label htmlFor="contact-company">Empresa</Label><Input id="contact-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa o agencia" /></div>
        <div><Label htmlFor="contact-email">Email *</Label><Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nombre@empresa.com" /></div>
        <div><Label htmlFor="contact-phone">Teléfono</Label><Input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 9 ..." /></div>
      </div>
      <div><Label htmlFor="contact-message">Mensaje</Label><Textarea id="contact-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contanos brevemente qué necesitás." /></div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-48">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Enviando…' : isMediaKit ? 'Solicitar Media Kit' : 'Enviar consulta'}
      </Button>
    </form>
  );
}
