import { useState } from 'react'
import { ScanLine, Layers, Boxes, Map, Users, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ONDAS } from '../lib/mock'
import { Badge, Modal, PageHeader, Progress } from '../components/ui'
import type { Onda } from '../lib/types'

const estrategiaInfo: Record<Onda['estrategia'], { l: string; icon: any; desc: string; quando: string }> = {
  discreto: { l: 'Discreto', icon: Package, desc: '1 pedido por vez', quando: 'Baixo volume, pedidos grandes' },
  batch: { l: 'Batch / Lote', icon: Layers, desc: 'Vários pedidos, mesmo SKU juntos', quando: 'Alto volume, itens repetidos' },
  wave: { l: 'Por onda (wave)', icon: Boxes, desc: 'Agrupado por rota/corte', quando: 'Sincronizar com expedição' },
  zona: { l: 'Por zona', icon: Map, desc: 'Operador cobre uma zona', quando: 'Armazém grande' },
  cluster: { l: 'Cluster', icon: Users, desc: 'N pedidos num carrinho', quando: 'E-commerce, pedidos pequenos' },
}
const statusMeta: Record<Onda['status'], { l: string; tone: any }> = {
  planejada: { l: 'Planejada', tone: 'neutral' },
  liberada: { l: 'Liberada', tone: 'info' },
  'em-separacao': { l: 'Em separação', tone: 'primary' },
  concluida: { l: 'Concluída', tone: 'ok' },
}

export default function Picking() {
  const [det, setDet] = useState<Onda | null>(null)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Picking (Separação)"
        subtitle="Coração do outbound — ondas priorizadas por SLA, rota otimizada e tratamento de exceções"
      >
        <Link to="/coletor" className="btn-primary">
          <ScanLine className="h-4 w-4" /> Abrir coletor RF
        </Link>
      </PageHeader>

      {/* estratégias */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Estratégias de separação</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(estrategiaInfo) as Onda['estrategia'][]).map((k) => {
            const e = estrategiaInfo[k]
            return (
              <div key={k} className="card p-3.5">
                <e.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-medium text-brand">{e.l}</p>
                <p className="text-xs text-ink-muted mt-0.5">{e.desc}</p>
                <p className="text-[11px] text-ink-muted mt-2 pt-2 border-t border-line">{e.quando}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ondas */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Ondas de separação</p>
        <div className="grid md:grid-cols-2 gap-4">
          {ONDAS.map((o) => {
            const e = estrategiaInfo[o.estrategia]
            return (
              <div key={o.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary grid place-items-center">
                      <e.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-brand mono">{o.id}</p>
                      <p className="text-xs text-ink-muted">{e.l} · corte {o.corte}</p>
                    </div>
                  </div>
                  <Badge tone={statusMeta[o.status].tone} dot>{statusMeta[o.status].l}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  {[['Pedidos', o.pedidos], ['Linhas', o.linhas], ['Itens', o.itens]].map(([l, v]) => (
                    <div key={l as string} className="rounded-xl bg-surface-sub py-2">
                      <div className="text-lg font-semibold text-brand mono">{v}</div>
                      <div className="text-[11px] text-ink-muted">{l}</div>
                    </div>
                  ))}
                </div>
                {o.status !== 'planejada' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-ink-muted">Progresso</span>
                      <span className="mono font-medium text-brand">{o.progresso}%</span>
                    </div>
                    <Progress value={o.progresso} tone={o.progresso === 100 ? 'ok' : 'primary'} />
                  </div>
                )}
                <button onClick={() => setDet(o)} className="btn-outline w-full mt-3 py-2 text-sm">
                  Detalhes da onda
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={!!det} onClose={() => setDet(null)} title={`Onda ${det?.id}`} subtitle={det ? estrategiaInfo[det.estrategia].l : undefined} size="md">
        {det && (
          <div className="space-y-4">
            <div className="rounded-xl bg-warn-50 border border-warn/20 p-3 text-xs text-warn">
              <strong>Exceções no fluxo:</strong> endereço com quantidade insuficiente → picking parcial + tarefa de
              reabastecimento gerada. Produto avariado → registra ocorrência, sistema busca outro endereço com o SKU.
            </div>
            <div className="rounded-xl border border-line divide-y divide-line">
              {[
                { a: 'A-12-03-2', s: 'SKU-10241', d: 'Fone Bluetooth Pulse X', q: 2, st: 'ok' },
                { a: 'A-12-04-1', s: 'SKU-10242', d: 'Carregador Turbo 30W', q: 1, st: 'ok' },
                { a: 'A-13-01-1', s: 'SKU-10243', d: 'Cabo USB-C 2m', q: 4, st: 'parcial' },
              ].map((r) => (
                <div key={r.s} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="mono text-xs font-medium text-primary w-20">{r.a}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-soft truncate">{r.d}</p>
                    <p className="text-xs text-ink-muted mono">{r.s} · {r.q} un</p>
                  </div>
                  {r.st === 'parcial' ? <Badge tone="warn">Parcial → reabast.</Badge> : <Badge tone="ok">OK</Badge>}
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-surface-sub p-3 text-xs text-ink-muted flex items-center gap-2">
              <Map className="h-4 w-4" /> Rota otimizada: o sistema ordena os endereços para minimizar deslocamento.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
