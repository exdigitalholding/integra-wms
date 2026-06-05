import { useState } from 'react'
import { Warehouse, Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { TIPO_ARMAZEM_LABEL } from '../lib/mock'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import { Field, FormGrid, SelectField, SettingRow } from '../components/form'
import { num, uid } from '../lib/utils'
import type { Armazem, ModoArmazem, TipoArmazem } from '../lib/types'

const novoArmazem = (): Armazem => ({
  id: uid('arm'),
  codigo: '',
  nome: '',
  tipo: 'cd',
  cidade: '',
  uf: '',
  modo: 'completo',
  ativo: true,
})

export default function Armazens() {
  const { armazens, enderecos, upsert, remove, toast } = useStore()
  const [edit, setEdit] = useState<Armazem | null>(null)
  const [novo, setNovo] = useState(false)

  const salvar = (a: Armazem) => {
    if (!a.codigo.trim() || !a.nome.trim()) {
      toast({ tipo: 'erro', titulo: 'Campos obrigatórios', texto: 'Código e nome são obrigatórios.' })
      return
    }
    upsert('armazens', a)
    toast({ tipo: 'sucesso', titulo: novo ? 'Armazém criado' : 'Armazém atualizado', texto: a.nome })
    setEdit(null)
    setNovo(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Armazéns & CDs" subtitle="Multi-armazém desde o dia 1 · o modo define a complexidade da operação">
        <Badge tone="neutral">{num(armazens.length)} unidades</Badge>
        <button className="btn-primary" onClick={() => { setEdit(novoArmazem()); setNovo(true) }}>
          <Plus className="h-4 w-4" /> Novo armazém
        </button>
      </PageHeader>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {armazens.map((a) => {
          const ends = enderecos.filter((e) => e.armazemId === a.id).length
          return (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary grid place-items-center">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-brand">{a.nome}</p>
                    <p className="text-xs text-ink-muted mono">{a.codigo} · {a.cidade}/{a.uf}</p>
                  </div>
                </div>
                <Badge tone={a.modo === 'completo' ? 'primary' : 'neutral'}>{a.modo}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                <span>{TIPO_ARMAZEM_LABEL[a.tipo]}</span>
                <span className="mono text-ink-soft">{num(ends)} endereços</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={a.ativo ? 'ok' : 'neutral'} dot>{a.ativo ? 'Operacional' : 'Inativo'}</Badge>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost p-2" onClick={() => { setEdit({ ...a }); setNovo(false) }} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="btn-ghost p-2 text-bad hover:bg-bad-50"
                    onClick={() => { remove('armazens', a.id); toast({ tipo: 'info', titulo: 'Armazém removido', texto: a.nome }) }}
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {armazens.length === 0 && (
        <div className="card">
          <EmptyState icon={<Warehouse className="h-6 w-6" />} title="Nenhum armazém cadastrado" text="Crie o primeiro armazém para começar." />
        </div>
      )}

      {edit && (
        <ArmazemModal armazem={edit} novo={novo} onClose={() => { setEdit(null); setNovo(false) }} onSave={salvar} />
      )}
    </div>
  )
}

function ArmazemModal({ armazem, novo, onClose, onSave }: { armazem: Armazem; novo: boolean; onClose: () => void; onSave: (a: Armazem) => void }) {
  const [f, setF] = useState<Armazem>(armazem)
  const set = <K extends keyof Armazem>(k: K, v: Armazem[K]) => setF((p) => ({ ...p, [k]: v }))

  return (
    <Modal
      open
      onClose={onClose}
      title={novo ? 'Novo armazém' : `Editar ${armazem.nome}`}
      subtitle="Unidade física / centro de distribuição"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onSave(f)}>Salvar</button>
        </>
      }
    >
      <div className="space-y-5">
        <FormGrid cols={2}>
          <Field label="Código *" value={f.codigo} onChange={(v) => set('codigo', v)} mono placeholder="CD-SP" />
          <SelectField label="Tipo" value={f.tipo} onChange={(v) => set('tipo', v as TipoArmazem)} options={[
            { value: 'cd', label: 'Centro de Distribuição' },
            { value: 'loja', label: 'Loja' },
            { value: 'fabrica', label: 'Fábrica' },
            { value: 'transito', label: 'Trânsito' },
          ]} />
        </FormGrid>
        <Field label="Nome *" value={f.nome} onChange={(v) => set('nome', v)} placeholder="CD Cajamar" />
        <FormGrid cols={2}>
          <Field label="Cidade" value={f.cidade} onChange={(v) => set('cidade', v)} placeholder="Cajamar" />
          <Field label="UF" value={f.uf} onChange={(v) => set('uf', v.toUpperCase().slice(0, 2))} placeholder="SP" />
        </FormGrid>
        <SelectField
          label="Modo de operação"
          value={f.modo}
          onChange={(v) => set('modo', v as ModoArmazem)}
          options={[
            { value: 'simples', label: 'Simples — endereço único, sem slotting' },
            { value: 'completo', label: 'Completo — endereçamento estruturado + slotting' },
          ]}
          hint="A chave que liga/desliga a complexidade. Mesmo schema, comportamento diferente."
        />
        <div className="rounded-xl border border-line px-4">
          <SettingRow title="Armazém ativo" desc="Inativo não recebe operação." on={f.ativo} onToggle={() => set('ativo', !f.ativo)} />
        </div>
      </div>
    </Modal>
  )
}
