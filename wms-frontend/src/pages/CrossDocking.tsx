import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Eye,
  GitBranch,
  PackageCheck,
  Plus,
  Route,
  ScanLine,
  Shuffle,
  Split,
  Timer,
  Truck,
} from 'lucide-react'
import { CROSSDOCK } from '../lib/mock'
import { useStore } from '../store/useStore'
import { Badge, Modal, PageHeader, type Tone } from '../components/ui'
import { cn } from '../lib/utils'

type CrossDockRow = (typeof CROSSDOCK)[number]
type CrossDockPrioridade = 'alta' | 'media' | 'baixa'
type CrossDockExecucao = 'triagem-direta' | 'reserva-doca' | 'divisao-parcial'

const operadoresCrossDock = ['Marina S.', 'Carlos M.', 'Ana P.', 'Patrícia L.', 'João R.', 'Operador Demo']

const execucoesCrossDock: Array<{ id: CrossDockExecucao; label: string; etapa: string; text: string }> = [
  {
    id: 'triagem-direta',
    label: 'Triagem direta',
    etapa: 'Triagem direta para expedição',
    text: 'Mover 100% do fluxo da doca de entrada para a doca de saída.',
  },
  {
    id: 'reserva-doca',
    label: 'Reservar doca',
    etapa: 'Reserva de doca e triagem direta',
    text: 'Bloquear a doca de saída antes de enviar a tarefa ao operador.',
  },
  {
    id: 'divisao-parcial',
    label: 'Dividir parcial',
    etapa: 'Triagem parcial para expedição',
    text: 'Enviar parte para saída direta e deixar o restante para putaway/quarentena.',
  },
]

interface CriarOsCrossDockingInput {
  prioridade: CrossDockPrioridade
  operador: string
  quantidade: number
  sla: string
  execucao: CrossDockExecucao
  reservarDoca: boolean
  exigirScan: boolean
  bloquearExcecao: boolean
  observacao: string
}

export default function CrossDocking() {
  const { criarTarefa, toast } = useStore()
  const [rows, setRows] = useState(CROSSDOCK)
  const [det, setDet] = useState<(typeof CROSSDOCK)[number] | null>(null)
  const [criacaoOs, setCriacaoOs] = useState<CrossDockRow | null>(null)
  const pendentes = rows.filter((row) => row.status === 'aguardando-triagem')
  const totalUnidades = rows.reduce((acc, row) => acc + row.quantidade, 0)

  const concluirTriagem = () => {
    if (!det) return
    const next = { ...det, status: 'em-transito-interno' as const }
    setRows((atual) => atual.map((x) => (x.id === det.id ? next : x)))
    setDet(next)
    toast({ tipo: 'sucesso', titulo: 'Cross-docking liberado', texto: `${det.id} direcionado para ${det.docaSaida}` })
  }

  const abrirCriacaoOs = (row?: CrossDockRow) => {
    const alvo = row ?? pendentes[0] ?? rows[0] ?? null
    if (!alvo) {
      toast({ tipo: 'aviso', titulo: 'Sem fluxo disponível', texto: 'Não há recebimento apto para cross-docking.' })
      return
    }
    setCriacaoOs(alvo)
  }

  const criarOsTriagem = (row: CrossDockRow, input: CriarOsCrossDockingInput) => {
    const execucaoMeta =
      execucoesCrossDock.find((item) => item.id === input.execucao) ?? execucoesCrossDock[0]
    const quantidade = Math.min(Math.max(input.quantidade, 1), row.quantidade)
    const destino =
      input.execucao === 'divisao-parcial' ? `${row.docaSaida} / putaway parcial` : row.docaSaida
    const observacao = input.observacao.trim()
    const salvaguardas = [
      input.reservarDoca ? 'doca reservada' : null,
      input.exigirScan ? 'scan obrigatório' : null,
      input.bloquearExcecao ? 'bloqueio por exceção' : null,
    ].filter(Boolean)
    const id = criarTarefa({
      tipo: 'cross-docking',
      prioridade: input.prioridade,
      operador: input.operador || null,
      origem: row.docaEntrada,
      destino,
      sku: row.sku,
      descricao: `${execucaoMeta.etapa} ${row.id} · ${row.descricao}${observacao ? ` · ${observacao}` : ''}`,
      quantidade,
      sla: input.sla || '00:25',
      etapa: execucaoMeta.etapa,
      referenciaTipo: 'recebimento',
      referenciaId: row.recebimento,
      status: input.operador ? 'fazendo' : 'a-fazer',
    })
    toast({
      tipo: 'sucesso',
      titulo: 'OS de cross-docking criada',
      texto: `${id} · ${row.docaEntrada} → ${destino}${salvaguardas.length ? ` · ${salvaguardas.join(', ')}` : ''}`,
    })
  }

  const acaoRapida = (titulo: string, texto: string) => {
    toast({ tipo: 'info', titulo, texto })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cross-docking"
        subtitle="Mercadoria entra e já sai sem ser estocada: o supervisor decide fluxo, OS, doca e exceções."
      >
        <button className="btn-primary" onClick={() => abrirCriacaoOs()}>
          <Plus className="h-4 w-4" /> Criar OS cross-docking
        </button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
            {[
              { l: 'Recebimento', icon: Truck, tone: 'bg-info-50 text-info' },
              { l: 'Triagem direta', icon: Shuffle, tone: 'bg-primary-50 text-primary' },
              { l: 'Expedição', icon: PackageCheck, tone: 'bg-ok-50 text-ok' },
            ].map((s, i, arr) => (
              <div key={s.l} className="flex items-center gap-4 flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`h-12 w-12 rounded-2xl grid place-items-center ${s.tone}`}><s.icon className="h-5 w-5" /></div>
                  <span className="text-sm font-medium text-brand">{s.l}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-ink-muted shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            ['Pendentes', pendentes.length, 'warn'],
            ['Em fluxo', rows.filter((row) => row.status === 'em-transito-interno').length, 'primary'],
            ['Unidades', totalUnidades, 'neutral'],
          ].map(([label, value, tone]) => (
            <div key={label} className="card p-4">
              <Badge tone={tone as Tone}>{label}</Badge>
              <p className="mono mt-2 text-2xl font-semibold text-brand">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <ActionCard icon={<ClipboardList className="h-4 w-4" />} title="Criar OS de triagem" text="Enviar tarefa para operador mover da doca de entrada para saída." />
        <ActionCard icon={<Route className="h-4 w-4" />} title="Amarrar a viagem" text="Confirmar romaneio, rota, cliente e janela de expedição." />
        <ActionCard icon={<Split className="h-4 w-4" />} title="Dividir parcial" text="Separar parte para cross-docking e parte para estoque/quarentena." />
        <ActionCard icon={<AlertTriangle className="h-4 w-4" />} title="Bloquear exceção" text="Avaria, falta ou fiscal impedem saída direta sem tratativa." tone="warn" />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] gap-4">
        <div className="card p-4">
          <div className="flex flex-col gap-2 border-b border-line pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-brand">Fila de cross-docking</h2>
              <p className="text-xs text-ink-muted mt-0.5">Produto, recebimento, fluxo físico, destino, status e ação em uma leitura só.</p>
            </div>
            <Badge tone="neutral">{rows.length} fluxos ativos</Badge>
          </div>

          <div className="mt-4 space-y-3">
            {rows.map((x) => (
              <div key={x.id} className="rounded-xl border border-line bg-surface-sub/60 p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(220px,1.1fr)_minmax(220px,0.9fr)_minmax(220px,0.9fr)]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono text-xs font-semibold text-primary">{x.id}</span>
                      <span className="mono text-xs text-ink-muted">{x.sku}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-brand">{x.descricao}</p>
                    <p className="mt-1 text-xs text-ink-muted">Recebimento origem <span className="mono text-ink-soft">{x.recebimento}</span></p>
                  </div>

                  <div className="rounded-lg border border-line bg-surface p-3">
                    <p className="text-[11px] uppercase tracking-wide text-ink-muted">Fluxo físico</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="mono font-medium text-brand">{x.docaEntrada}</span>
                      <ArrowRight className="h-4 w-4 text-ink-muted" />
                      <span className="mono font-medium text-primary">{x.docaSaida}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{x.quantidade} unidades para triagem direta</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={x.status === 'em-transito-interno' ? 'primary' : 'warn'} dot>
                        {x.status === 'em-transito-interno' ? 'Em trânsito interno' : 'Aguarda triagem'}
                      </Badge>
                      <span className="mono text-sm font-semibold text-brand">{x.quantidade} un</span>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-muted">Destino</p>
                      <p className="mt-1 text-sm font-medium text-brand">{x.destino}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="btn-outline py-2 px-3 text-xs" onClick={() => setDet(x)}>
                        <Eye className="h-3.5 w-3.5" /> Ver detalhes
                      </button>
                      <button className="btn-primary py-2 px-3 text-xs" onClick={() => abrirCriacaoOs(x)}>
                        <ClipboardList className="h-3.5 w-3.5" /> Criar OS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-brand">Decisões desta tela</p>
          </div>
          <div className="mt-3 space-y-3">
            {[
              ['Recebimento tem pedido de saída?', 'Se não houver demanda vinculada, vira putaway normal.'],
              ['Tem janela de expedição?', 'Priorize cross-docking quando a saída estiver próxima.'],
              ['Precisa conferir qualidade?', 'Se sim, bloqueia saída direta e manda para quarentena.'],
              ['Doca de saída está livre?', 'Reserve doca antes de mandar operador atravessar o armazém.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-line bg-surface-sub p-3">
                <p className="text-sm font-medium text-brand">{title}</p>
                <p className="text-xs text-ink-muted mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={!!det}
        onClose={() => setDet(null)}
        title={det ? `Cross-docking ${det.id}` : 'Cross-docking'}
        subtitle={det ? `${det.sku} · ${det.quantidade} un` : undefined}
        footer={
          det && (
            <>
              <button className="btn-outline" onClick={() => setDet(null)}>Fechar</button>
              <button
                className="btn-outline"
                onClick={() => {
                  setCriacaoOs(det)
                  setDet(null)
                }}
              >
                <ClipboardList className="h-4 w-4" /> Criar OS
              </button>
              <button className="btn-primary" onClick={concluirTriagem}>
                <ScanLine className="h-4 w-4" /> Liberar triagem
              </button>
            </>
          )
        }
      >
        {det && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line divide-y divide-line">
              {[
                ['Recebimento origem', det.recebimento],
                ['Doca de entrada', det.docaEntrada],
                ['Doca de saída', det.docaSaida],
                ['Destino comercial', det.destino],
                ['SLA interno', '25 min até doca de saída'],
                ['Responsável', 'Líder outbound'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="text-ink-muted">{k}</span>
                  <span className="mono font-medium text-brand">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                { etapa: 'Recepção', status: 'OK', tone: 'ok' },
                { etapa: 'Triagem', status: det.status === 'aguardando-triagem' ? 'Pendente' : 'Concluída', tone: det.status === 'aguardando-triagem' ? 'warn' : 'ok' },
                { etapa: 'Expedição', status: det.status === 'em-transito-interno' ? 'Em trânsito interno' : 'Aguardando', tone: det.status === 'em-transito-interno' ? 'primary' : 'neutral' },
              ] as Array<{ etapa: string; status: string; tone: Tone }>).map((item) => (
                <div key={item.etapa} className="rounded-xl bg-surface-sub p-3">
                  <p className="text-xs text-ink-muted">{item.etapa}</p>
                  <div className="mt-1"><Badge tone={item.tone}>{item.status}</Badge></div>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              <button className="btn-outline py-2 text-xs" onClick={() => acaoRapida('Doca reservada', `${det.docaSaida} bloqueada para ${det.id}`)}>
                <Timer className="h-3.5 w-3.5" /> Reservar doca
              </button>
              <button className="btn-outline py-2 text-xs" onClick={() => acaoRapida('Fluxo dividido', 'Parte segue para saída, parte para putaway/quarentena.')}>
                <Split className="h-3.5 w-3.5" /> Dividir parcial
              </button>
              <button className="btn-outline py-2 text-xs text-bad border-bad/30" onClick={() => acaoRapida('Exceção registrada', 'Triagem bloqueada até tratativa do supervisor.')}>
                <AlertTriangle className="h-3.5 w-3.5" /> Bloquear
              </button>
            </div>
          </div>
        )}
      </Modal>

      {criacaoOs && (
        <CriarOsCrossDockingModal
          rows={rows}
          initialRow={criacaoOs}
          onClose={() => setCriacaoOs(null)}
          onCriar={(row, input) => {
            criarOsTriagem(row, input)
            setCriacaoOs(null)
          }}
        />
      )}
    </div>
  )
}

function CriarOsCrossDockingModal({
  rows,
  initialRow,
  onClose,
  onCriar,
}: {
  rows: CrossDockRow[]
  initialRow: CrossDockRow
  onClose: () => void
  onCriar: (row: CrossDockRow, input: CriarOsCrossDockingInput) => void
}) {
  const [rowId, setRowId] = useState(initialRow.id)
  const row = rows.find((item) => item.id === rowId) ?? initialRow
  const [execucao, setExecucao] = useState<CrossDockExecucao>('triagem-direta')
  const [prioridade, setPrioridade] = useState<CrossDockPrioridade>('alta')
  const [operador, setOperador] = useState('')
  const [quantidade, setQuantidade] = useState(String(initialRow.quantidade))
  const [sla, setSla] = useState('00:25')
  const [reservarDoca, setReservarDoca] = useState(true)
  const [exigirScan, setExigirScan] = useState(true)
  const [bloquearExcecao, setBloquearExcecao] = useState(true)
  const [observacao, setObservacao] = useState('')
  const quantidadeNumerica = Math.min(Math.max(Number(quantidade || 0), 0), row.quantidade)
  const podeCriar = quantidadeNumerica > 0

  useEffect(() => {
    setQuantidade(String(row.quantidade))
  }, [row.id, row.quantidade])

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Criar OS de cross-docking"
      subtitle="Defina o fluxo físico antes de enviar a tarefa ao operador."
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            disabled={!podeCriar}
            onClick={() =>
              onCriar(row, {
                prioridade,
                operador,
                quantidade: quantidadeNumerica,
                sla,
                execucao,
                reservarDoca,
                exigirScan,
                bloquearExcecao,
                observacao,
              })
            }
          >
            <ClipboardList className="h-4 w-4" /> Criar OS
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Fluxo de cross-docking</label>
            <select value={rowId} onChange={(event) => setRowId(event.target.value)} className="input">
              {rows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.sku} · {item.quantidade} un
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Operador</label>
            <select value={operador} onChange={(event) => setOperador(event.target.value)} className="input">
              <option value="">Sem operador</option>
              {operadoresCrossDock.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-sub/70 p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <ResumoOs label="Recebimento" value={row.recebimento} />
            <ResumoOs label="Origem" value={row.docaEntrada} />
            <ResumoOs label="Destino" value={row.docaSaida} />
          </div>
          <p className="mt-3 text-sm font-medium text-brand">{row.descricao}</p>
          <p className="mt-1 text-xs text-ink-muted">{row.destino} · {row.status === 'aguardando-triagem' ? 'aguarda triagem' : 'em trânsito interno'}</p>
        </div>

        <div>
          <label className="label">Tipo de execução</label>
          <div className="grid gap-2 md:grid-cols-3">
            {execucoesCrossDock.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={execucao === item.id}
                onClick={() => setExecucao(item.id)}
                className={cn(
                  'rounded-xl border p-3 text-left transition cursor-pointer',
                  execucao === item.id
                    ? 'border-primary bg-primary-50 text-primary shadow-sm'
                    : 'border-line bg-surface hover:border-primary/30',
                )}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Prioridade</label>
            <select value={prioridade} onChange={(event) => setPrioridade(event.target.value as CrossDockPrioridade)} className="input">
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className="label">Quantidade</label>
            <input
              type="number"
              min={1}
              max={row.quantidade}
              value={quantidade}
              onChange={(event) => setQuantidade(event.target.value)}
              className="input mono"
            />
            <p className="mt-1 text-xs text-ink-muted">Disponível neste fluxo: {row.quantidade} un</p>
          </div>
          <div>
            <label className="label">SLA interno</label>
            <input value={sla} onChange={(event) => setSla(event.target.value)} className="input mono" placeholder="00:25" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SwitchOs
            checked={reservarDoca}
            onChange={setReservarDoca}
            title="Reservar doca"
            text="Evita mandar o operador para uma saída ocupada."
          />
          <SwitchOs
            checked={exigirScan}
            onChange={setExigirScan}
            title="Exigir scan"
            text="Operador confirma SKU, origem e doca de saída."
          />
          <SwitchOs
            checked={bloquearExcecao}
            onChange={setBloquearExcecao}
            title="Bloquear exceção"
            text="Avaria ou divergência fiscal para a OS."
          />
        </div>

        <div>
          <label className="label">Observação para o operador</label>
          <textarea
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            className="input min-h-24 resize-none"
            placeholder="Ex.: priorizar janela 10:30, manter volumes juntos, validar avaria antes da saída..."
          />
        </div>
      </div>
    </Modal>
  )
}

function ResumoOs({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mono mt-0.5 truncate text-sm font-semibold text-brand">{value}</p>
    </div>
  )
}

function SwitchOs({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  text: string
}) {
  return (
    <label className="flex min-h-[88px] cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-primary/30">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-line text-primary focus:ring-primary/40"
      />
      <span>
        <span className="block text-sm font-semibold text-brand">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{text}</span>
      </span>
    </label>
  )
}

function ActionCard({ icon, title, text, tone = 'primary' }: { icon: React.ReactNode; title: string; text: string; tone?: 'primary' | 'warn' }) {
  return (
    <div className="card p-4">
      <div className={`h-9 w-9 rounded-xl grid place-items-center ${tone === 'warn' ? 'bg-warn-50 text-warn' : 'bg-primary-50 text-primary'}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-brand mt-3">{title}</p>
      <p className="text-xs text-ink-muted mt-1">{text}</p>
    </div>
  )
}
