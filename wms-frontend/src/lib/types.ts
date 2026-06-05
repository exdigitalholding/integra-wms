export type Vertente = 'ecommerce' | 'industria' | '3pl'

export type StatusEstoque =
  | 'disponivel'
  | 'quarentena'
  | 'avaria'
  | 'qualidade'
  | 'reservado'

export interface Owner {
  id: string
  nome: string
  cor: string
}

export interface CD {
  id: string
  nome: string
  uf: string
}

export interface SKU {
  id: string
  codigo: string
  descricao: string
  curva: 'A' | 'B' | 'C'
  unidade: string
  controleLote: boolean
  controleSerie: boolean
  peso: number
}

export interface Lote {
  lote: string
  validade: string
}

export interface PosicaoEstoque {
  id: string
  skuCodigo: string
  descricao: string
  endereco: string
  lote: string | null
  validade: string | null
  ownerId: string
  curva: 'A' | 'B' | 'C'
  quantidade: number
  status: StatusEstoque
}

export type StatusRecebimento =
  | 'agendado'
  | 'na-doca'
  | 'em-conferencia'
  | 'divergencia'
  | 'concluido'

export interface ItemRecebimento {
  skuCodigo: string
  descricao: string
  esperado: number
  contado: number | null
  lote?: string
  validade?: string
  conferido: boolean
  ocorrencia?: Ocorrencia
}

export interface Recebimento {
  id: string
  doca: string
  fornecedor: string
  documento: string
  tipoDoc: 'NF-e' | 'ASN'
  ownerId: string
  vertente: Vertente
  eta: string
  status: StatusRecebimento
  itens: ItemRecebimento[]
}

export interface Ocorrencia {
  tipo: 'falta' | 'sobra' | 'item-trocado' | 'avaria'
  quantidadeReal: number
  observacao: string
  foto: boolean
}

export type StatusTarefa = 'pendente' | 'em-andamento' | 'concluida'
export type TipoTarefa =
  | 'putaway'
  | 'picking'
  | 'reabastecimento'
  | 'contagem'
  | 'cross-docking'

export interface Tarefa {
  id: string
  tipo: TipoTarefa
  prioridade: 'alta' | 'media' | 'baixa'
  operador: string | null
  status: StatusTarefa
  origem: string
  destino: string
  sku: string
  descricao: string
  quantidade: number
  lote?: string | null
  sla?: string
  ondaId?: string
}

export interface Onda {
  id: string
  estrategia: 'discreto' | 'batch' | 'wave' | 'zona' | 'cluster'
  pedidos: number
  linhas: number
  itens: number
  status: 'planejada' | 'liberada' | 'em-separacao' | 'concluida'
  corte: string
  progresso: number
}

export type StatusPedido =
  | 'aguardando'
  | 'em-separacao'
  | 'em-packing'
  | 'expedido'

export interface ItemPedido {
  skuCodigo: string
  descricao: string
  quantidade: number
  conferido: number
}

export interface Pedido {
  id: string
  cliente: string
  ownerId: string
  transportadora: string
  rota: string
  status: StatusPedido
  itens: ItemPedido[]
  peso: number
  volumes: number
  prazo: string
}

export interface ContagemItem {
  id: string
  endereco: string
  skuCodigo: string
  descricao: string
  sistemico: number
  contado: number | null
  recontagem: number | null
  status: 'pendente' | 'ok' | 'divergente' | 'aguardando-aprovacao' | 'ajustado'
  ownerId: string
}

export interface FaturaServico {
  ownerId: string
  armazenagem: number
  movimentacaoEntrada: number
  movimentacaoSaida: number
  pickingLinhas: number
  vas: number
  paletesDia: number
  total: number
}

export interface Integracao {
  id: string
  nome: string
  tipo: 'ERP' | 'TMS' | 'Marketplace' | 'EDI' | 'Transportadora'
  status: 'conectado' | 'erro' | 'sincronizando'
  ultimaSync: string
  registros: number
}

export interface RomaneioVolume {
  pedido: string
  volumes: number
  peso: number
  carregado: boolean
}
export interface Romaneio {
  id: string
  transportadora: string
  rota: string
  veiculo: string
  volumes: RomaneioVolume[]
  status: 'montando' | 'em-carregamento' | 'despachado'
}
