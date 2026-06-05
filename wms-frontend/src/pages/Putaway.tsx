import { useState } from 'react'
import { MapPin, ArrowRight, RefreshCw, CheckCircle2, Lightbulb } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Badge, Modal, PageHeader, ScanInput } from '../components/ui'
import type { Tarefa } from '../lib/types'

export default function Putaway() {
  const { tarefas, assumirTarefa, concluirTarefa, toast } = useStore()
  const fila = tarefas.filter((t) => t.tipo === 'putaway')
  const [exec, setExec] = useState<string | null>(null)
  const tarefa = tarefas.find((t) => t.id === exec) ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Endereçamento / Putaway"
        subtitle="Item em staging → Sistema sugere endereço → Operador transporta → Bipa → Disponível"
      >
        <Badge tone="info" dot>
          {fila.filter((t) => t.status !== 'concluida').length} tarefas pendentes
        </Badge>
      </PageHeader>

      {/* lógica de sugestão */}
      <div className="card p-4 flex items-start gap-3 bg-primary-50/40 border-primary/10">
        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-ink-soft">
          <span className="font-medium text-brand">Cérebro do putaway:</span> o endereço é sugerido por
          curva ABC (giro), tipo de posição (picking × pulmão), restrições de peso/validade/temperatura e
          estratégia de ocupação (caótico × fixo).
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {fila.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="mono text-xs font-medium text-ink-muted">{t.id}</span>
              {t.status === 'concluida' ? (
                <Badge tone="ok" dot>Guardado</Badge>
              ) : t.status === 'em-andamento' ? (
                <Badge tone="primary" dot>Em execução</Badge>
              ) : (
                <Badge tone={t.prioridade === 'alta' ? 'bad' : 'neutral'}>Prioridade {t.prioridade}</Badge>
              )}
            </div>
            <p className="mt-2 font-medium text-brand">{t.descricao}</p>
            <p className="text-xs text-ink-muted mono">{t.sku} · {t.quantidade} un</p>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-sub p-2.5 text-sm">
              <span className="mono text-ink-soft">{t.origem}</span>
              <ArrowRight className="h-4 w-4 text-ink-muted" />
              <span className="mono font-semibold text-primary">{t.destino}</span>
            </div>

            <button
              onClick={() => {
                if (t.status === 'pendente') assumirTarefa(t.id, 'Operador Demo')
                setExec(t.id)
              }}
              disabled={t.status === 'concluida'}
              className="btn-primary w-full mt-3 py-2"
            >
              {t.status === 'concluida' ? <><CheckCircle2 className="h-4 w-4" /> Concluído</> : 'Executar putaway'}
            </button>
          </div>
        ))}
      </div>

      {tarefa && (
        <PutawayExec
          tarefa={tarefa}
          onClose={() => setExec(null)}
          onConcluir={() => {
            concluirTarefa(tarefa.id)
            toast({ tipo: 'sucesso', titulo: 'Estoque disponível', texto: `${tarefa.sku} em ${tarefa.destino}` })
            setExec(null)
          }}
        />
      )}
    </div>
  )
}

function PutawayExec({
  tarefa,
  onClose,
  onConcluir,
}: {
  tarefa: Tarefa
  onClose: () => void
  onConcluir: () => void
}) {
  const [validado, setValidado] = useState(false)
  const [destino, setDestino] = useState(tarefa.destino)
  const [alternativo, setAlternativo] = useState(false)

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Executar putaway"
      subtitle={tarefa.id}
      footer={
        <>
          <button onClick={onClose} className="btn-outline">Cancelar</button>
          <button onClick={onConcluir} disabled={!validado} className="btn-primary">
            Confirmar guarda
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line p-3">
          <p className="text-xs text-ink-muted mb-1">Instrução ao operador</p>
          <p className="text-sm">
            Guardar <span className="font-medium text-brand">{tarefa.descricao}</span>{' '}
            (<span className="mono">{tarefa.quantidade} un</span>) no endereço{' '}
            <span className="mono font-semibold text-primary">{destino}</span>
          </p>
        </div>

        {!alternativo && (
          <button
            onClick={() => {
              const novo = 'A-15-02-1'
              setDestino(novo)
              setAlternativo(true)
              setValidado(false)
            }}
            className="flex items-center gap-2 text-xs text-accent hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Endereço ocupado/inacessível? Sugerir alternativa
          </button>
        )}
        {alternativo && (
          <div className="rounded-xl bg-accent-50 border border-accent/20 px-3 py-2 text-xs text-accent flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> Alternativa sugerida pelo sistema: <span className="mono">{destino}</span>
          </div>
        )}

        {!validado ? (
          <ScanInput
            expected={destino}
            label="Bipe o endereço de destino"
            onValid={() => setValidado(true)}
          />
        ) : (
          <div className="flex items-center gap-2 text-sm text-ok rounded-xl bg-ok-50 px-3 py-2.5 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" /> Endereço <span className="mono">{destino}</span> validado
          </div>
        )}
      </div>
    </Modal>
  )
}
