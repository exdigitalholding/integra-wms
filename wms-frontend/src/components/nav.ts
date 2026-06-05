import {
  LayoutDashboard,
  Truck,
  MapPin,
  Boxes,
  ClipboardCheck,
  ScanLine,
  ArrowUpDown,
  PackageCheck,
  Shuffle,
  ListTodo,
  Receipt,
  Plug,
  BarChart3,
  Settings,
  Smartphone,
  Box,
  Shield,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group: string
  only3pl?: boolean
  badge?: string
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Visão geral' },

  { to: '/recebimento', label: 'Recebimento', icon: Truck, group: 'Inbound' },
  { to: '/putaway', label: 'Endereçamento', icon: MapPin, group: 'Inbound' },
  { to: '/cross-docking', label: 'Cross-docking', icon: Shuffle, group: 'Inbound' },

  { to: '/estoque', label: 'Estoque', icon: Boxes, group: 'Estoque' },
  { to: '/mapa-3d', label: 'Planta 3D', icon: Box, group: 'Estoque', badge: 'novo' },
  { to: '/inventario', label: 'Inventário rotativo', icon: ClipboardCheck, group: 'Estoque' },
  { to: '/reabastecimento', label: 'Reabastecimento', icon: ArrowUpDown, group: 'Estoque' },

  { to: '/picking', label: 'Picking', icon: ScanLine, group: 'Outbound' },
  { to: '/expedicao', label: 'Packing & Expedição', icon: PackageCheck, group: 'Outbound' },

  { to: '/tarefas', label: 'Fila de tarefas', icon: ListTodo, group: 'Operação' },
  { to: '/coletor', label: 'Coletor RF', icon: Smartphone, group: 'Operação' },

  { to: '/faturamento', label: 'Faturamento 3PL', icon: Receipt, group: 'Gestão', only3pl: true },
  { to: '/relatorios', label: 'Relatórios & KPIs', icon: BarChart3, group: 'Gestão' },
  { to: '/integracoes', label: 'Integrações', icon: Plug, group: 'Gestão' },
  { to: '/transicao-operacional', label: 'Transição Operacional', icon: Shield, group: 'Gestão', badge: 'demo' },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, group: 'Gestão' },
]
