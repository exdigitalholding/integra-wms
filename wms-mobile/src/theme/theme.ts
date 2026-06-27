/**
 * Tema do Coletor Integra.
 * Cores derivadas da marca do wms-frontend: marinho institucional + teal da logomarca.
 * Princípio do app: cor SEMPRE acompanha ícone — nunca é o único sinal (operador de baixa alfabetização).
 */

export const colors = {
  // Marca Integra
  brand: '#21274E', // marinho institucional
  brandDark: '#161A36',
  brandSoft: '#2E3566',
  accent: '#00A88E', // teal da logomarca
  accentDark: '#007D69',

  // Superfícies
  bg: '#F4F6FB', // fundo geral claro
  surface: '#FFFFFF',
  surfaceSub: '#EEF0F6',

  // Texto (contraste alto — mínimo 4.5:1)
  ink: '#1B2140',
  inkSoft: '#475069',
  inkMuted: '#7A8199',
  onBrand: '#FFFFFF',

  // Semânticos (cada um tem um ícone fixo associado em iconFor)
  ok: '#0E9F6E',
  okSoft: '#E3F8EF',
  warn: '#E08A00',
  warnSoft: '#FFF6E5',
  bad: '#E02424',
  badSoft: '#FDECEC',
  info: '#2563EB',
  infoSoft: '#E8EFFE',

  line: '#E2E6F0',
} as const;

/** Cores por tipo de atividade do coletor — usadas nos cards grandes da Home. */
export const activityColors = {
  receber: '#2563EB', // azul (inbound / chegada)
  guardar: '#00A88E', // teal (putaway)
  separar: '#21274E', // marinho (picking)
  conferir: '#7C3AED', // roxo (conferência de saída)
  carregar: '#DC2626', // vermelho operacional (carregamento / expedição)
  contar: '#E08A00', // âmbar (inventário)
  abastecer: '#0E9F6E', // verde (reabastecimento)
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/**
 * Tipografia propositalmente grande. Operador lê de longe, com luva, no frio.
 * Nada de corpo menor que 16. Números e valores esperados são enormes.
 */
export const type = {
  giant: 56, // valor esperado (endereço, código) — o herói da tela
  display: 34, // títulos de tela
  title: 24,
  body: 18,
  bodyBold: 18,
  label: 15,
  caption: 13,
} as const;

export const shadow = {
  card: {
    shadowColor: '#21274E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lifted: {
    shadowColor: '#21274E',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
