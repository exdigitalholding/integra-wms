/**
 * Tipos do Coletor Integra. Espelham (em versão enxuta) o domínio do wms-frontend.
 * IMPORTANTE: sem backend nesta fase — tudo vem de data/mock.ts.
 */
import type { Ionicons } from '@expo/vector-icons';

export type IoniconName = keyof typeof Ionicons.glyphMap;

/** Os seis fluxos que o operador executa no chão. */
export type FluxoId =
  | 'receber'
  | 'guardar'
  | 'separar'
  | 'conferir'
  | 'contar'
  | 'abastecer';

/** Como o sistema valida um passo: bipar algo, contar quantidade, ou só confirmar. */
export type PassoTipo = 'scan' | 'quantidade' | 'confirmar';

/**
 * Unidade que o OPERADOR manuseia (o que ele pega na mão).
 * O sistema SEMPRE grava na unidade-base ('un'); palete/caixa são só camadas
 * de manuseio convertidas via `fatorBase`. O operador nunca multiplica nada.
 */
export type Unidade = 'un' | 'cx' | 'plt';

export interface Passo {
  /** Verbo curto e direto. Ex.: "Vá até", "Bipe o produto". */
  instrucao: string;
  /** O que aparece GIGANTE na tela (endereço, SKU, quantidade). */
  esperado: string;
  /** Legenda pequena do que é o valor esperado. Ex.: "Endereço", "Produto". */
  rotulo: string;
  tipo: PassoTipo;
  icon: IoniconName;
  /** Dica curta opcional exibida abaixo (ex.: descrição do produto). */
  dica?: string;

  // --- Campos de quantidade (só relevantes quando tipo === 'quantidade') ---
  /** Unidade que o operador manuseia neste passo. Default: 'un'. */
  unidade?: Unidade;
  /** Quantas unidades-base cada `unidade` vale (ex.: caixa = 12). Default: 1. */
  fatorBase?: number;
  /**
   * Contagem MISTA de inventário: o endereço tem caixas fechadas + unidades
   * soltas. Mostra dois contadores e o sistema converte tudo pra base.
   * Quando true, `fatorBase` é o tamanho da caixa fechada.
   */
  contagemMista?: boolean;
}

export interface Tarefa {
  id: string;
  fluxo: FluxoId;
  prioridade: 'alta' | 'normal';
  /** Resumo de uma linha pra fila de tarefas. */
  resumo: string;
  /** Sub-linha de contexto (rota, onda, cliente). */
  contexto: string;
  passos: Passo[];
  /** Mensagem da tela de sucesso ao concluir. */
  conclusao: string;
}

export interface Operador {
  id: string;
  nome: string;
  /** PIN de 4 dígitos (mock — sem backend). */
  pin: string;
  /** Inicial(is) mostradas no avatar colorido. */
  iniciais: string;
  cor: string;
  turno: string;
}

/** Motivos de ocorrência — a "saída de emergência" dentro do fluxo. */
export interface MotivoOcorrencia {
  id: string;
  rotulo: string;
  icon: IoniconName;
  cor: string;
}
