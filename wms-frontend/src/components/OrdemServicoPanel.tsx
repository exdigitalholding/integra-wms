import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Plus,
  UserPlus,
} from 'lucide-react'
import { Badge, Modal } from './ui'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import { STATUS_TAREFA_LABEL, TIPO_TAREFA_LABEL } from '../lib/tarefaMeta'
import type { Tarefa, TipoTarefa } from '../lib/types'

const operadores = ['Marina S.', 'Carlos M.', 'Ana P.', 'Patrícia L.', 'João R.', 'Operador Demo']

const statusColumns: Array<{ id: Tarefa['status']; label: string; tone: 'neutral' | 'primary' | 'ok' | 'bad' }> = [
  { id: 'a-fazer', label: 'A fazer', tone: 'neutral' },
  { id: 'fazendo', label: 'Fazendo', tone: 'primary' },
  { id: 'feito', label: 'Feito', tone: 'ok' },
  { id: 'problema', label: 'Problemas', tone: 'bad' },
]

const tipoTone: Record<TipoTarefa, 'neutral' | 'primary' | 'accent' | 'info' | 'warn' | 'bad'> = {
  recebimento: 'info',
  putaway: 'primary',
  picking: 'primary',
  packing: 'accent',
  carregamento: 'info',
  reabastecimento: 'accent',
  contagem: 'neutral',
  recontagem: 'warn',
  divergencia: 'bad',
  'cross-docking': 'warn',
}

export default function OrdemServicoPanel({
  title = 'Ordens de serviço',
  subtitle = 'Crie, atribua e acompanhe a execução no app/coletor.',
  tipos,
  referenciaId,
  defaultTipo,
  defaultOrigem = '—',
  defaultDestino = '—',
}: {
  title?: string
  subtitle?: string
  tipos?: TipoTarefa[]
  referenciaId?: string
  defaultTipo?: TipoTarefa
  defaultOrigem?: string
  defaultDestino?: string
}) {
  const {
    tarefas,
    criarTarefa,
    assumirTarefa,
    concluirTarefa,
    reportarProblemaTarefa,
    toast,
  } = useStore()
  const [criando, setCriando] = useState(false)
  const [detalhe, setDetalhe] = useState<Tarefa | null>(null)

  const lista = useMemo(
    () =>
      tarefas.filter((t) => {
        const porTipo = tipos ? tipos.includes(t.tipo) : true
        const porReferencia = referenciaId ? t.referenciaId === referenciaId : true
        return porTipo && porReferencia
      }),
    [tarefas, tipos, referenciaId],
  )

  const criar = (input: Omit<Tarefa, 'id' | 'status'> & { status?: Tarefa['status'] }) => {
    const id = criarTarefa(input)
    toast({ tipo: 'sucesso', titulo: 'OS criada', texto: `${id} enviada para a fila operacional` })
    setCriando(false)
  }

  return (
    <section className="card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-brand">{title}</h2>
          <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>
        </div>
        <button onClick={() => setCriando(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Criar OS
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {statusColumns.map((column) => {
          const items = lista.filter((t) => t.status === column.id)
          return (
            <div key={column.id} className="rounded-xl border border-line bg-surface-sub/70 p-3 h-[560px] flex min-h-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone={column.tone} dot>{column.label}</Badge>
                <span className="mono text-xs text-ink-muted">{items.length}</span>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {items.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetalhe(t)}
                    className="w-full rounded-xl border border-line bg-surface p-2.5 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="mono text-xs font-semibold text-brand">{t.id}</span>
                      <Badge tone={tipoTone[t.tipo]}>{TIPO_TAREFA_LABEL[t.tipo]}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink-soft leading-snug line-clamp-2">{t.descricao}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-ink-muted">
                      <span className="mono truncate">{t.origem} → {t.destino}</span>
                      {t.sla && <span className="mono shrink-0">{t.sla}</span>}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-muted truncate">{t.operador ?? 'Sem operador'}</span>
                      <Badge tone={t.prioridade === 'alta' ? 'bad' : t.prioridade === 'media' ? 'warn' : 'neutral'}>
                        {t.prioridade}
                      </Badge>
                    </div>
                    {t.problema && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-bad-50 px-2 py-1.5 text-xs text-bad">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{t.problema}</span>
                      </div>
                    )}
                  </button>
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-line bg-surface/60 px-3 py-6 text-center text-xs text-ink-muted">
                    Sem OS nesta coluna.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {criando && (
        <CriarOsModal
          tipos={tipos}
          defaultTipo={defaultTipo ?? tipos?.[0] ?? 'putaway'}
          defaultOrigem={defaultOrigem}
          defaultDestino={defaultDestino}
          onClose={() => setCriando(false)}
          onCriar={criar}
        />
      )}

      {detalhe && (
        <DetalheOsModal
          tarefa={detalhe}
          onClose={() => setDetalhe(null)}
          onAtribuir={(operador) => {
            assumirTarefa(detalhe.id, operador)
            toast({ tipo: 'info', titulo: 'OS atribuída', texto: `${detalhe.id} → ${operador}` })
            setDetalhe(null)
          }}
          onConcluir={() => {
            concluirTarefa(detalhe.id)
            toast({ tipo: 'sucesso', titulo: 'OS concluída', texto: detalhe.id })
            setDetalhe(null)
          }}
          onProblema={(problema) => {
            reportarProblemaTarefa(detalhe.id, problema)
            toast({ tipo: 'aviso', titulo: 'Problema registrado', texto: detalhe.id })
            setDetalhe(null)
          }}
        />
      )}
    </section>
  )
}

function CriarOsModal({
  tipos,
  defaultTipo,
  defaultOrigem,
  defaultDestino,
  onClose,
  onCriar,
}: {
  tipos?: TipoTarefa[]
  defaultTipo: TipoTarefa
  defaultOrigem: string
  defaultDestino: string
  onClose: () => void
  onCriar: (input: Omit<Tarefa, 'id' | 'status'> & { status?: Tarefa['status'] }) => void
}) {
  const [tipo, setTipo] = useState<TipoTarefa>(defaultTipo)
  const [descricao, setDescricao] = useState('')
  const [operador, setOperador] = useState('')
  const [prioridade, setPrioridade] = useState<Tarefa['prioridade']>('media')
  const [origem, setOrigem] = useState(defaultOrigem)
  const [destino, setDestino] = useState(defaultDestino)
  const [sku, setSku] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [sla, setSla] = useState('')

  const opcoesTipo = tipos ?? (Object.keys(TIPO_TAREFA_LABEL) as TipoTarefa[])
  const podeCriar = descricao.trim() !== ''

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Criar ordem de serviço"
      subtitle="A OS aparece na fila do supervisor e no app do operador quando atribuída."
      footer={
        <>
          <button onClick={onClose} className="btn-outline">Cancelar</button>
          <button
            disabled={!podeCriar}
            onClick={() =>
              onCriar({
                tipo,
                prioridade,
                operador: operador || null,
                origem,
                destino,
                sku: sku || '—',
                descricao,
                quantidade: Number(quantidade || 0),
                sla: sla || undefined,
                etapa: TIPO_TAREFA_LABEL[tipo],
                referenciaTipo: 'manual',
                referenciaId: 'manual',
                status: operador ? 'fazendo' : 'a-fazer',
              })
            }
            className="btn-primary"
          >
            <ClipboardList className="h-4 w-4" /> Criar OS
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Tipo</label>
          <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoTarefa)} className="input">
            {opcoesTipo.map((item) => <option key={item} value={item}>{TIPO_TAREFA_LABEL[item]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Prioridade</label>
          <select value={prioridade} onChange={(event) => setPrioridade(event.target.value as Tarefa['prioridade'])} className="input">
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Descrição da OS</label>
          <input value={descricao} onChange={(event) => setDescricao(event.target.value)} className="input" placeholder="Ex.: Conferir saída do PED-77120 no PACK-01" />
        </div>
        <div>
          <label className="label">Operador</label>
          <select value={operador} onChange={(event) => setOperador(event.target.value)} className="input">
            <option value="">Sem operador</option>
            {operadores.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label className="label">SLA</label>
          <input value={sla} onChange={(event) => setSla(event.target.value)} className="input mono" placeholder="10:30" />
        </div>
        <div>
          <label className="label">Origem</label>
          <input value={origem} onChange={(event) => setOrigem(event.target.value)} className="input mono" />
        </div>
        <div>
          <label className="label">Destino</label>
          <input value={destino} onChange={(event) => setDestino(event.target.value)} className="input mono" />
        </div>
        <div>
          <label className="label">SKU / Documento</label>
          <input value={sku} onChange={(event) => setSku(event.target.value)} className="input mono" placeholder="SKU, pedido, NF-e ou romaneio" />
        </div>
        <div>
          <label className="label">Quantidade</label>
          <input type="number" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} className="input mono" />
        </div>
      </div>
    </Modal>
  )
}

function DetalheOsModal({
  tarefa,
  onClose,
  onAtribuir,
  onConcluir,
  onProblema,
}: {
  tarefa: Tarefa
  onClose: () => void
  onAtribuir: (operador: string) => void
  onConcluir: () => void
  onProblema: (problema: string) => void
}) {
  const [operador, setOperador] = useState(tarefa.operador ?? operadores[0])
  const [problema, setProblema] = useState(tarefa.problema ?? '')

  return (
    <Modal
      open
      onClose={onClose}
      title={`OS ${tarefa.id}`}
      subtitle={`${TIPO_TAREFA_LABEL[tarefa.tipo]} · ${STATUS_TAREFA_LABEL[tarefa.status]}`}
      footer={
        <>
          <button onClick={onClose} className="btn-outline">Fechar</button>
          {tarefa.status !== 'feito' && (
            <button onClick={() => onProblema(problema || 'Problema operacional registrado pelo supervisor.')} className="btn-outline text-bad border-bad/30">
              <AlertTriangle className="h-4 w-4" /> Problema
            </button>
          )}
          {tarefa.status !== 'feito' && (
            <button onClick={onConcluir} className="btn-primary">
              <CheckCircle2 className="h-4 w-4" /> Concluir
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line p-3">
          <p className="text-sm font-medium text-brand">{tarefa.descricao}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {tarefa.etapa ?? TIPO_TAREFA_LABEL[tarefa.tipo]} · prioridade {tarefa.prioridade}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Origem" value={tarefa.origem} mono />
          <Info label="Destino" value={tarefa.destino} mono />
          <Info label="SKU/Doc." value={tarefa.sku} mono />
          <Info label="Quantidade" value={`${tarefa.quantidade} un`} mono />
          <Info label="SLA" value={tarefa.sla ?? '—'} mono />
          <Info label="Referência" value={tarefa.referenciaId ?? '—'} mono />
        </div>
        <div>
          <label className="label">Operador vinculado</label>
          <div className="flex gap-2">
            <select value={operador} onChange={(event) => setOperador(event.target.value)} className="input">
              {operadores.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button onClick={() => onAtribuir(operador)} className="btn-outline shrink-0">
              <UserPlus className="h-4 w-4" /> Atribuir
            </button>
          </div>
        </div>
        <div>
          <label className="label">Problema / ocorrência</label>
          <textarea
            value={problema}
            onChange={(event) => setProblema(event.target.value)}
            className={cn('input min-h-24 resize-none', tarefa.problema && 'border-bad/40 bg-bad-50')}
            placeholder="Ex.: endereço cheio, divergência fiscal, volume avariado, ruptura no picking..."
          />
        </div>
      </div>
    </Modal>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-sub px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn('text-sm font-medium text-brand mt-0.5 truncate', mono && 'mono')}>{value}</p>
    </div>
  )
}
