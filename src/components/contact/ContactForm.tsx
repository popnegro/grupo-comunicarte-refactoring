import { FormEvent, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSelection } from '../../context/SelectionContext';
import { Input, Textarea, Label } from '../ui/Input';
import { Button } from '../ui/Button';
import { recordNewLead } from '../../lib/dashboard-store';

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Completá tu nombre y un email válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mediakit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: {
            name: name.trim(),
            company: company.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
          },
          selectedIds: Array.from(selectedIds),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.status === 'error' || data?.status === 'availability_conflict') {
        throw new Error(data?.message || 'No pudimos enviar tu solicitud. Intentá nuevamente.');
      }

      const requestId = data?.requestId || `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      recordNewLead({
        requestId,
        clientName: name.trim(),
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        supportIds: Array.from(selectedIds),
        supportNames: [],
        plazas: [],
      });
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
