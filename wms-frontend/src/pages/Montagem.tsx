import { useMemo, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Edges, Grid, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FileText,
  Layers,
  Move3d,
  PackageCheck,
  Printer,
  RotateCcw,
  Ruler,
  Search,
  Tags,
  Truck,
  Weight,
} from 'lucide-react'
import { Badge, EmptyState, PageHeader, Progress, Tab, Tabs, type Tone } from '../components/ui'
import { VIAGENS_ETIQUETAGEM, ownerName } from '../lib/mock'
import {
  ORDEM_MONTAGEM_PALLETS,
  resumoSkusPendentes,
  skusPendentesDoRecebimento,
} from '../lib/skuControle'
import {
  calcularEtiquetas,
  emissaoAutomaticaIso,
  formatarDataHora,
  formatarKg,
  type EtiquetaVolume,
  type ViagemComRecebimento,
} from '../lib/etiquetas'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import type { SkuControle } from '../lib/types'

type AbaMontagem = 'etapa6' | 'historico' | 'bloqueadas' | 'todas'

interface VolumeMontagem {
  etiqueta: EtiquetaVolume
  cadastro: SkuControle | null
  pesoKg: number
  cubagemM3: number
  fatorCritico: number
}

interface SkuNoPallet {
  skuCodigo: string
  descricao: string
  volumes: number
  unidades: number
  pesoKg: number
  cubagemM3: number
}

interface PalletPlanejado {
  id: string
  volumes: VolumeMontagem[]
  skus: SkuNoPallet[]
  pesoKg: number
  cubagemM3: number
  alturaM: number
  utilizacaoPeso: number
  utilizacaoAltura: number
  gargalo: 'peso' | 'altura' | 'balanceado'
}

interface RowMontagem {
  row: ViagemComRecebimento
  bloqueio: string | null
  volumes: VolumeMontagem[]
  pallets: PalletPlanejado[]
  totalPesoKg: number
  totalCubagemM3: number
}

interface RequisicaoImpressaoSku {
  skuCodigo: string
  descricao: string
  volumes: number
  unidades: number
}

interface RequisicaoImpressaoPallet {
  id: string
  recebimentoId: string
  viagemId: string
  palletId: string
  criadaEmIso: string
  status: 'solicitada'
  cte: string
  nf: string
  skus: RequisicaoImpressaoSku[]
  volumes: number
  unidades: number
  pesoKg: number
  cubagemM3: number
}

const PALLET_COMPRIMENTO_M = 1.2
const PALLET_LARGURA_M = 1
const PALLET_BASE_M2 = PALLET_COMPRIMENTO_M * PALLET_LARGURA_M
const PALLET_ALTURA_BASE_M = 0.12
const PALLET_PADDING_M = 0.025
const CAIXA_GAP_M = 0.008
const LIMITE_PESO_KG = 1500
const LIMITE_ALTURA_CARGA_M = 3
const LIMITE_CUBAGEM_M3 = PALLET_BASE_M2 * LIMITE_ALTURA_CARGA_M
const ALTURA_TICK_M = 0.5
const CORES_SKU_3D = ['#2563eb', '#00a88e', '#d97706', '#db2777', '#059669', '#64748b']

interface CaixaPallet3D {
  id: string
  etiquetaId: string
  skuCodigo: string
  descricao: string
  comprimentoM: number
  larguraM: number
  alturaM: number
  bottomM: number
  x: number
  y: number
  z: number
  camada: number
  cor: string
  pesoKg: number
  cubagemM3: number
  quantidade: number
}

interface LayoutPallet3D {
  caixas: CaixaPallet3D[]
  alturaFisicaM: number
  alturaOcupadaM: number
  utilizacaoAltura: number
  overflowAltura: boolean
  overflowFootprint: boolean
  camadas: number
  legendas: Array<{
    skuCodigo: string
    descricao: string
    volumes: number
    cor: string
  }>
}

interface ExemploPallet3D {
  id: string
  titulo: string
  descricao: string
  contexto: string
  pallet: PalletPlanejado
}

interface GrupoVolumeDemo {
  skuCodigo: string
  cadastroCodigo: string
  descricao: string
  tipoEmbalagem: 'unidade' | 'caixa-matriz'
  volumes: number
  unidadesPorVolume: number
  pesoKgPorVolume: number
  fallback: Pick<SkuControle, 'ownerId' | 'tipo' | 'skuUnidadeConteudo' | 'unidadesPorCaixa' | 'comprimentoCm' | 'larguraCm' | 'alturaCm'>
}

function formatarM3(valor: number) {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³`
}

function formatarM(valor: number) {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`
}

function formatarPercentual(valor: number) {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`
}

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor))
}

function dimensoesDoVolume(volume: VolumeMontagem) {
  const cadastro = volume.cadastro
  if (!cadastro) {
    const lado = Math.cbrt(Math.max(volume.cubagemM3, 0.001))
    return {
      comprimentoM: limitar(lado, 0.08, PALLET_COMPRIMENTO_M),
      larguraM: limitar(lado, 0.08, PALLET_LARGURA_M),
      alturaM: limitar(lado, 0.04, LIMITE_ALTURA_CARGA_M),
    }
  }

  const comprimentoM = Math.max(cadastro.comprimentoCm / 100, 0.01)
  const larguraM = Math.max(cadastro.larguraCm / 100, 0.01)
  const alturaCadastroM = Math.max(cadastro.alturaCm / 100, 0.01)
  const baseM2 = comprimentoM * larguraM
  const alturaPorCubagemM = baseM2 > 0 ? volume.cubagemM3 / baseM2 : alturaCadastroM

  return {
    comprimentoM,
    larguraM,
    alturaM: Math.max(alturaCadastroM, alturaPorCubagemM),
  }
}

function orientacoesPossiveis(comprimentoM: number, larguraM: number) {
  if (Math.abs(comprimentoM - larguraM) < 0.001) {
    return [{ comprimentoM, larguraM }]
  }
  return [
    { comprimentoM, larguraM },
    { comprimentoM: larguraM, larguraM: comprimentoM },
  ]
}

function escolherOrientacao(
  comprimentoM: number,
  larguraM: number,
  disponivelX: number,
  disponivelZ: number,
) {
  return orientacoesPossiveis(comprimentoM, larguraM)
    .filter((orientacao) => orientacao.comprimentoM <= disponivelX + 0.001 && orientacao.larguraM <= disponivelZ + 0.001)
    .sort((a, b) => {
      const scoreA = a.comprimentoM / Math.max(disponivelX, 0.001) + a.larguraM / Math.max(disponivelZ, 0.001)
      const scoreB = b.comprimentoM / Math.max(disponivelX, 0.001) + b.larguraM / Math.max(disponivelZ, 0.001)
      return scoreB - scoreA
    })[0] ?? null
}

function corDoSku(index: number) {
  return CORES_SKU_3D[index % CORES_SKU_3D.length]
}

function montarLayoutPallet3D(pallet: PalletPlanejado): LayoutPallet3D {
  const inicioX = -PALLET_COMPRIMENTO_M / 2 + PALLET_PADDING_M
  const inicioZ = -PALLET_LARGURA_M / 2 + PALLET_PADDING_M
  const fimX = PALLET_COMPRIMENTO_M / 2 - PALLET_PADDING_M
  const fimZ = PALLET_LARGURA_M / 2 - PALLET_PADDING_M
  const larguraUtilM = fimX - inicioX
  const profundidadeUtilM = fimZ - inicioZ
  const skuIndex = new Map(pallet.skus.map((sku, index) => [sku.skuCodigo, index]))
  const caixas: CaixaPallet3D[] = []
  let overflowFootprint = false

  const volumesOrdenados = [...pallet.volumes].sort((a, b) => {
    const dimA = dimensoesDoVolume(a)
    const dimB = dimensoesDoVolume(b)
    return dimB.comprimentoM * dimB.larguraM - dimA.comprimentoM * dimA.larguraM
  })

  const novaCamada = (baseY: number, camada: number) => ({
    baseY,
    camada,
    cursorX: inicioX,
    cursorZ: inicioZ,
    rowDepth: 0,
    altura: 0,
  })

  let camadaAtual = novaCamada(0, 0)

  const posicionarNaCamada = (
    volume: VolumeMontagem,
    camada: ReturnType<typeof novaCamada>,
  ) => {
    const dimensoes = dimensoesDoVolume(volume)
    let comprimentoM = dimensoes.comprimentoM
    let larguraM = dimensoes.larguraM
    let alturaM = dimensoes.alturaM

    const cabeNoPallet = escolherOrientacao(comprimentoM, larguraM, larguraUtilM, profundidadeUtilM)
    if (!cabeNoPallet) {
      const escalaFootprint = Math.min(1, larguraUtilM / comprimentoM, profundidadeUtilM / larguraM)
      overflowFootprint = true
      comprimentoM *= escalaFootprint
      larguraM *= escalaFootprint
      alturaM = volume.cubagemM3 / Math.max(comprimentoM * larguraM, 0.001)
    }

    const tentativaAtual = escolherOrientacao(
      comprimentoM,
      larguraM,
      fimX - camada.cursorX,
      fimZ - camada.cursorZ,
    )

    if (tentativaAtual) {
      return { ...tentativaAtual, alturaM, x: camada.cursorX, z: camada.cursorZ }
    }

    const proximaLinhaZ = camada.cursorZ + camada.rowDepth + CAIXA_GAP_M
    const tentativaNovaLinha = escolherOrientacao(comprimentoM, larguraM, larguraUtilM, fimZ - proximaLinhaZ)

    if (tentativaNovaLinha) {
      camada.cursorX = inicioX
      camada.cursorZ = proximaLinhaZ
      camada.rowDepth = 0
      return { ...tentativaNovaLinha, alturaM, x: camada.cursorX, z: camada.cursorZ }
    }

    return null
  }

  volumesOrdenados.forEach((volume, index) => {
    let posicao = posicionarNaCamada(volume, camadaAtual)

    if (!posicao) {
      camadaAtual = novaCamada(camadaAtual.baseY + camadaAtual.altura + CAIXA_GAP_M, camadaAtual.camada + 1)
      posicao = posicionarNaCamada(volume, camadaAtual)
    }

    if (!posicao) return

    const skuPosicao = skuIndex.get(volume.etiqueta.skuCodigo) ?? 0
    const caixa: CaixaPallet3D = {
      id: `${volume.etiqueta.id}-${index}`,
      etiquetaId: volume.etiqueta.id,
      skuCodigo: volume.etiqueta.skuCodigo,
      descricao: volume.etiqueta.descricao,
      comprimentoM: posicao.comprimentoM,
      larguraM: posicao.larguraM,
      alturaM: posicao.alturaM,
      bottomM: camadaAtual.baseY,
      x: posicao.x + posicao.comprimentoM / 2,
      y: PALLET_ALTURA_BASE_M + camadaAtual.baseY + posicao.alturaM / 2,
      z: posicao.z + posicao.larguraM / 2,
      camada: camadaAtual.camada,
      cor: corDoSku(skuPosicao),
      pesoKg: volume.pesoKg,
      cubagemM3: volume.cubagemM3,
      quantidade: volume.etiqueta.quantidadeNoVolume,
    }

    caixas.push(caixa)
    camadaAtual.cursorX = posicao.x + posicao.comprimentoM + CAIXA_GAP_M
    camadaAtual.rowDepth = Math.max(camadaAtual.rowDepth, posicao.larguraM)
    camadaAtual.altura = Math.max(camadaAtual.altura, posicao.alturaM)
  })

  const alturaFisicaM = caixas.reduce((maior, caixa) => Math.max(maior, caixa.bottomM + caixa.alturaM), 0)
  const alturaOcupadaM = Math.max(alturaFisicaM, pallet.alturaM)
  const legendas = pallet.skus.map((sku, index) => ({
    skuCodigo: sku.skuCodigo,
    descricao: sku.descricao,
    volumes: sku.volumes,
    cor: corDoSku(index),
  }))

  return {
    caixas,
    alturaFisicaM,
    alturaOcupadaM,
    utilizacaoAltura: (alturaOcupadaM / LIMITE_ALTURA_CARGA_M) * 100,
    overflowAltura: alturaOcupadaM > LIMITE_ALTURA_CARGA_M,
    overflowFootprint,
    camadas: caixas.reduce((maior, caixa) => Math.max(maior, caixa.camada + 1), 0),
    legendas,
  }
}

function cadastroDoVolume(
  row: ViagemComRecebimento,
  etiqueta: EtiquetaVolume,
  skusControle: SkuControle[],
) {
  if (!row.recebimento) return null

  const config = row.viagem.itens.find((item) => item.skuCodigo === etiqueta.skuCodigo)
  const skusDoOwner = skusControle.filter((sku) => sku.ownerId === row.recebimento!.ownerId)

  if (config?.tipoEmbalagem === 'caixa-matriz') {
    return (
      skusDoOwner.find(
        (sku) =>
          sku.tipo === 'caixa-matriz' &&
          sku.skuUnidadeConteudo === etiqueta.skuCodigo &&
          sku.unidadesPorCaixa === config.unidadesPorVolume,
      ) ??
      skusDoOwner.find((sku) => sku.codigo === etiqueta.skuCodigo) ??
      null
    )
  }

  return skusDoOwner.find((sku) => sku.codigo === etiqueta.skuCodigo) ?? null
}

function cubagemDaEtiqueta(etiqueta: EtiquetaVolume, cadastro: SkuControle | null) {
  if (!cadastro) return 0
  if (cadastro.tipo === 'unidade' && etiqueta.tipoEmbalagem === 'unidade') {
    return cadastro.cubagemM3 * etiqueta.quantidadeNoVolume
  }
  return cadastro.cubagemM3
}

function volumesDaViagem(row: ViagemComRecebimento, skusControle: SkuControle[]): VolumeMontagem[] {
  if (!row.recebimento) return []

  return calcularEtiquetas(row.viagem, row.recebimento, emissaoAutomaticaIso(row)).map((etiqueta) => {
    const cadastro = cadastroDoVolume(row, etiqueta, skusControle)
    const cubagemM3 = cubagemDaEtiqueta(etiqueta, cadastro)
    return {
      etiqueta,
      cadastro,
      pesoKg: etiqueta.kgValor,
      cubagemM3,
      fatorCritico: Math.max(etiqueta.kgValor / LIMITE_PESO_KG, cubagemM3 / LIMITE_CUBAGEM_M3),
    }
  })
}

function motivoBloqueioMontagem(row: ViagemComRecebimento, volumes: VolumeMontagem[], skusControle: SkuControle[]) {
  if (!row.recebimento) return 'Recebimento não encontrado'

  const pendenciasSku = skusPendentesDoRecebimento(row.recebimento, skusControle)
  if (pendenciasSku.length) {
    return `${resumoSkusPendentes(pendenciasSku)}. A montagem depende da cubagem do Controle SKU.`
  }

  if (row.viagem.documentoStatus === 'bloqueado') return 'Documento bloqueado na etiquetagem'
  if (row.viagem.documentoStatus !== 'aprovado') return 'Documento ainda não aprovado na etiquetagem'
  if (row.recebimento.status === 'divergencia' || row.recebimento.itens.some((item) => item.ocorrencia)) {
    return 'Divergência aberta no recebimento'
  }

  const ordemAtual = row.recebimento.ordemExecucaoAtual ?? 0
  if (ordemAtual < ORDEM_MONTAGEM_PALLETS) {
    return ordemAtual === 5
      ? 'Conferência física ainda está confirmando as etiquetas'
      : `Recebimento na etapa ${ordemAtual || '—'}; montagem libera na etapa ${ORDEM_MONTAGEM_PALLETS}`
  }

  if (!volumes.length) return 'Nenhuma etiqueta calculada para montagem'

  const semCubagem = volumes.find((volume) => !volume.cadastro || volume.cubagemM3 <= 0)
  if (semCubagem) return `Etiqueta ${semCubagem.etiqueta.id} sem cubagem de embalagem no Controle SKU`

  const volumeInviavel = volumes.find(
    (volume) => volume.pesoKg > LIMITE_PESO_KG || volume.cubagemM3 > LIMITE_CUBAGEM_M3,
  )
  if (volumeInviavel) return `Etiqueta ${volumeInviavel.etiqueta.id} excede a capacidade individual do pallet`

  return null
}

function consolidarSkus(volumes: VolumeMontagem[]) {
  const porSku = new Map<string, SkuNoPallet>()
  volumes.forEach((volume) => {
    const sku = volume.etiqueta.skuCodigo
    const atual = porSku.get(sku) ?? {
      skuCodigo: sku,
      descricao: volume.etiqueta.descricao,
      volumes: 0,
      unidades: 0,
      pesoKg: 0,
      cubagemM3: 0,
    }

    porSku.set(sku, {
      ...atual,
      volumes: atual.volumes + 1,
      unidades: atual.unidades + volume.etiqueta.quantidadeNoVolume,
      pesoKg: atual.pesoKg + volume.pesoKg,
      cubagemM3: atual.cubagemM3 + volume.cubagemM3,
    })
  })

  return [...porSku.values()].sort((a, b) => b.cubagemM3 - a.cubagemM3)
}

function criarPallet(seed: string, index: number, volumes: VolumeMontagem[]): PalletPlanejado {
  const pesoKg = volumes.reduce((total, volume) => total + volume.pesoKg, 0)
  const cubagemM3 = volumes.reduce((total, volume) => total + volume.cubagemM3, 0)
  const alturaM = cubagemM3 / PALLET_BASE_M2
  const utilizacaoPeso = (pesoKg / LIMITE_PESO_KG) * 100
  const utilizacaoAltura = (alturaM / LIMITE_ALTURA_CARGA_M) * 100
  const diferenca = Math.abs(utilizacaoPeso - utilizacaoAltura)
  const gargalo =
    diferenca < 12 ? 'balanceado' : utilizacaoPeso > utilizacaoAltura ? 'peso' : 'altura'

  return {
    id: `PAL-${seed}-${String(index + 1).padStart(2, '0')}`,
    volumes,
    skus: consolidarSkus(volumes),
    pesoKg,
    cubagemM3,
    alturaM,
    utilizacaoPeso,
    utilizacaoAltura,
    gargalo,
  }
}

function planejarPallets(volumes: VolumeMontagem[], recebimentoId: string) {
  const ordenados = [...volumes].sort((a, b) => b.fatorCritico - a.fatorCritico)
  const buckets: VolumeMontagem[][] = []

  ordenados.forEach((volume) => {
    let melhorIndice = -1
    let melhorScore = -1

    buckets.forEach((bucket, index) => {
      const pesoAtual = bucket.reduce((total, item) => total + item.pesoKg, 0)
      const cubagemAtual = bucket.reduce((total, item) => total + item.cubagemM3, 0)
      const pesoDepois = pesoAtual + volume.pesoKg
      const cubagemDepois = cubagemAtual + volume.cubagemM3

      if (pesoDepois > LIMITE_PESO_KG || cubagemDepois > LIMITE_CUBAGEM_M3) return

      const score = pesoDepois / LIMITE_PESO_KG + cubagemDepois / LIMITE_CUBAGEM_M3
      if (score > melhorScore) {
        melhorIndice = index
        melhorScore = score
      }
    })

    if (melhorIndice === -1) buckets.push([volume])
    else buckets[melhorIndice].push(volume)
  })

  return buckets
    .map((bucket, index) =>
      criarPallet(
        recebimentoId.replace('REC-', ''),
        index,
        bucket.sort((a, b) => a.etiqueta.skuCodigo.localeCompare(b.etiqueta.skuCodigo)),
      ),
    )
    .sort((a, b) => b.cubagemM3 - a.cubagemM3)
}

function prepararRow(row: ViagemComRecebimento, skusControle: SkuControle[]): RowMontagem {
  const volumes = volumesDaViagem(row, skusControle)
  const bloqueio = motivoBloqueioMontagem(row, volumes, skusControle)
  const totalPesoKg = volumes.reduce((total, volume) => total + volume.pesoKg, 0)
  const totalCubagemM3 = volumes.reduce((total, volume) => total + volume.cubagemM3, 0)

  return {
    row,
    bloqueio,
    volumes,
    pallets: !bloqueio && row.recebimento ? planejarPallets(volumes, row.recebimento.id) : [],
    totalPesoKg,
    totalCubagemM3,
  }
}

function tomDoPallet(pallet: PalletPlanejado): Tone {
  const maximo = Math.max(pallet.utilizacaoPeso, pallet.utilizacaoAltura)
  if (maximo >= 95) return 'warn'
  if (maximo >= 82) return 'info'
  return 'ok'
}

function gargaloLabel(gargalo: PalletPlanejado['gargalo']) {
  if (gargalo === 'peso') return 'Limitado por peso'
  if (gargalo === 'altura') return 'Limitado por altura'
  return 'Balanceado'
}

function ordemAtual(item: RowMontagem) {
  return item.row.recebimento?.ordemExecucaoAtual ?? 0
}

function itemNaEtapaAtual(item: RowMontagem) {
  return ordemAtual(item) === ORDEM_MONTAGEM_PALLETS && !item.bloqueio
}

function quantidadeUnidadesPallet(pallet: PalletPlanejado) {
  return pallet.skus.reduce((total, sku) => total + sku.unidades, 0)
}

function criarRequisicoesImpressao(item: RowMontagem): RequisicaoImpressaoPallet[] {
  if (!item.row.recebimento) return []
  const criadaEmIso = new Date().toISOString()

  return item.pallets.map((pallet, index) => ({
    id: `PRINT-${item.row.recebimento!.id.replace('REC-', '')}-${String(index + 1).padStart(2, '0')}`,
    recebimentoId: item.row.recebimento!.id,
    viagemId: item.row.viagem.id,
    palletId: pallet.id,
    criadaEmIso,
    status: 'solicitada',
    cte: item.row.viagem.cte,
    nf: item.row.viagem.nf,
    skus: pallet.skus.map((sku) => ({
      skuCodigo: sku.skuCodigo,
      descricao: sku.descricao,
      volumes: sku.volumes,
      unidades: sku.unidades,
    })),
    volumes: pallet.volumes.length,
    unidades: quantidadeUnidadesPallet(pallet),
    pesoKg: pallet.pesoKg,
    cubagemM3: pallet.cubagemM3,
  }))
}

function cubagemCadastroDemo(input: Pick<SkuControle, 'comprimentoCm' | 'larguraCm' | 'alturaCm'>) {
  return Number(((input.comprimentoCm * input.larguraCm * input.alturaCm) / 1_000_000).toFixed(6))
}

function cadastroDemo(
  skusControle: SkuControle[],
  codigo: string,
  descricao: string,
  fallback: GrupoVolumeDemo['fallback'],
): SkuControle {
  return skusControle.find((sku) => sku.codigo === codigo) ?? {
    id: `sku-demo-${codigo}`,
    codigo,
    descricao,
    cubagemM3: cubagemCadastroDemo(fallback),
    criadoPor: 'Demonstração 3D',
    criadoEm: '2026-06-26T08:00:00.000Z',
    atualizadoPor: 'Demonstração 3D',
    atualizadoEm: '2026-06-26T08:00:00.000Z',
    ...fallback,
  }
}

function etiquetaDemo(grupo: GrupoVolumeDemo, index: number): EtiquetaVolume {
  return {
    id: `3D-${grupo.skuCodigo.replace(/\W/g, '')}-${String(index + 1).padStart(3, '0')}`,
    viagemId: 'DEMO-3D',
    recebimentoId: 'REC-DEMO-3D',
    skuCodigo: grupo.skuCodigo,
    descricao: grupo.descricao,
    tipoEmbalagem: grupo.tipoEmbalagem,
    quantidadeNoVolume: grupo.unidadesPorVolume,
    sequencia: `${index + 1}/${grupo.volumes}`,
    sequenciaSku: `${index + 1}/${grupo.volumes}`,
    emissaoIso: '2026-06-26T08:00:00.000Z',
    origemDestino: 'DEMO/CD',
    embarcador: 'Demonstração 3D',
    nf: 'NF-e DEMO',
    cte: 'CT-e DEMO',
    kg: formatarKg(grupo.pesoKgPorVolume),
    kgValor: grupo.pesoKgPorVolume,
    destinatario: 'Homologação de montagem',
    endereco: 'Área de staging',
  }
}

function volumesDemo(skusControle: SkuControle[], grupo: GrupoVolumeDemo): VolumeMontagem[] {
  const cadastro = cadastroDemo(skusControle, grupo.cadastroCodigo, grupo.descricao, grupo.fallback)

  return Array.from({ length: grupo.volumes }, (_, index) => {
    const etiqueta = etiquetaDemo(grupo, index)
    const cubagemM3 = cubagemDaEtiqueta(etiqueta, cadastro)

    return {
      etiqueta,
      cadastro,
      pesoKg: grupo.pesoKgPorVolume,
      cubagemM3,
      fatorCritico: Math.max(grupo.pesoKgPorVolume / LIMITE_PESO_KG, cubagemM3 / LIMITE_CUBAGEM_M3),
    }
  })
}

function palletDemo(id: string, volumes: VolumeMontagem[]) {
  return {
    ...criarPallet(id.replace('DEMO-', ''), 0, volumes),
    id,
  }
}

function criarExemplosPallet3D(skusControle: SkuControle[]): ExemploPallet3D[] {
  const exemplo = (
    id: string,
    titulo: string,
    contexto: string,
    descricao: string,
    grupos: GrupoVolumeDemo[],
  ): ExemploPallet3D => ({
    id,
    titulo,
    contexto,
    descricao,
    pallet: palletDemo(id, grupos.flatMap((grupo) => volumesDemo(skusControle, grupo))),
  })

  return [
    exemplo(
      'DEMO-BAL-01',
      'Balanceado multi-SKU',
      'Recebimento liberado',
      'Caixas de alimentos com boa ocupação de base e altura confortável.',
      [
        {
          skuCodigo: 'SKU-30012',
          cadastroCodigo: 'CX-30012-12',
          descricao: 'Grão de Bico 1kg',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 15,
          unidadesPorVolume: 12,
          pesoKgPorVolume: 12.48,
          fallback: { ownerId: 'own-verde', tipo: 'caixa-matriz', skuUnidadeConteudo: 'SKU-30012', unidadesPorCaixa: 12, comprimentoCm: 40, larguraCm: 28, alturaCm: 24 },
        },
        {
          skuCodigo: 'SKU-30011',
          cadastroCodigo: 'CX-30011-06',
          descricao: 'Azeite Extra Virgem 500ml',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 40,
          unidadesPorVolume: 6,
          pesoKgPorVolume: 3.72,
          fallback: { ownerId: 'own-verde', tipo: 'caixa-matriz', skuUnidadeConteudo: 'SKU-30011', unidadesPorCaixa: 6, comprimentoCm: 23, larguraCm: 16, alturaCm: 27 },
        },
      ],
    ),
    exemplo(
      'DEMO-ECO-02',
      'E-commerce fracionado',
      'Muitos volumes pequenos',
      'Mistura de unidades e caixas matriz para visualizar paletização densa.',
      [
        {
          skuCodigo: 'SKU-10241',
          cadastroCodigo: 'SKU-10241',
          descricao: 'Fone Bluetooth Pulse X',
          tipoEmbalagem: 'unidade',
          volumes: 80,
          unidadesPorVolume: 1,
          pesoKgPorVolume: 0.16,
          fallback: { ownerId: 'own-nano', tipo: 'unidade', skuUnidadeConteudo: null, unidadesPorCaixa: null, comprimentoCm: 10, larguraCm: 5, alturaCm: 18 },
        },
        {
          skuCodigo: 'SKU-10242',
          cadastroCodigo: 'CX-10242-10',
          descricao: 'Carregador Turbo 30W',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 22,
          unidadesPorVolume: 10,
          pesoKgPorVolume: 1.1,
          fallback: { ownerId: 'own-nano', tipo: 'caixa-matriz', skuUnidadeConteudo: 'SKU-10242', unidadesPorCaixa: 10, comprimentoCm: 26, larguraCm: 18, alturaCm: 14 },
        },
        {
          skuCodigo: 'SKU-10244',
          cadastroCodigo: 'CX-10244-04',
          descricao: 'Power Bank 10000mAh',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 18,
          unidadesPorVolume: 4,
          pesoKgPorVolume: 1,
          fallback: { ownerId: 'own-nano', tipo: 'caixa-matriz', skuUnidadeConteudo: 'SKU-10244', unidadesPorCaixa: 4, comprimentoCm: 18, larguraCm: 15, alturaCm: 8 },
        },
      ],
    ),
    exemplo(
      'DEMO-PES-03',
      'Carga pesada',
      'Limitado por peso',
      'Matéria-prima com pouca altura, mas peso próximo do limite do pallet.',
      [
        {
          skuCodigo: 'MP-7785',
          cadastroCodigo: 'CX-MP7785-11',
          descricao: 'Masterbatch Preto',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 10,
          unidadesPorVolume: 11,
          pesoKgPorVolume: 132,
          fallback: { ownerId: 'own-forte', tipo: 'caixa-matriz', skuUnidadeConteudo: 'MP-7785', unidadesPorCaixa: 11, comprimentoCm: 50, larguraCm: 38, alturaCm: 32 },
        },
      ],
    ),
    exemplo(
      'DEMO-ALT-04',
      'Altura crítica',
      'Régua de 3 m',
      'Caixas volumosas mostram a diferença entre cubagem e altura física empilhada.',
      [
        {
          skuCodigo: 'MP-7791',
          cadastroCodigo: 'MP-7791',
          descricao: 'Tampa Injetada Natural',
          tipoEmbalagem: 'unidade',
          volumes: 38,
          unidadesPorVolume: 1,
          pesoKgPorVolume: 24,
          fallback: { ownerId: 'own-forte', tipo: 'unidade', skuUnidadeConteudo: null, unidadesPorCaixa: null, comprimentoCm: 60, larguraCm: 40, alturaCm: 35 },
        },
      ],
    ),
    exemplo(
      'DEMO-MIX-05',
      'Carga mista de cosméticos',
      'Picking + packing',
      'Peças pequenas e caixas de reposição para conferir legenda por SKU.',
      [
        {
          skuCodigo: 'SKU-20056',
          cadastroCodigo: 'CX-20056-06',
          descricao: 'Base Líquida Tom 02',
          tipoEmbalagem: 'caixa-matriz',
          volumes: 36,
          unidadesPorVolume: 6,
          pesoKgPorVolume: 1.08,
          fallback: { ownerId: 'own-bella', tipo: 'caixa-matriz', skuUnidadeConteudo: 'SKU-20056', unidadesPorCaixa: 6, comprimentoCm: 18, larguraCm: 12, alturaCm: 13 },
        },
        {
          skuCodigo: 'SKU-20057',
          cadastroCodigo: 'SKU-20057',
          descricao: 'Batom Matte Rubi',
          tipoEmbalagem: 'unidade',
          volumes: 90,
          unidadesPorVolume: 1,
          pesoKgPorVolume: 0.04,
          fallback: { ownerId: 'own-bella', tipo: 'unidade', skuUnidadeConteudo: null, unidadesPorCaixa: null, comprimentoCm: 2, larguraCm: 2, alturaCm: 9 },
        },
        {
          skuCodigo: 'SKU-20060',
          cadastroCodigo: 'SKU-20060',
          descricao: 'Água Micelar 120ml',
          tipoEmbalagem: 'unidade',
          volumes: 48,
          unidadesPorVolume: 1,
          pesoKgPorVolume: 0.16,
          fallback: { ownerId: 'own-bella', tipo: 'unidade', skuUnidadeConteudo: null, unidadesPorCaixa: null, comprimentoCm: 5, larguraCm: 5, alturaCm: 14 },
        },
      ],
    ),
  ]
}

export default function Montagem() {
  const { recebimentos, ownerId, skusControle, toast } = useStore()
  const [aba, setAba] = useState<AbaMontagem>('etapa6')
  const [busca, setBusca] = useState('')
  const [selecionadaId, setSelecionadaId] = useState('')
  const [requisicoesImpressao, setRequisicoesImpressao] = useState<Record<string, RequisicaoImpressaoPallet[]>>({})

  const rows = useMemo<ViagemComRecebimento[]>(() => {
    return VIAGENS_ETIQUETAGEM.map((viagem) => ({
      viagem,
      recebimento: recebimentos.find((rec) => rec.id === viagem.recebimentoId) ?? null,
    })).filter((row) => ownerId === 'own-all' || row.recebimento?.ownerId === ownerId)
  }, [ownerId, recebimentos])

  const planejamentos = useMemo(
    () => rows.map((row) => prepararRow(row, skusControle)),
    [rows, skusControle],
  )
  const exemplos3D = useMemo(() => criarExemplosPallet3D(skusControle), [skusControle])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return planejamentos.filter((item) => {
      const naEtapaAtual = itemNaEtapaAtual(item)
      if (aba === 'etapa6' && !naEtapaAtual) return false
      if (aba === 'historico' && naEtapaAtual) return false
      if (aba === 'bloqueadas' && !item.bloqueio) return false
      if (!q) return true

      const alvo = [
        item.row.viagem.id,
        item.row.viagem.ordemServicoId,
        item.row.viagem.cte,
        item.row.viagem.nf,
        item.row.recebimento?.id ?? '',
        item.row.recebimento?.fornecedor ?? '',
        item.row.recebimento ? ownerName(item.row.recebimento.ownerId) : '',
        ...item.volumes.map((volume) => volume.etiqueta.skuCodigo),
      ].join(' ').toLowerCase()

      return alvo.includes(q)
    })
  }, [aba, busca, planejamentos])

  const selecionada = filtradas.find((item) => item.row.viagem.id === selecionadaId) ?? filtradas[0] ?? null
  const filaEtapa6 = planejamentos.filter(itemNaEtapaAtual)
  const historico = planejamentos.filter((item) => !itemNaEtapaAtual(item))
  const totalPallets = filaEtapa6.reduce((total, item) => total + item.pallets.length, 0)
  const totalVolumes = filaEtapa6.reduce((total, item) => total + item.volumes.length, 0)
  const totalFolhasGeradas = Object.values(requisicoesImpressao).reduce(
    (total, requisicoes) => total + requisicoes.length,
    0,
  )
  const recebimentoSelecionadoId = selecionada?.row.recebimento?.id
  const requisicoesSelecionadas = recebimentoSelecionadoId
    ? requisicoesImpressao[recebimentoSelecionadoId] ?? []
    : []
  const jaConfirmada = requisicoesSelecionadas.length > 0

  const confirmarMontagem = () => {
    if (!selecionada?.row.recebimento || selecionada.bloqueio) return
    const recId = selecionada.row.recebimento.id
    const requisicoes = criarRequisicoesImpressao(selecionada)
    setRequisicoesImpressao((atuais) => ({ ...atuais, [recId]: atuais[recId] ?? requisicoes }))
    toast({
      tipo: 'sucesso',
      titulo: 'Montagem aprovada',
      texto: `${requisicoes.length} requisição(ões) A4 enviadas para impressão.`,
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Montagem"
        subtitle={`Visão do recebimento na etapa ${ORDEM_MONTAGEM_PALLETS}/7: confira a organização automática da carga, aprove os pallets e gere as folhas A4.`}
      >
        <Badge tone="info">
          Pallet 1,20 x 1,00 m · {LIMITE_PESO_KG.toLocaleString('pt-BR')} kg · {formatarM(LIMITE_ALTURA_CARGA_M)}
        </Badge>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard icon={<PackageCheck className="h-5 w-5" />} label="Viagens na etapa 6" value={filaEtapa6.length.toLocaleString('pt-BR')} tone="ok" />
        <KpiCard icon={<Boxes className="h-5 w-5" />} label="Pallets da etapa" value={totalPallets.toLocaleString('pt-BR')} tone="primary" />
        <KpiCard icon={<Tags className="h-5 w-5" />} label="Etiquetas na montagem" value={totalVolumes.toLocaleString('pt-BR')} tone="accent" />
        <KpiCard icon={<FileText className="h-5 w-5" />} label="Folhas A4 geradas" value={totalFolhasGeradas.toLocaleString('pt-BR')} tone="info" />
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand">Visão geral do recebimento</p>
            <p className="mt-1 text-sm text-ink-muted">
              {filaEtapa6.length.toLocaleString('pt-BR')} viagem(ns) estão exatamente na etapa de montagem; {historico.length.toLocaleString('pt-BR')} ficam disponíveis para consulta histórica.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
            <FluxoEtapa numero="4" label="Etiquetas" status="ok" />
            <FluxoEtapa numero="5" label="Conferência física" status="ok" />
            <FluxoEtapa numero="6" label="Montagem" status="atual" />
          </div>
        </div>
      </div>

      <ExemplosPallet3D exemplos={exemplos3D} />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-4 pt-2">
              <Tabs value={aba} onChange={(value) => setAba(value as AbaMontagem)}>
                <Tab id="etapa6">Etapa 6</Tab>
                <Tab id="historico">Histórico</Tab>
                <Tab id="bloqueadas">Bloqueadas</Tab>
                <Tab id="todas">Todas</Tab>
              </Tabs>
            </div>
            <div className="p-4">
              <label htmlFor="busca-montagem" className="label">Buscar montagem</label>
              <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5">
                <Search className="h-4 w-4 text-ink-muted" />
                <input
                  id="busca-montagem"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Recebimento, NF, CTe, SKU..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filtradas.map((item) => (
              <MontagemListItem
                key={item.row.viagem.id}
                item={item}
                selected={selecionada?.row.viagem.id === item.row.viagem.id}
                confirmada={!!item.row.recebimento && !!requisicoesImpressao[item.row.recebimento.id]?.length}
                onClick={() => setSelecionadaId(item.row.viagem.id)}
              />
            ))}
            {!filtradas.length && (
              <div className="rounded-xl border border-line bg-surface">
                <EmptyState
                  icon={<PackageCheck className="h-6 w-6" />}
                  title="Nenhuma montagem encontrada"
                  text="Ajuste a busca ou altere o filtro de status."
                />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          {selecionada ? (
            <MontagemDetalhe
              item={selecionada}
              confirmada={jaConfirmada}
              requisicoes={requisicoesSelecionadas}
              onConfirmar={confirmarMontagem}
            />
          ) : (
            <div className="rounded-xl border border-line bg-surface">
              <EmptyState
                icon={<Layers className="h-6 w-6" />}
                title="Selecione uma montagem"
                text="As ordens aparecem quando existe viagem de etiquetagem vinculada ao recebimento."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExemplosPallet3D({ exemplos }: { exemplos: ExemploPallet3D[] }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-brand">Exemplos de pallets 3D</h2>
          <p className="text-sm text-ink-muted">
            Cenários de homologação para ver altura, cubagem, peso, camadas e mix de SKUs antes de aprovar a montagem real.
          </p>
        </div>
        <Badge tone="info">{exemplos.length.toLocaleString('pt-BR')} cenários</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {exemplos.map((exemplo) => {
          const ocupacaoMaxima = Math.max(exemplo.pallet.utilizacaoPeso, exemplo.pallet.utilizacaoAltura)

          return (
            <article key={exemplo.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-brand">{exemplo.titulo}</h3>
                    <Badge tone={tomDoPallet(exemplo.pallet)}>{gargaloLabel(exemplo.pallet.gargalo)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{exemplo.descricao}</p>
                </div>
                <Badge tone="neutral">{exemplo.contexto}</Badge>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <MiniStat label="Pallet" value={exemplo.pallet.id.replace('DEMO-', '')} />
                <MiniStat label="Peso" value={formatarKg(exemplo.pallet.pesoKg)} />
                <MiniStat label="Cubagem" value={formatarM3(exemplo.pallet.cubagemM3)} />
                <MiniStat label="Ocupação" value={formatarPercentual(ocupacaoMaxima)} />
              </div>

              <div className="mt-3">
                <Pallet3DViewer pallet={exemplo.pallet} compacto embedded />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: Tone
}) {
  const toneClass: Record<Tone, string> = {
    ok: 'text-ok bg-ok-50',
    warn: 'text-warn bg-warn-50',
    bad: 'text-bad bg-bad-50',
    info: 'text-info bg-info-50',
    primary: 'text-primary bg-primary-50',
    accent: 'text-accent bg-accent-50',
    neutral: 'text-ink-muted bg-slate-100',
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-brand">{value}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', toneClass[tone])}>{icon}</div>
      </div>
    </div>
  )
}

function FluxoEtapa({
  numero,
  label,
  status,
}: {
  numero: string
  label: string
  status: 'ok' | 'atual'
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2',
        status === 'ok'
          ? 'border-ok/30 bg-ok-50 text-ok'
          : 'border-primary/30 bg-primary-50 text-primary',
      )}
    >
      <span className="mono grid h-7 w-7 place-items-center rounded-md bg-white/80 text-xs font-semibold">
        {numero}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">{label}</p>
        <p className="text-[10px] font-medium opacity-80">{status === 'ok' ? 'Concluída' : 'Atual'}</p>
      </div>
    </div>
  )
}

function MontagemListItem({
  item,
  selected,
  confirmada,
  onClick,
}: {
  item: RowMontagem
  selected: boolean
  confirmada: boolean
  onClick: () => void
}) {
  const recebimento = item.row.recebimento
  const ordem = ordemAtual(item)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border bg-surface p-4 text-left transition-colors',
        selected ? 'border-primary shadow-sm' : 'border-line hover:border-primary/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mono truncate text-sm font-semibold text-brand">{recebimento?.id ?? item.row.viagem.id}</p>
            <Badge tone={item.bloqueio ? 'warn' : confirmada ? 'ok' : 'info'} dot>
              {item.bloqueio ? 'Bloqueada' : confirmada ? 'Aprovada' : `Etapa ${ordem}`}
            </Badge>
          </div>
          <p className="mt-1 truncate text-sm text-ink-soft">{recebimento?.fornecedor ?? item.row.viagem.embarcador}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{item.row.viagem.nf} · {item.row.viagem.cte}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-brand">{item.pallets.length || '—'} PLT</p>
          <p className="text-xs text-ink-muted">{item.volumes.length.toLocaleString('pt-BR')} etiquetas</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="Peso" value={formatarKg(item.totalPesoKg)} />
        <MiniStat label="Cubagem" value={formatarM3(item.totalCubagemM3)} />
        <MiniStat label="Etapa" value={`${ordem || '—'}/7`} />
      </div>

      {item.bloqueio && (
        <p className="mt-3 line-clamp-2 text-xs font-medium text-warn">{item.bloqueio}</p>
      )}
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-sub px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-brand">{value}</p>
    </div>
  )
}

function MontagemDetalhe({
  item,
  confirmada,
  requisicoes,
  onConfirmar,
}: {
  item: RowMontagem
  confirmada: boolean
  requisicoes: RequisicaoImpressaoPallet[]
  onConfirmar: () => void
}) {
  const recebimento = item.row.recebimento
  const maiorOcupacao = item.pallets.reduce(
    (maior, pallet) => Math.max(maior, pallet.utilizacaoPeso, pallet.utilizacaoAltura),
    0,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-brand">{recebimento?.id ?? item.row.viagem.id}</h2>
              <Badge tone={item.bloqueio ? 'warn' : confirmada ? 'ok' : 'primary'} dot>
                {item.bloqueio ? 'Aguardando liberação' : confirmada ? 'Montagem aprovada' : `Liberada na etapa ${ORDEM_MONTAGEM_PALLETS}`}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {item.row.viagem.embarcador} · {ownerName(recebimento?.ownerId ?? '')} · {item.row.viagem.nf}
            </p>
          </div>
          <button
            onClick={onConfirmar}
            disabled={!!item.bloqueio || confirmada}
            className={confirmada ? 'btn-outline text-ok' : 'btn-primary'}
          >
            {confirmada ? <CheckCircle2 className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
            {confirmada ? 'Aprovada · A4 geradas' : 'Aprovar e gerar A4'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Detail icon={<Truck className="h-4 w-4" />} label="Doca" value={recebimento?.doca ?? '—'} />
          <Detail icon={<Tags className="h-4 w-4" />} label="Etiquetas" value={item.volumes.length.toLocaleString('pt-BR')} mono />
          <Detail icon={<Weight className="h-4 w-4" />} label="Peso" value={formatarKg(item.totalPesoKg)} mono />
          <Detail icon={<Ruler className="h-4 w-4" />} label="Cubagem" value={formatarM3(item.totalCubagemM3)} mono />
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <StepBox numero="4" label="Etiquetas" active done />
          <StepBox numero="5" label="Conferência física" active={!!recebimento && (recebimento.ordemExecucaoAtual ?? 0) >= 5} done={!!recebimento && (recebimento.ordemExecucaoAtual ?? 0) > 5} />
          <StepBox numero="6" label="Montagem de pallets" active={!item.bloqueio} done={confirmada} />
        </div>

        {item.bloqueio ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warn/20 bg-warn-50 px-3 py-2 text-sm text-warn">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{item.bloqueio}</span>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-info/20 bg-info-50 px-3 py-2 text-sm text-info">
            Melhor encaixe calculado por peso e cubagem: maior ocupação prevista em {formatarPercentual(maiorOcupacao)}.
          </div>
        )}
      </div>

      {!item.bloqueio && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Pallets" value={item.pallets.length.toLocaleString('pt-BR')} />
            <Metric label="Capacidade útil" value={formatarM3(LIMITE_CUBAGEM_M3)} />
            <Metric label="Altura máxima de carga" value={formatarM(LIMITE_ALTURA_CARGA_M)} />
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-brand">Organização automática da carga</h3>
                <p className="text-sm text-ink-muted">Cada pallet mostra ocupação, composição por SKU e amostra das etiquetas alocadas.</p>
              </div>
              <Badge tone={confirmada ? 'ok' : 'primary'}>
                {confirmada ? 'Plano aprovado' : 'Aguardando aprovação'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {item.pallets.map((pallet) => (
              <PalletCard key={pallet.id} pallet={pallet} />
            ))}
          </div>

          {requisicoes.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-brand">Requisições de impressão A4</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    Uma folha horizontal por pallet, com CTe, NF, SKUs, volumes e unidades totais.
                  </p>
                </div>
                <Badge tone="info">{requisicoes.length.toLocaleString('pt-BR')} em fila</Badge>
              </div>

              <div className="mt-4 grid gap-4 2xl:grid-cols-2">
                {requisicoes.map((requisicao) => (
                  <A4PrintPreview key={requisicao.id} requisicao={requisicao} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Detail({
  icon,
  label,
  value,
  mono,
}: {
  icon: ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-sub px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        {icon}
        {label}
      </div>
      <p className={cn('mt-1 truncate text-sm font-semibold text-brand', mono && 'mono')}>{value}</p>
    </div>
  )
}

function StepBox({
  numero,
  label,
  active,
  done,
}: {
  numero: string
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        done
          ? 'border-ok/30 bg-ok-50 text-ok'
          : active
            ? 'border-primary/30 bg-primary-50 text-primary'
            : 'border-line bg-surface-sub text-ink-muted',
      )}
    >
      <span className="mono text-xs font-semibold">Parte {numero}</span>
      <p className="mt-0.5 font-medium">{label}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-brand">{value}</p>
    </div>
  )
}

function PalletCard({ pallet }: { pallet: PalletPlanejado }) {
  const tone = tomDoPallet(pallet)
  const etiquetasAmostra = pallet.volumes.slice(0, 8)

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mono text-sm font-semibold text-brand">{pallet.id}</h3>
            <Badge tone={tone}>{gargaloLabel(pallet.gargalo)}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {pallet.volumes.length.toLocaleString('pt-BR')} etiqueta(s) · {pallet.skus.length.toLocaleString('pt-BR')} SKU(s)
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right text-xs sm:min-w-[360px]">
          <MiniStat label="Peso" value={formatarKg(pallet.pesoKg)} />
          <MiniStat label="Cubagem" value={formatarM3(pallet.cubagemM3)} />
          <MiniStat label="Altura" value={formatarM(pallet.alturaM)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <UsoBarra label="Uso de peso" value={pallet.utilizacaoPeso} tone={pallet.utilizacaoPeso > 90 ? 'warn' : 'primary'} />
        <UsoBarra label="Uso de altura/cubagem" value={pallet.utilizacaoAltura} tone={pallet.utilizacaoAltura > 90 ? 'warn' : 'accent'} />
      </div>

      <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.08fr)_minmax(520px,0.92fr)]">
        <Pallet3DViewer pallet={pallet} />

        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-surface-sub">
              <tr>
                <th className="th">SKU</th>
                <th className="th text-right">Etiquetas</th>
                <th className="th text-right">Unidades</th>
                <th className="th text-right">Peso</th>
                <th className="th text-right">Cubagem</th>
              </tr>
            </thead>
            <tbody>
              {pallet.skus.map((sku) => (
                <tr key={sku.skuCodigo} className="row-hover">
                  <td className="td">
                    <p className="mono font-semibold text-brand">{sku.skuCodigo}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{sku.descricao}</p>
                  </td>
                  <td className="td text-right mono">{sku.volumes.toLocaleString('pt-BR')}</td>
                  <td className="td text-right mono">{sku.unidades.toLocaleString('pt-BR')}</td>
                  <td className="td text-right mono">{formatarKg(sku.pesoKg)}</td>
                  <td className="td text-right mono">{formatarM3(sku.cubagemM3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {etiquetasAmostra.map((volume) => (
          <span key={volume.etiqueta.id} className="mono rounded-md border border-line bg-surface-sub px-2 py-1 text-[11px] font-semibold text-ink-soft">
            {volume.etiqueta.id}
          </span>
        ))}
        {pallet.volumes.length > etiquetasAmostra.length && (
          <span className="rounded-md border border-line bg-surface-sub px-2 py-1 text-[11px] font-semibold text-ink-muted">
            +{pallet.volumes.length - etiquetasAmostra.length}
          </span>
        )}
      </div>
    </div>
  )
}

function Pallet3DViewer({
  pallet,
  compacto = false,
  embedded = false,
}: {
  pallet: PalletPlanejado
  compacto?: boolean
  embedded?: boolean
}) {
  const layout = useMemo(() => montarLayoutPallet3D(pallet), [pallet])
  const [hovered, setHovered] = useState<CaixaPallet3D | null>(null)
  const [cameraKey, setCameraKey] = useState(0)
  const toneAltura: Tone = layout.overflowAltura ? 'warn' : layout.utilizacaoAltura >= 82 ? 'info' : 'ok'

  return (
    <div className={cn(!embedded && 'rounded-xl border border-line bg-surface-sub p-3')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-brand">Pallet 3D</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Base {formatarM(PALLET_COMPRIMENTO_M)} x {formatarM(PALLET_LARGURA_M)} · {layout.caixas.length.toLocaleString('pt-BR')} pacote(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          <Badge tone={toneAltura}>{formatarPercentual(layout.utilizacaoAltura)}</Badge>
          <Badge tone="neutral">{layout.camadas.toLocaleString('pt-BR')} camada(s)</Badge>
        </div>
      </div>

      <div className={cn(
        'relative mt-3 overflow-hidden rounded-lg border border-slate-300 bg-slate-100',
        compacto ? 'h-[300px]' : 'h-[380px]',
      )}>
        <Canvas
          key={cameraKey}
          className="h-full w-full"
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ position: [2.25, 2.05, 2.55], fov: 43 }}
        >
          <Pallet3DScene layout={layout} hovered={hovered} onHover={setHovered} />
        </Canvas>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-brand shadow">
          <Move3d className="h-3.5 w-3.5 text-accent" />
          Visual 3D
        </div>

        <button
          type="button"
          onClick={() => setCameraKey((key) => key + 1)}
          aria-label="Visão inicial"
          className="absolute right-3 top-3 flex min-h-8 items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-brand shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Visão inicial</span>
        </button>

        <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg bg-white/90 px-3 py-2 shadow">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {layout.legendas.slice(0, 6).map((legenda, index) => (
              <span key={legenda.skuCodigo} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: legenda.cor }} />
                <span className="mono font-semibold text-brand">{index + 1}</span>
                <span className="mono">{legenda.skuCodigo}</span>
                <span className="text-ink-muted">{legenda.volumes.toLocaleString('pt-BR')} vol</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={cn('mt-3 grid gap-2', compacto ? 'sm:grid-cols-3' : 'sm:grid-cols-3')}>
        <MiniStat label="Altura 3D" value={formatarM(layout.alturaOcupadaM)} />
        <MiniStat label="Altura física" value={formatarM(layout.alturaFisicaM)} />
        <MiniStat label="Limite" value={formatarM(LIMITE_ALTURA_CARGA_M)} />
      </div>

      {(layout.overflowAltura || layout.overflowFootprint) && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warn/20 bg-warn-50 px-3 py-2 text-xs font-medium text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {layout.overflowAltura
              ? 'Altura projetada acima do limite operacional de 3 m.'
              : 'Há pacote maior que a base útil; a projeção foi ajustada para manter a cubagem visível.'}
          </span>
        </div>
      )}
    </div>
  )
}

function Pallet3DScene({
  layout,
  hovered,
  onHover,
}: {
  layout: LayoutPallet3D
  hovered: CaixaPallet3D | null
  onHover: (caixa: CaixaPallet3D | null) => void
}) {
  return (
    <>
      <color attach="background" args={['#eef4f8']} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[3.5, 6, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} />

      <Grid
        position={[0, -0.004, 0]}
        args={[4, 4]}
        cellSize={0.25}
        cellColor="#cbd5e1"
        sectionSize={1}
        sectionColor="#94a3b8"
        fadeDistance={5}
      />

      <PalletBase3D />
      <PalletCapacity3D layout={layout} />

      {layout.caixas.map((caixa) => (
        <Package3D
          key={caixa.id}
          caixa={caixa}
          muted={!!hovered && hovered.id !== caixa.id}
          active={hovered?.id === caixa.id}
          onHover={onHover}
        />
      ))}

      {hovered && (
        <Html position={[hovered.x, hovered.y + hovered.alturaM / 2 + 0.08, hovered.z]} center distanceFactor={4.8}>
          <div className="pointer-events-none whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1.5 text-center shadow-pop">
            <p className="mono text-[11px] font-semibold text-brand">{hovered.etiquetaId} · {hovered.skuCodigo}</p>
            <p className="mt-0.5 text-[10px] text-ink-muted">
              {formatarM(hovered.comprimentoM)} x {formatarM(hovered.larguraM)} x {formatarM(hovered.alturaM)}
            </p>
          </div>
        </Html>
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={1.6}
        maxDistance={6.5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.1, 0]}
      />
    </>
  )
}

function PalletBase3D() {
  return (
    <group>
      <mesh position={[0, PALLET_ALTURA_BASE_M / 2, 0]} receiveShadow>
        <boxGeometry args={[PALLET_COMPRIMENTO_M, PALLET_ALTURA_BASE_M, PALLET_LARGURA_M]} />
        <meshStandardMaterial color="#7c8796" roughness={0.78} metalness={0.05} />
        <Edges color="#334155" threshold={15} />
      </mesh>

      {[-0.36, 0, 0.36].map((z) => (
        <mesh key={z} position={[0, PALLET_ALTURA_BASE_M + 0.012, z]} receiveShadow>
          <boxGeometry args={[PALLET_COMPRIMENTO_M + 0.04, 0.024, 0.12]} />
          <meshStandardMaterial color="#475569" roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}

function PalletCapacity3D({ layout }: { layout: LayoutPallet3D }) {
  const alturaY = PALLET_ALTURA_BASE_M + LIMITE_ALTURA_CARGA_M / 2
  const ocupadaY = PALLET_ALTURA_BASE_M + layout.alturaOcupadaM
  const corAltura = layout.overflowAltura ? '#d97706' : '#00a88e'
  const tickCount = Math.round(LIMITE_ALTURA_CARGA_M / ALTURA_TICK_M) + 1

  return (
    <group>
      <mesh position={[0, alturaY, 0]}>
        <boxGeometry args={[PALLET_COMPRIMENTO_M, LIMITE_ALTURA_CARGA_M, PALLET_LARGURA_M]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.035} />
        <Edges color="#2563eb" threshold={15} />
      </mesh>

      <mesh position={[0, ocupadaY, 0]}>
        <boxGeometry args={[PALLET_COMPRIMENTO_M + 0.08, 0.012, PALLET_LARGURA_M + 0.08]} />
        <meshStandardMaterial color={corAltura} transparent opacity={0.48} roughness={0.5} />
      </mesh>

      <Html position={[0.72, PALLET_ALTURA_BASE_M + LIMITE_ALTURA_CARGA_M, -0.56]} center distanceFactor={4.8}>
        <div className="pointer-events-none rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          3,00 m
        </div>
      </Html>

      <Html position={[0.84, ocupadaY, 0.22]} center distanceFactor={2.2}>
        <div className="pointer-events-none whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 text-[9px] font-semibold text-brand shadow">
          {formatarM(layout.alturaOcupadaM)}
        </div>
      </Html>

      <mesh position={[0.76, PALLET_ALTURA_BASE_M + LIMITE_ALTURA_CARGA_M / 2, -0.58]}>
        <boxGeometry args={[0.012, LIMITE_ALTURA_CARGA_M, 0.012]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {Array.from({ length: tickCount }).map((_, index) => {
        const altura = index * ALTURA_TICK_M
        return (
          <group key={altura} position={[0.76, PALLET_ALTURA_BASE_M + altura, -0.58]}>
            <mesh>
              <boxGeometry args={[0.09, 0.008, 0.008]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
            {index % 2 === 0 && (
              <Html position={[0.1, 0, 0]} center distanceFactor={5.2}>
                <span className="pointer-events-none mono rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-ink-muted shadow">
                  {formatarM(altura)}
                </span>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

function Package3D({
  caixa,
  muted,
  active,
  onHover,
}: {
  caixa: CaixaPallet3D
  muted: boolean
  active: boolean
  onHover: (caixa: CaixaPallet3D | null) => void
}) {
  return (
    <RoundedBox
      args={[caixa.comprimentoM, caixa.alturaM, caixa.larguraM]}
      position={[caixa.x, caixa.y, caixa.z]}
      radius={Math.min(0.018, caixa.comprimentoM * 0.08, caixa.larguraM * 0.08, caixa.alturaM * 0.08)}
      smoothness={3}
      castShadow
      receiveShadow
      onPointerOver={(event) => {
        event.stopPropagation()
        onHover(caixa)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        onHover(null)
      }}
    >
      <meshStandardMaterial
        color={caixa.cor}
        roughness={0.56}
        metalness={0.04}
        emissive={caixa.cor}
        emissiveIntensity={active ? 0.18 : 0.035}
        transparent
        opacity={muted ? 0.5 : 0.94}
      />
      <Edges color={active ? '#ffffff' : '#172033'} threshold={15} />
    </RoundedBox>
  )
}

function A4PrintPreview({ requisicao }: { requisicao: RequisicaoImpressaoPallet }) {
  return (
    <div className="rounded-xl border border-line bg-surface-sub p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-ink-soft">
          <Printer className="h-4 w-4 shrink-0" />
          <span className="mono truncate font-semibold">{requisicao.id}</span>
        </div>
        <Badge tone="info">Solicitada</Badge>
      </div>

      <div className="aspect-[297/210] overflow-hidden rounded-lg border border-slate-300 bg-white p-5 text-slate-950 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Folha A4 horizontal</p>
            <h4 className="mono mt-1 text-2xl font-black leading-none">{requisicao.palletId}</h4>
            <p className="mt-1 text-xs font-semibold text-slate-600">{requisicao.recebimentoId} · {requisicao.viagemId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">CTe</p>
            <p className="mono text-sm font-black">{requisicao.cte}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">NF</p>
            <p className="mono text-sm font-black">{requisicao.nf}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <A4Metric label="SKUs" value={requisicao.skus.length.toLocaleString('pt-BR')} />
          <A4Metric label="Volumes" value={requisicao.volumes.toLocaleString('pt-BR')} />
          <A4Metric label="Unidades" value={requisicao.unidades.toLocaleString('pt-BR')} />
          <A4Metric label="Peso" value={formatarKg(requisicao.pesoKg)} />
        </div>

        <div className="mt-3 overflow-hidden rounded border border-slate-300">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1.5 font-black uppercase text-slate-600">SKU</th>
                <th className="px-2 py-1.5 font-black uppercase text-slate-600">Descrição</th>
                <th className="px-2 py-1.5 text-right font-black uppercase text-slate-600">Volumes</th>
                <th className="px-2 py-1.5 text-right font-black uppercase text-slate-600">Unidades</th>
              </tr>
            </thead>
            <tbody>
              {requisicao.skus.map((sku) => (
                <tr key={sku.skuCodigo} className="border-t border-slate-200">
                  <td className="mono px-2 py-1.5 font-black">{sku.skuCodigo}</td>
                  <td className="px-2 py-1.5 font-semibold">{sku.descricao}</td>
                  <td className="mono px-2 py-1.5 text-right font-black">{sku.volumes.toLocaleString('pt-BR')}</td>
                  <td className="mono px-2 py-1.5 text-right font-black">{sku.unidades.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Unidades calculadas pela quebra da etiqueta/caixa matriz</span>
          <span>{formatarM3(requisicao.cubagemM3)}</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-ink-muted">
        Criada em <span className="mono text-ink-soft">{formatarDataHora(requisicao.criadaEmIso)}</span>
      </p>
    </div>
  )
}

function A4Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mono mt-0.5 text-sm font-black text-slate-950">{value}</p>
    </div>
  )
}

function UsoBarra({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: Tone
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-ink-soft">{label}</span>
        <span className="mono text-ink-muted">{formatarPercentual(value)}</span>
      </div>
      <Progress value={value} tone={tone} />
    </div>
  )
}
