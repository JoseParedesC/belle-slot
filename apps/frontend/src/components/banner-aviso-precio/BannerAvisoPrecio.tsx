import { AlertTriangle } from 'lucide-react';

interface Props {
  texto: string;
}

export function BannerAvisoPrecio({ texto }: Props) {
  return (
    <div className="banner-aviso-precio" role="note">
      ⚠️ {texto}
      <div className="banner-aviso-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="banner-aviso-texto">
        <strong>Aviso importante:</strong> {texto}
      </div>
    </div>
  );
}
