import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  criarEventoBipagemRecebimento,
  criarTarefaMobileRecebimento,
  validarCodigoBipado,
} from '../../wms-shared-demo/recebimento.ts';

describe('recebimento mobile integrado ao web', () => {
  it('valida bipagem com normalizacao de leitor fisico', () => {
    assert.equal(validarCodigoBipado(' doca-03 ', 'DOCA03'), true);
    assert.equal(validarCodigoBipado('SKU-10241', 'SKU-10242'), false);
  });

  it('gera evento pendente de sync para o recebimento web', () => {
    const evento = criarEventoBipagemRecebimento({
      recebimentoId: 'REC-2041',
      tarefaId: 'T-9011',
      passoRotulo: 'Produto',
      codigoEsperado: 'SKU-10241',
      codigoLido: 'SKU-10241',
      operadorId: 'op1',
      deviceId: 'dev-1',
      timestamp: '2026-06-29T10:00:00-03:00',
    });

    assert.equal(evento.objectType, 'task');
    assert.equal(evento.objectId, 'REC-2041');
    assert.equal(evento.eventType, 'recebimento.codigo_bipado');
    assert.equal(evento.payload?.syncStatus, 'SYNC_PENDING');
    assert.equal(evento.payload?.resultado, 'ok');
  });

  it('monta tarefa mobile de chegada sem bipar produto antes do checklist', () => {
    const tarefa = criarTarefaMobileRecebimento({
      id: 'REC-2041',
      doca: 'Doca 03',
      documento: 'NF-e 88.214',
      fornecedor: 'Distribuidora Andrade',
      placa: 'FJD-3A21',
      eta: '13:10',
      ordemExecucaoAtual: 4,
      itens: [
        { skuCodigo: 'SKU-10241', descricao: 'Fone Bluetooth Pulse X', esperado: 120 },
      ],
    });

    assert.equal(tarefa.recebimento.id, 'REC-2041');
    assert.equal(tarefa.passos[0].esperado, 'DOCA-03');
    assert.equal(tarefa.passos.length, 1);
    assert.equal(
      tarefa.passos.some((passo) => passo.rotulo === 'Produto' || passo.esperado === 'SKU-10241'),
      false,
    );
  });
});
