import { useMemo, useState } from 'react'
import { Container, Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { armazemName, TIPO_DOCA_LABEL } from '../lib/mock'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import { Field, FormGrid, SelectField, SettingRow } from '../components/form'
import { num, uid } from '../lib/utils'
import type { Doca, TipoDoca } from '../lib/types'

const novaDoca = (armazemId: string): Doca => ({
  id: uid('dk'),
  armazemId,
  codigo: '',
  nome: '',
  tipo: 'recebimento',
  niveladora: true,
  ativo: true,
})

const docaTone: Record<TipoDoca, 'info' | 'warn' | 'primary'> = {
  recebimento: 'info',
  expedicao: 'warn',
  ambas: 'primary',
}

export default function Docas() {
  const { docas, armazemId, upsert, remove, toast } = useStore()
  const [edit, setEdit] = useState<Doca | null>(null)
  const [novo, setNovo] = useState(false)

  const lista = useMemo(() => docas.filter((d) => d.armazemId === armazemId), [docas, armazemId])

  const salvar = (d: Doca) => {
    if (!d.codigo.trim() || !d.nome.trim()) {
      toast({ tipo: 'erro', titulo: 'Campos obrigatórios', texto: 'Código e nome são obrigatórios.' })
      return
    }
    upsert('docas', d)
    toast({ tipo: 'sucesso', titulo: novo ? 'Doca criada' : 'Doca atualizada', texto: d.nome })
    setEdit(null)
    setNovo(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Docas" subtitle={`Portas de recebimento e expedição de ${armazemName(armazemId)}`}>
        <Badge tone="neutral">{num(lista.length)} docas</Badge>
        <button className="btn-primary" onClick={() => { setEdit(novaDoca(armazemId)); setNovo(true) }}>
          <Plus className="h-4 w-4" /> Nova doca
        </button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lista.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary grid place-items-center">
                <Container className="h-5 w-5" />
              </div>
              <Badge tone={d.ativo ? 'ok' : 'neutral'} dot>{d.ativo ? 'Ativa' : 'Inativa'}</Badge>
            </div>
            <p className="mt-3 font-medium text-brand mono">{d.codigo}</p>
            <p className="text-xs text-ink-muted">{d.nome}</p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge tone={docaTone[d.tipo]}>{TIPO_DOCA_LABEL[d.tipo]}</Badge>
              {d.niveladora && <Badge tone="neutral">Niveladora</Badge>}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
              <button className="btn-ghost p-2" onClick={() => { setEdit({ ...d }); setNovo(false) }} title="Editar"><Pencil className="h-4 w-4" /></button>
              <button className="btn-ghost p-2 text-bad hover:bg-bad-50" onClick={() => { remove('docas', d.id); toast({ tipo: 'info', titulo: 'Doca removida', texto: d.nome }) }} title="Remover"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {lista.length === 0 && (
        <div className="card">
          <EmptyState icon={<Container className="h-6 w-6" />} title="Nenhuma doca neste armazém" text="Cadastre docas para agendar recebimento e expedição." />
        </div>
      )}

      {edit && (
        <Modal
          open
          onClose={() => { setEdit(null); setNovo(false) }}
          title={novo ? 'Nova doca' : `Editar ${edit.codigo}`}
          subtitle={armazemName(armazemId)}
          footer={<><button className="btn-outline" onClick={() => { setEdit(null); setNovo(false) }}>Cancelar</button><button className="btn-primary" onClick={() => salvar(edit)}>Salvar</button></>}
        >
          <div className="space-y-5">
            <FormGrid cols={2}>
              <Field label="Código *" value={edit.codigo} onChange={(v) => setEdit({ ...edit, codigo: v.toUpperCase() })} mono placeholder="DOCA-01" />
              <SelectField label="Tipo" value={edit.tipo} onChange={(v) => setEdit({ ...edit, tipo: v as TipoDoca })} options={Object.entries(TIPO_DOCA_LABEL).map(([value, label]) => ({ value, label }))} />
            </FormGrid>
            <Field label="Nome *" value={edit.nome} onChange={(v) => setEdit({ ...edit, nome: v })} placeholder="Doca 01 — Recebimento" />
            <div className="rounded-xl border border-line px-4">
              <SettingRow title="Possui niveladora" desc="Plataforma niveladora para carga/descarga." on={edit.niveladora} onToggle={() => setEdit({ ...edit, niveladora: !edit.niveladora })} />
              <SettingRow title="Doca ativa" desc="Inativa não pode ser agendada." on={edit.ativo} onToggle={() => setEdit({ ...edit, ativo: !edit.ativo })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
