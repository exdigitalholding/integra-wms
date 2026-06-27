import { useState, type ReactNode } from 'react'
import {
  Box,
  Printer,
  Truck,
  ClipboardList,
  CheckCircle2,
  Scale,
  ScanLine,
  Clock,
  MapPin,
  AlertTriangle,
  PackageCheck,
  Send,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { COLETAS_TMS, ownerName } from '../lib/mock'
import { Badge, Modal, PageHeader, Progress, Tab, Tabs, type Tone } from '../components/ui'
import OrdemServicoPanel from '../components/OrdemServicoPanel'
import { cn } from '../lib/utils'
import type { ColetaTms, Pedido, StatusColetaTms } from '../lib/types'

const statusMeta: Record<Pedido['status'], { l: string; tone: Tone }> = {
  aguardando: { l: 'Aguardando', tone: 'neutral' },
  'em-separacao': { l: 'Em separação', tone: 'primary' },
  'em-packing': { l: 'Em packing', tone: 'info' },
  expedido: { l: 'Expedido', tone: 'ok' },
}

const coletaStatusMeta: Record<StatusColetaTms, { l: string; tone: Tone }> = {
  recebida: { l: 'Recebida do TMS', tone: 'info' },
  validando: { l: 'Validando reserva', tone: 'warn' },
  'em-separacao': { l: 'Em separação', tone: 'primary' },
  'em-packing': { l: 'Em packing', tone: 'info' },
  'pronta-doca': { l: 'Pronta na doca', tone: 'ok' },
  carregando: { l: 'Carregando', tone: 'primary' },
  despachada: { l: 'Despachada', tone: 'ok' },
  risco: { l: 'Em risco', tone: 'bad' },
}

const riscoTone: Record<ColetaTms['risco'], Tone> = {
  baixo: 'ok',
  medio: 'warn',
  alto: 'bad',
}

export default function Expedicao() {
  const { pedidos, romaneios, conferirVolume, expedirPedido, toast } = useStore()
  const [aba, setAba] = useState('coletas')
  const [pack, setPack] = useState<string | null>(null)
  const [coletaDet, setColetaDet] = useState<ColetaTms | null>(null)
  const pedido = pedidos.find((p) => p.id === pack) ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packing & Expedição (Outbound)"
        subtitle="Coletas TMS, packing, volumes rastreáveis, romaneio, doca e conferência de carregamento."
      />

      <OrdemServicoPanel
        title="OS de packing, romaneio e carregamento"
        subtitle="Crie ordens para conferência de saída, cubagem, etiqueta, montagem de romaneio e bipagem final no veículo."
        tipos={['packing', 'carregamento']}
        defaultTipo={aba === 'romaneio' || aba === 'coletas' ? 'carregamento' : 'packing'}
        defaultOrigem={aba === 'romaneio' || aba === 'coletas' ? 'ROM-3301' : 'PACK-01'}
        defaultDestino={aba === 'romaneio' || aba === 'coletas' ? 'Veículo / doca' : 'Romaneio'}
      />

      <div className="card overflow-hidden">
        <div className="px-4 pt-1">
          <Tabs value={aba} onChange={setAba}>
            <Tab id="coletas">Coletas TMS de hoje</Tab>
            <Tab id="packing">Estações de packing</Tab>
            <Tab id="romaneio">Romaneios & carregamento</Tab>
          </Tabs>
        </div>

        {aba === 'coletas' && (
          <div className="p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ['Coletas abertas', COLETAS_TMS.filter((c) => c.status !== 'despachada').length],
                ['Em risco', COLETAS_TMS.filter((c) => c.risco === 'alto').length],
                ['Volumes prontos', COLETAS_TMS.reduce((s, c) => s + c.volumesProntos, 0)],
                ['A carregar', COLETAS_TMS.reduce((s, c) => s + Math.max(0, c.volumesPrevistos - c.volumesProntos), 0)],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border border-line bg-surface-sub p-4">
                  <p className="text-xs text-ink-muted">{label}</p>
                  <p className="mt-1 text-3xl font-semibold text-brand mono">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid xl:grid-cols-3 gap-4">
              {COLETAS_TMS.map((coleta) => {
                const status = coletaStatusMeta[coleta.status]
                return (
                  <div key={coleta.id} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mono text-sm font-semibold text-brand">{coleta.id}</p>
                        <p className="mt-1 text-sm font-medium text-ink-soft truncate">{coleta.transportadora} · {coleta.rota}</p>
                      </div>
                      <Badge tone={status.tone} dot>{status.l}</Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <MiniInfo icon={<Clock className="h-4 w-4" />} label="Janela" value={coleta.janelaColeta} />
                      <MiniInfo icon={<MapPin className="h-4 w-4" />} label="Doca" value={coleta.doca} />
                      <MiniInfo icon={<Truck className="h-4 w-4" />} label="Veículo" value={coleta.placa} />
                      <MiniInfo icon={<PackageCheck className="h-4 w-4" />} label="Volumes" value={`${coleta.volumesProntos}/${coleta.volumesPrevistos}`} />
                    </div>

                    <div className="mt-4 space-y-2">
                      <ProcessBar label="Picking" value={coleta.progressoPicking} />
                      <ProcessBar label="Packing" value={coleta.progressoPacking} />
                      <ProcessBar label="Carregamento" value={coleta.progressoCarregamento} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Badge tone={riscoTone[coleta.risco]}>
                        {coleta.risco === 'alto' ? 'Ação agora' : coleta.risco === 'medio' ? 'Acompanhar' : 'No prazo'}
                      </Badge>
                      <div className="flex gap-2">
                        <button className="btn-outline py-2 px-3 text-xs" onClick={() => setColetaDet(coleta)}>
                          Detalhes
                        </button>
                        <button
                          className="btn-primary py-2 px-3 text-xs"
                          onClick={() =>
                            toast({
                              tipo: 'info',
                              titulo: 'OS de carregamento preparada',
                              texto: `${coleta.id} · ${coleta.doca} · veículo ${coleta.placa}`,
                            })
                          }
                        >
                          <Send className="h-3.5 w-3.5" /> Acionar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {aba === 'packing' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Pedido</th>
                  <th className="th">Cliente</th>
                  <th className="th">Transportadora</th>
                  <th className="th">Coleta</th>
                  <th className="th">Reserva</th>
                  <th className="th">Volumes / Peso</th>
                  <th className="th">Conferência</th>
                  <th className="th">Status</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => {
                  const conf = p.itens.reduce((s, i) => s + i.conferido, 0)
                  const tot = p.itens.reduce((s, i) => s + i.quantidade, 0)
                  return (
                    <tr key={p.id} className="row-hover">
                      <td className="td mono font-medium text-brand">{p.id}</td>
                      <td className="td">
                        <div>{p.cliente}</div>
                        <div className="text-xs text-ink-muted">{ownerName(p.ownerId)}</div>
                      </td>
                      <td className="td">{p.transportadora}</td>
                      <td className="td mono text-xs">{p.coletaId ?? '—'}</td>
                      <td className="td">
                        <Badge tone={p.reservaStatus === 'reservado' ? 'ok' : p.reservaStatus === 'parcial' ? 'warn' : 'neutral'}>
                          {p.reservaStatus === 'reservado' ? 'Reservado' : p.reservaStatus === 'parcial' ? 'Parcial' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="td mono text-xs">{p.volumes} vol · {p.peso} kg</td>
                      <td className="td w-40">
                        <div className="flex items-center gap-2">
                          <Progress value={(conf / tot) * 100} tone={conf === tot ? 'ok' : 'primary'} />
                          <span className="mono text-xs text-ink-soft">{conf}/{tot}</span>
                        </div>
                      </td>
                      <td className="td"><Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].l}</Badge></td>
                      <td className="td text-right">
                        <button
                          onClick={() => setPack(p.id)}
                          disabled={p.status === 'expedido'}
                          className="btn-outline py-1.5 px-3 text-xs"
                        >
                          {p.status === 'expedido' ? 'Expedido' : 'Packing'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {aba === 'romaneio' && (
          <div className="p-4 grid md:grid-cols-2 gap-4">
            {romaneios.map((r) => {
              const carregados = r.volumes.filter((v) => v.carregado).length
              return (
                <div key={r.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-info-50 text-info grid place-items-center"><Truck className="h-4 w-4" /></div>
                      <div>
                        <p className="font-medium text-brand mono">{r.id}</p>
                        <p className="text-xs text-ink-muted">{r.transportadora} · {r.rota}</p>
                      </div>
                    </div>
                    <Badge tone={r.status === 'despachado' ? 'ok' : r.status === 'em-carregamento' ? 'primary' : 'neutral'} dot>
                      {r.status === 'montando' ? 'Montando' : r.status === 'em-carregamento' ? 'Carregando' : 'Despachado'}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-2 mono">{r.veiculo}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <MiniInfo icon={<MapPin className="h-4 w-4" />} label="Doca" value={r.doca ?? '—'} />
                    <MiniInfo icon={<Clock className="h-4 w-4" />} label="Janela" value={r.janela ?? '—'} />
                    <MiniInfo icon={<Truck className="h-4 w-4" />} label="Placa" value={r.placa ?? '—'} />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {r.volumes.map((v) => (
                      <div key={v.pedido} className="flex items-center gap-2 rounded-lg bg-surface-sub px-3 py-2 text-sm">
                        {v.carregado ? <CheckCircle2 className="h-4 w-4 text-ok" /> : <Box className="h-4 w-4 text-ink-muted" />}
                        <div className="min-w-0">
                          <p className="mono text-xs text-brand">{v.codigoVolume ?? v.pedido}</p>
                          <p className="text-ink-muted text-xs truncate">{v.pedido} · {v.volumes} vol · {v.peso} kg · {v.staging}</p>
                        </div>
                        <span className="flex-1" />
                        {v.carregado ? <span className="text-xs text-ok">carregado</span> : <span className="text-xs text-ink-muted">a carregar</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                    <span>Conferência de carregamento (docking)</span>
                    <span className="mono">{carregados}/{r.volumes.length}</span>
                  </div>
                  <button
                    className="btn-outline w-full mt-2 py-2 text-sm"
                    onClick={() =>
                      toast({
                        tipo: 'info',
                        titulo: 'Conferência de carregamento iniciada',
                        texto: `${r.id} aberto para bipagem final de volumes no veículo.`,
                      })
                    }
                  >
                    <ScanLine className="h-4 w-4" /> Bipar volumes no veículo
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pedido && (
        <PackingModal
          pedido={pedido}
          onConferir={(sku) => conferirVolume(pedido.id, sku)}
          onClose={() => setPack(null)}
          onExpedir={() => {
            expedirPedido(pedido.id)
            toast({ tipo: 'sucesso', titulo: 'Pedido expedido', texto: `${pedido.id} · etiqueta ${pedido.transportadora} gerada` })
            setPack(null)
          }}
        />
      )}

      {coletaDet && (
        <Modal
          open
          onClose={() => setColetaDet(null)}
          title={`Coleta ${coletaDet.id}`}
          subtitle={`${coletaDet.viagemIdTms} · ${coletaDet.transportadora} · ${coletaDet.rota}`}
          size="lg"
          footer={
            <>
              <button className="btn-outline" onClick={() => setColetaDet(null)}>Fechar</button>
              <button
                className="btn-primary"
                onClick={() =>
                  toast({
                    tipo: 'info',
                    titulo: 'Operação acionada',
                    texto: `Supervisor deve acompanhar ${coletaDet.romaneioId} na doca ${coletaDet.doca}.`,
                  })
                }
              >
                <ScanLine className="h-4 w-4" /> Abrir carregamento
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-sub p-4">
              <p className="text-sm font-semibold text-brand">Mensagem recebida do TMS</p>
              <p className="mt-1 text-sm text-ink-soft">{coletaDet.ultimaMensagemTms}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Detail label="Cotação" value={coletaDet.cotacaoId} mono />
              <Detail label="Onda" value={coletaDet.ondaId} mono />
              <Detail label="Romaneio" value={coletaDet.romaneioId} mono />
              <Detail label="Cut-off" value={coletaDet.cutOff} mono />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ActionTile icon={<ClipboardList className="h-5 w-5" />} title="1. Validar reserva" text="Confere se todos os pedidos possuem saldo reservado antes de liberar a onda." />
              <ActionTile icon={<PackageCheck className="h-5 w-5" />} title="2. Fechar volumes" text="Packing cria volume rastreável, peso, cubagem, etiqueta e staging." />
              <ActionTile icon={<Truck className="h-5 w-5" />} title="3. Carregar veículo" text="Operador bipa doca, placa, volume e lacre no mobile." />
            </div>
            {coletaDet.risco === 'alto' && (
              <div className="rounded-xl border border-bad/20 bg-bad-50 p-3 text-sm text-bad flex gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>Risco alto: resolva reserva parcial ou ajuste de onda antes do horário de corte.</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

function PackingModal({
  pedido,
  onConferir,
  onClose,
  onExpedir,
}: {
  pedido: Pedido
  onConferir: (sku: string) => void
  onClose: () => void
  onExpedir: () => void
}) {
  const [step, setStep] = useState(0)
  const conf = pedido.itens.reduce((s, i) => s + i.conferido, 0)
  const tot = pedido.itens.reduce((s, i) => s + i.quantidade, 0)
  const tudoConf = conf === tot
  const steps = ['Conferência de saída', 'Cubagem & embalagem', 'Etiqueta & romaneio']

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`Packing · ${pedido.id}`}
      subtitle={`${pedido.cliente} · ${pedido.transportadora}`}
      footer={
        step < 2 ? (
          <>
            <button onClick={onClose} className="btn-outline">Fechar</button>
            <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !tudoConf} className="btn-primary">
              Avançar
            </button>
          </>
        ) : (
          <>
            <button onClick={onClose} className="btn-outline">Fechar</button>
            <button onClick={onExpedir} className="btn-primary"><Truck className="h-4 w-4" /> Despachar</button>
          </>
        )
      }
    >
      {/* stepper */}
      <div className="flex items-center gap-2 mb-5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn('h-7 w-7 rounded-full grid place-items-center text-xs font-semibold shrink-0', i <= step ? 'bg-primary text-white' : 'bg-slate-100 text-ink-muted')}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block', i <= step ? 'text-brand' : 'text-ink-muted')}>{s}</span>
            {i < steps.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-line')} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink-muted mb-2">Re-bipe cada item — última barreira contra erro de envio.</p>
          {pedido.itens.map((i) => {
            const done = i.conferido >= i.quantidade
            return (
              <div key={i.skuCodigo} className={cn('flex items-center gap-3 rounded-xl border p-3', done ? 'border-ok/40 bg-ok-50' : 'border-line')}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand">{i.descricao}</p>
                  <p className="text-xs text-ink-muted mono">{i.skuCodigo}</p>
                </div>
                <span className="mono text-sm text-ink-soft">{i.conferido}/{i.quantidade}</span>
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-ok" />
                ) : (
                  <button onClick={() => onConferir(i.skuCodigo)} className="btn-primary py-1.5 px-3 text-xs"><ScanLine className="h-3.5 w-3.5" /> Bipar</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-sub p-4 text-center">
              <Scale className="h-5 w-5 text-primary mx-auto" />
              <div className="text-2xl font-semibold text-brand mono mt-2">{pedido.peso} kg</div>
              <div className="text-xs text-ink-muted">Peso aferido</div>
            </div>
            <div className="rounded-xl bg-surface-sub p-4 text-center">
              <Box className="h-5 w-5 text-primary mx-auto" />
              <div className="text-2xl font-semibold text-brand mono mt-2">22×16×10</div>
              <div className="text-xs text-ink-muted">Cubagem (cm)</div>
            </div>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="label">Embalagem sugerida pelo sistema</p>
            <div className="flex items-center gap-2 text-sm"><Box className="h-4 w-4 text-primary" /> Caixa P (até 2 kg) — melhor cubagem para os itens</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Detail label="Staging" value="STG-EXP-03" mono />
            <Detail label="Lacre" value={`LCR-${pedido.id.replace('PED-', '')}`} mono />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary-50/30 p-4 text-center">
            <Printer className="h-6 w-6 text-primary mx-auto" />
            <p className="text-sm font-medium text-brand mt-2">Etiqueta {pedido.transportadora}</p>
            <p className="mono text-xs text-ink-muted mt-1">VOL-{pedido.id.replace('PED-', '')}-1 · {pedido.rota}</p>
            <div className="mt-2 mx-auto h-10 w-48 flex items-end gap-px justify-center">
              {Array.from({ length: 48 }).map((_, i) => (
                <span key={i} className="bg-brand" style={{ width: 2, height: `${30 + ((i * 7) % 70)}%` }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-sub p-3 text-sm text-ink-soft">
            <ClipboardList className="h-4 w-4 text-ink-muted" /> Agrupado no romaneio <span className="mono">ROM-3301</span> · rota {pedido.rota}
          </div>
          <div className="rounded-xl border border-line p-3 text-sm text-ink-soft">
            <p className="font-medium text-brand">Próximo passo para o operador</p>
            <p className="mt-1">Levar volume para <span className="mono">STG-EXP-03</span>. No carregamento, o mobile vai pedir doca, placa, volume e lacre.</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ProcessBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="mono font-semibold text-brand">{value}%</span>
      </div>
      <Progress value={value} tone={value === 100 ? 'ok' : value > 0 ? 'primary' : 'neutral'} />
    </div>
  )
}

function MiniInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-sub px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-xs font-semibold text-brand mono truncate">{value}</p>
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold text-brand', mono && 'mono')}>{value}</p>
    </div>
  )
}

function ActionTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary grid place-items-center">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-brand">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{text}</p>
    </div>
  )
}
