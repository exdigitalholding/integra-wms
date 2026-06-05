import { create } from 'zustand'
import {
  CONTAGENS,
  ESTOQUE,
  PEDIDOS,
  RECEBIMENTOS,
  ROMANEIOS,
  TAREFAS,
} from '../lib/mock'
import type {
  ContagemItem,
  Ocorrencia,
  Pedido,
  PosicaoEstoque,
  Recebimento,
  Romaneio,
  Tarefa,
  Vertente,
} from '../lib/types'

export interface Toast {
  id: number
  tipo: 'sucesso' | 'erro' | 'info' | 'aviso'
  titulo: string
  texto?: string
}

interface State {
  // sessão
  autenticado: boolean
  usuario: string
  perfil: Vertente
  cdId: string
  ownerId: string
  // dados
  recebimentos: Recebimento[]
  estoque: PosicaoEstoque[]
  tarefas: Tarefa[]
  pedidos: Pedido[]
  contagens: ContagemItem[]
  romaneios: Romaneio[]
  toasts: Toast[]

  // ações de sessão
  login: (perfil: Vertente, usuario: string) => void
  logout: () => void
  setCd: (id: string) => void
  setOwner: (id: string) => void

  // toasts
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void

  // recebimento
  conferirItem: (recId: string, sku: string, contado: number) => void
  registrarOcorrencia: (recId: string, sku: string, oc: Ocorrencia) => void
  concluirRecebimento: (recId: string) => void

  // tarefas
  assumirTarefa: (id: string, operador: string) => void
  concluirTarefa: (id: string) => void

  // contagem
  registrarContagem: (id: string, valor: number) => void
  recontar: (id: string, valor: number) => void
  aprovarAjuste: (id: string) => void

  // pedido / packing
  conferirVolume: (pedidoId: string, sku: string) => void
  expedirPedido: (pedidoId: string) => void
}

let toastSeq = 1

export const useStore = create<State>((set, get) => ({
  autenticado: false,
  usuario: '',
  perfil: 'ecommerce',
  cdId: 'cd-sp',
  ownerId: 'own-all',

  recebimentos: structuredClone(RECEBIMENTOS),
  estoque: structuredClone(ESTOQUE),
  tarefas: structuredClone(TAREFAS),
  pedidos: structuredClone(PEDIDOS),
  contagens: structuredClone(CONTAGENS),
  romaneios: structuredClone(ROMANEIOS),
  toasts: [],

  login: (perfil, usuario) =>
    set({ autenticado: true, perfil, usuario, ownerId: perfil === '3pl' ? 'own-all' : 'own-nano' }),
  logout: () => set({ autenticado: false, usuario: '' }),
  setCd: (id) => set({ cdId: id }),
  setOwner: (id) => set({ ownerId: id }),

  toast: (t) => {
    const id = toastSeq++
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().dismiss(id), 4200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  conferirItem: (recId, sku, contado) =>
    set((s) => ({
      recebimentos: s.recebimentos.map((r) =>
        r.id !== recId
          ? r
          : {
              ...r,
              status: 'em-conferencia',
              itens: r.itens.map((i) =>
                i.skuCodigo === sku ? { ...i, contado, conferido: true } : i,
              ),
            },
      ),
    })),

  registrarOcorrencia: (recId, sku, oc) =>
    set((s) => ({
      recebimentos: s.recebimentos.map((r) =>
        r.id !== recId
          ? r
          : {
              ...r,
              status: 'divergencia',
              itens: r.itens.map((i) =>
                i.skuCodigo === sku
                  ? { ...i, contado: oc.quantidadeReal, conferido: true, ocorrencia: oc }
                  : i,
              ),
            },
      ),
    })),

  concluirRecebimento: (recId) =>
    set((s) => ({
      recebimentos: s.recebimentos.map((r) =>
        r.id === recId ? { ...r, status: 'concluido' } : r,
      ),
    })),

  assumirTarefa: (id, operador) =>
    set((s) => ({
      tarefas: s.tarefas.map((t) =>
        t.id === id ? { ...t, operador, status: 'em-andamento' } : t,
      ),
    })),

  concluirTarefa: (id) =>
    set((s) => ({
      tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status: 'concluida' } : t)),
    })),

  registrarContagem: (id, valor) =>
    set((s) => ({
      contagens: s.contagens.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              contado: valor,
              status: valor === c.sistemico ? 'ok' : 'divergente',
            },
      ),
    })),

  recontar: (id, valor) =>
    set((s) => ({
      contagens: s.contagens.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              recontagem: valor,
              status: valor === c.sistemico ? 'ok' : 'aguardando-aprovacao',
            },
      ),
    })),

  aprovarAjuste: (id) =>
    set((s) => ({
      contagens: s.contagens.map((c) => (c.id === id ? { ...c, status: 'ajustado' } : c)),
    })),

  conferirVolume: (pedidoId, sku) =>
    set((s) => ({
      pedidos: s.pedidos.map((p) =>
        p.id !== pedidoId
          ? p
          : {
              ...p,
              itens: p.itens.map((i) =>
                i.skuCodigo === sku
                  ? { ...i, conferido: Math.min(i.conferido + 1, i.quantidade) }
                  : i,
              ),
            },
      ),
    })),

  expedirPedido: (pedidoId) =>
    set((s) => ({
      pedidos: s.pedidos.map((p) =>
        p.id === pedidoId ? { ...p, status: 'expedido' } : p,
      ),
    })),
}))
