import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '../components/Screen';
import { colors, radius, shadow, spacing, type } from '../theme/theme';
import { FLUXOS, contagemPorFluxo } from '../data/mock';
import type { FluxoId } from '../types';
import { useSession } from '../navigation/session';
import { useNav } from '../navigation/router';
import { tapLeve } from '../lib/haptics';

const ORDEM: FluxoId[] = ['receber', 'bipagem', 'guardar', 'separar', 'carregar', 'conferir', 'abastecer', 'contar'];

/** Tela inicial: grade de atividades. Cada card = uma cor + um ícone + uma palavra + nº de tarefas. */
export function HomeScreen() {
  const { operador, sair } = useSession();
  const { navigate, reset } = useNav();
  const contagem = contagemPorFluxo();
  const totalPendente = ORDEM.reduce((s, f) => s + contagem[f], 0);

  return (
    <Screen bg={colors.bg}>
      <StatusBar style="dark" />
      {/* cabeçalho com operador */}
      <View style={styles.header}>
        <View>
          <Text style={styles.ola}>Olá,</Text>
          <Text style={styles.nome}>{operador?.nome ?? 'Operador'}</Text>
        </View>
        <Pressable
          onPress={() => { tapLeve(); sair(); reset('login'); }}
          accessibilityRole="button"
          accessibilityLabel="Sair"
          hitSlop={12}
          style={({ pressed }) => [styles.sairBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="exit-outline" size={22} color={colors.inkSoft} />
          <Text style={styles.sairTxt}>Sair</Text>
        </Pressable>
      </View>

      {/* resumo da fila */}
      <View style={styles.resumo}>
        <View style={[styles.resumoIcon, { backgroundColor: colors.accent }]}>
          <Ionicons name="layers" size={26} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resumoNum}>{totalPendente} tarefas</Text>
          <Text style={styles.resumoTxt}>esperando você hoje</Text>
        </View>
      </View>

      <Text style={styles.secao}>O que vamos fazer?</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {ORDEM.map((f) => {
          const meta = FLUXOS[f];
          const n = contagem[f];
          return (
            <Pressable
              key={f}
              onPress={() => { tapLeve(); navigate('lista', { fluxo: f }); }}
              accessibilityRole="button"
              accessibilityLabel={`${meta.nome}. ${n} tarefas`}
              style={({ pressed }) => [styles.card, { backgroundColor: meta.cor }, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            >
              {n > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{n}</Text>
                </View>
              )}
              <View style={styles.cardIcon}>
                <Ionicons name={meta.icon} size={40} color="#fff" />
              </View>
              <Text style={styles.cardNome}>{meta.nome}</Text>
              <Text style={styles.cardVerbo}>{meta.verbo}</Text>
            </Pressable>
          );
        })}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  ola: { fontSize: type.body, color: colors.inkMuted, fontWeight: '600' },
  nome: { fontSize: type.display, color: colors.ink, fontWeight: '900' },
  sairBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surface },
  sairTxt: { color: colors.inkSoft, fontWeight: '700', fontSize: type.label },

  resumo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  resumoIcon: { height: 52, width: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  resumoNum: { fontSize: type.title, fontWeight: '900', color: colors.ink },
  resumoTxt: { fontSize: type.label, color: colors.inkMuted, fontWeight: '600' },

  secao: { fontSize: type.title, fontWeight: '800', color: colors.ink, marginHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, paddingHorizontal: spacing.xl },
  card: { width: '47%', borderRadius: radius.xl, padding: spacing.lg, minHeight: 150, justifyContent: 'flex-end', ...shadow.card },
  cardIcon: { height: 64, width: 64, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  cardNome: { color: '#fff', fontSize: type.title, fontWeight: '900' },
  cardVerbo: { color: 'rgba(255,255,255,0.8)', fontSize: type.caption, fontWeight: '600', marginTop: 2 },
  badge: { position: 'absolute', top: spacing.md, right: spacing.md, minWidth: 34, height: 34, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  badgeTxt: { color: '#fff', fontWeight: '900', fontSize: type.body },
});
