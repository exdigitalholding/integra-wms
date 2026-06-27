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
import { FLUXOS, OPERATIONAL_CHECKLISTS, TAREFAS, UNIDADES } from '../data/mock';
import type { ChecklistAnswerValue, ChecklistBlockContext, IoniconName, OperationalChecklistQuestion, RecebimentoChecklistContext, Tarefa } from '../types';
import { useNav } from '../navigation/router';
import { erro, sucesso, tapLeve } from '../lib/haptics';

type ChecklistAnswerState = Record<string, { value?: ChecklistAnswerValue; photo?: boolean; observation?: string }>;
type ReceivingCargoCondition = 'YES' | 'NO';
type ReceivingChecklistState = {
  placa: string;
  motorista: string;
  horario: string;
  lacrePhoto: boolean;
  cargaPhoto: boolean;
  cargaBomEstado?: ReceivingCargoCondition;
  observacoes: string;
};
type ReceivingChecklistRouting = {
  id: 'gr' | 'administrativo';
  title: string;
  reason: string;
  queue: string;
  icon: IoniconName;
  tone: 'warn' | 'bad';
};

const RECEIVING_CHECKLIST_INITIAL: ReceivingChecklistState = {
  placa: '',
  motorista: '',
  horario: '',
  lacrePhoto: false,
  cargaPhoto: false,
  observacoes: '',
};

/**
 * MOTOR scan-to-confirm — a tela mais importante do app.
 * Mostra UMA instrução por vez. O valor esperado aparece GIGANTE.
 * O operador "bipa" (ou digita) e o sistema valida antes de avançar.
 */
export function FlowScreen() {
  const { route, navigate, back, replace, resetStack } = useNav();
  const tarefa = useMemo(() => TAREFAS.find((t) => t.id === route.params?.tarefaId)!, [route.params]);
  const meta = FLUXOS[tarefa.fluxo];

  const [idx, setIdx] = useState(0);
  const [valor, setValor] = useState('');
  const [errado, setErrado] = useState(false);
  const [modo, setModo] = useState<'passo' | 'checklist'>('passo');
  const [checklistIdx, setChecklistIdx] = useState(0);
  const [checklistConcluido, setChecklistConcluido] = useState(false);
  const [checklistAnswers, setChecklistAnswers] = useState<ChecklistAnswerState>({});
  const [checklistErro, setChecklistErro] = useState('');
  const [blockedContext, setBlockedContext] = useState<ChecklistBlockContext | null>(null);
  const [receivingChecklist, setReceivingChecklist] = useState<ReceivingChecklistState>(RECEIVING_CHECKLIST_INITIAL);
  // Contagem mista de inventário: caixas fechadas + unidades soltas.
  const [caixas, setCaixas] = useState('');
  const [soltas, setSoltas] = useState('');

  const passo = tarefa.passos[idx];
  const checklist = OPERATIONAL_CHECKLISTS[tarefa.fluxo];
  const checklistQuestion = checklist[checklistIdx];
  const ehQtd = passo.tipo === 'quantidade';
  const ehConfirmar = passo.tipo === 'confirmar';
  const ehChecklistGate =
    passo.tipo === 'scan' &&
    (passo.rotulo.toLowerCase().includes('produto') || passo.rotulo.toLowerCase().includes('volume'));

  // --- Unidade de manuseio: operador conta caixa/palete; sistema grava na base. ---
  const um = UNIDADES[passo.unidade ?? 'un'];
  const fator = passo.fatorBase ?? 1;
  const mista = ehQtd && !!passo.contagemMista;
  const caixasN = Number(caixas) || 0;
  const soltasN = Number(soltas) || 0;
  const qtdInformada = Number(valor) || 0;
  // Total SEMPRE em unidade-base — é o que o sistema gravaria.
  const totalBase = mista ? caixasN * fator + soltasN : qtdInformada * fator;

  const resetPassoInput = () => {
    setValor('');
    setCaixas('');
    setSoltas('');
    setErrado(false);
  };

  const avancarPasso = () => {
    if (idx + 1 < tarefa.passos.length) {
      sucesso();
      setIdx(idx + 1);
      resetPassoInput();
    } else {
      replace('sucesso', { tarefaId: tarefa.id });
    }
  };

  const avancar = () => {
    if (ehChecklistGate && !checklistConcluido && checklist.length > 0) {
      sucesso();
      setModo('checklist');
      setChecklistIdx(0);
      setChecklistErro('');
      return;
    }
    avancarPasso();
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

  const atualizarChecklist = (patch: ChecklistAnswerState[string]) => {
    setChecklistErro('');
    setChecklistAnswers((prev) => ({
      ...prev,
      [checklistQuestion.id]: { ...prev[checklistQuestion.id], ...patch },
    }));
  };

  const atualizarChecklistRecebimento = (patch: Partial<ReceivingChecklistState>) => {
    setChecklistErro('');
    setReceivingChecklist((prev) => ({ ...prev, ...patch }));
  };

  const concluirChecklist = () => {
    setChecklistConcluido(true);
    setModo('passo');
    setChecklistIdx(0);
    setChecklistErro('');
    avancarPasso();
  };

  const proximaPerguntaChecklist = () => {
    const atual = checklistAnswers[checklistQuestion.id] ?? {};
    const validation = validarChecklist(checklistQuestion, atual);
    if (validation) {
      erro();
      setChecklistErro(validation);
      return;
    }
    const falhou = checklistFalhou(checklistQuestion, atual.value);
    if (falhou && checklistQuestion.blocksStep) {
      erro();
      setBlockedContext({
        occurrenceId: `OCC-${tarefa.id}-${checklistQuestion.id}`.toUpperCase(),
        taskId: tarefa.id,
        flow: tarefa.fluxo,
        questionId: checklistQuestion.id,
        questionText: checklistQuestion.text,
        requiresPhoto: !!checklistQuestion.requiresPhotoOnFail,
        requiresObservation: !!checklistQuestion.requiresObservationOnFail,
        requiresSupervisor: !!checklistQuestion.requiresSupervisor || !!checklistQuestion.blocksStep,
        observation: atual.observation,
        photo: atual.photo,
      });
      setChecklistErro('OS bloqueada. Registre a ocorrencia e aguarde decisao do lider.');
      return;
    }
    sucesso();
    if (checklistIdx + 1 < checklist.length) {
      setChecklistIdx(checklistIdx + 1);
      setChecklistErro('');
    } else {
      concluirChecklist();
    }
  };

  if (modo === 'checklist') {
    if (tarefa.fluxo === 'receber' && tarefa.recebimento) {
      const routing = getReceivingChecklistRouting(tarefa.recebimento, receivingChecklist);
      const salvarChecklistRecebimento = () => {
        const validation = validarReceivingChecklist(receivingChecklist);
        if (validation) {
          erro();
          setChecklistErro(validation);
          return;
        }

        // FUTURO BACKEND:
        // 1. Persistir o checklist no recebimento `tarefa.recebimento.id`.
        // 2. Se houver routing `gr`, abrir evento para GR/Gerenciamento de Risco.
        // 3. Se houver routing `administrativo`, abrir tratativa administrativa.
        // 4. Anexar evidencias `lacrePhoto` e `cargaPhoto` no documento do recebimento.
        sucesso();
        concluirChecklist();
      };

      return (
        <ReceivingArrivalChecklist
          tarefa={tarefa}
          values={receivingChecklist}
          routing={routing}
          errorMessage={checklistErro}
          onBack={() => setModo('passo')}
          onChange={atualizarChecklistRecebimento}
          onSave={salvarChecklistRecebimento}
        />
      );
    }

    if (blockedContext) {
      return (
        <Screen bg={colors.bg} edges={['bottom']}>
          <StatusBar style="light" />
          <View style={[styles.head, { backgroundColor: colors.bad }]}>
            <TopBar
              title="OS bloqueada"
              subtitle={`${tarefa.id} · ${FLUXOS[tarefa.fluxo].nome}`}
              onBack={() => resetStack([{ name: 'home' }, { name: 'lista', params: { fluxo: tarefa.fluxo } }])}
            />
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View style={[styles.bigIcon, { backgroundColor: colors.badSoft }]}>
              <Ionicons name="lock-closed" size={32} color={colors.bad} />
            </View>
            <Text style={styles.blockTitle}>Fluxo parado</Text>
            <Text style={styles.blockCopy}>
              Esta pergunta e bloqueante. A tarefa nao pode seguir ate uma decisao do lider.
            </Text>

            <View style={styles.blockCard}>
              <Text style={styles.blockLabel}>Pergunta reprovada</Text>
              <Text style={styles.blockQuestion}>{blockedContext.questionText}</Text>
              <View style={styles.blockRows}>
                <View style={styles.blockRow}>
                  <Ionicons name="document-text" size={20} color={colors.inkMuted} />
                  <Text style={styles.blockRowText}>
                    {blockedContext.observation?.trim() || 'Observacao registrada na ocorrencia.'}
                  </Text>
                </View>
                <View style={styles.blockRow}>
                  <Ionicons name={blockedContext.photo ? 'camera' : 'image-outline'} size={20} color={blockedContext.photo ? colors.ok : colors.warn} />
                  <Text style={styles.blockRowText}>
                    {blockedContext.photo ? 'Foto anexada pelo operador.' : 'Foto nao anexada.'}
                  </Text>
                </View>
                <View style={styles.blockRow}>
                  <Ionicons name="person" size={20} color={colors.warn} />
                  <Text style={styles.blockRowText}>
                    {blockedContext.requiresSupervisor ? 'Aguardando supervisor.' : 'Aguardando tratativa operacional.'}
                  </Text>
                </View>
              </View>
            </View>

            {checklistErro ? (
              <View style={styles.erroBox}>
                <Ionicons name="close-circle" size={20} color={colors.bad} />
                <Text style={styles.erroTxt}>{checklistErro}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.rodapeChecklist}>
            <BigButton
              label="Registrar ocorrencia"
              icon="send"
              variant="danger"
              onPress={() => replace('ocorrencia', { ...blockedContext, bloqueante: true })}
            />
            <Pressable
              onPress={() => resetStack([{ name: 'home' }, { name: 'lista', params: { fluxo: tarefa.fluxo } }])}
              style={({ pressed }) => [styles.backToQueue, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.backToQueueTxt}>Voltar para fila sem concluir</Text>
            </Pressable>
          </View>
        </Screen>
      );
    }

    const atual = checklistAnswers[checklistQuestion.id] ?? {};
    const falhou = checklistFalhou(checklistQuestion, atual.value);
    const exigeFoto = falhou && !!checklistQuestion.requiresPhotoOnFail;
    const exigeObs = falhou && !!checklistQuestion.requiresObservationOnFail;

    return (
      <Screen bg={colors.bg} edges={['bottom']}>
        <StatusBar style="light" />
        <View style={[styles.head, { backgroundColor: falhou && checklistQuestion.blocksStep ? colors.bad : meta.cor }]}>
          <TopBar
            title="Checklist"
            subtitle={`${tarefa.id} · ${FLUXOS[tarefa.fluxo].nome} · ${checklistIdx + 1} de ${checklist.length}`}
            onBack={() => setModo('passo')}
          />
          <View style={styles.dotsWrap}>
            <StepDots total={checklist.length} atual={checklistIdx} cor="#fff" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={[styles.bigIcon, { backgroundColor: meta.cor + '1A' }]}>
            <Ionicons name="clipboard" size={30} color={meta.cor} />
          </View>
          <Text style={styles.checklistIntro}>Confirme para seguir</Text>
          <Text style={styles.instrucao}>{checklistQuestion.text}</Text>

          <View style={styles.checklistCard}>
            <ChecklistAnswerControl
              question={checklistQuestion}
              value={atual.value}
              cor={meta.cor}
              onChange={(value) => atualizarChecklist({ value })}
            />

            {falhou ? (
              <View style={[styles.checklistAlert, checklistQuestion.blocksStep && styles.checklistBlock]}>
                <Ionicons name={checklistQuestion.blocksStep ? 'lock-closed' : 'alert-circle'} size={22} color={checklistQuestion.blocksStep ? colors.bad : colors.warn} />
                <Text style={[styles.checklistAlertTxt, checklistQuestion.blocksStep && { color: colors.bad }]}>
                  {checklistQuestion.blocksStep ? 'Pare esta OS. Registre foto/observacao.' : 'Siga somente apos registrar a ressalva.'}
                </Text>
              </View>
            ) : null}

            {exigeFoto || checklistQuestion.type === 'PHOTO' ? (
              <Pressable
                onPress={() => atualizarChecklist({ photo: true })}
                style={[styles.evidence, atual.photo && styles.evidenceOn]}
              >
                <Ionicons name={atual.photo ? 'checkmark-circle' : 'camera'} size={26} color={atual.photo ? colors.ok : colors.inkSoft} />
                <Text style={[styles.evidenceTxt, atual.photo && { color: colors.ok }]}>
                  {atual.photo ? 'Foto anexada' : exigeFoto ? 'Tirar foto obrigatoria' : 'Tirar foto'}
                </Text>
              </Pressable>
            ) : null}

            {exigeObs ? (
              <TextInput
                value={atual.observation ?? ''}
                onChangeText={(text) => atualizarChecklist({ observation: text })}
                placeholder="Descreva o problema"
                placeholderTextColor={colors.inkMuted}
                multiline
                style={styles.obsInput}
              />
            ) : null}
          </View>

          {checklistErro ? (
            <View style={styles.erroBox}>
              <Ionicons name="close-circle" size={20} color={colors.bad} />
              <Text style={styles.erroTxt}>{checklistErro}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.rodapeChecklist}>
          <BigButton
            label={checklistIdx + 1 === checklist.length ? 'Concluir checklist' : 'Proxima'}
            icon="arrow-forward"
            variant={falhou && checklistQuestion.blocksStep ? 'danger' : 'success'}
            onPress={proximaPerguntaChecklist}
          />
        </View>
      </Screen>
    );
  }

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

function ReceivingArrivalChecklist({
  tarefa,
  values,
  routing,
  errorMessage,
  onBack,
  onChange,
  onSave,
}: {
  tarefa: Tarefa;
  values: ReceivingChecklistState;
  routing: ReceivingChecklistRouting[];
  errorMessage: string;
  onBack: () => void;
  onChange: (patch: Partial<ReceivingChecklistState>) => void;
  onSave: () => void;
}) {
  const recebimento = tarefa.recebimento!;
  const meta = FLUXOS.receber;
  const placaDivergente = values.placa.trim().length > 0 && placaDiffers(values.placa, recebimento.placaEsperada);
  const motoristaDivergente = values.motorista.trim().length > 0 && textDiffers(values.motorista, recebimento.motoristaEsperado);

  return (
    <Screen bg={colors.bg} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={[styles.head, { backgroundColor: meta.cor }]}>
        <TopBar
          title="Checklist recebimento"
          subtitle={`${recebimento.id} · ${tarefa.id}`}
          onBack={onBack}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={[styles.bigIcon, { backgroundColor: meta.cor + '1A' }]}>
          <Ionicons name="clipboard" size={30} color={meta.cor} />
        </View>
        <Text style={styles.checklistIntro}>Chegada fisica</Text>
        <Text style={styles.instrucao}>Recebimento {recebimento.id}</Text>

        <View style={styles.receiptCard}>
          <Text style={styles.receiptCardTitle}>Dados esperados</Text>
          <ReceivingInfoRow icon="car" label="Placa" value={recebimento.placaEsperada} />
          <ReceivingInfoRow icon="person" label="Motorista" value={recebimento.motoristaEsperado} />
          <ReceivingInfoRow icon="time" label="Horario" value={recebimento.horarioAgendado ?? 'Nao informado'} />
        </View>

        <View style={styles.receivingForm}>
          <ReceivingTextField
            label="Placa"
            value={values.placa}
            placeholder="AAA-1A23"
            icon="car"
            invalid={placaDivergente}
            help={placaDivergente ? `Diverge de ${recebimento.placaEsperada}. Vai para GR.` : undefined}
            autoCapitalize="characters"
            onChangeText={(placa) => onChange({ placa })}
          />

          <ReceivingTextField
            label="Nome do motorista"
            value={values.motorista}
            placeholder="Nome completo"
            icon="person"
            invalid={motoristaDivergente}
            help={motoristaDivergente ? `Diverge de ${recebimento.motoristaEsperado}. Vai para GR.` : undefined}
            autoCapitalize="words"
            onChangeText={(motorista) => onChange({ motorista })}
          />

          <ReceivingTextField
            label="Horario"
            value={values.horario}
            placeholder="08:30"
            icon="time"
            keyboardType="numbers-and-punctuation"
            onChangeText={(horario) => onChange({ horario })}
          />

          <PhotoSaveButton
            active={values.lacrePhoto}
            label="Tirar foto do lacre e salvar"
            savedLabel="Foto do lacre salva"
            onPress={() => onChange({ lacrePhoto: true })}
          />

          <PhotoSaveButton
            active={values.cargaPhoto}
            label="Tirar foto da condicao da carga e salvar"
            savedLabel="Foto da carga salva"
            onPress={() => onChange({ cargaPhoto: true })}
          />

          <View style={styles.receivingField}>
            <View style={styles.receivingLabelRow}>
              <Ionicons name="checkmark-done-circle" size={20} color={meta.cor} />
              <Text style={styles.receivingLabel}>Carga esta em bom estado</Text>
            </View>
            <View style={styles.checkOptions}>
              <ConditionOption
                active={values.cargaBomEstado === 'YES'}
                label="Sim"
                color={colors.ok}
                onPress={() => onChange({ cargaBomEstado: 'YES' })}
              />
              <ConditionOption
                active={values.cargaBomEstado === 'NO'}
                label="Nao"
                color={colors.bad}
                onPress={() => onChange({ cargaBomEstado: 'NO' })}
              />
            </View>
          </View>

          <View style={styles.receivingField}>
            <View style={styles.receivingLabelRow}>
              <Ionicons name="document-text" size={20} color={meta.cor} />
              <Text style={styles.receivingLabel}>Observacoes</Text>
            </View>
            <TextInput
              value={values.observacoes}
              onChangeText={(observacoes) => onChange({ observacoes })}
              placeholder="Registre ressalvas da chegada, lacre ou condicao da carga"
              placeholderTextColor={colors.inkMuted}
              multiline
              style={styles.receivingObsInput}
            />
          </View>
        </View>

        {routing.length > 0 ? (
          <View style={styles.routingBox}>
            <Text style={styles.routingTitle}>Encaminhamento futuro</Text>
            {routing.map((item) => (
              <View
                key={item.id}
                style={[styles.routingRow, { borderColor: item.tone === 'bad' ? colors.bad : colors.warn, backgroundColor: item.tone === 'bad' ? colors.badSoft : colors.warnSoft }]}
              >
                <Ionicons name={item.icon} size={22} color={item.tone === 'bad' ? colors.bad : colors.warn} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.routingRowTitle, { color: item.tone === 'bad' ? colors.bad : colors.warn }]}>{item.title}</Text>
                  <Text style={styles.routingReason}>{item.reason}</Text>
                  <Text style={styles.routingQueue}>{item.queue}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.erroBox}>
            <Ionicons name="close-circle" size={20} color={colors.bad} />
            <Text style={styles.erroTxt}>{errorMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.rodapeChecklist}>
        <BigButton
          label="Salvar checklist"
          icon="save"
          variant={routing.some((item) => item.tone === 'bad') ? 'danger' : 'success'}
          onPress={onSave}
        />
      </View>
    </Screen>
  );
}

function ReceivingInfoRow({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={styles.receiptInfoRow}>
      <Ionicons name={icon} size={20} color={colors.inkMuted} />
      <Text style={styles.receiptInfoLabel}>{label}</Text>
      <Text style={styles.receiptInfoValue}>{value}</Text>
    </View>
  );
}

function ReceivingTextField({
  label,
  value,
  placeholder,
  icon,
  invalid = false,
  help,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: IoniconName;
  invalid?: boolean;
  help?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numbers-and-punctuation';
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.receivingField}>
      <View style={styles.receivingLabelRow}>
        <Ionicons name={icon} size={20} color={invalid ? colors.bad : colors.info} />
        <Text style={[styles.receivingLabel, invalid && { color: colors.bad }]}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        style={[styles.receivingInput, invalid && styles.receivingInputInvalid]}
      />
      {help ? <Text style={styles.receivingHelp}>{help}</Text> : null}
    </View>
  );
}

function PhotoSaveButton({
  active,
  label,
  savedLabel,
  onPress,
}: {
  active: boolean;
  label: string;
  savedLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapLeve();
        onPress();
      }}
      style={({ pressed }) => [styles.evidence, active && styles.evidenceOn, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={active ? 'checkmark-circle' : 'camera'} size={26} color={active ? colors.ok : colors.inkSoft} />
      <Text style={[styles.evidenceTxt, active && { color: colors.ok }]}>
        {active ? savedLabel : label}
      </Text>
    </Pressable>
  );
}

function ConditionOption({
  active,
  label,
  color,
  onPress,
}: {
  active: boolean;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapLeve();
        onPress();
      }}
      style={[styles.checkOption, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.checkOptionTxt, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function validarReceivingChecklist(answer: ReceivingChecklistState) {
  if (!answer.placa.trim()) return 'Informe a placa.';
  if (!answer.motorista.trim()) return 'Informe o nome do motorista.';
  if (!answer.horario.trim()) return 'Informe o horario.';
  if (!answer.lacrePhoto) return 'Foto do lacre obrigatoria.';
  if (!answer.cargaPhoto) return 'Foto da condicao da carga obrigatoria.';
  if (!answer.cargaBomEstado) return 'Informe se a carga esta em bom estado.';
  return '';
}

function getReceivingChecklistRouting(
  context: RecebimentoChecklistContext,
  answer: ReceivingChecklistState,
): ReceivingChecklistRouting[] {
  const routing: ReceivingChecklistRouting[] = [];
  const cadastroDivergente =
    answer.placa.trim().length > 0 &&
    answer.motorista.trim().length > 0 &&
    (placaDiffers(answer.placa, context.placaEsperada) || textDiffers(answer.motorista, context.motoristaEsperado));

  if (cadastroDivergente) {
    routing.push({
      id: 'gr',
      title: 'Enviar para GR',
      reason: 'Placa ou motorista nao confere com o recebimento agendado.',
      queue: context.filaSeguranca,
      icon: 'shield-checkmark',
      tone: 'warn',
    });
  }

  if (answer.cargaBomEstado === 'NO') {
    routing.push({
      id: 'administrativo',
      title: 'Enviar para administrativo',
      reason: 'Operador marcou que a carga nao esta em bom estado.',
      queue: context.filaAdministrativa,
      icon: 'business',
      tone: 'bad',
    });
  }

  return routing;
}

function placaDiffers(input: string, expected: string) {
  return normalizePlate(input) !== normalizePlate(expected);
}

function textDiffers(input: string, expected: string) {
  return normalizeText(input) !== normalizeText(expected);
}

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function ChecklistAnswerControl({
  question,
  value,
  cor,
  onChange,
}: {
  question: OperationalChecklistQuestion;
  value?: ChecklistAnswerValue;
  cor: string;
  onChange: (value: ChecklistAnswerValue) => void;
}) {
  if (question.type === 'PHOTO') return null;
  const options: Array<[ChecklistAnswerValue, string]> =
    question.type === 'BOOLEAN'
      ? [['YES', question.okLabel ?? 'Correto'], ['NO', question.failLabel ?? 'Registrar problema']]
      : [['OK', question.okLabel ?? 'Tudo certo'], ['NOK', question.failLabel ?? 'Registrar problema']];

  return (
    <View style={styles.checkOptions}>
      {options.map(([option, label]) => {
        const active = value === option;
        return (
          <Pressable
            key={String(option)}
            onPress={() => {
              tapLeve();
              onChange(option);
            }}
            style={[styles.checkOption, active && { backgroundColor: cor, borderColor: cor }]}
          >
            <Text style={[styles.checkOptionTxt, active && { color: '#fff' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function checklistFalhou(question: OperationalChecklistQuestion, value?: ChecklistAnswerValue) {
  return !!question.failValues?.some((item) => item === value);
}

function validarChecklist(question: OperationalChecklistQuestion, answer: ChecklistAnswerState[string]) {
  if (question.required && question.type !== 'PHOTO' && (answer.value == null || answer.value === '')) {
    return 'Responda antes de continuar.';
  }
  if (question.type === 'PHOTO' && question.required && !answer.photo) {
    return 'Foto obrigatoria.';
  }
  const falhou = checklistFalhou(question, answer.value);
  if (falhou && question.requiresPhotoOnFail && !answer.photo) {
    return 'Foto obrigatoria para nao conformidade.';
  }
  if (falhou && question.requiresObservationOnFail && !answer.observation?.trim()) {
    return 'Observacao obrigatoria para nao conformidade.';
  }
  return '';
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

  checklistIntro: { fontSize: type.label, fontWeight: '900', color: colors.inkMuted, textTransform: 'uppercase', marginTop: spacing.md },
  checklistCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.lg, gap: spacing.lg, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  checkOptions: { flexDirection: 'row', gap: spacing.md },
  checkOption: { flex: 1, minHeight: 76, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  checkOptionTxt: { fontSize: type.title, fontWeight: '900', color: colors.ink, textAlign: 'center' },
  checklistAlert: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.warnSoft, borderWidth: 1, borderColor: '#F8D59A' },
  checklistBlock: { backgroundColor: colors.badSoft, borderColor: '#F8B4B4' },
  checklistAlertTxt: { flex: 1, color: colors.warn, fontSize: type.body, fontWeight: '900' },
  receiptCard: { width: '100%', backgroundColor: colors.infoSoft, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, borderWidth: 1, borderColor: '#C9D8FF' },
  receiptCardTitle: { fontSize: type.label, fontWeight: '900', color: colors.info, textTransform: 'uppercase', marginBottom: spacing.sm },
  receiptInfoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  receiptInfoLabel: { width: 84, fontSize: type.label, fontWeight: '800', color: colors.inkMuted },
  receiptInfoValue: { flex: 1, fontSize: type.body, fontWeight: '900', color: colors.ink },
  receivingForm: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.lg, gap: spacing.lg, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  receivingField: { width: '100%', gap: spacing.sm },
  receivingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  receivingLabel: { flex: 1, fontSize: type.label, fontWeight: '900', color: colors.inkMuted, textTransform: 'uppercase' },
  receivingInput: { minHeight: 62, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, fontSize: type.title, fontWeight: '900', color: colors.ink },
  receivingInputInvalid: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  receivingHelp: { fontSize: type.caption, fontWeight: '800', color: colors.bad },
  receivingObsInput: { minHeight: 120, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, padding: spacing.lg, fontSize: type.body, color: colors.ink, fontWeight: '700', textAlignVertical: 'top' },
  routingBox: { width: '100%', marginTop: spacing.lg, gap: spacing.sm },
  routingTitle: { fontSize: type.label, fontWeight: '900', color: colors.inkMuted, textTransform: 'uppercase' },
  routingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radius.lg, borderWidth: 2, padding: spacing.md },
  routingRowTitle: { fontSize: type.body, fontWeight: '900' },
  routingReason: { fontSize: type.label, fontWeight: '800', color: colors.ink, marginTop: 2 },
  routingQueue: { fontSize: type.caption, fontWeight: '900', color: colors.inkMuted, marginTop: spacing.xs },
  evidence: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 68, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, borderStyle: 'dashed', backgroundColor: colors.surface },
  evidenceOn: { borderColor: colors.ok, backgroundColor: colors.okSoft, borderStyle: 'solid' },
  evidenceTxt: { color: colors.inkSoft, fontSize: type.body, fontWeight: '900' },
  obsInput: { minHeight: 104, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, padding: spacing.lg, fontSize: type.body, color: colors.ink, fontWeight: '700', textAlignVertical: 'top' },
  rodapeChecklist: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  blockTitle: { fontSize: type.display, fontWeight: '900', color: colors.bad, marginTop: spacing.md, textAlign: 'center' },
  blockCopy: { fontSize: type.body, fontWeight: '700', color: colors.inkSoft, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  blockCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.lg, borderWidth: 2, borderColor: colors.bad, ...shadow.card },
  blockLabel: { fontSize: type.caption, fontWeight: '900', color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  blockQuestion: { fontSize: type.title, fontWeight: '900', color: colors.ink, marginTop: spacing.xs },
  blockRows: { gap: spacing.sm, marginTop: spacing.lg },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line },
  blockRowText: { flex: 1, fontSize: type.body, fontWeight: '700', color: colors.inkSoft },
  backToQueue: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  backToQueueTxt: { color: colors.inkSoft, fontSize: type.body, fontWeight: '900' },
});
