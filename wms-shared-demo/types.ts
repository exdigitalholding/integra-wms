export type DemoAppScope = 'admin' | 'frontend-supervisor' | 'mobile-operador' | 'demo' | 'remover'

export interface DemoWarehouse {
  id: string
  codigo: string
  nome: string
  cidade: string
  uf: string
  modo: 'simples' | 'completo'
  ativo: boolean
}

export interface DemoOwner {
  id: string
  codigo: string
  nome: string
  cnpj: string
  cor: string
  ativo: boolean
}

export interface DemoSku {
  id: string
  codigo: string
  ean: string
  descricao: string
  categoria: string
  curva: 'A' | 'B' | 'C'
  unidade: string
  unidadesPorCaixa: number
  peso: number
  altura: number
  largura: number
  profundidade: number
  controleLote: boolean
  controleValidade: boolean
  controleSerie: boolean
  ncm: string
  cest: string
  origem: number
  ownerId: string
  ativo: boolean
}

export interface DemoAddress {
  codigo: string
  armazemId: string
  zona: string
  tipo: 'picking' | 'pulmao' | 'recebimento' | 'expedicao' | 'avaria' | 'quarentena'
  bloqueado: boolean
}

export interface DemoProfile {
  id: string
  nome: string
  cor: string
  permissoes: string[]
}

export interface DemoUser {
  id: string
  nome: string
  email: string
  perfilId: string
  armazemIds: string[]
  ownerIds?: string[]
  ativo: boolean
}

export interface DemoOccurrenceReason {
  id: string
  codigo: string
  rotulo: string
  tipo:
    | 'falta'
    | 'sobra'
    | 'item-trocado'
    | 'avaria'
    | 'local-cheio'
    | 'local-vazio'
  exigeFoto?: boolean
  exigeAprovacao?: boolean
  cor: string
}

export interface DemoEffectiveParameter {
  chave: string
  grupo: string
  label: string
  descricao: string
  valor: string
  valorLabel: string
  origem: 'global' | 'cd' | 'owner'
  escopoLabel: string
  gerenciadoPor: 'wms-admin-business'
  consumidoPor: Array<'wms-frontend' | 'wms-mobile'>
}

export interface DemoDevice {
  id: string
  nome: string
  tipo: 'coletor' | 'voice' | 'tablet'
  status: 'online' | 'offline' | 'manutencao'
  operador: string
  armazemId: string
}

export interface DemoOperationalTask {
  id: string
  fluxo:
    | 'receber'
    | 'guardar'
    | 'separar'
    | 'conferir'
    | 'contar'
    | 'abastecer'
  prioridade: 'alta' | 'normal'
  resumo: string
  contexto: string
  conclusao: string
  ownerId: string
  armazemId: string
  origem: string
  destino: string
  skuCodigo: string
  quantidadeBase: number
  passos: Array<{
    instrucao: string
    esperado: string
    rotulo: string
    tipo: 'scan' | 'quantidade' | 'confirmar'
    icon: string
    dica?: string
    unidade?: 'un' | 'cx' | 'plt'
    fatorBase?: number
    contagemMista?: boolean
  }>
}

export interface DemoAppResponsibility {
  tela: string
  app: 'wms-admin-business' | 'wms-frontend' | 'wms-mobile'
  classificacao: DemoAppScope
  papel: string
  acaoEsperada: string
}
