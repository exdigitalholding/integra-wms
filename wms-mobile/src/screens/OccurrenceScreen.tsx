import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { BigButton } from '../components/BigButton';
import { colors, radius, shadow, spacing, type } from '../theme/theme';
import { MOTIVOS } from '../data/mock';
import { useNav } from '../navigation/router';
import { sucesso, tapMedio } from '../lib/haptics';

/**
 * Registro de ocorrência DENTRO do fluxo (princípio: nunca "ligue para o supervisor").
 * Grade de ícones grandes — operador toca o problema, opcionalmente "tira foto", confirma.
 */
export function OccurrenceScreen() {
  const { back } = useNav();
  const [sel, setSel] = useState<string | null>(null);
  const [foto, setFoto] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = () => {
    sucesso();
    setEnviado(true);
    setTimeout(back, 1100);
  };

  if (enviado) {
    return (
      <Screen bg={colors.bg}>
        <StatusBar style="dark" />
        <View style={styles.okWrap}>
          <View style={styles.okCircle}>
            <Ionicons name="checkmark" size={72} color="#fff" />
          </View>
          <Text style={styles.okTitle}>Problema registrado</Text>
          <Text style={styles.okSub}>O líder foi avisado. Pode seguir.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.bg} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={[styles.head, { backgroundColor: colors.warn }]}>
        <TopBar title="Tive um problema" subtitle="Toque no que aconteceu" onBack={back} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {MOTIVOS.map((m) => {
            const ativo = sel === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => { tapMedio(); setSel(m.id); }}
                accessibilityRole="button"
                accessibilityLabel={m.rotulo}
                style={({ pressed }) => [styles.motivo, ativo && { borderColor: m.cor, backgroundColor: m.cor + '12' }, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.motivoIcon, { backgroundColor: m.cor }]}>
                  <Ionicons name={m.icon} size={34} color="#fff" />
                </View>
                <Text style={styles.motivoTxt}>{m.rotulo}</Text>
                {ativo && (
                  <View style={[styles.check, { backgroundColor: m.cor }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* anexar foto (mock) */}
        <Pressable
          onPress={() => { tapMedio(); setFoto((f) => !f); }}
          style={({ pressed }) => [styles.foto, foto && styles.fotoOn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name={foto ? 'checkmark-circle' : 'camera'} size={26} color={foto ? colors.ok : colors.inkSoft} />
          <Text style={[styles.fotoTxt, foto && { color: colors.ok }]}>
            {foto ? 'Foto anexada' : 'Tirar foto (opcional)'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.rodape}>
        <BigButton label="Enviar e continuar" icon="send" variant="primary" onPress={enviar} disabled={!sel} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingBottom: spacing.lg },
  body: { padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  motivo: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: colors.line, ...shadow.card },
  motivoIcon: { height: 64, width: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  motivoTxt: { fontSize: type.body, fontWeight: '800', color: colors.ink },
  check: { position: 'absolute', top: spacing.sm, right: spacing.sm, height: 26, width: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },

  foto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, borderStyle: 'dashed' },
  fotoOn: { borderColor: colors.ok, backgroundColor: colors.okSoft, borderStyle: 'solid' },
  fotoTxt: { fontSize: type.body, fontWeight: '700', color: colors.inkSoft },

  rodape: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },

  okWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  okCircle: { height: 120, width: 120, borderRadius: radius.pill, backgroundColor: colors.ok, alignItems: 'center', justifyContent: 'center', ...shadow.lifted },
  okTitle: { fontSize: type.display, fontWeight: '900', color: colors.ink, marginTop: spacing.lg },
  okSub: { fontSize: type.body, fontWeight: '600', color: colors.inkMuted },
});
