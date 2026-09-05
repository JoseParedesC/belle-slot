import { Empresa } from '../types';

export interface PaletaTema {
  primary: string;
  primaryHover: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  primaryGlow: string;
  accentGold: string;
  accentGoldLight: string;
  bgPage: string;
}

export const PALETA_DEFAULT: PaletaTema = {
  primary: '#d94676',
  primaryHover: '#be3360',
  primaryDark: '#8c1e40',
  primaryLight: '#fff2f6',
  primarySubtle: '#fbebf0',
  primaryGlow: 'rgba(217, 70, 118, 0.22)',
  accentGold: '#c29057',
  accentGoldLight: '#faf3eb',
  bgPage: '#faf6f8',
};

// Conversor seguro de HEX a { r, g, b }
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;

  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Mezclador de colores para generar tonos suaves o fondos pastel
export function mezclarConBlanco(hex: string, pesoBlanco: number = 0.9): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#fff2f6';

  const w = Math.min(Math.max(pesoBlanco, 0), 1);
  const r = Math.round(rgb.r * (1 - w) + 255 * w);
  const g = Math.round(rgb.g * (1 - w) + 255 * w);
  const b = Math.round(rgb.b * (1 - w) + 255 * w);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Oscurecer un color para estados :hover o :active
export function oscurecer(hex: string, factor: number = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const f = Math.min(Math.max(factor, 0), 1);
  const r = Math.max(0, Math.round(rgb.r * (1 - f)));
  const g = Math.max(0, Math.round(rgb.g * (1 - f)));
  const b = Math.max(0, Math.round(rgb.b * (1 - f)));

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Genera la paleta completa computada a partir de los datos configurados en la Empresa
 */
export function generarPaleta(empresa?: Partial<Empresa> | null): PaletaTema {
  const primary = empresa?.colorPrimario || PALETA_DEFAULT.primary;
  const secondary = empresa?.colorSecundario;
  const accent = empresa?.colorAcento || PALETA_DEFAULT.accentGold;
  const bg = empresa?.colorFondo || PALETA_DEFAULT.bgPage;

  const rgb = hexToRgb(primary) || { r: 217, g: 70, b: 118 };

  return {
    primary,
    primaryHover: secondary ? oscurecer(secondary, 0.08) : oscurecer(primary, 0.15),
    primaryDark: secondary || oscurecer(primary, 0.35),
    primaryLight: mezclarConBlanco(primary, 0.93),
    primarySubtle: mezclarConBlanco(primary, 0.86),
    primaryGlow: 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.22)',
    accentGold: accent,
    accentGoldLight: mezclarConBlanco(accent, 0.92),
    bgPage: bg,
  };
}

/**
 * Inyecta dinámicamente las variables CSS en el :root (document.documentElement)
 */
export function aplicarTema(empresa?: Partial<Empresa> | null): void {
  if (typeof document === 'undefined') return;

  const paleta = generarPaleta(empresa);
  const root = document.documentElement;

  root.style.setProperty('--primary', paleta.primary);
  root.style.setProperty('--primary-hover', paleta.primaryHover);
  root.style.setProperty('--primary-dark', paleta.primaryDark);
  root.style.setProperty('--primary-light', paleta.primaryLight);
  root.style.setProperty('--primary-subtle', paleta.primarySubtle);
  root.style.setProperty('--primary-glow', paleta.primaryGlow);
  root.style.setProperty('--border-focus', paleta.primary);
  root.style.setProperty('--accent-gold', paleta.accentGold);
  root.style.setProperty('--accent-gold-light', paleta.accentGoldLight);
  root.style.setProperty('--bg-page', paleta.bgPage);
}

// Paletas preestablecidas de alta gama para creación rápida de salones
export const PALETAS_PRESET = [
  {
    id: 'rose-gold',
    nombre: 'Rose Gold Belle',
    primary: '#d94676',
    secondary: '#8c1e40',
    accent: '#c29057',
    bg: '#faf6f8',
  },
  {
    id: 'royal-purple',
    nombre: 'Royal Violet Glamour',
    primary: '#7c3aed',
    secondary: '#5b21b6',
    accent: '#06b6d4',
    bg: '#f8f7fc',
  },
  {
    id: 'emerald-luxury',
    nombre: 'Emerald Spa',
    primary: '#059669',
    secondary: '#065f46',
    accent: '#d97706',
    bg: '#f0fdf4',
  },
  {
    id: 'ruby-elegance',
    nombre: 'Ruby Velvet',
    primary: '#e11d48',
    secondary: '#9f1239',
    accent: '#f59e0b',
    bg: '#fff1f2',
  },
  {
    id: 'midnight-sapphire',
    nombre: 'Sapphire Studio',
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#eab308',
    bg: '#f0f7ff',
  },
];
