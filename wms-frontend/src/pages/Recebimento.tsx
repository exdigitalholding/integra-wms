import { useState } from 'react'
import {
  PackageOpen,
  Tag,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { ownerColor, ownerName } from '../lib/mock'
import { Badge, Modal, PageHeader, ScanInput, Tab, Tabs } from '../components/ui'
import { cn } from '../lib/utils'
import type { ItemRecebimento, Ocorrencia, Recebimento as Rec } from '../lib/types'

const statusMeta: Record<string, { l: string; tone: any }> = {
  agendado: { l: 'Agendado', tone: 'neutral' },
  'na-doca': { l: 'Na doca', tone: 'info' },
  'em-conferencia': { l: 'Em conferência', tone: 'primary' },
  divergencia: { l: 'Divergência', tone: 'bad' },
  concluido: { l: 'Concluído', tone: 'ok' },
}
const vertenteLabel: Record<string, string> = {
  ecommerce: 'E-commerce',
  industria: 'Indústria',
  '3pl': '3PL',
}

export default function Recebimento() {
  const { recebimentos, conferirItem, registrarOcorrencia, concluirRecebimento, toast } =
    useStore()
  const [aba, setAba] = useState('todos')
  const [aberto, setAberto] = useState<string | null>(null)

  const lista = recebimentos.filter((r) => (aba === 'todos' ? true : r.status === aba))
  const rec = recebimentos.find((r) => r.id === aberto) ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recebimento (Inbound)"
        subtitle="Agendamento → Doca → Conferência cega → Tratamento de divergência → Etiquetagem"
      >
        <Badge tone="info" dot>
          {recebimentos.filter((r) => r.status !== 'concluido').length} em andamento
        </Badge>
      </PageHeader>

      {/* docas resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Agendados', v: recebimentos.filter((r) => r.status === 'agendado').length, tone: 'neutral' },
          { l: 'Na doca', v: recebimentos.filter((r) => r.status === 'na-doca').length, tone: 'info' },
          { l: 'Em conferência', v: recebimentos.filter((r) => r.status === 'em-conferencia').length, tone: 'primary' },
          { l: 'Divergências', v: recebimentos.filter((r) => r.status === 'divergencia').length, tone: 'bad' },
        ].map((c) => (
          <div key={c.l} className="card p-4">
            <div className="text-2xl font-semibold text-brand mono">{c.v}</div>
            <div className="text-xs text-ink-muted mt-0.5">{c.l}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 pt-1">
          <Tabs value={aba} onChange={setAba}>
            <Tab id="todos">Todos</Tab>
            <Tab id="na-doca">Na doca</Tab>
            <Tab id="em-conferencia">Em conferência</Tab>
            <Tab id="divergencia">Divergências</Tab>
            <Tab id="concluido">Concluídos</Tab>
          </Tabs>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Recebimento</th>
                <th className="th">Doca</th>
                <th className="th">Fornecedor</th>
                <th className="th">Documento</th>
                <th className="th">Cliente / Owner</th>
                <th className="th">ETA</th>
                <th className="th">Status</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => {
                const conf = r.itens.filter((i) => i.conferido).length
                return (
                  <tr key={r.id} className="row-hover">
                    <td className="td font-medium text-brand mono">{r.id}</td>
                    <td className="td">{r.doca}</td>
                    <td className="td">{r.fornecedor}</td>
                    <td className="td">
                      <span className="mono text-xs">{r.documento}</span>
                      <Badge tone="neutral" className="ml-2">{r.tipoDoc}</Badge>
                    </td>
                    <td className="td">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: ownerColor(r.ownerId) }} />
                        {ownerName(r.ownerId)}
                      </span>
                    </td>
                    <td className="td mono">{r.eta}</td>
                    <td className="td">
                      <Badge tone={statusMeta[r.status].tone}>
                        {statusMeta[r.status].l}
                        {r.status === 'em-conferencia' && ` ${conf}/${r.itens.length}`}
                      </Badge>
                    </td>
                    <td className="td text-right">
                      <button onClick={() => setAberto(r.id)} className="btn-outline py-1.5 px-3 text-xs">
                        {r.status === 'concluido' ? 'Ver' : 'Conferir'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {rec && (
        <ConferenciaModal
          rec={rec}
          onClose={() => setAberto(null)}
          onConferir={(sku, q) => {
            conferirItem(rec.id, sku, q)
            toast({ tipo: 'sucesso', titulo: 'Item conferido', texto: `${sku} · ${q} un` })
          }}
          onOcorrencia={(sku, oc) => {
            registrarOcorrencia(rec.id, sku, oc)
            toast({ tipo: 'aviso', titulo: 'Ocorrência registrada', texto: `${oc.tipo} em ${sku}` })
          }}
          onConcluir={() => {
            concluirRecebimento(rec.id)
            toast({ tipo: 'sucesso', titulo: 'Recebimento concluído', texto: `${rec.id} disponível p/ putaway` })
            setAberto(null)
          }}
        />
      )}
    </div>
  )
}

function ConferenciaModal({
  rec,
  onClose,
  onConferir,
  onOcorrencia,
  onConcluir,
}: {
  rec: Rec
  onClose: () => void
  onConferir: (sku: string, q: number) => void
  onOcorrencia: (sku: string, oc: Ocorrencia) => void
  onConcluir: () => void
}) {
  const [cega, setCega] = useState(true)
  const [ativo, setAtivo] = useState<ItemRecebimento | null>(null)
  const [oco, setOco] = useState<ItemRecebimento | null>(null)
  const todosConferidos = rec.itens.every((i) => i.conferido)

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        title={`Conferência · ${rec.id}`}
        subtitle={`${rec.fornecedor} · ${rec.doca} · ${vertenteLabel[rec.vertente]}`}
        footer={
          <>
            <button onClick={onClose} className="btn-outline">Fechar</button>
            <button onClick={onConcluir} disabled={!todosConferidos} className="btn-primary">
              <Tag className="h-4 w-4" /> Gerar etiqueta SSCC & disponibilizar
            </button>
          </>
        }
      >
        <div className="flex items-center justify-between rounded-xl bg-surface-sub border border-line p-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            {cega ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-ink-muted" />}
            <div>
              <p className="font-medium text-brand">Conferência cega</p>
              <p className="text-xs text-ink-muted">Operador conta sem ver o esperado — reduz viés e fraude.</p>
            </div>
          </div>
          <button
            onClick={() => setCega((c) => !c)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              cega ? 'bg-primary' : 'bg-slate-300',
            )}
          >
            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', cega ? 'left-[22px]' : 'left-0.5')} />
          </button>
        </div>

        <div className="space-y-2">
          {rec.itens.map((i) => {
            const ok = i.conferido && !i.ocorrencia
            const div = !!i.ocorrencia
            return (
              <div
                key={i.skuCodigo}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  ok && 'border-ok/40 bg-ok-50',
                  div && 'border-bad/40 bg-bad-50',
                  !i.conferido && 'border-line',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-surface border border-line grid place-items-center text-ink-muted">
                    <PackageOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand">{i.descricao}</p>
                    <p className="text-xs text-ink-muted mono">
                      {i.skuCodigo}
                      {i.lote && ` · Lote ${i.lote}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {!cega && <p className="text-xs text-ink-muted">Esperado: <span className="mono">{i.esperado}</span></p>}
                    {i.conferido && (
                      <p className={cn('text-sm font-semibold mono', div ? 'text-bad' : 'text-ok')}>
                        {i.contado} un
                      </p>
                    )}
                  </div>
                  {!i.conferido ? (
                    <button onClick={() => setAtivo(i)} className="btn-primary py-1.5 px-3 text-xs">
                      Bipar
                    </button>
                  ) : ok ? (
                    <CheckCircle2 className="h-5 w-5 text-ok" />
                  ) : (
                    <Badge tone="bad">{i.ocorrencia?.tipo}</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Sub-modal: bipar item */}
      {ativo && (
        <BiparModal
          item={ativo}
          cega={cega}
          onClose={() => setAtivo(null)}
          onConfirmar={(q) => {
            onConferir(ativo.skuCodigo, q)
            setAtivo(null)
          }}
          onDivergir={() => {
            setOco(ativo)
            setAtivo(null)
          }}
        />
      )}

      {/* Sub-modal: ocorrência */}
      {oco && (
        <OcorrenciaModal
          item={oco}
          onClose={() => setOco(null)}
          onSalvar={(o) => {
            onOcorrencia(oco.skuCodigo, o)
            setOco(null)
          }}
        />
      )}
    </>
  )
}

function BiparModal({
  item,
  cega,
  onClose,
  onConfirmar,
  onDivergir,
}: {
  item: ItemRecebimento
  cega: boolean
  onClose: () => void
  onConfirmar: (q: number) => void
  onDivergir: () => void
}) {
  const [bipado, setBipado] = useState(false)
  const [q, setQ] = useState('')
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Bipar produto"
      subtitle={item.descricao}
      footer={
        <>
          <button onClick={onDivergir} className="btn-outline text-bad border-bad/30 hover:bg-bad-50">
            <AlertTriangle className="h-4 w-4" /> Divergência
          </button>
          <button
            onClick={() => onConfirmar(Number(q))}
            disabled={!bipado || q === ''}
            className="btn-primary"
          >
            Confirmar
          </button>
        </>
      }
    >
      {!bipado ? (
        <ScanInput
          expected={item.skuCodigo}
          label="Bipe o código do produto"
          onValid={() => setBipado(true)}
        />
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-ok rounded-xl bg-ok-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4" /> SKU validado: <span className="mono">{item.skuCodigo}</span>
          </div>
          {item.lote && (
            <div className="rounded-xl bg-warn-50 border border-warn/20 px-3 py-2 text-xs text-warn">
              Controle de lote/validade — Lote <span className="mono">{item.lote}</span> · venc. {item.validade}
            </div>
          )}
          <div>
            <label className="label">Quantidade contada {cega ? '(conferência cega)' : ''}</label>
            <input
              autoFocus
              type="number"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="0"
              className="input mono text-lg"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

const TIPOS_OCO = [
  { id: 'falta', l: 'Falta' },
  { id: 'sobra', l: 'Sobra' },
  { id: 'item-trocado', l: 'Item trocado' },
  { id: 'avaria', l: 'Avaria' },
] as const

function OcorrenciaModal({
  item,
  onClose,
  onSalvar,
}: {
  item: ItemRecebimento
  onClose: () => void
  onSalvar: (o: Ocorrencia) => void
}) {
  const [tipo, setTipo] = useState<Ocorrencia['tipo']>('falta')
  const [q, setQ] = useState('')
  const [obs, setObs] = useState('')
  const [foto, setFoto] = useState(false)
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Registrar ocorrência"
      subtitle={`${item.descricao} · ${item.skuCodigo}`}
      footer={
        <>
          <button onClick={onClose} className="btn-outline">Cancelar</button>
          <button
            onClick={() => onSalvar({ tipo, quantidadeReal: Number(q) || 0, observacao: obs, foto })}
            disabled={q === ''}
            className="btn-accent"
          >
            Registrar e seguir
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-muted">
          A exceção é tratada dentro do fluxo — o operador não abandona a tarefa.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS_OCO.map((t) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                tipo === t.id ? 'border-accent bg-accent-50 text-accent' : 'border-line text-ink-soft hover:bg-surface-sub',
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Quantidade real recebida</label>
          <input type="number" value={q} onChange={(e) => setQ(e.target.value)} className="input mono" placeholder="0" />
        </div>
        <div>
          <label className="label">Observação</label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Descreva a divergência…"
          />
        </div>
        <button
          onClick={() => setFoto((f) => !f)}
          className={cn(
            'flex items-center gap-2 w-full rounded-xl border border-dashed px-3 py-3 text-sm transition-colors',
            foto ? 'border-ok bg-ok-50 text-ok' : 'border-line text-ink-muted hover:bg-surface-sub',
          )}
        >
          {foto ? <CheckCircle2 className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {foto ? 'Foto anexada (1)' : 'Anexar foto da avaria/divergência'}
        </button>
      </div>
    </Modal>
  )
}
