import type {
  CD,
  ContagemItem,
  FaturaServico,
  Integracao,
  Onda,
  Owner,
  Pedido,
  PosicaoEstoque,
  Recebimento,
  Romaneio,
  Tarefa,
} from './types'

export const CDS: CD[] = [
  { id: 'cd-sp', nome: 'CD Cajamar', uf: 'SP' },
  { id: 'cd-rj', nome: 'CD Duque de Caxias', uf: 'RJ' },
  { id: 'cd-pe', nome: 'CD Jaboatão', uf: 'PE' },
]

export const OWNERS: Owner[] = [
  { id: 'own-all', nome: 'Todos os clientes', cor: '#64748b' },
  { id: 'own-nano', nome: 'NanoTech Eletrônicos', cor: '#2563eb' },
  { id: 'own-bella', nome: 'Bella Cosméticos', cor: '#db2777' },
  { id: 'own-verde', nome: 'Verde Alimentos', cor: '#16a34a' },
  { id: 'own-forte', nome: 'Forte Indústria', cor: '#f97316' },
]

export const ownerName = (id: string) =>
  OWNERS.find((o) => o.id === id)?.nome ?? '—'
export const ownerColor = (id: string) =>
  OWNERS.find((o) => o.id === id)?.cor ?? '#64748b'

export const KPIS = {
  acuracidade: 99.4,
  produtividade: 142,
  otif: 97.8,
  ocupacao: 81,
  dockToStock: 2.4,
  divergencia: 0.6,
  cicloPedido: 3.1,
}

export const PRODUTIVIDADE_SEMANA = [
  { dia: 'Seg', linhas: 118, meta: 130 },
  { dia: 'Ter', linhas: 134, meta: 130 },
  { dia: 'Qua', linhas: 129, meta: 130 },
  { dia: 'Qui', linhas: 151, meta: 130 },
  { dia: 'Sex', linhas: 162, meta: 130 },
  { dia: 'Sáb', linhas: 98, meta: 130 },
]

export const FLUXO_DIA = [
  { hora: '06h', recebido: 12, expedido: 4 },
  { hora: '08h', recebido: 34, expedido: 21 },
  { hora: '10h', recebido: 58, expedido: 47 },
  { hora: '12h', recebido: 41, expedido: 63 },
  { hora: '14h', recebido: 67, expedido: 88 },
  { hora: '16h', recebido: 52, expedido: 102 },
  { hora: '18h', recebido: 29, expedido: 74 },
]

export const OCUPACAO_ZONAS = [
  { zona: 'Picking A', ocupacao: 92 },
  { zona: 'Picking B', ocupacao: 78 },
  { zona: 'Pulmão', ocupacao: 84 },
  { zona: 'Refrigerados', ocupacao: 61 },
  { zona: 'Quarentena', ocupacao: 28 },
]

export const STATUS_PEDIDOS = [
  { name: 'Expedido', value: 248, cor: '#16a34a' },
  { name: 'Em packing', value: 42, cor: '#2563eb' },
  { name: 'Em separação', value: 67, cor: '#f97316' },
  { name: 'Aguardando', value: 31, cor: '#94a3b8' },
]

export const RECEBIMENTOS: Recebimento[] = [
  {
    id: 'REC-2041',
    doca: 'Doca 03',
    fornecedor: 'Distribuidora Andrade',
    documento: 'NF-e 88.214',
    tipoDoc: 'NF-e',
    ownerId: 'own-nano',
    vertente: 'ecommerce',
    eta: '08:30',
    status: 'em-conferencia',
    itens: [
      { skuCodigo: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', esperado: 120, contado: null, conferido: false },
      { skuCodigo: 'SKU-10242', descricao: 'Carregador Turbo 30W', esperado: 200, contado: null, conferido: false },
      { skuCodigo: 'SKU-10243', descricao: 'Cabo USB-C 2m', esperado: 350, contado: null, conferido: false },
      { skuCodigo: 'SKU-10244', descricao: 'Power Bank 10000mAh', esperado: 80, contado: null, conferido: false },
    ],
  },
  {
    id: 'REC-2042',
    doca: 'Doca 01',
    fornecedor: 'Verde Alimentos S/A',
    documento: 'ASN 5567',
    tipoDoc: 'ASN',
    ownerId: 'own-verde',
    vertente: '3pl',
    eta: '09:15',
    status: 'na-doca',
    itens: [
      { skuCodigo: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', esperado: 240, contado: null, conferido: false, lote: 'L-2410', validade: '2026-10-12' },
      { skuCodigo: 'SKU-30012', descricao: 'Grão de Bico 1kg', esperado: 180, contado: null, conferido: false, lote: 'L-2255', validade: '2026-08-01' },
    ],
  },
  {
    id: 'REC-2043',
    doca: 'Doca 05',
    fornecedor: 'Forte Indústria Ltda',
    documento: 'NF-e 12.880',
    tipoDoc: 'NF-e',
    ownerId: 'own-forte',
    vertente: 'industria',
    eta: '10:00',
    status: 'agendado',
    itens: [
      { skuCodigo: 'MP-7781', descricao: 'Resina PET grau A', esperado: 50, contado: null, conferido: false, lote: 'MP-A-991', validade: '2027-01-01' },
      { skuCodigo: 'MP-7782', descricao: 'Pigmento Azul 04', esperado: 25, contado: null, conferido: false, lote: 'MP-B-552', validade: '2026-12-15' },
    ],
  },
  {
    id: 'REC-2040',
    doca: 'Doca 02',
    fornecedor: 'Bella Distribuição',
    documento: 'NF-e 44.120',
    tipoDoc: 'NF-e',
    ownerId: 'own-bella',
    vertente: '3pl',
    eta: '07:45',
    status: 'concluido',
    itens: [
      { skuCodigo: 'SKU-20055', descricao: 'Sérum Vitamina C 30ml', esperado: 300, contado: 300, conferido: true, lote: 'B-7781', validade: '2026-05-30' },
    ],
  },
]

export const ESTOQUE: PosicaoEstoque[] = [
  { id: 'e1', skuCodigo: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', endereco: 'A-12-03-2', lote: null, validade: null, ownerId: 'own-nano', curva: 'A', quantidade: 84, status: 'disponivel' },
  { id: 'e2', skuCodigo: 'SKU-10242', descricao: 'Carregador Turbo 30W', endereco: 'A-12-04-1', lote: null, validade: null, ownerId: 'own-nano', curva: 'A', quantidade: 156, status: 'disponivel' },
  { id: 'e3', skuCodigo: 'SKU-10243', descricao: 'Cabo USB-C 2m', endereco: 'A-13-01-1', lote: null, validade: null, ownerId: 'own-nano', curva: 'A', quantidade: 12, status: 'disponivel' },
  { id: 'e4', skuCodigo: 'SKU-20055', descricao: 'Sérum Vitamina C 30ml', endereco: 'B-04-12-3', lote: 'B-7781', validade: '2026-05-30', ownerId: 'own-bella', curva: 'B', quantidade: 300, status: 'disponivel' },
  { id: 'e5', skuCodigo: 'SKU-20056', descricao: 'Base Líquida Tom 02', endereco: 'B-05-02-2', lote: 'B-6610', validade: '2026-06-04', ownerId: 'own-bella', curva: 'B', quantidade: 45, status: 'quarentena' },
  { id: 'e6', skuCodigo: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', endereco: 'C-08-01-1', lote: 'L-2410', validade: '2026-10-12', ownerId: 'own-verde', curva: 'B', quantidade: 240, status: 'disponivel' },
  { id: 'e7', skuCodigo: 'SKU-30012', descricao: 'Grão de Bico 1kg', endereco: 'C-08-03-1', lote: 'L-2255', validade: '2026-08-01', ownerId: 'own-verde', curva: 'C', quantidade: 180, status: 'disponivel' },
  { id: 'e8', skuCodigo: 'MP-7781', descricao: 'Resina PET grau A', endereco: 'D-01-01-1', lote: 'MP-A-991', validade: '2027-01-01', ownerId: 'own-forte', curva: 'C', quantidade: 50, status: 'qualidade' },
  { id: 'e9', skuCodigo: 'SKU-10244', descricao: 'Power Bank 10000mAh', endereco: 'A-14-02-2', lote: null, validade: null, ownerId: 'own-nano', curva: 'A', quantidade: 8, status: 'reservado' },
  { id: 'e10', skuCodigo: 'SKU-20057', descricao: 'Batom Matte Rubi', endereco: 'B-06-01-1', lote: 'B-5540', validade: '2025-12-10', ownerId: 'own-bella', curva: 'C', quantidade: 22, status: 'avaria' },
]

export const TAREFAS: Tarefa[] = [
  { id: 'T-9001', tipo: 'putaway', prioridade: 'alta', operador: null, status: 'pendente', origem: 'STG-REC-03', destino: 'B-04-12-3', sku: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', quantidade: 120, sla: '08:55' },
  { id: 'T-9002', tipo: 'putaway', prioridade: 'media', operador: null, status: 'pendente', origem: 'STG-REC-03', destino: 'A-12-04-1', sku: 'SKU-10242', descricao: 'Carregador Turbo 30W', quantidade: 200, sla: '09:10' },
  { id: 'T-9003', tipo: 'picking', prioridade: 'alta', operador: 'Carlos M.', status: 'em-andamento', origem: 'A-12-03-2', destino: 'PACK-01', sku: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', quantidade: 2, sla: '08:40', ondaId: 'OND-501' },
  { id: 'T-9004', tipo: 'picking', prioridade: 'alta', operador: 'Carlos M.', status: 'pendente', origem: 'A-12-04-1', destino: 'PACK-01', sku: 'SKU-10242', descricao: 'Carregador Turbo 30W', quantidade: 1, sla: '08:40', ondaId: 'OND-501' },
  { id: 'T-9005', tipo: 'reabastecimento', prioridade: 'alta', operador: null, status: 'pendente', origem: 'PUL-A-22', destino: 'A-13-01-1', sku: 'SKU-10243', descricao: 'Cabo USB-C 2m', quantidade: 144, sla: '09:00' },
  { id: 'T-9006', tipo: 'contagem', prioridade: 'baixa', operador: null, status: 'pendente', origem: 'A-12-03-2', destino: '—', sku: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', quantidade: 0, sla: '12:00' },
  { id: 'T-9007', tipo: 'cross-docking', prioridade: 'alta', operador: null, status: 'pendente', origem: 'STG-REC-01', destino: 'DOCA-SAI-04', sku: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', quantidade: 48, sla: '08:50' },
]

export const ONDAS: Onda[] = [
  { id: 'OND-501', estrategia: 'cluster', pedidos: 24, linhas: 86, itens: 142, status: 'em-separacao', corte: '08:00', progresso: 62 },
  { id: 'OND-502', estrategia: 'batch', pedidos: 58, linhas: 58, itens: 410, status: 'liberada', corte: '10:00', progresso: 0 },
  { id: 'OND-503', estrategia: 'wave', pedidos: 31, linhas: 120, itens: 240, status: 'planejada', corte: '14:00', progresso: 0 },
  { id: 'OND-500', estrategia: 'zona', pedidos: 40, linhas: 156, itens: 320, status: 'concluida', corte: '06:00', progresso: 100 },
]

export const PEDIDOS: Pedido[] = [
  {
    id: 'PED-77120', cliente: 'João Pereira', ownerId: 'own-nano', transportadora: 'Correios SEDEX', rota: 'SP-Capital', status: 'em-packing', peso: 1.2, volumes: 1, prazo: 'Hoje 18h',
    itens: [
      { skuCodigo: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', quantidade: 1, conferido: 0 },
      { skuCodigo: 'SKU-10243', descricao: 'Cabo USB-C 2m', quantidade: 2, conferido: 0 },
    ],
  },
  {
    id: 'PED-77121', cliente: 'Maria Silva', ownerId: 'own-bella', transportadora: 'Loggi', rota: 'SP-Capital', status: 'em-separacao', peso: 0.4, volumes: 1, prazo: 'Hoje 18h',
    itens: [{ skuCodigo: 'SKU-20055', descricao: 'Sérum Vitamina C 30ml', quantidade: 2, conferido: 0 }],
  },
  {
    id: 'PED-77122', cliente: 'Mercado Bom Preço', ownerId: 'own-verde', transportadora: 'Jamef', rota: 'Interior-SP', status: 'aguardando', peso: 18.5, volumes: 3, prazo: 'Amanhã 12h',
    itens: [
      { skuCodigo: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', quantidade: 24, conferido: 0 },
      { skuCodigo: 'SKU-30012', descricao: 'Grão de Bico 1kg', quantidade: 12, conferido: 0 },
    ],
  },
  {
    id: 'PED-77119', cliente: 'Ana Costa', ownerId: 'own-nano', transportadora: 'Correios PAC', rota: 'SP-Capital', status: 'expedido', peso: 0.3, volumes: 1, prazo: 'Hoje 18h',
    itens: [{ skuCodigo: 'SKU-10242', descricao: 'Carregador Turbo 30W', quantidade: 1, conferido: 1 }],
  },
]

export const CONTAGENS: ContagemItem[] = [
  { id: 'CT-01', endereco: 'A-12-03-2', skuCodigo: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', sistemico: 84, contado: null, recontagem: null, status: 'pendente', ownerId: 'own-nano' },
  { id: 'CT-02', endereco: 'A-12-04-1', skuCodigo: 'SKU-10242', descricao: 'Carregador Turbo 30W', sistemico: 156, contado: null, recontagem: null, status: 'pendente', ownerId: 'own-nano' },
  { id: 'CT-03', endereco: 'B-04-12-3', skuCodigo: 'SKU-20055', descricao: 'Sérum Vitamina C 30ml', sistemico: 300, contado: null, recontagem: null, status: 'pendente', ownerId: 'own-bella' },
  { id: 'CT-04', endereco: 'C-08-01-1', skuCodigo: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', sistemico: 240, contado: null, recontagem: null, status: 'pendente', ownerId: 'own-verde' },
]

export const FATURAS: FaturaServico[] = [
  { ownerId: 'own-nano', armazenagem: 12400, movimentacaoEntrada: 3800, movimentacaoSaida: 9600, pickingLinhas: 7250, vas: 1500, paletesDia: 310, total: 34550 },
  { ownerId: 'own-bella', armazenagem: 8600, movimentacaoEntrada: 2100, movimentacaoSaida: 6400, pickingLinhas: 4800, vas: 3200, paletesDia: 180, total: 25100 },
  { ownerId: 'own-verde', armazenagem: 15200, movimentacaoEntrada: 4500, movimentacaoSaida: 7100, pickingLinhas: 3900, vas: 800, paletesDia: 420, total: 31500 },
  { ownerId: 'own-forte', armazenagem: 9800, movimentacaoEntrada: 5200, movimentacaoSaida: 4300, pickingLinhas: 2100, vas: 0, paletesDia: 260, total: 21400 },
]

export const INTEGRACOES: Integracao[] = [
  { id: 'int-erp', nome: 'SAP ERP', tipo: 'ERP', status: 'conectado', ultimaSync: 'há 2 min', registros: 18420 },
  { id: 'int-tms', nome: 'TMS Frete Fácil', tipo: 'TMS', status: 'conectado', ultimaSync: 'há 5 min', registros: 3120 },
  { id: 'int-ml', nome: 'Mercado Livre', tipo: 'Marketplace', status: 'sincronizando', ultimaSync: 'agora', registros: 8870 },
  { id: 'int-shp', nome: 'Shopee', tipo: 'Marketplace', status: 'conectado', ultimaSync: 'há 1 min', registros: 6210 },
  { id: 'int-edi', nome: 'EDI Carrefour', tipo: 'EDI', status: 'erro', ultimaSync: 'há 48 min', registros: 940 },
  { id: 'int-cor', nome: 'Correios', tipo: 'Transportadora', status: 'conectado', ultimaSync: 'há 3 min', registros: 5400 },
]

export const ROMANEIOS: Romaneio[] = [
  {
    id: 'ROM-3301', transportadora: 'Correios', rota: 'SP-Capital', veiculo: 'Van — PLT-2D45', status: 'em-carregamento',
    volumes: [
      { pedido: 'PED-77119', volumes: 1, peso: 0.3, carregado: true },
      { pedido: 'PED-77120', volumes: 1, peso: 1.2, carregado: false },
    ],
  },
  {
    id: 'ROM-3302', transportadora: 'Jamef', rota: 'Interior-SP', veiculo: 'Truck — JKM-9981', status: 'montando',
    volumes: [{ pedido: 'PED-77122', volumes: 3, peso: 18.5, carregado: false }],
  },
]

export const CROSSDOCK = [
  { id: 'XD-01', sku: 'SKU-30011', descricao: 'Azeite Extra Virgem 500ml', recebimento: 'REC-2042', docaEntrada: 'Doca 01', docaSaida: 'DOCA-SAI-04', quantidade: 48, destino: 'CD Duque de Caxias', status: 'aguardando-triagem' },
  { id: 'XD-02', sku: 'SKU-20055', descricao: 'Sérum Vitamina C 30ml', recebimento: 'REC-2040', docaEntrada: 'Doca 02', docaSaida: 'DOCA-SAI-02', quantidade: 60, destino: 'Loja Bella Centro', status: 'em-transito-interno' },
]

export const ENDERECOS_SUGESTOES = ['B-04-12-3', 'A-12-04-1', 'C-08-01-1', 'D-01-01-1']
