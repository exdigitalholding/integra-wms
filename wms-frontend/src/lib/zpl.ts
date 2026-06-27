export interface ZplPrinterConfig {
  host: string
  port: number
  dpi: 203 | 300
  widthMm: number
  heightMm: number
}

export interface ZplEtiquetaInput {
  id: string
  viagemId: string
  skuCodigo: string
  descricao: string
  sequencia: string
  sequenciaSku: string
  quantidadeNoVolume: number
  emissaoIso: string
  origemDestino: string
  embarcador: string
  nf: string
  cte: string
  kg: string
  destinatario: string
  endereco: string
}

const mmToDots = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi)

export function normalizarTextoZpl(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\^~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function dataZpl(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')
}

export function gerarZplEtiqueta(etiqueta: ZplEtiquetaInput, config: ZplPrinterConfig) {
  const width = mmToDots(config.widthMm, config.dpi)
  const height = mmToDots(config.heightMm, config.dpi)
  const dot = (mm: number) => mmToDots(mm, config.dpi)
  const [origem = '', destino = ''] = etiqueta.origemDestino.split('/')
  const leftStrip = dot(15)
  const rightStrip = dot(9)
  const centerX = leftStrip + dot(1.5)
  const centerWidth = Math.max(dot(38), width - leftStrip - rightStrip - dot(3))
  const rightX = width - rightStrip
  const barcodeHeight = dot(27)

  return [
    '^XA',
    '^CI28',
    `^PW${width}`,
    `^LL${height}`,
    '^LH0,0',
    `^FO0,0^GB${width},${height},2^FS`,
    `^FO${leftStrip},0^GB1,${height},1^FS`,
    `^FO${rightX},0^GB${rightStrip},${height},${rightStrip}^FS`,
    `^FO${dot(2)},${dot(35)}^BY2,2,${barcodeHeight}^BCR,${barcodeHeight},N,N,N^FD${normalizarTextoZpl(etiqueta.id)}^FS`,
    `^FO${dot(1)},${height - dot(3.5)}^A0N,${dot(2)},${dot(2)}^FB${leftStrip - dot(2)},1,0,C^FD${normalizarTextoZpl(etiqueta.id)}^FS`,
    `^FO${centerX},${dot(1.2)}^A0N,${dot(2)},${dot(2)}^FD${normalizarTextoZpl(etiqueta.viagemId)}^FS`,
    `^FO${centerX + dot(27)},${dot(1.2)}^A0N,${dot(2)},${dot(2)}^FD${dataZpl(etiqueta.emissaoIso)}^FS`,
    `^FO${centerX},${dot(5.2)}^A0N,${dot(6.5)},${dot(6.5)}^FDD-${normalizarTextoZpl(destino)}^FS`,
    `^FO${centerX + dot(22.5)},${dot(5.2)}^A0N,${dot(6.5)},${dot(6.5)}^FDO-${normalizarTextoZpl(origem)}^FS`,
    `^FO${centerX},${dot(13.8)}^A0N,${dot(5)},${dot(5)}^FD${normalizarTextoZpl(etiqueta.id)}^FS`,
    `^FO${centerX + dot(28)},${dot(13.9)}^A0N,${dot(4.3)},${dot(4.3)}^FD${normalizarTextoZpl(etiqueta.sequencia)}^FS`,
    `^FO${centerX},${dot(20.5)}^A0N,${dot(2.3)},${dot(2.3)}^FB${centerWidth - dot(14)},1,0,L^FD${normalizarTextoZpl(etiqueta.cte)}^FS`,
    `^FO${centerX},${dot(23.8)}^A0N,${dot(2)},${dot(2)}^FB${centerWidth - dot(14)},1,0,L^FD${normalizarTextoZpl(etiqueta.skuCodigo)}^FS`,
    `^FO${centerX + dot(31)},${dot(20.5)}^A0N,${dot(1.6)},${dot(1.6)}^FDKg.Calc.^FS`,
    `^FO${centerX + dot(31)},${dot(23.2)}^A0N,${dot(2.7)},${dot(2.7)}^FD${normalizarTextoZpl(etiqueta.kg.replace(/\s?kg$/, ''))}^FS`,
    `^FO${centerX},${dot(26.8)}^GB${centerWidth},1,1^FS`,
    `^FO${centerX},${dot(28.2)}^A0N,${dot(2.2)},${dot(2.2)}^FB${centerWidth},1,0,L^FD${normalizarTextoZpl(etiqueta.destinatario)}^FS`,
    `^FO${centerX},${dot(31.3)}^A0N,${dot(1.8)},${dot(1.8)}^FB${centerWidth},2,1,L^FD${normalizarTextoZpl(etiqueta.endereco)}^FS`,
    `^FO${centerX},${dot(36.4)}^A0N,${dot(1.7)},${dot(1.7)}^FB${centerWidth},1,0,L^FD${normalizarTextoZpl(`${etiqueta.quantidadeNoVolume} un - ${etiqueta.sequenciaSku}`)}^FS`,
    `^FO${rightX + dot(2)},${height - dot(4)}^A0R,${dot(3.2)},${dot(3.2)}^FR^FDINTEGRA^FS`,
    `^FO${rightX + dot(5.5)},${height - dot(11)}^A0R,${dot(1.7)},${dot(1.7)}^FR^FDWMS^FS`,
    '^XZ',
  ].join('\n')
}

export function gerarZplLote(etiquetas: ZplEtiquetaInput[], config: ZplPrinterConfig) {
  return etiquetas.map((etiqueta) => gerarZplEtiqueta(etiqueta, config)).join('\n')
}
