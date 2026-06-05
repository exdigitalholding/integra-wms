/**
 * DADOS MOCK — nenhuma chamada de rede, nenhum banco.
 * A partir desta etapa, a demo mobile passa a reutilizar o contrato
 * compartilhado do monorepo para apresentar a mesma historia do web/admin.
 */
import type { FluxoId, MotivoOcorrencia, Operador, Tarefa, IoniconName, Unidade } from '../types';
import { activityColors } from '../theme/theme';
import { DEMO_OCCURRENCE_REASONS, DEMO_OPERATIONAL_TASKS } from '../../../wms-shared-demo';

export const UNIDADES: Record<
  Unidade,
  { singular: string; plural: string; icon: IoniconName }
> = {
  un: { singular: 'unidade', plural: 'unidades', icon: 'ellipse' },
  cx: { singular: 'caixa', plural: 'caixas', icon: 'cube' },
  plt: { singular: 'palete', plural: 'paletes', icon: 'file-tray-stacked' },
};

export const FLUXOS: Record<
  FluxoId,
  { nome: string; verbo: string; icon: IoniconName; cor: string }
> = {
  receber: { nome: 'Receber', verbo: 'Conferir o que chegou', icon: 'cube', cor: activityColors.receber },
  guardar: { nome: 'Guardar', verbo: 'Enderecar no local', icon: 'file-tray-stacked', cor: activityColors.guardar },
  separar: { nome: 'Separar', verbo: 'Picking do pedido', icon: 'bag-handle', cor: activityColors.separar },
  conferir: { nome: 'Conferir', verbo: 'Conferencia de saida', icon: 'checkmark-done-circle', cor: activityColors.conferir },
  contar: { nome: 'Contar', verbo: 'Inventario no endereco', icon: 'calculator', cor: activityColors.contar },
  abastecer: { nome: 'Abastecer', verbo: 'Repor o picking', icon: 'swap-vertical', cor: activityColors.abastecer },
};

export const OPERADORES: Operador[] = [
  { id: 'op1', nome: 'Carlos', pin: '1234', iniciais: 'CA', cor: '#2563EB', turno: 'Turno manha' },
  { id: 'op2', nome: 'Marina', pin: '1234', iniciais: 'MA', cor: '#00A88E', turno: 'Turno manha' },
  { id: 'op3', nome: 'Joao', pin: '1234', iniciais: 'JO', cor: '#7C3AED', turno: 'Turno tarde' },
  { id: 'op4', nome: 'Ana', pin: '1234', iniciais: 'AN', cor: '#E08A00', turno: 'Turno tarde' },
];

export const MOTIVOS: MotivoOcorrencia[] = DEMO_OCCURRENCE_REASONS.map((item) => ({
  id: item.id,
  rotulo: item.rotulo,
  cor: item.cor,
  icon:
    item.tipo === 'falta'
      ? 'remove-circle'
      : item.tipo === 'sobra'
        ? 'add-circle'
        : item.tipo === 'avaria'
          ? 'warning'
          : item.tipo === 'local-cheio'
            ? 'file-tray-full'
            : item.tipo === 'local-vazio'
              ? 'file-tray'
              : 'swap-horizontal',
}));

export const TAREFAS: Tarefa[] = DEMO_OPERATIONAL_TASKS.map((item) => ({
  id: item.id,
  fluxo: item.fluxo,
  prioridade: item.prioridade,
  resumo: item.resumo,
  contexto: item.contexto,
  conclusao: item.conclusao,
  passos: item.passos.map((passo) => ({
    instrucao: passo.instrucao,
    esperado: passo.esperado,
    rotulo: passo.rotulo,
    tipo: passo.tipo,
    icon: passo.icon as IoniconName,
    dica: passo.dica,
    unidade: passo.unidade,
    fatorBase: passo.fatorBase,
    contagemMista: passo.contagemMista,
  })),
}));

export const tarefasPorFluxo = (fluxo: FluxoId) =>
  TAREFAS.filter((t) => t.fluxo === fluxo);

export const contagemPorFluxo = (): Record<FluxoId, number> => {
  const base: Record<FluxoId, number> = {
    receber: 0, guardar: 0, separar: 0, conferir: 0, contar: 0, abastecer: 0,
  };
  for (const t of TAREFAS) base[t.fluxo] += 1;
  return base;
};
