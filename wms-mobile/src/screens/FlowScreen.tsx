import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { BigButton } from '../components/BigButton';
import { StepDots } from '../components/StepDots';
import { NumPad } from '../components/NumPad';
import { colors, radius, shadow, spacing, type } from '../theme/theme';
import { FLUXOS, TAREFAS, UNIDADES } from '../data/mock';
import { useNav } from '../navigation/router';
import { erro, sucesso, tapLeve } from '../lib/haptics';

/**
 * MOTOR scan-to-confirm — a tela mais importante do app.
 * Mostra UMA instrução por vez. O valor esperado aparece GIGANTE.
 * O operador "bipa" (ou digita) e o sistema valida antes de avançar.
 */
export function FlowScreen() {
  const { route, navigate, back, replace } = useNav();
  const tarefa = useMemo(() => TAREFAS.find((t) => t.id === route.params?.tarefaId)!, [route.params]);
  const meta = FLUXOS[tarefa.fluxo];

  const [idx, setIdx] = useState(0);
  const [valor, setValor] = useState('');
  const [errado, setErrado] = useState(false);
  // Contagem mista de inventário: caixas fechadas + unidades soltas.
  const [caixas, setCaixas] = useState('');
  const [soltas, setSoltas] = useState('');

  const passo = tarefa.passos[idx];
  const ehQtd = passo.tipo === 'quantidade';
  const ehConfirmar = passo.tipo === 'confirmar';

  // --- Unidade de manuseio: operador conta caixa/palete; sistema grava na base. ---
  const um = UNIDADES[passo.unidade ?? 'un'];
  const fator = passo.fatorBase ?? 1;
  const mista = ehQtd && !!passo.contagemMista;
  const caixasN = Number(caixas) || 0;
  const soltasN = Number(soltas) || 0;
  const qtdInformada = Number(valor) || 0;
  // Total SEMPRE em unidade-base — é o que o sistema gravaria.
  const totalBase = mista ? caixasN * fator + soltasN : qtdInformada * fator;

  const avancar = () => {
    if (idx + 1 < tarefa.passos.length) {
      sucesso();
      setIdx(idx + 1);
      setValor('');
      setCaixas('');
      setSoltas('');
      setErrado(false);
    } else {
      replace('sucesso', { tarefaId: tarefa.id });
    }
  };

  /** Bipagem (scan). Para o demo, "BIPAR" entrega o código certo. */
  const bipar = () => {
    setValor(passo.esperado);
    setTimeout(avancar, 180);
  };

  /** Confirmação de valor digitado (scan manual). */
  const confirmarDigitado = () => {
    if (valor.trim().toUpperCase() === passo.esperado.toUpperCase()) avancar();
    else {
      erro();
      setErrado(true);
    }
  };

  /** Quantidade: confirma o número informado (count pode divergir — o sistema registra). */
  const confirmarQtd = () => {
    if (mista) {
      if (caixas.length === 0 && soltas.length === 0) return;
    } else if (valor.length === 0) return;
    avancar();
  };

  return (
    <Screen bg={colors.bg} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={[styles.head, { backgroundColor: meta.cor }]}>
        <TopBar
          title={meta.nome}
          subtitle={`${tarefa.id} · passo ${idx + 1} de ${tarefa.passos.length}`}
          onBack={back}
          right={
            <Pressable
              onPress={() => navigate('ocorrencia', { tarefaId: tarefa.id })}
              accessibilityRole="button"
              accessibilityLabel="Tive um problema"
              hitSlop={10}
              style={({ pressed }) => [styles.problemaPill, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="alert-circle" size={20} color="#fff" />
              <Text style={styles.problemaPillTxt}>Problema</Text>
            </Pressable>
          }
        />
        <View style={styles.dotsWrap}>
          <StepDots total={tarefa.passos.length} atual={idx} cor="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* instrução */}
        <View style={[styles.bigIcon, { backgroundColor: meta.cor + '1A' }]}>
          <Ionicons name={passo.icon} size={30} color={meta.cor} />
        </View>
        <Text style={styles.instrucao}>{passo.instrucao}</Text>

        {/* valor esperado GIGANTE */}
        <View style={[styles.alvo, errado && styles.alvoErro]}>
          <Text style={styles.rotulo}>{passo.rotulo}</Text>

          {ehQtd ? (
            // Quantidade: número grande + UNIDADE escrita grande (nunca número solto)
            // + conversão visível. O operador nunca multiplica nada.
            <>
              <Text style={[styles.esperado, { color: meta.cor }]}>
                {mista ? totalBase : valor || '0'}
              </Text>
              <View style={styles.unidadeLinha}>
                <Ionicons name={mista ? UNIDADES.un.icon : um.icon} size={26} color={meta.cor} />
                <Text style={[styles.unidadeBig, { color: meta.cor }]}>
                  {(mista ? UNIDADES.un.plural : qtdInformada === 1 ? um.singular : um.plural).toUpperCase()}
                </Text>
              </View>

              {mista ? (
                <Text style={styles.conv}>
                  {caixasN} {caixasN === 1 ? 'caixa' : 'caixas'} × {fator} + {soltasN} soltas ={' '}
                  <Text style={styles.convForte}>{totalBase} unidades</Text>
                </Text>
              ) : fator > 1 ? (
                <Text style={styles.conv}>
                  cada {um.singular} = {fator} un · total{' '}
                  <Text style={styles.convForte}>{totalBase} unidades</Text>
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.esperado, { color: errado ? colors.bad : meta.cor }]}>
              {passo.esperado}
            </Text>
          )}

          {passo.dica ? <Text style={styles.dica}>{passo.dica}</Text> : null}
        </View>

        {errado && (
          <View style={styles.erroBox}>
            <Ionicons name="close-circle" size={20} color={colors.bad} />
            <Text style={styles.erroTxt}>Não confere. Bipe de novo.</Text>
          </View>
        )}

        {/* ação conforme o tipo do passo */}
        {ehQtd && mista ? (
          // Inventário: dois contadores. Operador informa o que VÊ (caixas fechadas
          // e unidades soltas); o sistema converte. Nunca pedir "um número só".
          <View style={styles.acaoQtd}>
            <Stepper
              rotulo="Caixas fechadas"
              dica={`cada uma = ${fator} un`}
              icon="cube"
              cor={meta.cor}
              valor={caixas}
              onChange={setCaixas}
            />
            <Stepper
              rotulo="Unidades soltas"
              dica="itens fora da caixa"
              icon="ellipse"
              cor={meta.cor}
              valor={soltas}
              onChange={setSoltas}
            />
            <BigButton
              label="Confirmar contagem"
              icon="checkmark"
              variant="success"
              onPress={confirmarQtd}
              disabled={caixas.length === 0 && soltas.length === 0}
            />
          </View>
        ) : ehQtd ? (
          <View style={styles.acaoQtd}>
            <NumPad onDigit={(d) => setValor((v) => (v.length < 5 ? v + d : v))} onClear={() => setValor((v) => v.slice(0, -1))} />
            <BigButton label="Confirmar" icon="checkmark" variant="success" onPress={confirmarQtd} disabled={valor.length === 0} />
          </View>
        ) : ehConfirmar ? (
          <View style={styles.acao}>
            <BigButton label="Confirmar" icon="checkmark-done" variant="success" onPress={avancar} />
          </View>
        ) : (
          <View style={styles.acao}>
            <BigButton label="BIPAR" icon="scan" variant="primary" onPress={bipar} />
            <ManualEntry valor={valor} setValor={(v) => { setValor(v); setErrado(false); }} onConfirm={confirmarDigitado} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

/** Entrada manual de código (recurso quando o leitor falha). */
function ManualEntry({ valor, setValor, onConfirm }: { valor: string; setValor: (v: string) => void; onConfirm: () => void }) {
  const [aberto, setAberto] = useState(false);
  if (!aberto) {
    return (
      <Pressable onPress={() => setAberto(true)} style={styles.manualLink} hitSlop={8}>
        <Ionicons name="keypad-outline" size={18} color={colors.inkSoft} />
        <Text style={styles.manualTxt}>Não bipou? Digitar código</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.manualBox}>
      <TextInput
        value={valor}
        onChangeText={setValor}
        autoFocus
        autoCapitalize="characters"
        placeholder="Digite o código"
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
      />
      <BigButton label="Confirmar" icon="checkmark" variant="success" onPress={onConfirm} disabled={valor.length === 0} />
    </View>
  );
}

/**
 * Contador grande com − e + (contagem mista de inventário).
 * Botões enormes: operador conta com luva, sem teclar. O número fica no meio.
 */
function Stepper({
  rotulo,
  dica,
  icon,
  cor,
  valor,
  onChange,
}: {
  rotulo: string;
  dica: string;
  icon: any;
  cor: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  const n = Number(valor) || 0;
  const set = (next: number) => {
    tapLeve();
    onChange(next <= 0 ? '' : String(next));
  };
  return (
    <View style={styles.stepper}>
      <View style={styles.stepperHead}>
        <Ionicons name={icon} size={20} color={cor} />
        <View>
          <Text style={styles.stepperRotulo}>{rotulo}</Text>
          <Text style={styles.stepperDica}>{dica}</Text>
        </View>
      </View>
      <View style={styles.stepperCtrl}>
        <Pressable
          onPress={() => set(n - 1)}
          disabled={n === 0}
          accessibilityRole="button"
          accessibilityLabel={`diminuir ${rotulo}`}
          style={({ pressed }) => [styles.stepBtn, n === 0 && { opacity: 0.3 }, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="remove" size={32} color={colors.ink} />
        </Pressable>
        <Text style={styles.stepNum}>{n}</Text>
        <Pressable
          onPress={() => set(n + 1)}
          accessibilityRole="button"
          accessibilityLabel={`aumentar ${rotulo}`}
          style={({ pressed }) => [styles.stepBtn, { backgroundColor: cor }, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingBottom: spacing.lg },
  dotsWrap: { marginTop: spacing.sm },

  body: { padding: spacing.xl, paddingTop: spacing.lg, alignItems: 'center', paddingBottom: spacing.xxl },
  bigIcon: { height: 60, width: 60, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  instrucao: { fontSize: type.title, fontWeight: '900', color: colors.ink, textAlign: 'center', marginTop: spacing.md },

  alvo: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center', marginTop: spacing.lg, borderWidth: 2, borderColor: colors.line, ...shadow.card },
  alvoErro: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  rotulo: { fontSize: type.label, fontWeight: '700', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 1 },
  esperado: { fontSize: type.giant, fontWeight: '900', letterSpacing: -1, marginTop: spacing.xs },
  dica: { fontSize: type.body, fontWeight: '600', color: colors.inkSoft, marginTop: spacing.sm, textAlign: 'center' },

  // Unidade escrita GRANDE ao lado do número — número solto causa erro de expedição.
  unidadeLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  unidadeBig: { fontSize: type.title, fontWeight: '900', letterSpacing: 1 },
  // Conversão visível (cinza, pequena) — o operador nunca multiplica.
  conv: { fontSize: type.label, fontWeight: '600', color: colors.inkMuted, marginTop: spacing.sm, textAlign: 'center' },
  convForte: { fontWeight: '900', color: colors.inkSoft },

  erroBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  erroTxt: { color: colors.bad, fontWeight: '800', fontSize: type.body },

  acao: { width: '100%', gap: spacing.md, marginTop: spacing.xl },
  acaoQtd: { width: '100%', gap: spacing.lg, marginTop: spacing.xl },

  manualLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  manualTxt: { color: colors.inkSoft, fontWeight: '700', fontSize: type.label },
  manualBox: { width: '100%', gap: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.brand, borderRadius: radius.lg, paddingHorizontal: spacing.lg, height: 64, fontSize: type.title, fontWeight: '800', color: colors.ink, textAlign: 'center' },

  // Saída de emergência — vermelho forte e sempre visível no cabeçalho, fora do caminho do botão Confirmar.
  problemaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.bad, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: spacing.md, borderWidth: 1.5, borderColor: '#fff', ...shadow.card },
  problemaPillTxt: { color: '#fff', fontWeight: '900', fontSize: type.label, letterSpacing: 0.3 },

  // Contadores da contagem mista (inventário)
  stepper: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.lg, ...shadow.card },
  stepperHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperRotulo: { fontSize: type.bodyBold, fontWeight: '800', color: colors.ink },
  stepperDica: { fontSize: type.caption, fontWeight: '600', color: colors.inkMuted },
  stepperCtrl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  stepBtn: { height: 64, width: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSub, borderWidth: 1, borderColor: colors.line },
  stepNum: { fontSize: type.giant, fontWeight: '900', color: colors.ink, minWidth: 80, textAlign: 'center' },
});
