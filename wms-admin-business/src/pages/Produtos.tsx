import { useMemo, useState } from 'react'
import { Search, Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ORIGEM_LABEL } from '../lib/mock'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import { Field, FormGrid, FormSection, SelectField, SettingRow } from '../components/form'
import { cn, maskCest, maskEan, maskNcm, num, uid } from '../lib/utils'
import type { Curva, SKU } from '../lib/types'

const novoSku = (): SKU => ({
  id: uid('sku'),
  codigo: '',
  ean: '',
  descricao: '',
  categoria: '',
  curva: 'B',
  unidade: 'UN',
  unidadesPorCaixa: 1,
  peso: 0,
  altura: 0,
  largura: 0,
  profundidade: 0,
  controleLote: false,
  controleValidade: false,
  controleSerie: false,
  ncm: '',
  cest: '',
  origem: 0,
  ativo: true,
})

const curvaTone: Record<Curva, string> = {
  A: 'bg-primary-50 text-primary',
  B: 'bg-info-50 text-info',
  C: 'bg-slate-100 text-ink-soft',
}

export default function Produtos() {
  const { skus, upsert, remove, toast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroCurva, setFiltroCurva] = useState<Curva | 'todos'>('todos')
  const [edit, setEdit] = useState<SKU | null>(null)
  const [novo, setNovo] = useState(false)

  const lista = useMemo(() => {
    const q = busca.toLowerCase()
    return skus.filter((p) => {
      if (filtroCurva !== 'todos' && p.curva !== filtroCurva) return false
      return (
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        p.ean.includes(q) ||
        p.ncm.includes(q)
      )
    })
  }, [skus, busca, filtroCurva])

  const salvar = (sku: SKU) => {
    if (!sku.codigo.trim() || !sku.descricao.trim()) {
      toast({ tipo: 'erro', titulo: 'Campos obrigatórios', texto: 'Código e descrição são obrigatórios.' })
      return
    }
    upsert('skus', sku)
    toast({ tipo: 'sucesso', titulo: novo ? 'Produto cadastrado' : 'Produto atualizado', texto: sku.codigo })
    setEdit(null)
    setNovo(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Produtos (SKU)" subtitle="Cadastro mestre com controles de rastreio e dados fiscais BR">
        <Badge tone="neutral">{num(lista.length)} SKUs</Badge>
        <Link to="/migracao-dados" className="btn-outline">
          Importar base legado
        </Link>
        <button
          className="btn-primary"
          onClick={() => {
            setEdit(novoSku())
            setNovo(true)
          }}
        >
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </PageHeader>

      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-sub px-3 py-2 flex-1">
          <Search className="h-4 w-4 text-ink-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar código, descrição, EAN ou NCM…"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['todos', 'A', 'B', 'C'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFiltroCurva(c)}
              className={cn(
                'chip whitespace-nowrap cursor-pointer transition-colors',
                filtroCurva === c ? 'bg-primary text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200',
              )}
            >
              {c === 'todos' ? 'Todas as curvas' : `Curva ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Código</th>
                <th className="th">Descrição</th>
                <th className="th">Categoria</th>
                <th className="th">Curva</th>
                <th className="th">Controles</th>
                <th className="th">NCM</th>
                <th className="th">Status</th>
                <th className="th text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className="row-hover">
                  <td className="td mono font-medium text-brand">{p.codigo}</td>
                  <td className="td text-ink">{p.descricao}</td>
                  <td className="td">{p.categoria || '—'}</td>
                  <td className="td">
                    <span className={cn('chip', curvaTone[p.curva])}>Curva {p.curva}</span>
                  </td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {p.controleLote && <Badge tone="info">Lote</Badge>}
                      {p.controleValidade && <Badge tone="warn">Validade</Badge>}
                      {p.controleSerie && <Badge tone="primary">Série</Badge>}
                      {!p.controleLote && !p.controleValidade && !p.controleSerie && (
                        <span className="text-ink-muted text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="td mono text-xs">{p.ncm || '—'}</td>
                  <td className="td">
                    <Badge tone={p.ativo ? 'ok' : 'neutral'} dot>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="btn-ghost p-2"
                        onClick={() => {
                          setEdit({ ...p })
                          setNovo(false)
                        }}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost p-2 text-bad hover:bg-bad-50"
                        onClick={() => {
                          remove('skus', p.id)
                          toast({ tipo: 'info', titulo: 'Produto removido', texto: p.codigo })
                        }}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lista.length === 0 && (
          <EmptyState icon={<Package className="h-6 w-6" />} title="Nenhum produto encontrado" text="Ajuste a busca ou cadastre um novo SKU." />
        )}
      </div>

      {edit && (
        <ProdutoModal
          sku={edit}
          novo={novo}
          onClose={() => {
            setEdit(null)
            setNovo(false)
          }}
          onSave={salvar}
        />
      )}
    </div>
  )
}

function ProdutoModal({ sku, novo, onClose, onSave }: { sku: SKU; novo: boolean; onClose: () => void; onSave: (s: SKU) => void }) {
  const [f, setF] = useState<SKU>(sku)
  const set = <K extends keyof SKU>(k: K, v: SKU[K]) => setF((p) => ({ ...p, [k]: v }))
  const n = (v: string) => Number(v) || 0

  return (
    <Modal
      open
      onClose={onClose}
      title={novo ? 'Novo produto' : `Editar ${sku.codigo}`}
      subtitle="SKU — cadastro mestre"
      size="lg"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onSave(f)}>Salvar</button>
        </>
      }
    >
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid cols={2}>
            <Field label="Código *" value={f.codigo} onChange={(v) => set('codigo', v)} mono placeholder="NT-FONE-01" />
            <Field label="EAN / GTIN" value={f.ean} onChange={(v) => set('ean', maskEan(v))} mono placeholder="7891234500017" />
          </FormGrid>
          <Field label="Descrição *" value={f.descricao} onChange={(v) => set('descricao', v)} placeholder="Fone Bluetooth NanoSound" />
          <FormGrid cols={3}>
            <Field label="Categoria" value={f.categoria} onChange={(v) => set('categoria', v)} placeholder="Eletrônicos" />
            <SelectField label="Curva ABC" value={f.curva} onChange={(v) => set('curva', v as Curva)} options={[{ value: 'A', label: 'Curva A (alto giro)' }, { value: 'B', label: 'Curva B (médio)' }, { value: 'C', label: 'Curva C (cauda)' }]} />
            <Field label="Unidade" value={f.unidade} onChange={(v) => set('unidade', v)} placeholder="UN / CX / KG" />
          </FormGrid>
        </FormSection>

        <FormSection title="Logística (slotting & cubagem)">
          <FormGrid cols={3}>
            <Field label="Unidades por caixa" type="number" value={f.unidadesPorCaixa} onChange={(v) => set('unidadesPorCaixa', n(v))} hint="Conversão caixa → unidade" />
            <Field label="Peso (kg)" type="number" value={f.peso} onChange={(v) => set('peso', n(v))} />
            <div />
            <Field label="Altura (cm)" type="number" value={f.altura} onChange={(v) => set('altura', n(v))} />
            <Field label="Largura (cm)" type="number" value={f.largura} onChange={(v) => set('largura', n(v))} />
            <Field label="Profundidade (cm)" type="number" value={f.profundidade} onChange={(v) => set('profundidade', n(v))} />
          </FormGrid>
        </FormSection>

        <FormSection title="Controles de rastreio">
          <div className="rounded-xl border border-line px-4">
            <SettingRow title="Controle de lote" desc="Rastreia lote de fabricação (base para FEFO)." on={f.controleLote} onToggle={() => set('controleLote', !f.controleLote)} />
            <SettingRow title="Controle de validade" desc="Exige data de validade no recebimento." on={f.controleValidade} onToggle={() => set('controleValidade', !f.controleValidade)} />
            <SettingRow title="Controle por número de série" desc="Para eletrônicos e itens de alto valor." on={f.controleSerie} onToggle={() => set('controleSerie', !f.controleSerie)} />
          </div>
        </FormSection>

        <FormSection title="Fiscal (Brasil)">
          <FormGrid cols={3}>
            <Field label="NCM" value={f.ncm} onChange={(v) => set('ncm', maskNcm(v))} mono placeholder="8518.30.00" />
            <Field label="CEST" value={f.cest} onChange={(v) => set('cest', maskCest(v))} mono placeholder="21.106.00" />
            <SelectField label="Origem (ICMS)" value={String(f.origem)} onChange={(v) => set('origem', Number(v))} options={Object.entries(ORIGEM_LABEL).map(([k, l]) => ({ value: k, label: l }))} />
          </FormGrid>
        </FormSection>

        <div className="rounded-xl border border-line px-4">
          <SettingRow title="Produto ativo" desc="Inativo não aparece para a operação." on={f.ativo} onToggle={() => set('ativo', !f.ativo)} />
        </div>
      </div>
    </Modal>
  )
}
