import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { colors, radius, shadow, spacing, type } from '../theme/theme';
import { FLUXOS, tarefasPorFluxo } from '../data/mock';
import type { FluxoId, Tarefa } from '../types';
import { useNav } from '../navigation/router';
import { tapLeve } from '../lib/haptics';

/** Fila de tarefas de um fluxo. Prioridade alta = faixa vermelha + ícone de urgência. */
export function TaskListScreen() {
  const { route, navigate, back } = useNav();
  const fluxo = route.params?.fluxo as FluxoId;
  const meta = FLUXOS[fluxo];
  const tarefas = tarefasPorFluxo(fluxo);

  return (
    <Screen bg={colors.bg} edges={['bottom']}>
      <StatusBar style="light" />
      <LinearGradient colors={[meta.cor, sombra(meta.cor)]} style={styles.head}>
        <TopBar title={meta.nome} subtitle={`${tarefas.length} tarefas · ${meta.verbo}`} onBack={back} />
        <View style={styles.headIcon}>
          <Ionicons name={meta.icon} size={30} color="#fff" />
        </View>
      </LinearGradient>

      {tarefas.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="checkmark-circle" size={72} color={colors.ok} />
          <Text style={styles.vazioTxt}>Nada por aqui!</Text>
          <Text style={styles.vazioSub}>Sem tarefas de {meta.nome.toLowerCase()} agora.</Text>
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TarefaCard tarefa={item} cor={meta.cor} onPress={() => { tapLeve(); navigate('fluxo', { tarefaId: item.id }); }} />
          )}
        />
      )}
    </Screen>
  );
}

function TarefaCard({ tarefa, cor, onPress }: { tarefa: Tarefa; cor: string; onPress: () => void }) {
  const urgente = tarefa.prioridade === 'alta';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tarefa.resumo}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.faixa, { backgroundColor: urgente ? colors.bad : cor }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Text style={styles.cardId}>{tarefa.id}</Text>
          {urgente && (
            <View style={styles.urgente}>
              <Ionicons name="flash" size={13} color={colors.bad} />
              <Text style={styles.urgenteTxt}>URGENTE</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardResumo}>{tarefa.resumo}</Text>
        <Text style={styles.cardCtx}>{tarefa.contexto}</Text>
        <View style={styles.passosRow}>
          <Ionicons name="footsteps" size={15} color={colors.inkMuted} />
          <Text style={styles.passosTxt}>{tarefa.passos.length} passos</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={28} color={colors.inkMuted} />
    </Pressable>
  );
}

/** Escurece levemente a cor pro gradiente do topo (sem libs de cor). */
function sombra(hex: string) {
  const map: Record<string, string> = {
    '#2563EB': '#1D4FD7', '#00A88E': '#007D69', '#21274E': '#161A36',
    '#7C3AED': '#5B21B6', '#E08A00': '#B36F00', '#0E9F6E': '#0A7D56',
  };
  return map[hex] ?? hex;
}

const styles = StyleSheet.create({
  head: { paddingBottom: spacing.lg },
  headIcon: { position: 'absolute', right: spacing.xl, bottom: spacing.lg, height: 56, width: 56, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },

  list: { padding: spacing.lg, gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  faixa: { width: 6, alignSelf: 'stretch', borderRadius: radius.pill },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardId: { fontSize: type.caption, fontWeight: '800', color: colors.inkMuted, letterSpacing: 1 },
  urgente: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.badSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  urgenteTxt: { fontSize: 11, fontWeight: '900', color: colors.bad, letterSpacing: 0.5 },
  cardResumo: { fontSize: type.body, fontWeight: '800', color: colors.ink, marginTop: 2 },
  cardCtx: { fontSize: type.label, color: colors.inkMuted, fontWeight: '600', marginTop: 2 },
  passosRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  passosTxt: { fontSize: type.caption, color: colors.inkMuted, fontWeight: '700' },

  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  vazioTxt: { fontSize: type.title, fontWeight: '900', color: colors.ink, marginTop: spacing.md },
  vazioSub: { fontSize: type.body, color: colors.inkMuted, fontWeight: '600', textAlign: 'center' },
});
