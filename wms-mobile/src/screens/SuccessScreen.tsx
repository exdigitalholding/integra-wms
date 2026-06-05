import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { BigButton } from '../components/BigButton';
import { colors, radius, shadow, spacing, type } from '../theme/theme';
import { FLUXOS, TAREFAS, tarefasPorFluxo } from '../data/mock';
import { useNav } from '../navigation/router';
import { sucesso } from '../lib/haptics';

/** Confirmação de tarefa concluída: checkmark animado + háptico + próximo passo claro. */
export function SuccessScreen() {
  const { route, reset, resetStack } = useNav();
  const tarefa = TAREFAS.find((t) => t.id === route.params?.tarefaId)!;
  const meta = FLUXOS[tarefa.fluxo];

  // próxima tarefa do mesmo fluxo (que não seja a atual)
  const proxima = tarefasPorFluxo(tarefa.fluxo).find((t) => t.id !== tarefa.id);

  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    sucesso();
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={[meta.cor, colors.brandDark]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Screen bg="transparent">
        <View style={styles.body}>
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Ionicons name="checkmark" size={96} color={meta.cor} />
          </Animated.View>
          <Text style={styles.titulo}>Tudo certo!</Text>
          <Text style={styles.tarefaId}>{tarefa.id} concluída</Text>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={22} color="#fff" />
            <Text style={styles.infoTxt}>{tarefa.conclusao}</Text>
          </View>
        </View>

        <View style={styles.rodape}>
          {proxima ? (
            <BigButton
              label="Próxima tarefa"
              icon="arrow-forward"
              variant="success"
              onPress={() => resetStack([{ name: 'home' }, { name: 'fluxo', params: { tarefaId: proxima.id } }])}
            />
          ) : null}
          <BigButton label="Voltar ao início" icon="home" variant="ghost" onPress={() => reset('home')} />
        </View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  circle: { height: 168, width: 168, borderRadius: radius.pill, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.lifted },
  titulo: { fontSize: 40, fontWeight: '900', color: '#fff', marginTop: spacing.xl },
  tarefaId: { fontSize: type.body, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs, letterSpacing: 1 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  infoTxt: { flex: 1, color: '#fff', fontSize: type.body, fontWeight: '600', lineHeight: 24 },
  rodape: { padding: spacing.lg, gap: spacing.md },
});
