import { useMemo, useState } from 'react'
import { SlidersHorizontal, RotateCcw, Globe, Warehouse, Building2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { DEFINICOES_PARAMETROS, armazemName, ownerName } from '../lib/mock'
import { findOverride, resolverPara, asBool, type Resolucao } from '../lib/parametros'
import { Badge, PageHeader } from '../components/ui'
import { Toggle } from '../components/form'
import { cn } from '../lib/utils'
import type { DefinicaoParametro, EscopoParametro } from '../lib/types'

export default function Parametros() {
  const { parametros, owners, armazemId, setParametro, resetParametro } = useStore()
  const [escopo, setEscopo] = useState<EscopoParametro>('global')
  const ownersAtivos = owners.filter((o) => o.ativo)
  const [ownerSel, setOwnerSel] = useState(ownersAtivos[0]?.id ?? '')

  const escopoId = escopo === 'cd' ? armazemId : escopo === 'owner' ? ownerSel : null

  const grupos = useMemo(() => [...new Set(DEFINICOES_PARAMETROS.map((d) => d.grupo))], [])

  const escopoBtns: { id: EscopoParametro; label: string; icon: typeof Globe }[] = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'cd', label: armazemName(armazemId), icon: Warehouse },
    { id: 'owner', label: 'Cliente', icon: Building2 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Parâmetros operacionais" subtitle="As chaves que a operação lê · resolução: owner → CD → global → padrão">
        <Badge tone="neutral">{DEFINICOES_PARAMETROS.length} parâmetros</Badge>
      </PageHeader>

      {/* seletor de escopo */}
      <div className="card p-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-32">Editando escopo</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {escopoBtns.map((b) => (
            <button
              key={b.id}
              onClick={() => setEscopo(b.id)}
              className={cn(
                'btn px-3 py-2 gap-2',
                escopo === b.id ? 'bg-primary text-white shadow-md' : 'border border-line bg-surface text-ink-soft hover:bg-slate-50',
              )}
            >
              <b.icon className="h-4 w-4" />
              {b.label}
            </button>
          ))}
          {escopo === 'owner' && (
            <select
              value={ownerSel}
              onChange={(e) => setOwnerSel(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm cursor-pointer"
            >
              {ownersAtivos.map((o) => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-primary-50 border border-primary-100 p-3 text-xs text-primary flex items-start gap-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          {escopo === 'global'
            ? 'Você edita o valor base que vale para todos os armazéns e clientes, salvo onde houver sobrescrita.'
            : escopo === 'cd'
              ? `Sobrescritas aqui valem só para ${armazemName(armazemId)}. Onde não houver, herda do Global.`
              : `Sobrescritas aqui valem só para ${ownerName(ownerSel)} (em qualquer CD). Onde não houver, herda do Global.`}
        </p>
      </div>

      {grupos.map((g) => (
        <div key={g} className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-line bg-surface-sub">
            <p className="text-sm font-semibold text-brand">{g}</p>
          </div>
          <div className="px-5">
            {DEFINICOES_PARAMETROS.filter((d) => d.grupo === g).map((def) => (
              <ParamRow
                key={def.chave}
                def={def}
                res={resolverPara(def, parametros, escopo, escopoId)}
                definidoAqui={!!findOverride(parametros, def.chave, escopo, escopoId)}
                onChange={(v) => setParametro(def.chave, escopo, escopoId, v)}
                onReset={() => resetParametro(def.chave, escopo, escopoId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function OrigemBadge({ origem, aqui }: { origem: Resolucao['origem']; aqui: boolean }) {
  if (aqui) return <Badge tone="primary">Definido aqui</Badge>
  if (origem === 'global') return <Badge tone="info">Herdado: Global</Badge>
  return <Badge tone="neutral">Padrão do sistema</Badge>
}

function ParamRow({
  def,
  res,
  definidoAqui,
  onChange,
  onReset,
}: {
  def: DefinicaoParametro
  res: Resolucao
  definidoAqui: boolean
  onChange: (v: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-brand">{def.label}</p>
          <OrigemBadge origem={res.origem} aqui={definidoAqui} />
        </div>
        <p className="text-xs text-ink-muted mt-0.5">{def.descricao}</p>
        <div className="mt-1.5 flex flex-col sm:flex-row sm:gap-4 text-[11px] text-ink-muted">
          <span><span className="font-medium text-ink-soft">Simples:</span> {def.modoSimples}</span>
          <span><span className="font-medium text-ink-soft">Completo:</span> {def.modoCompleto}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {definidoAqui && (
          <button onClick={onReset} className="btn-ghost p-2" title="Resetar para herdado">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <ParamControl def={def} valor={res.valor} onChange={onChange} />
      </div>
    </div>
  )
}

function ParamControl({ def, valor, onChange }: { def: DefinicaoParametro; valor: string; onChange: (v: string) => void }) {
  if (def.tipo === 'boolean') {
    return <Toggle on={asBool(valor)} onToggle={() => onChange(asBool(valor) ? 'false' : 'true')} />
  }
  if (def.tipo === 'number') {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-xl border border-zinc-200 bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {def.unidade && <span className="text-xs text-ink-muted">{def.unidade}</span>}
      </div>
    )
  }
  // enum
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-zinc-200 bg-surface px-3 py-2 text-sm cursor-pointer focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {def.opcoes?.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
