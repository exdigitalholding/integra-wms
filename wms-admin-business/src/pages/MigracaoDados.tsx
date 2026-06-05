import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileJson2,
  FileSpreadsheet,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Modal, PageHeader, Tab, Tabs } from '../components/ui'
import { Field, FormGrid, FormSection, SelectField } from '../components/form'
import { useStore } from '../store/useStore'
import { DEMO_OWNERS, DEMO_SKUS } from '../../../wms-shared-demo'

type Formato = 'csv' | 'json' | 'xlsx'
type Aba = 'importacoes' | 'mapeamento' | 'confianca'

interface LoteImportacao {
  id: string
  cliente: string
  origem: string
  formato: Formato
  registros: number
  status: 'pronto' | 'mapeando' | 'revisao'
  conflitos: number
}

const LOTES_INICIAIS: LoteImportacao[] = [
  { id: 'IMP-2401', cliente: 'NanoTech Eletronicos', origem: 'TMS legado', formato: 'csv', registros: 1284, status: 'pronto', conflitos: 12 },
  { id: 'IMP-2402', cliente: 'Bella Cosmeticos', origem: 'ERP + planilha comercial', formato: 'xlsx', registros: 842, status: 'mapeando', conflitos: 7 },
  { id: 'IMP-2403', cliente: 'Verde Alimentos', origem: 'Exportacao JSON do WMS atual', formato: 'json', registros: 453, status: 'revisao', conflitos: 3 },
]

const MAPEAMENTO_SUGERIDO = [
  { legado: 'cod_item', integra: 'codigo', confianca: 98, exemplo: 'SKU-10241' },
  { legado: 'descricao_produto', integra: 'descricao', confianca: 99, exemplo: 'Fone Bluetooth Pulse X' },
  { legado: 'cod_barras', integra: 'ean', confianca: 97, exemplo: '7891000102413' },
  { legado: 'qtd_caixa', integra: 'unidadesPorCaixa', confianca: 94, exemplo: '6' },
  { legado: 'vencimento', integra: 'controleValidade', confianca: 82, exemplo: 'true' },
]

const FORMATO_LABEL: Record<Formato, string> = {
  csv: 'CSV',
  json: 'JSON',
  xlsx: 'Excel',
}

export default function MigracaoDados() {
  const { toast } = useStore()
  const [aba, setAba] = useState<Aba>('importacoes')
  const [lotes, setLotes] = useState(LOTES_INICIAIS)
  const [abrirAssistente, setAbrirAssistente] = useState(false)
  const [abrirPreview, setAbrirPreview] = useState<LoteImportacao | null>(null)

  const totalRegistros = useMemo(
    () => lotes.reduce((acc, item) => acc + item.registros, 0),
    [lotes],
  )

  const iniciarMock = (payload: {
    cliente: string
    origem: string
    formato: Formato
    registros: number
  }) => {
    const novo: LoteImportacao = {
      id: `IMP-${2400 + lotes.length + 1}`,
      cliente: DEMO_OWNERS.find((owner) => owner.id === payload.cliente)?.nome ?? 'Cliente importado',
      origem: payload.origem,
      formato: payload.formato,
      registros: payload.registros,
      status: 'mapeando',
      conflitos: Math.max(2, Math.round(payload.registros * 0.01)),
    }

    setLotes((atual) => [novo, ...atual])
    setAbrirAssistente(false)
    setAba('importacoes')
    toast({
      tipo: 'sucesso',
      titulo: 'Importação preparada',
      texto: `${novo.id} criada com ${novo.registros} registros para revisão assistida.`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Migração de Dados e Onboarding"
        subtitle="Tela comercial para mostrar ao cliente como SKU, cadastro mestre e estrutura podem entrar no Integra WMS sem backend nesta etapa."
      >
        <Badge tone="primary">{totalRegistros.toLocaleString('pt-BR')} registros demo</Badge>
        <button className="btn-primary" onClick={() => setAbrirAssistente(true)}>
          <Upload className="h-4 w-4" /> Nova importação
        </button>
      </PageHeader>

      <div className="card p-4 flex items-start gap-3 bg-primary-50 border-primary/10">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-ink-soft">
          <p className="font-medium text-brand">Resposta direta à objeção do cliente</p>
          <p className="mt-1">
            A promessa aqui não é “manda a planilha que depois a gente vê”. A tela mostra importação
            assistida, mapeamento sugerido e pré-visualização antes da carga definitiva.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-1">
          <Tabs value={aba} onChange={(value) => setAba(value as Aba)}>
            <Tab id="importacoes">Lotes de importação</Tab>
            <Tab id="mapeamento">Mapeamento assistido</Tab>
            <Tab id="confianca">Segurança comercial</Tab>
          </Tabs>
        </div>

        <div className="p-5">
          {aba === 'importacoes' && (
            <div className="grid xl:grid-cols-[1.5fr_1fr] gap-5">
              <div className="space-y-3">
                {lotes.map((lote) => (
                  <div key={lote.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-brand mono">{lote.id}</p>
                          <Badge tone={lote.status === 'pronto' ? 'ok' : lote.status === 'mapeando' ? 'info' : 'warn'}>
                            {lote.status === 'pronto' ? 'Pronto para carga' : lote.status === 'mapeando' ? 'Mapeando' : 'Aguardando revisão'}
                          </Badge>
                        </div>
                        <p className="text-sm text-ink-soft mt-1">{lote.cliente}</p>
                        <p className="text-xs text-ink-muted mt-1">{lote.origem} · {FORMATO_LABEL[lote.formato]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-brand mono">{lote.registros.toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-ink-muted">registros</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                      <span className="text-ink-muted">Conflitos detectados: <span className="font-semibold text-ink-soft">{lote.conflitos}</span></span>
                      <div className="flex items-center gap-2">
                        <button className="btn-outline py-2 px-3 text-xs" onClick={() => setAbrirPreview(lote)}>
                          Pré-visualizar
                        </button>
                        <button
                          className="btn-primary py-2 px-3 text-xs"
                          onClick={() =>
                            toast({
                              tipo: 'info',
                              titulo: 'Mapeamento reprocessado',
                              texto: `${lote.id} foi reavaliada com regras de normalização e IA.`,
                            })
                          }
                        >
                          Reprocessar com IA
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-line p-4 bg-surface-sub">
                  <p className="text-sm font-semibold text-brand">O que essa tela vende</p>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                    <li>Importar CSV, JSON ou Excel sem falar de backend.</li>
                    <li>Mostrar que o layout legado pode ser reorganizado antes da carga.</li>
                    <li>Dar visibilidade de conflitos antes do go-live.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold text-brand">Entidades que já entram aqui</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge tone="primary">SKU</Badge>
                    <Badge tone="info">Owner</Badge>
                    <Badge tone="accent">Fornecedor</Badge>
                    <Badge tone="warn">Transportadora</Badge>
                    <Badge tone="neutral">Endereço</Badge>
                  </div>
                  <Link to="/produtos" className="btn-outline w-full mt-4 py-2.5 text-sm">
                    Ver cadastro mestre
                  </Link>
                </div>
              </div>
            </div>
          )}

          {aba === 'mapeamento' && (
            <div className="grid xl:grid-cols-[1.4fr_1fr] gap-5">
              <div className="rounded-2xl border border-line overflow-hidden">
                <div className="px-4 py-3 border-b border-line bg-surface-sub flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-brand">Mapeamento sugerido por IA</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="th">Campo legado</th>
                      <th className="th">Campo Integra</th>
                      <th className="th">Confiança</th>
                      <th className="th">Exemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAPEAMENTO_SUGERIDO.map((item) => (
                      <tr key={item.legado} className="row-hover">
                        <td className="td mono">{item.legado}</td>
                        <td className="td mono text-brand">{item.integra}</td>
                        <td className="td">
                          <Badge tone={item.confianca >= 95 ? 'ok' : item.confianca >= 85 ? 'info' : 'warn'}>
                            {item.confianca}%
                          </Badge>
                        </td>
                        <td className="td mono text-xs">{item.exemplo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold text-brand">Conflitos que a demo consegue explicar</p>
                  <div className="space-y-3 mt-3 text-sm">
                    <div className="rounded-xl bg-warn-50/50 border border-warn/20 p-3">
                      <p className="font-medium text-brand">Unidade divergente</p>
                      <p className="text-ink-muted mt-1">Legado usa “caixa” e Integra grava em unidade-base.</p>
                    </div>
                    <div className="rounded-xl bg-bad-50/50 border border-bad/20 p-3">
                      <p className="font-medium text-brand">Validade sem regra explícita</p>
                      <p className="text-ink-muted mt-1">Campo encontrado, mas o SKU ainda não liga controle FEFO.</p>
                    </div>
                    <div className="rounded-xl bg-info-50/50 border border-info/20 p-3">
                      <p className="font-medium text-brand">Categoria precisa normalização</p>
                      <p className="text-ink-muted mt-1">A IA sugere grupo e curva de giro com base no histórico importado.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-line p-4 bg-primary-50/50">
                  <p className="text-sm font-semibold text-brand">Amostra do catálogo demo</p>
                  <div className="mt-3 space-y-2">
                    {DEMO_SKUS.slice(0, 3).map((sku) => (
                      <div key={sku.id} className="rounded-xl border border-primary/15 bg-white px-3 py-2">
                        <p className="text-sm font-medium text-brand">{sku.codigo}</p>
                        <p className="text-xs text-ink-muted">{sku.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {aba === 'confianca' && (
            <div className="grid md:grid-cols-3 gap-4">
              <ConfiancaCard
                icon={<CheckCircle2 className="h-5 w-5 text-ok" />}
                title="Pré-carga validada"
                text="O cliente enxerga o que vai entrar antes de virar dado oficial."
              />
              <ConfiancaCard
                icon={<Sparkles className="h-5 w-5 text-primary" />}
                title="Normalização assistida"
                text="Campos desalinhados, unidades e descrições podem ser reorganizados com apoio de IA."
              />
              <ConfiancaCard
                icon={<AlertTriangle className="h-5 w-5 text-warn" />}
                title="Conflito exposto cedo"
                text="A demo mostra onde a base antiga precisa de ajuste, evitando surpresa no go-live."
              />
            </div>
          )}
        </div>
      </div>

      {abrirAssistente && <AssistenteImportacao onClose={() => setAbrirAssistente(false)} onConfirm={iniciarMock} />}
      {abrirPreview && <PreviewImportacao lote={abrirPreview} onClose={() => setAbrirPreview(null)} />}
    </div>
  )
}

function AssistenteImportacao({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (payload: { cliente: string; origem: string; formato: Formato; registros: number }) => void
}) {
  const [cliente, setCliente] = useState(DEMO_OWNERS[0]?.id ?? '')
  const [origem, setOrigem] = useState('Exportação do TMS legado')
  const [formato, setFormato] = useState<Formato>('csv')
  const [registros, setRegistros] = useState('1200')

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova importação assistida"
      subtitle="Simulação comercial da entrada de base do cliente"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onConfirm({ cliente, origem, formato, registros: Number(registros) || 0 })}>
            Preparar revisão
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <FormSection title="Origem do material">
          <FormGrid cols={2}>
            <SelectField
              label="Cliente / owner"
              value={cliente}
              onChange={setCliente}
              options={DEMO_OWNERS.map((owner) => ({ value: owner.id, label: owner.nome }))}
            />
            <SelectField
              label="Formato"
              value={formato}
              onChange={(value) => setFormato(value as Formato)}
              options={[
                { value: 'csv', label: 'CSV exportado do sistema atual' },
                { value: 'json', label: 'JSON estruturado' },
                { value: 'xlsx', label: 'Planilha Excel' },
              ]}
            />
          </FormGrid>
          <Field label="Origem declarada" value={origem} onChange={setOrigem} />
        </FormSection>

        <FormSection title="Estimativa do lote">
          <FormGrid cols={2}>
            <Field label="Registros encontrados" type="number" value={registros} onChange={setRegistros} hint="Serve para simular volume percebido na apresentação." />
            <Field label="Arquivo selecionado" value={formato === 'csv' ? 'sku_legacy_export.csv' : formato === 'json' ? 'wms-atual-catalogo.json' : 'base_clientes_implantacao.xlsx'} onChange={() => undefined} disabled />
          </FormGrid>
        </FormSection>

        <div className="grid md:grid-cols-3 gap-3">
          <MiniInfo icon={<FileSpreadsheet className="h-4 w-4 text-primary" />} title="CSV e Excel" text="Bom para exportações de TMS e ERP." />
          <MiniInfo icon={<FileJson2 className="h-4 w-4 text-info" />} title="JSON" text="Ideal para clientes com exportação estruturada." />
          <MiniInfo icon={<Wand2 className="h-4 w-4 text-accent" />} title="IA assistida" text="Sugere mapeamento e acusa conflitos antes da carga." />
        </div>
      </div>
    </Modal>
  )
}

function PreviewImportacao({ lote, onClose }: { lote: LoteImportacao; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`Pré-visualização ${lote.id}`}
      subtitle="Amostra do que o cliente veria antes da confirmação"
      size="lg"
      footer={<button className="btn-primary" onClick={onClose}>Fechar</button>}
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Cliente" value={lote.cliente} />
          <Stat label="Formato" value={FORMATO_LABEL[lote.formato]} />
          <Stat label="Conflitos" value={`${lote.conflitos}`} />
        </div>
        <div className="rounded-2xl border border-line overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Código</th>
                <th className="th">Descrição</th>
                <th className="th">Owner</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_SKUS.slice(0, 5).map((sku, index) => (
                <tr key={`${lote.id}-${sku.id}`} className="row-hover">
                  <td className="td mono">{sku.codigo}</td>
                  <td className="td">{sku.descricao}</td>
                  <td className="td">{DEMO_OWNERS.find((owner) => owner.id === sku.ownerId)?.nome ?? '—'}</td>
                  <td className="td">
                    <Badge tone={index === 2 ? 'warn' : 'ok'}>{index === 2 ? 'Revisar unidade' : 'OK para carga'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-sub p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="text-sm font-medium text-brand mt-1">{value}</p>
    </div>
  )
}

function ConfiancaCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="h-10 w-10 rounded-xl bg-surface-sub border border-line grid place-items-center">
        {icon}
      </div>
      <p className="text-sm font-semibold text-brand mt-4">{title}</p>
      <p className="text-sm text-ink-muted mt-2">{text}</p>
    </div>
  )
}

function MiniInfo({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="h-8 w-8 rounded-lg bg-surface-sub border border-line grid place-items-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-brand mt-3">{title}</p>
      <p className="text-xs text-ink-muted mt-1">{text}</p>
    </div>
  )
}
