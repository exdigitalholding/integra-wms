const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const homeSource = readFileSync(path.resolve(__dirname, '../src/screens/HomeScreen.tsx'), 'utf8');
const mockSource = readFileSync(path.resolve(__dirname, '../src/data/mock.ts'), 'utf8');

describe('ordem operacional dos icones na Home mobile', () => {
  it('mantem o fluxo WMS: chegada, bipar, levar, tirar e carregar', () => {
    assert.ok(
      homeSource.includes("const ORDEM: FluxoId[] = ['receber', 'bipagem', 'guardar', 'separar', 'carregar', 'conferir', 'abastecer', 'contar']"),
      'Home deve ordenar os icones como CHEGADA -> BIPAR -> LEVAR PARA O ARMAZEM -> TIRAR DO ARMAZEM -> CARREGAR',
    );
  });

  it('usa nomes claros para cada etapa principal do WMS', () => {
    assert.ok(mockSource.includes("receber: { nome: 'Chegada'"), 'receber deve aparecer como Chegada');
    assert.ok(mockSource.includes("bipagem: { nome: 'Bipar'"), 'bipagem deve aparecer como Bipar');
    assert.ok(mockSource.includes("guardar: { nome: 'Levar'"), 'guardar deve aparecer como Levar');
    assert.ok(mockSource.includes("verbo: 'Para o armazem'"), 'guardar deve explicar que leva para o armazem');
    assert.ok(mockSource.includes("separar: { nome: 'Tirar'"), 'separar deve aparecer como Tirar');
    assert.ok(mockSource.includes("verbo: 'Do armazem'"), 'separar deve explicar que tira do armazem');
    assert.ok(mockSource.includes("carregar: { nome: 'Carregar'"), 'carregar deve continuar como Carregar');
  });
});
