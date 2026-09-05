interface Props {
  texto: string;
}

export function BannerAvisoPrecio({ texto }: Props) {
  return (
    <div className="banner-aviso-precio" role="note">
      ⚠️ {texto}
    </div>
  );
}
