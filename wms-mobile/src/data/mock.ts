/**
 * DADOS MOCK — nenhuma chamada de rede, nenhum banco.
 * A partir desta etapa, a demo mobile passa a reutilizar o contrato
 * compartilhado do monorepo para apresentar a mesma historia do web/admin.
 */
import type { FluxoId, MotivoOcorrencia, Operador, OperationalChecklistQuestion, Passo, Tarefa, IoniconName, Unidade } from '../types';
import { activityColors } from '../theme/theme';
import { DEMO_OCCURRENCE_REASONS, DEMO_OPERATIONAL_TASKS } from '../../../wms-shared-demo';

const RECEBIMENTOS_POR_TAREFA = {
  'T-9011': {
    id: 'XYZ-123',
    placaEsperada: 'BRA-4E22',
    motoristaEsperado: 'Marcos Almeida',
    horarioAgendado: '08:30',
    filaSeguranca: 'GR - Gerenciamento de Risco',
    filaAdministrativa: 'Administrativo - Tratativa de recebimento',
  },
};

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
  carregar: { nome: 'Carregar', verbo: 'Bipar volume no veiculo', icon: 'car', cor: activityColors.carregar },
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

export const TAREFAS: Tarefa[] = DEMO_OPERATIONAL_TASKS.map((item) => {
  const passos: Passo[] = item.passos.map((passo) => ({
    instrucao: passo.instrucao,
    esperado: passo.esperado,
    rotulo: passo.rotulo,
    tipo: passo.tipo,
    icon: passo.icon as IoniconName,
    dica: passo.dica,
    unidade: passo.unidade,
    fatorBase: passo.fatorBase,
    contagemMista: passo.contagemMista,
  }));

  if (item.fluxo !== 'carregar' && !passos.some((passo) => passo.rotulo.toLowerCase().includes('produto'))) {
    const scanProduto = {
      instrucao: 'Bipe o produto',
      esperado: item.skuCodigo,
      rotulo: 'Produto',
      tipo: 'scan' as const,
      icon: 'cube' as IoniconName,
      dica: 'Validacao obrigatoria antes do checklist',
    };
    passos.splice(Math.min(1, passos.length), 0, scanProduto);
  }

  return {
    id: item.id,
    fluxo: item.fluxo,
    prioridade: item.prioridade,
    status: item.status,
    resumo: item.resumo,
    contexto: item.contexto,
    conclusao: item.conclusao,
    passos,
    recebimento: item.fluxo === 'receber'
      ? RECEBIMENTOS_POR_TAREFA[item.id as keyof typeof RECEBIMENTOS_POR_TAREFA]
      : undefined,
  };
});

export const tarefasPorFluxo = (fluxo: FluxoId) =>
  TAREFAS.filter((t) => t.fluxo === fluxo);

export const contagemPorFluxo = (): Record<FluxoId, number> => {
  const base: Record<FluxoId, number> = {
    receber: 0, guardar: 0, separar: 0, conferir: 0, carregar: 0, contar: 0, abastecer: 0,
  };
  for (const t of TAREFAS) base[t.fluxo] += 1;
  return base;
};

export const OPERATIONAL_CHECKLISTS: Record<FluxoId, OperationalChecklistQuestion[]> = {
  separar: [
    {
      id: 'sep-1',
      text: 'Confira o produto antes de retirar.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Sem avaria',
      failLabel: 'Tem avaria',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'sep-2',
      text: 'Compare lote e validade com a OS.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Lote correto',
      failLabel: 'Lote divergente',
      failValues: ['NOK'],
      requiresObservationOnFail: true,
      requiresSupervisor: true,
    },
    {
      id: 'sep-3',
      text: 'Verifique se ha produto fisico no endereco.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Produto encontrado',
      failLabel: 'Endereco vazio',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
  ],
  receber: [
    {
      id: 'rec-1',
      text: 'Compare o produto recebido com a NF/OS.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Produto correto',
      failLabel: 'Produto divergente',
      failValues: ['NOK'],
      requiresObservationOnFail: true,
      blocksStep: true,
      requiresSupervisor: true,
    },
    {
      id: 'rec-2',
      text: 'Confira a embalagem da carga.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Embalagem integra',
      failLabel: 'Embalagem avariada',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'rec-3',
      text: 'Confira lote, lacre e validade.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Dados legiveis',
      failLabel: 'Dado ilegivel',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      requiresSupervisor: true,
    },
  ],
  guardar: [
    {
      id: 'gua-1',
      text: 'Confira a etiqueta do palete.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Palete identificado',
      failLabel: 'Sem etiqueta',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'gua-2',
      text: 'Confira se o produto pode ser armazenado.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Pode armazenar',
      failLabel: 'Tem dano',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
    },
    {
      id: 'gua-3',
      text: 'Confira o espaco do endereco destino.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Endereco comporta',
      failLabel: 'Nao comporta',
      failValues: ['NO'],
      requiresObservationOnFail: true,
      blocksStep: true,
    },
  ],
  abastecer: [
    {
      id: 'aba-1',
      text: 'Confira o saldo fisico na origem.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Tem produto',
      failLabel: 'Falta produto',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'aba-2',
      text: 'Confira o endereco de picking destino.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Destino livre',
      failLabel: 'Destino ocupado',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'aba-3',
      text: 'Compare lote/validade antes de abastecer.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Mesmo lote',
      failLabel: 'Lote diferente',
      failValues: ['NOK'],
      requiresObservationOnFail: true,
      requiresSupervisor: true,
    },
  ],
  conferir: [
    {
      id: 'conf-1',
      text: 'Compare o item com o pedido.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Item correto',
      failLabel: 'Item errado',
      failValues: ['NOK'],
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'conf-2',
      text: 'Confira produto e embalagem.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Sem avaria',
      failLabel: 'Tem avaria',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'conf-3',
      text: 'Confira a quantidade visual do volume.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Quantidade confere',
      failLabel: 'Quantidade diverge',
      failValues: ['NO'],
      requiresObservationOnFail: true,
      requiresSupervisor: true,
    },
  ],
  carregar: [
    {
      id: 'car-1',
      text: 'Confira se o veiculo esta na doca correta.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Doca correta',
      failLabel: 'Doca errada',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'car-2',
      text: 'Confira se o volume esta inteiro.',
      type: 'OK_NOK_NA',
      required: true,
      okLabel: 'Volume integro',
      failLabel: 'Volume avariado',
      failValues: ['NOK'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'car-3',
      text: 'Confira o lacre antes de finalizar.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Lacre confere',
      failLabel: 'Lacre diverge',
      failValues: ['NO'],
      requiresObservationOnFail: true,
      requiresSupervisor: true,
      blocksStep: true,
    },
  ],
  contar: [
    {
      id: 'cnt-1',
      text: 'Confirme o endereco da contagem.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Endereco correto',
      failLabel: 'Endereco errado',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
    {
      id: 'cnt-2',
      text: 'Confira se o endereco tem somente este produto.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Somente este produto',
      failLabel: 'Tem mistura',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      requiresSupervisor: true,
    },
    {
      id: 'cnt-3',
      text: 'Confira avaria e validade antes de contar.',
      type: 'BOOLEAN',
      required: true,
      okLabel: 'Sem problema',
      failLabel: 'Avaria/vencido',
      failValues: ['NO'],
      requiresPhotoOnFail: true,
      requiresObservationOnFail: true,
      blocksStep: true,
    },
  ],
};
