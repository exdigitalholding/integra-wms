import { useState } from 'react'
import { Shuffle, ArrowRight, Truck, PackageCheck, ScanLine } from 'lucide-react'
import { CROSSDOCK } from '../lib/mock'
import { useStore } from '../store/useStore'
import { Badge, Modal, PageHeader } from '../components/ui'

export default function CrossDocking() {
  const { toast } = useStore()
  const [rows, setRows] = useState(CROSSDOCK)
  const [det, setDet] = useState<(typeof CROSSDOCK)[number] | null>(null)

  const concluirTriagem = () => {
    if (!det) return
    const next = { ...det, status: 'em-transito-interno' as const }
    setRows((atual) => atual.map((x) => (x.id === det.id ? next : x)))
    setDet(null)
    toast({ tipo: 'sucesso', titulo: 'Cross-docking liberado', texto: `${det.id} direcionado para ${det.docaSaida}` })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cross-docking"
        subtitle="Mercadoria entra e já sai sem ser estocada — triagem direta para a doca de saída"
      />

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

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">ID</th>
              <th className="th">Produto</th>
              <th className="th">Recebimento</th>
              <th className="th">Fluxo</th>
              <th className="th text-right">Qtde</th>
              <th className="th">Destino</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="row-hover cursor-pointer" onClick={() => setDet(x)}>
                <td className="td mono font-medium text-brand">{x.id}</td>
                <td className="td">
                  <div className="text-sm">{x.descricao}</div>
                  <div className="text-xs text-ink-muted mono">{x.sku}</div>
                </td>
                <td className="td mono text-xs">{x.recebimento}</td>
                <td className="td">
                  <span className="inline-flex items-center gap-1.5 mono text-xs">
                    {x.docaEntrada} <ArrowRight className="h-3 w-3 text-ink-muted" /> <span className="text-primary font-medium">{x.docaSaida}</span>
                  </span>
                </td>
                <td className="td text-right mono">{x.quantidade}</td>
                <td className="td text-sm">{x.destino}</td>
                <td className="td">
                  <Badge tone={x.status === 'em-transito-interno' ? 'primary' : 'warn'} dot>
                    {x.status === 'em-transito-interno' ? 'Em trânsito interno' : 'Aguarda triagem'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="text-ink-muted">{k}</span>
                  <span className="mono font-medium text-brand">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { etapa: 'Recepção', status: 'OK', tone: 'ok' },
                { etapa: 'Triagem', status: det.status === 'aguardando-triagem' ? 'Pendente' : 'Concluída', tone: det.status === 'aguardando-triagem' ? 'warn' : 'ok' },
                { etapa: 'Expedição', status: det.status === 'em-transito-interno' ? 'Em trânsito interno' : 'Aguardando', tone: det.status === 'em-transito-interno' ? 'primary' : 'neutral' },
              ].map((item) => (
                <div key={item.etapa} className="rounded-xl bg-surface-sub p-3">
                  <p className="text-xs text-ink-muted">{item.etapa}</p>
                  <div className="mt-1"><Badge tone={item.tone as any}>{item.status}</Badge></div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-accent-50 border border-accent/10 p-3 text-xs text-accent">
              Esta tela demonstra a decisão operacional do supervisor. A confirmação física por leitura continua acontecendo no app mobile.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
