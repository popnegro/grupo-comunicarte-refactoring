import { useState, FormEvent } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea, Label } from '../ui/Input';

interface ContactSlideProps {
  itemName: string;
  onBack: () => void;
}

export function ContactSlide({ itemName, onBack }: ContactSlideProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No hay backend de envío en el PMV: se valida y se confirma la acción en la UI.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-2">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Consulta enviada</h3>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          Recibimos tu consulta sobre <span className="font-medium text-gray-700">{itemName}</span>. Nuestro equipo comercial te va a contactar a la brevedad.
        </p>
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al detalle
      </button>

      <h3 className="text-lg font-bold mb-1">Consultar disponibilidad</h3>
      <p className="text-sm text-gray-500 mb-6">
        Sobre <span className="font-medium text-gray-700">{itemName}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="contact-name">Nombre</Label>
          <Input id="contact-name" name="name" required placeholder="Tu nombre" />
        </div>
        <div>
          <Label htmlFor="contact-company">Empresa</Label>
          <Input id="contact-company" name="company" placeholder="Nombre de tu empresa (opcional)" />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required placeholder="tu@empresa.com" />
        </div>
        <div>
          <Label htmlFor="contact-phone">Teléfono</Label>
          <Input id="contact-phone" name="phone" type="tel" placeholder="Opcional" />
        </div>
        <div>
          <Label htmlFor="contact-message">Mensaje</Label>
          <Textarea id="contact-message" name="message" rows={3} placeholder={`Quisiera consultar por ${itemName}...`} />
        </div>
        <Button type="submit" className="w-full">Enviar consulta</Button>
      </form>
    </div>
  );
}
